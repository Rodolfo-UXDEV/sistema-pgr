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
  VerticalAlign 
} from 'docx';
import { saveAs } from 'file-saver';
import { PgrDocumentContext, buildPgrFullDocument, filterContextForCompany, OFFICIAL_PGR_TEXTS } from '@/lib/pgr-official-template';
import { parseContentWithTables } from '@/lib/table-parser';
import { HAZARD_CATEGORY_CONFIG, getNormativeRiskMatrix } from '@/lib/risk-matrix';
import { RiskInventoryItem, ActionPlanItem, HazardCategory } from '@/types/pgr';
import { groupInventoryByGhe, isNoExposureRisk } from '@/lib/pgr-groups';
import { ensurePngDataUrl, dataUrlToUint8Array } from '@/lib/image-utils';
import { DEFAULT_EMISSORA_LOGO, DEFAULT_CLIENTE_LOGO } from '@/lib/default-logos';
import { formatCNPJ } from '@/lib/utils';

function parseTextToTextRuns(text: string): TextRun[] {
  if (!text) return [new TextRun({ text: '', color: '000000' })];
  const tokens = text.split(/(\*\*[\s\S]*?\*\*|\*[^\*\n]+?\*)/g);
  return tokens.map((token) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return new TextRun({ text: token.slice(2, -2), bold: true, color: '000000' });
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      return new TextRun({ text: token.slice(1, -1), italics: true, color: '000000' });
    }
    return new TextRun({ text: token, color: '000000' });
  });
}

export async function generatePgrDocx(rawCtx: PgrDocumentContext): Promise<void> {
  const ctx = filterContextForCompany(rawCtx);
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
        spacing: { before: 600, after: 150 },
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
      text: `RESPONSÁVEL TÉCNICO: ${docData.header.techRespName} (${docData.header.techRespCouncil})`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `DATA DE ELABORAÇÃO: ${docData.header.elaborationDate}`,
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

    if (section.id === 'sec-1' || section.title.toLowerCase().includes('indice')) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'SEQUÊNCIA DO PROGRAMA DE GERENCIAMENTO DE RISCOS (PGR):',
              bold: true,
              color: '000000',
              size: 20,
            }),
          ],
          spacing: { before: 100, after: 120 },
        })
      );

      const rawLines = (section.content || '').split('\n');
      for (const line of rawLines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'SEQUÊNCIA DO PGR') continue;

        const isSubItem = line.startsWith('  ') || line.startsWith('\t') || trimmed.startsWith('GES') || trimmed.startsWith('- GES');
        const cleanText = trimmed.replace(/^-\s*/, '').replace(/^\*\s*/, '');

        if (isSubItem) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `    •  ${cleanText}`, color: '000000', size: 18 })],
              spacing: { after: 40 },
            })
          );
        } else {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `•  ${cleanText}`, bold: true, color: '000000', size: 20 })],
              spacing: { before: 80, after: 40 },
            })
          );
        }
      }
      continue;
    }

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
        const qualifText = el.qualificacoes && el.qualificacoes.length > 0
          ? el.qualificacoes.join(' | ')
          : (el.cargo || '-');

        const elParas = [
          new Paragraph({
            children: [new TextRun({ text: 'Responsável Técnico pela Elaboração e ART:', bold: true })],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ text: `• Nome: ${el.nome}` }),
          new Paragraph({ text: `• Qualificações / Cargos Habilitados: ${qualifText}` }),
          new Paragraph({ text: `• Registro Profissional: ${el.conselho}` }),
        ];

        if (el.cpf) {
          elParas.push(new Paragraph({ text: `• CPF do Responsável Técnico: ${el.cpf}` }));
        }

        if (el.art && el.art !== 'ART Emitida' && el.art !== '-' && el.art.trim() !== '') {
          elParas.push(new Paragraph({ text: `• Número da ART / RRT: ${el.art}` }));
        }

        elParas.push(new Paragraph({ text: `• Consultoria Especializada: ${el.empresaConsultoria}` }));
        children.push(...elParas);
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
          const paras = block.content.split('\n\n');
          for (const p of paras) {
            children.push(new Paragraph({ children: parseTextToTextRuns(p), spacing: { after: 150 }, alignment: AlignmentType.JUSTIFIED }));
          }
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
            const actLine = `Descrição da Atividade: ${pos.activityDescription}`;
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

                // Row 11: Data da Avaliação | Resultado | LT Headers
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      shading: { fill: labelGray, type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Data da Avaliação', bold: true })], alignment: AlignmentType.CENTER })],
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

                // Row 14: Severidade | Probabilidade | Nível de Risco | Prioridade de ação Headers
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
                      children: [new Paragraph({ children: [new TextRun({ text: 'Nível de Risco', bold: true })], alignment: AlignmentType.CENTER })],
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

                // Row 15: Severidade | Probabilidade | Nível de Risco | Prioridade Values
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 1,
                      children: [new Paragraph({ text: String(item.severity || '1'), alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 1,
                      children: [new Paragraph({ text: String(item.probability || '1'), alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 1,
                      children: [new Paragraph({ children: [new TextRun({ text: displayRiskLevel, bold: true, color: statusHex })], alignment: AlignmentType.CENTER })],
                      borders: cellBorder,
                    }),
                    new TableCell({
                      columnSpan: 1,
                      children: [new Paragraph({ text: prioridadeFinal, alignment: AlignmentType.CENTER })],
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
                      children: [new Paragraph({ children: [new TextRun({ text: 'Recomendações:', bold: true })] })],
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
                new TableCell({ children: [new Paragraph({ text: meta })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: prio, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: start, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: end, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: who, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: st, alignment: AlignmentType.CENTER })], borders: cellBorder }),
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
            const startDateText = act.startDate || 'Contínuo';
            const endDateText = act.whenDate || 'Contínuo';
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
                new TableCell({ children: [new Paragraph({ text: metaText, alignment: AlignmentType.JUSTIFIED })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: priorityText, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: startDateText, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: endDateText, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: responsibleText, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: statusText, alignment: AlignmentType.CENTER })], borders: cellBorder }),
              ],
            });
          });

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
      const creaText = docData.header.techRespCouncil
        ? (docData.header.techRespCouncil.toUpperCase().includes('CREA') 
            ? docData.header.techRespCouncil 
            : `CREA: ${docData.header.techRespCouncil}`)
        : 'CREA Habilitado';

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
          text: `${docData.header.techRespName}\n${creaText}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),
        new Paragraph({
          text: '____________________________________________________',
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `${ctx.company.name}\nCNPJ: ${formatCNPJ(ctx.company.cnpj)}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }
  }

  // Gera o documento .docx
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            color: '000000',
          },
        },
      },
    },
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
