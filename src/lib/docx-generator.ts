import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  ImageRun,
  Table, 
  TableRow, 
  TableCell, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  WidthType, 
  ShadingType,
  VerticalAlign,
  Header,
  Footer,
  PageNumber,
  TabStopType,
  LeaderType
} from 'docx';
import { saveAs } from 'file-saver';
import { PgrDocumentContext, buildPgrFullDocument, filterContextForCompany, OFFICIAL_PGR_TEXTS } from '@/lib/pgr-official-template';
import { parseContentWithTables } from '@/lib/table-parser';
import { HAZARD_CATEGORY_CONFIG, getNormativeRiskMatrix } from '@/lib/risk-matrix';
import { RiskInventoryItem, ActionPlanItem, HazardCategory } from '@/types/pgr';
import { groupInventoryByGhe, isNoExposureRisk } from '@/lib/pgr-groups';
import { ensurePngDataUrl, dataUrlToUint8Array } from '@/lib/image-utils';
import { DEFAULT_EMISSORA_LOGO, DEFAULT_CLIENTE_LOGO } from '@/lib/default-logos';
import { formatCNPJ, getExposureParts } from '@/lib/utils';
import { getIssuerCompanyConfig } from '@/lib/issuer-company-service';

function parseTextToTextRuns(text: string, defaultSize: number = 20): TextRun[] {
  if (!text) return [new TextRun({ text: '', color: '000000', size: defaultSize })];
  const normalized = text
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');

  const tokens: { text: string; bold: boolean; italics: boolean }[] = [];
  const regex = /(\*\*[\s\S]+?\*\*|\*[^\*\n]+?\*)/g;
  let lastIdx = 0;
  let match;
  while ((match = regex.exec(normalized)) !== null) {
    if (match.index > lastIdx) {
      tokens.push({ text: normalized.slice(lastIdx, match.index), bold: false, italics: false });
    }
    const token = match[1];
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      tokens.push({ text: token.slice(2, -2), bold: true, italics: false });
    } else if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      tokens.push({ text: token.slice(1, -1), bold: false, italics: true });
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < normalized.length) {
    tokens.push({ text: normalized.slice(lastIdx), bold: false, italics: false });
  }

  return tokens.map(
    (t) =>
      new TextRun({
        text: t.text,
        bold: t.bold,
        italics: t.italics,
        color: '000000',
        size: defaultSize,
      })
  );
}

