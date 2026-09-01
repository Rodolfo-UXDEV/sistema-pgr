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
  ShadingType 
} from 'docx';
import { saveAs } from 'file-saver';
import { PgrDocumentContext, buildPgrFullDocument, OFFICIAL_PGR_TEXTS } from '@/lib/pgr-official-template';
import { parseContentWithTables } from '@/lib/table-parser';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
import { RiskInventoryItem, ActionPlanItem, HazardCategory } from '@/types/pgr';
import { ensurePngDataUrl, dataUrlToUint8Array } from '@/lib/image-utils';
import { DEFAULT_EMISSORA_LOGO, DEFAULT_CLIENTE_LOGO } from '@/lib/default-logos';

function parseTextToTextRuns(text: string): TextRun[] {
  if (!text) return [new TextRun({ text: '' })];
  const tokens = text.split(/(\*\*[\s\S]*?\*\*|\*[^\*\n]+?\*)/g);
  return tokens.map((token) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return new TextRun({ text: token.slice(2, -2), bold: true });
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      return new TextRun({ text: token.slice(1, -1), italics: true });
    }
    return new TextRun({ text: token });
  });
}

export async function generatePgrDocx(ctx: PgrDocumentContext): Promise<void> {
  const docData = buildPgrFullDocument(ctx);

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
  const emissoraPng = await ensurePngDataUrl(docData.header.consultingLogo || DEFAULT_EMISSORA_LOGO, 600, 150);
  const emissoraBytes = dataUrlToUint8Array(emissoraPng);

  if (emissoraBytes) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 150 },
        children: [
          new ImageRun({
            data: emissoraBytes,
            transformation: { width: 340, height: 85 },
            type: 'png',
          } as any),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      text: docData.header.consultingCompany || OFFICIAL_PGR_TEXTS.consultingCompany,
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 80 },
    }),
    new Paragraph({
      text: docData.header.consultingCrea || OFFICIAL_PGR_TEXTS.consultingCrea,
      alignment: AlignmentType.CENTER,
      spacing: { after: 1000 },
    }),
    new Paragraph({
      text: 'PROGRAMA DE GERENCIAMENTO DE RISCOS',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'PGR / GRO — NORMA REGULAMENTADORA Nº 01',
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  );

  // 2. Logotipo da Empresa Cliente Contratante
  const clientePng = await ensurePngDataUrl(docData.header.companyLogo || DEFAULT_CLIENTE_LOGO, 600, 150);
  const clienteBytes = dataUrlToUint8Array(clientePng);

  if (clienteBytes) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 150 },
        children: [
          new ImageRun({
            data: clienteBytes,
            transformation: { width: 340, height: 85 },
            type: 'png',
          } as any),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      text: docData.header.companyName.toUpperCase(),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `CNPJ: ${docData.header.cnpj} | ${docData.header.establishmentName}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
    }),
    new Paragraph({
      text: `DOCUMENTO: ${docData.header.code} - VERSÃO ${docData.header.version}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `VIGÊNCIA: ${docData.header.validityPeriod}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `RESPONSÁVEL TÉCNICO: ${docData.header.techRespName} (${docData.header.techRespCouncil})`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 1600 },
    }),
    new Paragraph({
      text: `${ctx.company.address.city}/${ctx.company.address.state} — ${docData.header.year}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    })
  );

  // ==========================================
  // SEÇÕES DO DOCUMENTO
  // ==========================================
  for (const section of docData.sections) {
    // Título da Seção
    const sectionHeading = /^\d+\./.test(section.title) ? section.title : `${section.number}. ${section.title}`;
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sectionHeading,
            bold: true,
            color: '01853C',
            size: 24,
          }),
        ],
        spacing: { before: 600, after: 200 },
      })
    );

    if (section.type === 'company_info') {
      const d = section.data;
      const rows = [
        ['Razão Social:', d.razaoSocial],
        ['Nome Fantasia:', d.nomeFantasia],
        ['CNPJ:', d.cnpj],
        ['Atividade Principal (CNAE):', d.cnae],
        ['Grau de Risco (NR-04):', d.grauDeRisco],
        ['Endereço da Matriz:', d.enderecoMatriz],
        ['Estabelecimento Avaliado:', d.estabelecimento],
        ['Representante Legal:', d.representanteLegal],
        ['População Trabalhadora:', d.totalTrabalhadores],
        ['Contato / E-mail:', d.contato],
      ].map(
        ([label, val]) =>
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
                width: { size: 3500, type: WidthType.DXA },
                shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' },
                borders: cellBorder,
              }),
              new TableCell({
                children: [new Paragraph({ text: val })],
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

      if (el) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Responsável Técnico pela Elaboração e ART:', bold: true })],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ text: `• Nome: ${el.nome}` }),
          new Paragraph({ text: `• Qualificação: ${el.cargo}` }),
          new Paragraph({ text: `• Registro Profissional: ${el.conselho}` }),
          new Paragraph({ text: `• Número da ART / RRT: ${el.art}` }),
          new Paragraph({ text: `• Consultoria Especializada: ${el.empresaConsultoria}` })
        );
      }

      if (med) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Médico Coordenador do PCMSO (NR-07):', bold: true })],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ text: `• Nome: ${med.nome}` }),
          new Paragraph({ text: `• Conselho: ${med.conselho}` })
        );
      }
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
            ...block.rows.map((row) =>
              new TableRow({
                children: row.map((cell) => {
                  const trimmed = cell.trim();
                  let fill: string | undefined = undefined;
                  let textColor: string | undefined = undefined;
                  let align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;

                  if (/\(TRI\)/i.test(trimmed)) {
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
                  }

                  return new TableCell({
                    children: [
                      new Paragraph({
                        children: fill
                          ? [new TextRun({ text: trimmed, color: textColor, bold: true })]
                          : parseTextToTextRuns(cell),
                        alignment: align,
                      })
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
          const paras = block.content.split('\n\n');
          for (const p of paras) {
            children.push(new Paragraph({ children: parseTextToTextRuns(p), spacing: { after: 150 } }));
          }
        }
      }
    } else if (section.type === 'sectors_list') {
      for (const s of section.sectors) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Setor: ${s.name}`, bold: true })],
            spacing: { before: 200, after: 80 },
          })
        );
        if (s.description) {
          children.push(new Paragraph({ text: `Descrição: ${s.description}` }));
        }
        if (s.characteristics && s.characteristics.floorType) {
          children.push(
            new Paragraph({
              text: `Estrutura Física: Piso ${s.characteristics.floorType || '-'} | Paredes ${s.characteristics.wallType || '-'} | Cobertura ${s.characteristics.roofType || '-'} | Ventilação ${s.characteristics.ventilationType || '-'} | Iluminação ${s.characteristics.lightingType || '-'}`,
              spacing: { after: 150 },
            })
          );
        }
      }
    } else if (section.type === 'risk_inventory_table') {
      const items = section.items;

      if (!items || items.length === 0) {
        children.push(new Paragraph({ text: 'Nenhum risco cadastrado no inventário.', spacing: { after: 200 } }));
      } else {
        const headerGray = '52525B';
        const sectionGray = 'E2E8F0';
        const labelGray = 'F8FAFC';

        for (const item of items) {
          const sec = ctx.sectors.find(s => s.id === item.sectorId);
          const pos = ctx.positions.find(p => p.id === item.positionId);
          const ghe = ctx.ghes.find(g => g.id === item.gheId);
          const catConfig = HAZARD_CATEGORY_CONFIG[item.hazardCategory as HazardCategory];
          const catHex = (catConfig?.color || '#16a34a').replace('#', '');

          const posTitle = pos?.title ? `Cargo / Função: ${pos.title}${pos.cbo ? ` (CBO: ${pos.cbo})` : ''}` : (ghe?.name ? `Cargo / Função: ${ghe.name}` : 'Cargo / Função: Geral');
          const sectorInfo = `Setor: ${sec?.name || '-'} | Efetivo Exposto: ${pos?.workerCount || ghe?.workerCount || 1} trabalhador(es)`;
          const activityDesc = `Descrição da Atividade: ${pos?.activityDescription || pos?.routineActivities || pos?.description || ghe?.description || 'Não identificada'}`;

          children.push(
            new Paragraph({
              children: [new TextRun({ text: posTitle, bold: true, size: 20 })],
              spacing: { before: 280, after: 60 },
            }),
            new Paragraph({
              children: [new TextRun({ text: sectorInfo, size: 18, color: '475569' })],
              spacing: { after: 60 },
            }),
            new Paragraph({
              children: parseTextToTextRuns(activityDesc),
              spacing: { after: 120 },
            })
          );

          const gesCode = ghe?.code ? `GES ${ghe.code}` : (sec?.name ? `GES - ${sec.name}` : 'GES 1.1');
          const headerTitle = `${gesCode} APR-HO - ${docData.header.elaborationDate || '02/2026'}`;

          let expPart1 = 'Habitual';
          let expPart2 = 'Permanente';
          if (item.exposureType === 'HABITUAL_INTERMITENTE') {
            expPart1 = 'Habitual';
            expPart2 = 'Intermitente';
          } else if (item.exposureType === 'EVENTUAL_INTERMITENTE') {
            expPart1 = 'Eventual';
            expPart2 = 'Intermitente';
          } else if (item.exposureType === 'EVENTUAL') {
            expPart1 = 'Eventual';
            expPart2 = 'NAP';
          } else if (item.exposureType === 'HABITUAL') {
            expPart1 = 'Habitual';
            expPart2 = 'NAP';
          } else if (item.exposureType === 'PERMANENTE') {
            expPart1 = 'NAP';
            expPart2 = 'Permanente';
          } else if (item.exposureType === 'INTERMITENTE') {
            expPart1 = 'NAP';
            expPart2 = 'Intermitente';
          }

          const epcStr = item.epcExisting && item.epcExisting.length > 0 ? item.epcExisting.join(', ') : '';
          const epiStr = item.epiExisting && item.epiExisting.length > 0
            ? item.epiExisting.map((e: any) => `${e.name} (CA: ${e.ca || 'S/N'})`).join('; ')
            : '';
          const epcEpiFinal = [epcStr ? `EPC: ${epcStr}` : '', epiStr ? `EPI: ${epiStr}` : ''].filter(Boolean).join(' | ') || 'NAP';

          const meas = item.measurements && item.measurements.length > 0 ? item.measurements[0] : null;
          const criterio = meas?.criteria || (meas ? 'Quantitativo (Pontual)' : 'Qualitativo / NAP');
          const tecnica = meas?.technique || (meas ? 'NR-15 / NHO' : 'NAP');
          const dataMedicao = meas?.measurementDate || (meas ? '25/02/2026' : 'NAP');
          const resultado = meas?.resultText || (meas?.measuredValue ? `${meas.measuredValue} ${meas.unit || ''}` : 'NAP');
          const lt = meas?.toleranceLimitText || (meas?.toleranceLimit ? `${meas.toleranceLimit} ${meas.unit || ''}` : 'NAP');

          let statusAgente = 'Risco Baixo';
          let statusHex = '16A34A';
          let prioridade = 'Baixa';

          if (item.riskLevel === 'TRIVIAL') {
            statusAgente = 'Risco Muito Baixo';
            statusHex = '16A34A';
            prioridade = 'Nenhuma';
          } else if (item.riskLevel === 'TOLERAVEL') {
            statusAgente = 'Risco Baixo';
            statusHex = '16A34A';
            prioridade = 'Baixa';
          } else if (item.riskLevel === 'MODERADO') {
            statusAgente = 'Risco Médio';
            statusHex = 'D97706';
            prioridade = 'Média';
          } else if (item.riskLevel === 'SUBSTANCIAL') {
            statusAgente = 'Risco Alto';
            statusHex = 'EA580C';
            prioridade = 'Alta';
          } else if (item.riskLevel === 'INTOLERAVEL') {
            statusAgente = 'Risco Crítico';
            statusHex = 'DC2626';
            prioridade = 'Crítica / Imediata';
          }

          const rows = [
            // Row 1: Header Gray
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 4,
                  shading: { fill: headerGray, type: ShadingType.CLEAR, color: 'auto' },
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: headerTitle, bold: true, color: 'FFFFFF' })],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: cellBorder,
                }),
              ],
            }),

            // Row 2: Risco Categoria & Agente
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 1,
                  shading: { fill: catHex, type: ShadingType.CLEAR, color: 'auto' },
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: `Risco ${catConfig?.label || 'Físico'}`, bold: true, color: 'FFFFFF' })],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 3,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'Agente: ', bold: true }),
                        new TextRun({ text: item.hazardName }),
                      ],
                    }),
                  ],
                  borders: cellBorder,
                }),
              ],
            }),

            // Row 3: Tipo de Exposição
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 1,
                  shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Tipo de Exposição', bold: true })] })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 1,
                  children: [new Paragraph({ text: expPart1, alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 2,
                  children: [new Paragraph({ text: expPart2, alignment: AlignmentType.CENTER })],
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
                  children: [new Paragraph({ children: [new TextRun({ text: 'Fontes ou circunstância', bold: true })] })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 3,
                  children: [new Paragraph({ text: item.sourceDescription || 'NAP' })],
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
                  children: [new Paragraph({ children: [new TextRun({ text: 'Trajetória', bold: true })] })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 3,
                  children: [new Paragraph({ text: item.trajectory || 'Ar' })],
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
                  children: [new Paragraph({ children: [new TextRun({ text: 'Via de penetração', bold: true })] })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 3,
                  children: [new Paragraph({ text: item.penetrationRoute || 'NAP' })],
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
                  children: [new Paragraph({ children: [new TextRun({ text: 'Efeitos a saúde', bold: true })] })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 3,
                  children: [new Paragraph({ text: item.healthDamage || 'NAP' })],
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
                  children: [new Paragraph({ children: [new TextRun({ text: 'EPC/EPI', bold: true })] })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 3,
                  children: [new Paragraph({ text: epcEpiFinal })],
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
                  children: [new Paragraph({ children: [new TextRun({ text: 'Medição', bold: true })], alignment: AlignmentType.CENTER })],
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
                        new TextRun({ text: 'Critério: ', bold: true }),
                        new TextRun({ text: criterio }),
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
                        new TextRun({ text: 'Técnica utilizada: ', bold: true }),
                        new TextRun({ text: tecnica }),
                      ],
                    }),
                  ],
                  borders: cellBorder,
                }),
              ],
            }),

            // Row 11: Data da medição | Resultado | LT Headers
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 1,
                  shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Data da medição', bold: true })], alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 2,
                  shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Resultado', bold: true })], alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 1,
                  shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'LT', bold: true })], alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
              ],
            }),

            // Row 12: Data da medição | Resultado | LT Values
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 1,
                  children: [new Paragraph({ text: dataMedicao, alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 2,
                  children: [new Paragraph({ children: [new TextRun({ text: resultado, bold: true })], alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 1,
                  children: [new Paragraph({ text: lt, alignment: AlignmentType.CENTER })],
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
                  children: [new Paragraph({ children: [new TextRun({ text: 'Categorização do risco/perigo', bold: true })], alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
              ],
            }),

            // Row 14: Severidade | Probabilidade | Status do agente | Prioridade Headers
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 1,
                  shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Severidade', bold: true })], alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 1,
                  shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Probabilidade', bold: true })], alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 1,
                  shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Status do agente', bold: true })], alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 1,
                  shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Prioridade de ação', bold: true })], alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
              ],
            }),

            // Row 15: Severidade | Probabilidade | Status do agente | Prioridade Values
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 1,
                  children: [new Paragraph({ text: String(item.severity), alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 1,
                  children: [new Paragraph({ text: String(item.probability), alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 1,
                  children: [new Paragraph({ children: [new TextRun({ text: statusAgente, bold: true, color: statusHex })], alignment: AlignmentType.CENTER })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 1,
                  children: [new Paragraph({ text: prioridade, alignment: AlignmentType.CENTER })],
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
                  children: [new Paragraph({ children: [new TextRun({ text: 'Recomendações', bold: true })], alignment: AlignmentType.CENTER })],
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
                  children: [new Paragraph({ children: [new TextRun({ text: 'Recomendações', bold: true })] })],
                  borders: cellBorder,
                }),
                new TableCell({
                  columnSpan: 3,
                  children: [new Paragraph({ text: item.recommendations || 'NAP' })],
                  borders: cellBorder,
                }),
              ],
            }),
          ];

          children.push(
            new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
            new Paragraph({ text: '', spacing: { after: 200 } })
          );
        }
      }
    } else if (section.type === 'action_plan_table') {
      const actions = section.items;
      const gesLabel = ctx.ghes.length > 0 ? `GES ${ctx.ghes[0].code || '1.0'}` : 'GES 1.0';

      const defaultMetas = [
        ['Manter o fornecimento e a obrigatoriedade do uso dos EPIs especificados, com substituição conforme condições de uso, desgaste e orientação do fabricante.', '2', 'Contínuo', 'Contínuo', 'SESMT / RH', 'EM ANDAMENTO'],
        ['Realizar inspeções periódicas das condições de segurança dos ambientes, equipamentos e instalações.', '2', 'Contínuo', 'Contínuo', 'SESMT / Manutenção', 'EM ANDAMENTO'],
        ['Manter os treinamentos e orientações de segurança conforme os riscos e as atividades desenvolvidas.', '2', 'Contínuo', 'Contínuo', 'RH / Treinamento', 'PROGRAMADO'],
        ['Manter as medidas de controle existentes para os agentes ocupacionais identificados e acompanhar sua eficácia.', '2', 'Contínuo', 'Contínuo', 'SESMT / Diretoria', 'EM ANDAMENTO'],
        ['Realizar avaliações quantitativas dos agentes físicos e químicos, quando aplicável, conforme os critérios técnicos e legais pertinentes.', '2', 'Contínuo', 'Contínuo', 'Consultoria SST', 'A INICIAR'],
        ['Elaborar e implementar o PPR – Programa de Proteção Respiratória, quando aplicável.', '2', 'Contínuo', 'Contínuo', 'SESMT', 'A INICIAR'],
        ['Avaliar e acompanhar os fatores de riscos psicossociais relacionados ao trabalho, implementando medidas de prevenção quando necessárias.', '2', 'Contínuo', 'Contínuo', 'RH / Gestão', 'A INICIAR'],
        ['Reavaliar as condições de trabalho sempre que houver alterações nos processos, ambientes, atividades ou identificação de novos riscos.', '2', 'Contínuo', 'Contínuo', 'SESMT / Diretoria', 'EM ANDAMENTO']
      ];

      const dataRows = (!actions || actions.length === 0)
        ? defaultMetas.map(([meta, prio, start, end, who, st]) => 
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: meta })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: prio, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: start, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: end, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: who, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: st, alignment: AlignmentType.CENTER })], borders: cellBorder }),
              ]
            })
          )
        : actions.map((act: ActionPlanItem) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: act.what })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: '2', alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: 'Contínuo', alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: act.whenDate || 'Contínuo', alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: act.who || 'SESMT', alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: act.status.replace('_', ' ').toUpperCase(), alignment: AlignmentType.CENTER })], borders: cellBorder }),
              ],
            })
          );

      const rows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Metas', bold: true })] })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Grau de Prioridade', bold: true })], alignment: AlignmentType.CENTER })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Prazo Inicial', bold: true })], alignment: AlignmentType.CENTER })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Prazo Final', bold: true })], alignment: AlignmentType.CENTER })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Responsável', bold: true })], alignment: AlignmentType.CENTER })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })], alignment: AlignmentType.CENTER })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 6,
              children: [new Paragraph({ children: [new TextRun({ text: gesLabel, bold: true })], alignment: AlignmentType.CENTER })],
              borders: cellBorder,
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR, color: 'auto' }
            })
          ]
        }),
        ...dataRows
      ];

      children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    } else if (section.type === 'closing_signatures') {
      children.push(
        new Paragraph({ text: section.text, spacing: { after: 300 } }),
        new Paragraph({
          text: `${section.city}/${section.state}, ${section.date}.`,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 800 },
        }),
        new Paragraph({
          text: '____________________________________________________',
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `${docData.header.techRespName}\n${docData.header.techRespCouncil}\n${docData.header.techRespArt}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),
        new Paragraph({
          text: '____________________________________________________',
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `${ctx.company.legalRepresentative}\n${ctx.company.representativeRole}\n${ctx.company.name}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }
  }

  // Gera o documento .docx
  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = ctx.company.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `PGR_${cleanName}_${docData.header.year}.docx`;
  saveAs(blob, filename);
}
