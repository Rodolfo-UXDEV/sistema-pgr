import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PgrDocumentContext, buildPgrFullDocument, OFFICIAL_PGR_TEXTS } from '@/lib/pgr-official-template';
import { parseContentWithTables } from '@/lib/table-parser';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
import { HazardCategory, RiskInventoryItem, ActionPlanItem } from '@/types/pgr';
import { getIssuerCompanyConfig } from '@/lib/issuer-company-service';
import { ensurePngDataUrl } from '@/lib/image-utils';
import { DEFAULT_EMISSORA_LOGO, DEFAULT_CLIENTE_LOGO } from '@/lib/default-logos';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

export async function generatePgrPdf(ctx: PgrDocumentContext): Promise<void> {
  const docData = buildPgrFullDocument(ctx);
  const issuerConfig = getIssuerCompanyConfig();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Converte e garante que ambas as imagens sejam PNGs rasterizados válidos para o jsPDF
  const emissoraLogoUrl = issuerConfig.logoUrl || DEFAULT_EMISSORA_LOGO;
  const clienteLogoUrl = docData.header.companyLogo || DEFAULT_CLIENTE_LOGO;

  const emissoraPng = await ensurePngDataUrl(emissoraLogoUrl, 600, 150);
  const clientePng = await ensurePngDataUrl(clienteLogoUrl, 600, 150);

  const primaryColor: [number, number, number] = [15, 118, 110]; // Teal 700
  const secondaryColor: [number, number, number] = [51, 65, 85]; // Slate 700
  const headerGray: [number, number, number] = [82, 82, 91]; // Dark Charcoal Zinc 600
  const sectionGray: [number, number, number] = [226, 232, 240]; // Light Gray Slate 200
  const labelGray: [number, number, number] = [248, 250, 252]; // Slate 50

  // Helper para verificar espaço de página
  const checkPageBreak = (neededHeight: number = 20) => {
    if (currentY + neededHeight > 275) {
      doc.addPage();
      currentY = 20;
    }
  };

  // ==========================================
  // CAPA INSTITUCIONAL OFICIAL
  // ==========================================
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 12, 'F');
  doc.rect(0, 285, 210, 12, 'F');

  // 1. Logotipo da Empresa Emissora / Consultoria SST
  if (emissoraPng && emissoraPng.startsWith('data:image/')) {
    try {
      doc.addImage(emissoraPng, 'PNG', 65, 16, 80, 20, undefined, 'FAST');
    } catch (e) {
      console.error('Erro ao adicionar logo da emissora no PDF:', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(docData.header.consultingCompany || OFFICIAL_PGR_TEXTS.consultingCompany, 105, 41, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(docData.header.consultingCrea || OFFICIAL_PGR_TEXTS.consultingCrea, 105, 46, { align: 'center' });

  // Título Principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PROGRAMA DE GERENCIAMENTO', 105, 66, { align: 'center' });
  doc.text('DE RISCOS - PGR', 105, 74, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('GERENCIAMENTO DE RISCOS OCUPACIONAIS (GRO) — NR-01', 105, 83, { align: 'center' });

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(40, 89, 170, 89);

  // 2. Dados da Empresa com Logotipo do Cliente
  if (clientePng && clientePng.startsWith('data:image/')) {
    try {
      doc.addImage(clientePng, 'PNG', 65, 95, 80, 20, undefined, 'FAST');
    } catch (e) {
      console.error('Erro ao adicionar logo do cliente no PDF:', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(docData.header.companyName.toUpperCase(), 105, 122, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`CNPJ: ${docData.header.cnpj}`, 105, 129, { align: 'center' });
  doc.text(`Estabelecimento: ${docData.header.establishmentName}`, 105, 135, { align: 'center' });

  // Bloco de Identificação
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(30, 155, 150, 45, 3, 3, 'FD');
  doc.setDrawColor(203, 213, 225);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`DOCUMENTO TÉCNICO: ${docData.header.code} (REV: ${docData.header.version})`, 35, 165);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Vigência: ${docData.header.validityPeriod}`, 35, 172);
  doc.text(`Responsável Técnico: ${docData.header.techRespName}`, 35, 179);
  doc.text(`Registro de Classe: ${docData.header.techRespCouncil} | ART: ${docData.header.techRespArt}`, 35, 186);
  doc.text(`Data de Elaboração: ${docData.header.elaborationDate}`, 35, 193);

  // Rodapé da Capa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${ctx.company.address.city}/${ctx.company.address.state} — ${docData.header.year}`, 105, 265, { align: 'center' });

  // ==========================================
  // PÁGINAS DO DOCUMENTO (SEÇÕES 1 A 18)
  // ==========================================
  doc.addPage();
  let currentY = 20;

  for (const section of docData.sections) {
    if (section.type === 'text') {
      checkPageBreak(30);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 6;

      const blocks = parseContentWithTables(section.content);
      for (const block of blocks) {
        if (block.type === 'text') {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          const lines = doc.splitTextToSize(block.content, 182);
          checkPageBreak(lines.length * 4 + 5);
          doc.text(lines, 14, currentY);
          currentY += lines.length * 4 + 4;
        } else if (block.type === 'table') {
          checkPageBreak(25);
          autoTable(doc, {
            startY: currentY,
            head: [block.headers],
            body: block.rows,
            theme: 'grid',
            headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 8 },
            styles: { fontSize: 7.5, cellPadding: 2 },
            margin: { left: 14, right: 14 },
          });
          currentY = (doc as any).lastAutoTable.finalY + 6;
        }
      }
      currentY += 4;

    } else if (section.type === 'sectors_list') {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 6;

      for (const s of section.sectors) {
        checkPageBreak(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`Setor: ${s.name}`, 14, currentY);
        currentY += 4;

        if (s.description) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          const descLines = doc.splitTextToSize(`Descrição: ${s.description}`, 182);
          doc.text(descLines, 14, currentY);
          currentY += descLines.length * 3.5 + 2;
        }

        if (s.characteristics && s.characteristics.floorType) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          const structText = `Estrutura Física: Piso ${s.characteristics.floorType || '-'} | Paredes ${s.characteristics.wallType || '-'} | Cobertura ${s.characteristics.roofType || '-'} | Ventilação ${s.characteristics.ventilationType || '-'} | Iluminação ${s.characteristics.lightingType || '-'}`;
          const structLines = doc.splitTextToSize(structText, 182);
          doc.text(structLines, 14, currentY);
          currentY += structLines.length * 3.5 + 5;
        } else {
          currentY += 2;
        }
      }

    } else if (section.type === 'positions_list') {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 6;

      for (const p of section.positions) {
        checkPageBreak(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`Cargo / Função: ${p.title} (CBO: ${p.cbo})`, 14, currentY);
        currentY += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`Setor: ${p.sectorName} | Efetivo Exposto: ${p.workers} trabalhador(es)`, 14, currentY);
        currentY += 4;

        const actLines = doc.splitTextToSize(`Descrição da Atividade: ${p.activityDescription || p.routine || '-'}`, 182);
        doc.text(actLines, 14, currentY);
        currentY += actLines.length * 3.5 + 4;
      }

    } else if (section.type === 'risk_inventory_table') {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 6;

      const items = section.items;
      if (!items || items.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text('Nenhum risco registrado no inventário.', 14, currentY);
        currentY += 8;
      } else {
        for (const item of items) {
          checkPageBreak(65);

          const sec = ctx.sectors.find(s => s.id === item.sectorId);
          const pos = ctx.positions.find(p => p.id === item.positionId);
          const ghe = ctx.ghes.find(g => g.id === item.gheId);
          const catConfig = HAZARD_CATEGORY_CONFIG[item.hazardCategory as HazardCategory];
          const catRgb = hexToRgb(catConfig?.color || '#16a34a');

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
          const dataMedicao = meas?.measurementDate 
            ? (meas.measurementDate.includes('-') ? meas.measurementDate.split('-').reverse().join('/') : meas.measurementDate)
            : (meas ? '25/02/2026' : 'NAP');
          const resultado = meas?.resultText || (meas?.measuredValue ? `${meas.measuredValue} ${meas.unit || ''}` : 'NAP');
          const lt = meas?.toleranceLimitText || (meas?.toleranceLimit ? `${meas.toleranceLimit} ${meas.unit || ''}` : 'NAP');

          let statusAgente = 'Risco Baixo';
          let prioridade = 'Baixa';

          if (item.riskLevel === 'TRIVIAL') {
            statusAgente = 'Risco Muito Baixo';
            prioridade = 'Nenhuma';
          } else if (item.riskLevel === 'TOLERAVEL') {
            statusAgente = 'Risco Baixo';
            prioridade = 'Baixa';
          } else if (item.riskLevel === 'MODERADO') {
            statusAgente = 'Risco Médio';
            prioridade = 'Média';
          } else if (item.riskLevel === 'SUBSTANCIAL') {
            statusAgente = 'Risco Alto';
            prioridade = 'Alta';
          } else if (item.riskLevel === 'INTOLERAVEL') {
            statusAgente = 'Risco Crítico';
            prioridade = 'Crítica / Imediata';
          }

          const tableBody = [
            // Row 1: Header Dark Gray
            [
              { content: headerTitle, colSpan: 4, styles: { fillColor: headerGray, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 8.5 } }
            ],
            // Row 2: Risco Categoria & Agente
            [
              { content: `Risco ${catConfig?.label || 'Físico'}`, colSpan: 1, styles: { fillColor: catRgb, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' } },
              { content: `Agente: ${item.hazardName}`, colSpan: 3, styles: { fontStyle: 'bold', textColor: [15, 23, 42] } }
            ],
            // Row 3: Tipo de Exposição
            [
              { content: 'Tipo de Exposição', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold' } },
              { content: expPart1, colSpan: 1, styles: { halign: 'center' } },
              { content: expPart2, colSpan: 2, styles: { halign: 'center' } }
            ],
            // Row 4: Fontes ou circunstância
            [
              { content: 'Fontes ou circunstância', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold' } },
              { content: item.sourceDescription || 'NAP', colSpan: 3 }
            ],
            // Row 5: Trajetória
            [
              { content: 'Trajetória', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold' } },
              { content: item.trajectory || 'Ar', colSpan: 3 }
            ],
            // Row 6: Via de penetração
            [
              { content: 'Via de penetração', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold' } },
              { content: item.penetrationRoute || 'NAP', colSpan: 3 }
            ],
            // Row 7: Efeitos a saúde
            [
              { content: 'Efeitos a saúde', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold' } },
              { content: item.healthDamage || 'NAP', colSpan: 3 }
            ],
            // Row 8: EPC/EPI
            [
              { content: 'EPC/EPI', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold' } },
              { content: epcEpiFinal, colSpan: 3 }
            ],
            // Section Header: Medição
            [
              { content: 'Medição', colSpan: 4, styles: { fillColor: sectionGray, fontStyle: 'bold', halign: 'center', textColor: [15, 23, 42] } }
            ],
            // Row 10: Critério & Técnica
            [
              { content: `Critério: ${criterio}`, colSpan: 2, styles: { fontStyle: 'bold' } },
              { content: `Técnica utilizada: ${tecnica}`, colSpan: 2, styles: { fontStyle: 'bold' } }
            ],
            // Row 11: Data da medição | Resultado | LT Headers
            [
              { content: 'Data da medição', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold', halign: 'center' } },
              { content: 'Resultado', colSpan: 2, styles: { fillColor: labelGray, fontStyle: 'bold', halign: 'center' } },
              { content: 'LT', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold', halign: 'center' } }
            ],
            // Row 12: Data da medição | Resultado | LT Values
            [
              { content: dataMedicao, colSpan: 1, styles: { halign: 'center' } },
              { content: resultado, colSpan: 2, styles: { fontStyle: 'bold', halign: 'center' } },
              { content: lt, colSpan: 1, styles: { halign: 'center' } }
            ],
            // Section Header: Categorização do risco/perigo
            [
              { content: 'Categorização do risco/perigo', colSpan: 4, styles: { fillColor: sectionGray, fontStyle: 'bold', halign: 'center', textColor: [15, 23, 42] } }
            ],
            // Row 14: Severidade | Probabilidade | Status do agente | Prioridade Headers
            [
              { content: 'Severidade', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold', halign: 'center' } },
              { content: 'Probabilidade', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold', halign: 'center' } },
              { content: 'Status do agente', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold', halign: 'center' } },
              { content: 'Prioridade de ação', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold', halign: 'center' } }
            ],
            // Row 15: Severidade | Probabilidade | Status do agente | Prioridade Values
            [
              { content: String(item.severity), colSpan: 1, styles: { halign: 'center', fontStyle: 'bold' } },
              { content: String(item.probability), colSpan: 1, styles: { halign: 'center', fontStyle: 'bold' } },
              { content: statusAgente, colSpan: 1, styles: { halign: 'center', fontStyle: 'bold', textColor: catRgb } },
              { content: prioridade, colSpan: 1, styles: { halign: 'center', fontStyle: 'bold' } }
            ],
            // Section Header: Recomendações
            [
              { content: 'Recomendações', colSpan: 4, styles: { fillColor: sectionGray, fontStyle: 'bold', halign: 'center', textColor: [15, 23, 42] } }
            ],
            // Row 17: Recomendações Values
            [
              { content: 'Recomendações', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold' } },
              { content: item.recommendations || 'NAP', colSpan: 3 }
            ]
          ];

          autoTable(doc, {
            startY: currentY,
            body: tableBody as any,
            theme: 'grid',
            styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
            margin: { left: 14, right: 14 },
          });

          currentY = (doc as any).lastAutoTable.finalY + 8;
        }
      }

    } else if (section.type === 'action_plan_table') {
      checkPageBreak(35);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 6;

      const actions = section.items;
      const actionRows = (!actions || actions.length === 0)
        ? [['Nenhuma ação programada no plano de prevenção.', '-', '-', '-', '-', '-']]
        : actions.map((act: ActionPlanItem) => [
            act.what,
            act.why,
            act.who,
            act.whenDate,
            `R$ ${Number(act.howMuch || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            act.status.replace('_', ' ').toUpperCase(),
          ]);

      autoTable(doc, {
        startY: currentY,
        head: [['O que (Ação)', 'Por que (Motivo)', 'Quem (Responsável)', 'Prazo', 'Custo (R$)', 'Status']],
        body: actionRows,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 2.5 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 45 },
          2: { cellWidth: 30 },
          3: { cellWidth: 22, halign: 'center' },
          4: { cellWidth: 22, halign: 'right' },
          5: { cellWidth: 18, halign: 'center' },
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;

    } else if (section.type === 'closing_signatures') {
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const closeLines = doc.splitTextToSize(section.text, 182);
      doc.text(closeLines, 14, currentY);
      currentY += closeLines.length * 4 + 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${section.city}/${section.state}, ${section.date}.`, 196, currentY, { align: 'right' });
      currentY += 20;

      // Linhas de Assinaturas
      checkPageBreak(30);
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.5);

      // Assinatura 1 (RT)
      doc.line(20, currentY, 95, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(docData.header.techRespName, 57.5, currentY + 4, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${docData.header.techRespCouncil} | ${docData.header.techRespArt}`, 57.5, currentY + 8, { align: 'center' });
      doc.text('Responsável Técnico SST', 57.5, currentY + 12, { align: 'center' });

      // Assinatura 2 (Empresa)
      doc.line(115, currentY, 190, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(ctx.company.legalRepresentative, 152.5, currentY + 4, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(ctx.company.representativeRole, 152.5, currentY + 8, { align: 'center' });
      doc.text(ctx.company.name, 152.5, currentY + 12, { align: 'center' });

      currentY += 20;
    }
  }

  // Download do arquivo PDF
  const sanitizedCompany = ctx.company.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`PGR_${sanitizedCompany}_${docData.header.code}.pdf`);
}