export async function generatePgrDocx(rawCtx: PgrDocumentContext): Promise<void> {
  const ctx = filterContextForCompany(rawCtx);
  const docData = buildPgrFullDocument(ctx);
  const issuerConfig = getIssuerCompanyConfig();

  const lightGray = 'F1F5F9';
  const borderColor = 'CBD5E1';

  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
  };

  const children: any[] = [];

  // ==========================================
  // CAPA INSTITUCIONAL
  // ==========================================

  // 1. Logotipo da Empresa Emissora / Consultoria SST
  const emissoraLogoUrl = issuerConfig.logoUrl || docData.header.consultingLogo || DEFAULT_EMISSORA_LOGO;
  const clienteLogoUrl = docData.header.companyLogo || DEFAULT_CLIENTE_LOGO;

  const emissoraPng = await ensurePngDataUrl(emissoraLogoUrl, 600, 150);
  const clientePng = await ensurePngDataUrl(clienteLogoUrl, 600, 150);

  const emissoraBytes = dataUrlToUint8Array(emissoraPng);
  const clienteBytes = dataUrlToUint8Array(clientePng);

  // Espaçamento e respiro generoso antes do logo da emissora (atendendo ao pedido de respiro elegante)
  if (emissoraBytes) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 150 },
        children: [
          new ImageRun({
            data: emissoraBytes,
            transformation: { width: 320, height: 80 },
            type: 'png',
          } as any),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 60 },
      children: [
        new TextRun({
          text: docData.header.consultingCompany || OFFICIAL_PGR_TEXTS.consultingCompany,
          bold: true,
          size: 20,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 700 },
      children: [
        new TextRun({
          text: docData.header.consultingCrea || OFFICIAL_PGR_TEXTS.consultingCrea,
          size: 17,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'PROGRAMA DE GERENCIAMENTO DE RISCOS',
          bold: true,
          size: 34,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'DE RISCOS - PGR',
          bold: true,
          size: 34,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
      children: [
        new TextRun({
          text: 'GERENCIAMENTO DE RISCOS OCUPACIONAIS (GRO) — NR-01',
          bold: true,
          size: 20,
          color: '000000',
        }),
      ],
    })
  );

  // 2. Logotipo da Empresa Cliente Contratante
  if (clienteBytes) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 150 },
        children: [
          new ImageRun({
            data: clienteBytes,
            transformation: { width: 300, height: 75 },
            type: 'png',
          } as any),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: docData.header.companyName.toUpperCase(),
          bold: true,
          size: 26,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: `CNPJ: ${docData.header.cnpj}`,
          size: 19,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 700 },
      children: [
        new TextRun({
          text: `Estabelecimento: ${docData.header.establishmentName}`,
          size: 19,
          color: '000000',
        }),
      ],
    })
  );

  // Bloco de Metadados Técnicos da Capa (Sem linha de ART/RRT)
  const metaBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  };

  const coverMetaTable = new Table({
    width: { size: 80, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: metaBorder,
            shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `DOCUMENTO TÉCNICO: ${docData.header.code} (REV: ${docData.header.version})`,
                    bold: true,
                    size: 18,
                    color: '000000',
                  }),
                ],
                spacing: { before: 80, after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Responsável Técnico: ${docData.header.techRespName}`,
                    size: 18,
                    color: '000000',
                  }),
                ],
                spacing: { after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Registro de Classe: ${docData.header.techRespCouncil}`,
                    size: 18,
                    color: '000000',
                  }),
                ],
                spacing: { after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Data de Elaboração: ${docData.header.elaborationDate}`,
                    size: 18,
                    color: '000000',
                  }),
                ],
                spacing: { after: 80 },
              }),
            ],
          }),
        ],
      }),
    ],
  });

  children.push(
    coverMetaTable,
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 200 },
      children: [
        new TextRun({
          text: `${ctx.company.address.city}/${ctx.company.address.state} — ${docData.header.year}`,
          bold: true,
          size: 19,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({ pageBreakBefore: true })
  );

  // ==========================================
  // SEÇÕES DO DOCUMENTO
  // ==========================================
  for (const section of docData.sections) {
    if (section.id === 'sec-1' || section.title.toLowerCase().includes('indice')) {
      children.push(
        new Paragraph({
          pageBreakBefore: true,
          children: [
            new TextRun({
              text: 'Índice',
              bold: true,
              color: '000000',
              size: 32,
              font: 'Arial',
            }),
          ],
          border: {
            bottom: {
              color: '000000',
              size: 8,
              style: BorderStyle.SINGLE,
            },
          },
          spacing: { before: 100, after: 300 },
        })
      );

      const indexSections = docData.sections.filter(
        s => s.id !== 'sec-0' && s.id !== 'sec-1' && !s.title.toLowerCase().includes('indice')
      );
      const gheGroupsForIndex = groupInventoryByGhe(ctx.sectors, ctx.positions, ctx.ghes, ctx.riskInventory);

      let estPage = 3;
      for (const sec of indexSections) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sec.title,
                size: 20,
                color: '000000',
                font: 'Arial',
              }),
              new TextRun({
                text: `\t${estPage}`,
                size: 20,
                color: '000000',
                font: 'Arial',
              }),
            ],
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: 9026,
                leader: LeaderType.DOT,
              },
            ],
            spacing: { after: 100 },
          })
        );

        if (sec.type === 'risk_inventory_table' && gheGroupsForIndex && gheGroupsForIndex.length > 0) {
          let ghePage = estPage;
          gheGroupsForIndex.forEach((g, gIdx) => {
            if (gIdx > 0) ghePage += 1;
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `   ${g.gheCode} – Setor ${g.sectorName}`,
                    size: 18,
                    color: '000000',
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: `\t${ghePage}`,
                    size: 18,
                    color: '000000',
                    font: 'Arial',
                  }),
                ],
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: 9026,
                    leader: LeaderType.DOT,
                  },
                ],
                spacing: { after: 80 },
              })
            );
          });
          estPage += Math.max(1, Math.ceil((ctx.riskInventory?.length || 1) / 3));
        } else if (sec.type === 'action_plan_table') {
          estPage += Math.max(1, Math.ceil((ctx.actionPlans?.length || 1) / 8));
        } else {
          estPage += 1;
        }
      }
      continue;
    }

    // Título da Seção
    const sectionHeading = /^\d+\./.test(section.title) ? section.title : `${section.number}. ${section.title}`;
    const shouldPageBreak = section.id === 'sec-2' || section.id === 'sec-3' || section.id === 'sec-4' || section.id === 'sec-5' || section.id === 'sec-6' || section.type === 'risk_inventory_table' || section.type === 'action_plan_table' || section.type === 'closing_signatures' || section.id === 'sec-17';

    children.push(
      new Paragraph({
        pageBreakBefore: shouldPageBreak,
        children: [
          new TextRun({
            text: sectionHeading,
            bold: true,
            color: '000000',
            size: 24,
          }),
        ],
        spacing: { before: 600, after: 200 },
      })
    );

    if (section.type === 'company_info') {
      const d = section.data;
      const rows = [
        ['Razão Social:', d.razaoSocial || '-'],
        ['Nome Fantasia:', d.nomeFantasia || '-'],
        ['CNPJ:', d.cnpj || '-'],
        ['Atividade Principal (CNAE):', d.cnae || '-'],
        ['Grau de Risco (NR-04):', d.grauDeRisco || '-'],
        ['Endereço da Matriz:', d.enderecoMatriz || '-'],
        ['Estabelecimento Avaliado:', d.estabelecimento || '-'],
        ['Representante Legal:', d.representanteLegal || '-'],
        ['População Trabalhadora:', d.totalTrabalhadores || '-'],
        ['Contato / E-mail:', d.contato || '-'],
      ].map(
        ([label, val]) =>
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: label, bold: true, color: '000000', size: 19 })],
                  }),
                ],
                width: { size: 3500, type: WidthType.DXA },
                shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' },
                borders: cellBorder,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: val, color: '000000', size: 19 })],
                  }),
                ],
                width: { size: 6500, type: WidthType.DXA },
                borders: cellBorder,
              }),
            ],
          })
      );

      children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    } else if (section.type === 'responsibles_info') {
      const el = section.elaborador;
      const med = section.medicoPcmso;

      const respRows: TableRow[] = [];
      if (el) {
        const qualifText = el.qualificacoes && el.qualificacoes.length > 0
          ? el.qualificacoes.join(' | ')
          : (el.cargo || '-');

        respRows.push(
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                shading: { fill: 'F1F5F9', type: ShadingType.CLEAR, color: 'auto' },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Responsável Técnico pela Elaboração do PGR', bold: true, color: '000000', size: 20 })],
                  }),
                ],
                borders: cellBorder,
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 3500, type: WidthType.DXA },
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                children: [new Paragraph({ children: [new TextRun({ text: 'Nome do Profissional:', bold: true, color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
              new TableCell({
                width: { size: 6500, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: el.nome || '-', color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 3500, type: WidthType.DXA },
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                children: [new Paragraph({ children: [new TextRun({ text: 'Qualificações / Cargos Habilitados:', bold: true, color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
              new TableCell({
                width: { size: 6500, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: qualifText, color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 3500, type: WidthType.DXA },
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                children: [new Paragraph({ children: [new TextRun({ text: 'Registro Profissional:', bold: true, color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
              new TableCell({
                width: { size: 6500, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: el.conselho || '-', color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
            ],
          })
        );

        if (el.cpf) {
          respRows.push(
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 3500, type: WidthType.DXA },
                  shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'CPF do Responsável:', bold: true, color: '000000', size: 19 })] })],
                  borders: cellBorder,
                }),
                new TableCell({
                  width: { size: 6500, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun({ text: el.cpf, color: '000000', size: 19 })] })],
                  borders: cellBorder,
                }),
              ],
            })
          );
        }

        respRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 3500, type: WidthType.DXA },
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                children: [new Paragraph({ children: [new TextRun({ text: 'Consultoria Especializada:', bold: true, color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
              new TableCell({
                width: { size: 6500, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: el.empresaConsultoria || '-', color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
            ],
          })
        );
      }

      if (med) {
        respRows.push(
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                shading: { fill: 'F1F5F9', type: ShadingType.CLEAR, color: 'auto' },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Médico Coordenador do PCMSO (NR-07)', bold: true, color: '000000', size: 20 })],
                  }),
                ],
                borders: cellBorder,
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 3500, type: WidthType.DXA },
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                children: [new Paragraph({ children: [new TextRun({ text: 'Nome do Médico:', bold: true, color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
              new TableCell({
                width: { size: 6500, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: med.nome || '-', color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 3500, type: WidthType.DXA },
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                children: [new Paragraph({ children: [new TextRun({ text: 'Registro CRM:', bold: true, color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
              new TableCell({
                width: { size: 6500, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: med.conselho || '-', color: '000000', size: 19 })] })],
                borders: cellBorder,
              }),
            ],
          })
        );
      }

      children.push(new Table({ rows: respRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    } else if (section.type === 'text') {
      const blocks = parseContentWithTables(section.content);
      for (const block of blocks) {
        if (block.type === 'table') {
          const tableRows = [
            new TableRow({
              tableHeader: true,
              children: block.headers.map((h) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
                  borders: cellBorder,
                  shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' },
                })
              ),
            }),
            ...block.rows.map((r) =>
              new TableRow({
                children: r.map((c, cellIndex) => {
                  const trimmed = c.trim();
                  let fill: string | undefined = undefined;
                  let textColor = '000000';
                  let align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;

                  if (/\(TRI(V)?\)/i.test(trimmed)) {
                    fill = '10B981';
                    textColor = 'FFFFFF';
                    align = AlignmentType.CENTER;
                  } else if (/\(TOL\)/i.test(trimmed)) {
                    fill = '84CC16';
                    textColor = 'FFFFFF';
                    align = AlignmentType.CENTER;
                  } else if (/\(MOD\)/i.test(trimmed)) {
                    fill = 'F59E0B';
                    textColor = 'FFFFFF';
                    align = AlignmentType.CENTER;
                  } else if (/\(SUB\)/i.test(trimmed)) {
                    fill = 'F97316';
                    textColor = 'FFFFFF';
                    align = AlignmentType.CENTER;
                  } else if (/\(INT\)/i.test(trimmed)) {
                    fill = 'E11D48';
                    textColor = 'FFFFFF';
                    align = AlignmentType.CENTER;
                  } else if (/^([1-9]|1[0-9]|2[0-5])$/.test(trimmed) && block.headers.some(h => /Insignificante|Severidade|Probabilidade/i.test(h))) {
                    const num = parseInt(trimmed, 10);
                    if (num >= 16) fill = 'E11D48';
                    else if (num >= 10) fill = 'F97316';
                    else if (num >= 5) fill = 'F59E0B';
                    else fill = '10B981';
                    textColor = 'FFFFFF';
                    align = AlignmentType.CENTER;
                  } else if (cellIndex <= 1 || (cellIndex === 2 && block.headers.length <= 4)) {
                    if (trimmed.includes('15 a 25') || trimmed.includes('16 a 25') || trimmed.includes('Intolerável') || trimmed === 'Urgente' || trimmed === 'Extremo') {
                      fill = 'FEE2E2';
                      textColor = '9F1239';
                    } else if (trimmed.includes('10 a 16') || trimmed.includes('10 a 15') || trimmed.includes('Substancial') || trimmed === 'Alta' || trimmed === 'Alto') {
                      fill = 'FFEDD5';
                      textColor = '9A3412';
                    } else if (trimmed.includes('5 a 9') || trimmed.includes('Moderado') || trimmed === 'Média' || trimmed === 'Médio') {
                      fill = 'FEF3C7';
                      textColor = '92400E';
                    } else if (trimmed.includes('3 a 4') || trimmed.includes('Tolerável') || trimmed === 'Baixa' || trimmed === 'Baixo') {
                      fill = 'ECFCCB';
                      textColor = '365314';
                    } else if (trimmed.includes('1 a 2') || trimmed.includes('1 a 4') || trimmed.includes('Trivial') || trimmed.includes('Muito Baixo')) {
                      fill = 'D1FAE5';
                      textColor = '065F46';
                    }
                  }

                  const cleanCellText = trimmed.replace(/[🟥🟧🟨🟩]/g, '').trim();

                  return new TableCell({
                    children: [
                      new Paragraph({
                        children: fill
                          ? [new TextRun({ text: cleanCellText, color: textColor, bold: true })]
                          : parseTextToTextRuns(cleanCellText),
                        alignment: align,
                      }),
                    ],
                    borders: cellBorder,
                    shading: fill ? { fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
                  });
                }),
              })
            ),
          ];
          children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
          children.push(new Paragraph({ text: '', spacing: { after: 150 } }));
        } else {
          const rawLines = block.content.replace(/\r\n/g, '\n').split('\n');
          let currentParagraph: string[] = [];

          const flushDocxPara = () => {
            if (currentParagraph.length === 0) return;
            const fullText = currentParagraph.join(' ').trim();
            currentParagraph = [];
            if (!fullText) return;

            children.push(
              new Paragraph({
                children: parseTextToTextRuns(fullText),
                spacing: { after: 120 },
                alignment: AlignmentType.JUSTIFIED,
              })
            );
          };

          for (const rawLine of rawLines) {
            const trimmed = rawLine.trim();
            if (!trimmed) {
              flushDocxPara();
              continue;
            }

            const cleanTrimmed = trimmed.replace(/^(\*{2}|_{2})/, '').replace(/(\*{2}|_{2})$/, '').trim();
            const isMarkdownHeader = /^#{1,6}\s+/.test(trimmed);
            const isSpecialHeader = /^CABE AO (EMPREGADOR|TRABALHADOR):?$/i.test(cleanTrimmed) ||
                                   /^Principais referências normativas:?$/i.test(cleanTrimmed) ||
                                   /^Tabela\s+\d+/i.test(cleanTrimmed);
            const isSectionNumberHeader = /^(\d+\.)+\s+[A-Z]/.test(cleanTrimmed) && cleanTrimmed.length < 90 && !/[;]$/.test(cleanTrimmed);
            const isAllCapsHeader = /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ0-9\s\.\-]{5,60}:$/.test(cleanTrimmed);
            const isPureBoldHeader = /^\*\*[^\*]{3,80}\*\*$/.test(trimmed) && !/[.,;]$/.test(cleanTrimmed);

            const isHeading = isMarkdownHeader || isSpecialHeader || isSectionNumberHeader || isAllCapsHeader || isPureBoldHeader;

            const bulletMatch = trimmed.match(/^([•\-\*])\s+(.*)$/);
            const alineaMatch = trimmed.match(/^([a-z]\))\s+(.*)$/i);
            const romanMatch = trimmed.match(/^([IVXLCDM]+\.)\s+(.*)$/);

            if (isHeading) {
              flushDocxPara();
              const cleanHeading = cleanTrimmed.replace(/^#{1,6}\s+/, '').replace(/\*\*/g, '').trim();
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: cleanHeading, bold: true, color: '000000', size: 19 })],
                  spacing: { before: 160, after: 60 },
                  alignment: AlignmentType.LEFT,
                })
              );
            } else if (romanMatch) {
              flushDocxPara();
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `${romanMatch[1]} `, bold: true, color: '000000' }),
                    ...parseTextToTextRuns(romanMatch[2]),
                  ],
                  spacing: { after: 60 },
                  alignment: AlignmentType.JUSTIFIED,
                  indent: { left: 540 },
                })
              );
            } else if (alineaMatch) {
              flushDocxPara();
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `${alineaMatch[1]} `, bold: true, color: '000000' }),
                    ...parseTextToTextRuns(alineaMatch[2]),
                  ],
                  spacing: { after: 60 },
                  alignment: AlignmentType.JUSTIFIED,
                  indent: { left: 360 },
                })
              );
            } else if (bulletMatch) {
              flushDocxPara();
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: '•  ', color: '000000' }),
                    ...parseTextToTextRuns(bulletMatch[2]),
                  ],
                  spacing: { after: 60 },
                  alignment: AlignmentType.JUSTIFIED,
                  indent: { left: 360 },
                })
              );
            } else {
              currentParagraph.push(trimmed);
            }
          }
          flushDocxPara();
        }
      }
    } else if (section.type === 'risk_inventory_table') {
      const gheGroups = groupInventoryByGhe(ctx.sectors, ctx.positions, ctx.ghes, ctx.riskInventory);

      if (!gheGroups || gheGroups.length === 0) {
        children.push(new Paragraph({ text: 'Nenhum setor ou risco cadastrado no inventário.', spacing: { after: 200 } }));
      } else {
        const headerGray = '52525B';
        const sectionGray = 'E2E8F0';
        const labelGray = 'F8FAFC';

        for (let gIdx = 0; gIdx < gheGroups.length; gIdx++) {
          const group = gheGroups[gIdx];
          // 1. Título do GHE / Setor em Negrito
          const emrInfo = group.emr ? ` | EMR: ${group.emr}` : '';
          const gheHeader = `${group.gheCode} | Setor: ${group.sectorName} | Efetivo Exposto: ${group.workerCount} trabalhador(es)${emrInfo}`;

          children.push(
            new Paragraph({
              pageBreakBefore: gIdx > 0,
              children: [new TextRun({ text: gheHeader, bold: true, size: 20 })],
              spacing: { before: 280, after: 60 },
            })
          );

          // 2. Cargos e Descrições de Atividades deste GHE/Setor
          for (const pos of group.positions) {
            const posLine = `Cargo / Função: ${pos.title}${pos.cbo ? ` (CBO: ${pos.cbo})` : ''}`;
            const actLine = `**Descrição da Atividade:** ${pos.activityDescription || 'Atividades operacionais e rotinas da função.'}`;
            children.push(
              new Paragraph({
                children: [new TextRun({ text: posLine, bold: true, size: 18, color: '000000' })],
                spacing: { after: 30 },
              }),
              new Paragraph({
                children: parseTextToTextRuns(actLine),
                spacing: { after: 70 },
              })
            );
          }

          // 3. Tabelas APR-HO deste GHE/Setor
          if (group.risks.length === 0) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: 'Nenhum risco ocupacional identificado para este setor/GHE.', italics: true, size: 18, color: '000000' })],
                spacing: { after: 140 },
              })
            );
          } else {
            // Salto de página obrigatório após finalizar descrição de cargos/funções antes das tabelas APR-HO
            children.push(
              new Paragraph({
                pageBreakBefore: true,
                spacing: { before: 0, after: 100 },
              })
            );

            for (const item of group.risks) {
              const catConfig = HAZARD_CATEGORY_CONFIG[item.hazardCategory as HazardCategory];
              const catHex = (catConfig?.color || '#16a34a').replace('#', '');
              const catLabel = (catConfig?.label || item.hazardCategory || 'FÍSICO').toUpperCase();

              const headerTitle = `${group.gheCode} APR-HO - ${docData.header.elaborationDate || '02/2026'}`;

              if (isNoExposureRisk(item)) {
                const agentText = item.hazardName && item.hazardName.toLowerCase() !== 'nap'
                  ? item.hazardName
                  : 'Não há exposição / Não se Aplica';

                const rawCondition = (item.sourceDescription || item.healthDamage || '').trim();
                const isGenericNap = !rawCondition || rawCondition.toLowerCase() === 'nap' || rawCondition.toLowerCase().includes('não se aplica') || rawCondition.toLowerCase().includes('não há exposição');
                const condText = isGenericNap
                  ? 'NAP'
                  : `NAP (${rawCondition})`;

                const headerRow = new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 2800, type: WidthType.DXA },
                      shading: { fill: headerGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: headerTitle, bold: true, color: 'FFFFFF' })],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      width: { size: 4160, type: WidthType.DXA },
                      shading: { fill: headerGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'IDENTIFICAÇÃO DO PERIGO / FATOR DE RISCO', bold: true, color: 'FFFFFF' })],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      width: { size: 2400, type: WidthType.DXA },
                      shading: { fill: catHex, type: ShadingType.CLEAR, color: 'auto' },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: `RISCO ${catLabel}`, bold: true, color: 'FFFFFF' })],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      borders: cellBorder,
                    }),
                  ],
                });

                const infoRow = new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 3,
                      shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: 'Agente: ', bold: true, size: 16, color: '000000' }),
                            new TextRun({ text: `${agentText}   |   `, size: 16, color: '000000' }),
                            new TextRun({ text: 'Condição: ', bold: true, size: 16, color: '000000' }),
                            new TextRun({ text: condText, size: 16, color: '000000' }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      borders: cellBorder,
                    }),
                  ],
                });

                children.push(
                  new Table({
                    rows: [headerRow, infoRow],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                  }),
                  new Paragraph({ text: '', spacing: { after: 120 } })
                );
                continue;
              }

              const { expPart1, expPart2 } = getExposureParts(item.exposureType, item.exposureObservation);

              const epcStr = item.epcExisting && item.epcExisting.length > 0 ? item.epcExisting.join(', ') : '';
              const epiStr = item.epiExisting && item.epiExisting.length > 0
                ? item.epiExisting.map((e: any) => `${e.name} (CA: ${e.ca || 'S/N'})`).join('; ')
                : '';
              const epcEpiFinal = [epcStr ? `EPC: ${epcStr}` : '', epiStr ? `EPI: ${epiStr}` : ''].filter(Boolean).join(' | ') || 'NAP';

              const meas = item.measurements && item.measurements.length > 0 ? item.measurements[0] : null;
              const criterio = meas?.criteria || (meas ? 'Quantitativo (Pontual)' : 'Qualitativo / NAP');
              const tecnica = meas?.technique || (meas ? 'NR-15 / NHO' : 'NAP');
              const dataMedicao = meas?.measurementDate 
                ? (meas.measurementDate.includes('-') ? meas.measurementDate.split('-').reverse().join('/') : meas.measurementDate)
                : (meas ? '25/02/2026' : 'NAP');
              const resultado = meas?.resultText || (meas?.measuredValue ? `${meas.measuredValue} ${meas.unit || ''}` : 'NAP');
              const lt = meas?.toleranceLimitText || (meas?.toleranceLimit ? `${meas.toleranceLimit} ${meas.unit || ''}` : 'NAP');

              // Cálculo de nível de risco conforme Tabela 5 e 7 da NR-01 / PGR (Matriz 5x5)
              const score = item.riskScore || (Number(item.severity || 1) * Number(item.probability || 1));
              const norm = getNormativeRiskMatrix(score);
              const displayRiskLevel = norm.displayLevel;
              const prioridadeFinal = item.actionPriority || norm.priority;
              let statusHex = '16A34A';
              if (norm.level === 'Médio') statusHex = 'D97706';
              else if (norm.level === 'Alto') statusHex = 'EA580C';
              else if (norm.level === 'Extremo') statusHex = 'DC2626';

              const rows = [
                // Row 1: Header 3 Colunas (Identificação, Perigo e Risco)
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 2800, type: WidthType.DXA },
                      columnSpan: 1,
                      shading: { fill: headerGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: headerTitle, bold: true, color: 'FFFFFF' })],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      width: { size: 4160, type: WidthType.DXA },
                      columnSpan: 2,
                      shading: { fill: headerGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'IDENTIFICAÇÃO DO PERIGO / FATOR DE RISCO', bold: true, color: 'FFFFFF' })],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      width: { size: 2400, type: WidthType.DXA },
                      columnSpan: 1,
                      shading: { fill: catHex, type: ShadingType.CLEAR, color: 'auto' },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: `RISCO ${catLabel}`, bold: true, color: 'FFFFFF' })],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 2: Tipo do Agente / Perigo
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Tipo do Agente / Perigo:', bold: true })],
                        }),
                      ],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 3,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: item.hazardName || 'Não informado' }),
                          ],
                        }),
                      ],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 3: Tipo e Regime de Exposição
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Tipo e Regime de Exposição:', bold: true, color: '000000' })] })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 3,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: expPart2 ? `${expPart1} - ${expPart2}` : (expPart1 || 'Não informado'),
                              color: '000000',
                            }),
                          ],
                        }),
                      ],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 4: Fontes ou circunstância
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Fonte ou Circunstância:', bold: true, color: '000000' })] })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 3,
                      children: [new Paragraph({ children: [new TextRun({ text: item.sourceDescription || 'Não informada', color: '000000' })] })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 5: Trajetória
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Meio de Propagação / Trajetória:', bold: true, color: '000000' })] })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 3,
                      children: [new Paragraph({ children: [new TextRun({ text: item.trajectory || 'Ar', color: '000000' })] })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 6: Via de penetração
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Via de Penetração:', bold: true, color: '000000' })] })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 3,
                      children: [new Paragraph({ children: [new TextRun({ text: item.penetrationRoute || 'Cutânea / Respiratória / NAP', color: '000000' })] })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 7: Efeitos a saúde
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Possíveis Lesões / Danos à Saúde:', bold: true, color: '000000' })] })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 3,
                      children: [new Paragraph({ children: [new TextRun({ text: item.healthDamage || 'Não informado', color: '000000' })] })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 8: EPC/EPI
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Medidas de Controle (EPC/EPI):', bold: true, color: '000000' })] })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 3,
                      children: [new Paragraph({ children: [new TextRun({ text: epcEpiFinal, color: '000000' })] })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Section Header: Medição
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 4,
                      shading: { fill: sectionGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: '3. AVALIAÇÃO QUANTITATIVA / QUALITATIVA DO AGENTE', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 10: Critério & Técnica
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 2,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: 'Tipo de Avaliação / Critério: ', bold: true, color: '000000' }),
                            new TextRun({ text: criterio, color: '000000' }),
                          ],
                        }),
                      ],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 2,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: 'Técnica / Norma: ', bold: true, color: '000000' }),
                            new TextRun({ text: tecnica, color: '000000' }),
                          ],
                        }),
                      ],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 11: Data da Avaliação | Resultado | LT Headers
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Data da Avaliação', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 2,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Nível / Concentração Obtida', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Limite de Tolerância (LT)', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 12: Data da medição | Resultado | LT Values
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      children: [new Paragraph({ children: [new TextRun({ text: dataMedicao, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 2,
                      children: [new Paragraph({ children: [new TextRun({ text: resultado, bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 1,
                      children: [new Paragraph({ children: [new TextRun({ text: lt, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Section Header: Categorização do risco/perigo
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 4,
                      shading: { fill: sectionGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: '4. CLASSIFICAÇÃO DO RISCO OCUPACIONAL (MATRIZ 5x5 - GRO)', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 14: Severidade | Probabilidade | Nível de Risco | Prioridade de ação Headers
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Severidade', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Probabilidade', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Nível de Risco', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Prioridade de Ação', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 15: Severidade | Probabilidade | Nível de Risco | Prioridade Values
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      children: [new Paragraph({ children: [new TextRun({ text: `${item.severity || '1'} (Nível ${item.severity || '1'})`, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 1,
                      children: [new Paragraph({ children: [new TextRun({ text: `${item.probability || '1'} (Nível ${item.probability || '1'})`, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 1,
                      children: [new Paragraph({ children: [new TextRun({ text: displayRiskLevel, bold: true, color: statusHex })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 1,
                      children: [new Paragraph({ children: [new TextRun({ text: prioridadeFinal, bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Section Header: Recomendações
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 4,
                      shading: { fill: sectionGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Recomendações e Medidas Propostas', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                  ],
                }),

                // Row 17: Recomendações Values
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Recomendações:', bold: true, color: '000000' })] })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 3,
                      children: [new Paragraph({ children: [new TextRun({ text: item.recommendations || 'Manter o monitoramento contínuo das condições ambientais e o cumprimento dos procedimentos operacionais padrão.', color: '000000' })] })],
                      borders: cellBorder,
                    }),
                  ],
                }),
              ];

              children.push(
                new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
                new Paragraph({ text: '', spacing: { after: 150 } })
              );
            }
          }
        }
      }
    } else if (section.type === 'action_plan_table') {
      const actions = section.items;
      const gesLabel = ctx.ghes.length > 0 ? `GES ${ctx.ghes[0].code || '1.0'}` : 'GES 1.0';

      const defaultMetas = [
        ['Manter o fornecimento e a obrigatoriedade do uso dos EPIs especificados, com substituição conforme condições de uso, desgaste e orientação do fabricante.', 'Média', 'Contínuo', 'Contínuo', 'SESMT / RH', 'EM ANDAMENTO'],
        ['Realizar inspeções periódicas das condições de segurança dos ambientes, equipamentos e instalações.', 'Média', 'Contínuo', 'Contínuo', 'SESMT / Manutenção', 'EM ANDAMENTO'],
        ['Manter os treinamentos e orientações de segurança conforme os riscos e as atividades desenvolvidas.', 'Média', 'Contínuo', 'Contínuo', 'RH / Treinamento', 'PROGRAMADO'],
        ['Manter as medidas de controle existentes para os agentes ocupacionais identificados e acompanhar sua eficácia.', 'Média', 'Contínuo', 'Contínuo', 'SESMT / Diretoria', 'EM ANDAMENTO'],
        ['Realizar avaliações quantitativas dos agentes físicos e químicos, quando aplicável, conforme os critérios técnicos e legais pertinentes.', 'Média', 'Contínuo', 'Contínuo', 'Consultoria SST', 'A INICIAR'],
        ['Elaborar e implementar o PPR – Programa de Proteção Respiratória, quando aplicável.', 'Média', 'Contínuo', 'Contínuo', 'SESMT', 'A INICIAR'],
        ['Avaliar e acompanhar os fatores de riscos psicossociais relacionados ao trabalho, implementando medidas de prevenção quando necessárias.', 'Média', 'Contínuo', 'Contínuo', 'RH / Gestão', 'A INICIAR'],
        ['Reavaliar as condições de trabalho sempre que houver alterações nos processos, ambientes, atividades ou identificação de novos riscos.', 'Média', 'Contínuo', 'Contínuo', 'SESMT / Diretoria', 'EM ANDAMENTO']
      ];

      const validActions = (actions || []).filter((act: ActionPlanItem) => {
        const matchedRisk = ctx.riskInventory?.find((r: any) => r.id === act.riskInventoryId);
        if (matchedRisk && isNoExposureRisk(matchedRisk)) return false;
        const lowerWhat = (act.what || '').toLowerCase();
        if (lowerWhat.includes('não há exposição') || lowerWhat.includes('nao ha exposicao') || lowerWhat.includes('não se aplica') || lowerWhat.includes('nao se aplica')) {
          return false;
        }
        return true;
      });

      const dataRows = (validActions.length === 0)
        ? defaultMetas.map(([meta, prio, start, end, who, st]) => 
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: meta, color: '000000' })], alignment: AlignmentType.JUSTIFIED })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: prio, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: start, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: end, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: who, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: st, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder }),
              ]
            })
          )
        : validActions.map((act: ActionPlanItem) => {
            const matchedRisk = ctx.riskInventory?.find((r: any) => r.id === act.riskInventoryId);
            let metaText = act.what;
            if (matchedRisk?.recommendations?.trim()) {
              metaText = matchedRisk.recommendations.trim();
            } else if (metaText && metaText.startsWith('Mitigação de ')) {
              const parts = metaText.split(':');
              if (parts.length > 1) {
                const recommendation = parts[parts.length - 1].trim();
                if (recommendation.length > 5) {
                  metaText = recommendation.charAt(0).toUpperCase() + recommendation.slice(1);
                }
              }
            }
            const priorityText = act.priority || matchedRisk?.actionPriority || 'Média';
            
            const isContinuous = !!act.isContinuousDeadline ||
              (act.startDate && (act.startDate.toLowerCase().includes('continuo') || act.startDate.toLowerCase().includes('contínuo'))) ||
              (act.whenDate && (act.whenDate.toLowerCase().includes('continuo') || act.whenDate.toLowerCase().includes('contínuo')));

            const startDateText = isContinuous 
              ? 'Contínuo' 
              : (act.startDate ? (act.startDate.includes('-') ? act.startDate.split('-').reverse().join('/') : act.startDate) : 'Contínuo');
            
            const endDateText = isContinuous
              ? (act.continuousDeadlineNote ? `Contínuo (${act.continuousDeadlineNote})` : 'Contínuo')
              : (act.whenDate ? (act.whenDate.includes('-') ? act.whenDate.split('-').reverse().join('/') : act.whenDate) : 'Contínuo');

            const responsibleText = act.who || ctx.establishment?.managerName || ctx.company?.legalRepresentative || 'SESMT';
            
            let statusText = 'NÃO INICIADA';
            if (act.status) {
              const upper = act.status.toUpperCase();
              if (upper === 'IN_PROGRESS' || upper === 'EM_ANDAMENTO') statusText = 'EM ANDAMENTO';
              else if (upper === 'COMPLETED' || upper === 'CONCLUIDA' || upper === 'CONCLUÍDA') statusText = 'CONCLUÍDA';
              else if (upper === 'CANCELLED' || upper === 'CANCELADA') statusText = 'CANCELADA';
              else if (upper === 'NOT_STARTED' || upper === 'NAO_INICIADA') statusText = 'NÃO INICIADA';
              else statusText = act.status.replace(/_/g, ' ').toUpperCase();
            }

            return new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: metaText, color: '000000' })], alignment: AlignmentType.JUSTIFIED })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: priorityText, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: startDateText, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: endDateText, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: responsibleText, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: statusText, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder }),
              ],
            });
          });

      const rows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Metas', bold: true, color: '000000' })] })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Grau de Prioridade', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Prazo Inicial', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Prazo Final', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Responsável', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 6,
              children: [new Paragraph({ children: [new TextRun({ text: gesLabel, bold: true, color: '000000' })], alignment: AlignmentType.CENTER })],
              borders: cellBorder,
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR, color: 'auto' }
            })
          ]
        }),
        ...dataRows
      ];

      children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    } else if (section.type === 'closing_signatures') {
      const creaText = docData.header.techRespCouncil
        ? (docData.header.techRespCouncil.toUpperCase().includes('CREA') 
            ? docData.header.techRespCouncil 
            : `CREA: ${docData.header.techRespCouncil}`)
        : 'CREA Habilitado';

      children.push(
        new Paragraph({
          pageBreakBefore: true,
          children: parseTextToTextRuns(section.text),
          spacing: { before: 200, after: 400 },
          alignment: AlignmentType.JUSTIFIED,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${section.city}/${section.state}, ${section.date}.`,
              bold: true,
              color: '000000',
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 800 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '____________________________________________________', color: '000000' })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: docData.header.techRespName, bold: true, color: '000000' }),
            new TextRun({ text: `\n${creaText}`, color: '000000' }),
            new TextRun({ text: '\nResponsável Técnico pelo PGR', color: '000000' }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '____________________________________________________', color: '000000' })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: ctx.company.name, bold: true, color: '000000' }),
            new TextRun({ text: `\nCNPJ: ${formatCNPJ(ctx.company.cnpj)}`, color: '000000' }),
            new TextRun({ text: `\nRepresentante Legal: ${ctx.company.legalRepresentative || 'Diretoria'}`, color: '000000' }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }
  }

  // Gera o documento .docx com paginação, cabeçalho e rodapé oficial
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            color: '000000',
            font: 'Arial',
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          titlePage: true, // Primeira página (Capa) sem cabeçalho/rodapé
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `PGR / GRO — ${docData.header.code} (REV: ${docData.header.version}) | ${docData.header.companyName}`,
                    size: 16,
                    color: '666666',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Página ', size: 16, color: '666666' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '666666' }),
                  new TextRun({ text: ' de ', size: 16, color: '666666' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '666666' }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = ctx.company.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `PGR_${cleanName}_${docData.header.year}.docx`;
  saveAs(blob, filename);
}
