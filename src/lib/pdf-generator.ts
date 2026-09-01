import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PgrDocumentContext, buildPgrFullDocument, OFFICIAL_PGR_TEXTS } from '@/lib/pgr-official-template';
import { parseContentWithTables } from '@/lib/table-parser';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
import { HazardCategory, ActionPlanItem } from '@/types/pgr';
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

  const emissoraLogoUrl = issuerConfig.logoUrl || DEFAULT_EMISSORA_LOGO;
  const clienteLogoUrl = docData.header.companyLogo || DEFAULT_CLIENTE_LOGO;

  const emissoraPng = await ensurePngDataUrl(emissoraLogoUrl, 600, 150);
  const clientePng = await ensurePngDataUrl(clienteLogoUrl, 600, 150);

  const primaryColor: [number, number, number] = [1, 133, 60]; // Hex #01853C
  const secondaryColor: [number, number, number] = [51, 65, 85];
  const headerGray: [number, number, number] = [82, 82, 91];
  const sectionGray: [number, number, number] = [226, 232, 240];
  const labelGray: [number, number, number] = [248, 250, 252];

  let currentY = 20;

  const checkPageBreak = (neededHeight: number = 20) => {
    if (currentY + neededHeight > 272) {
      doc.addPage();
      currentY = 20;
    }
  };

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 12, 'F');
  doc.rect(0, 285, 210, 12, 'F');

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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${ctx.company.address.city}/${ctx.company.address.state} — ${docData.header.year}`, 105, 265, { align: 'center' });

  doc.addPage();
  currentY = 20;

  for (const section of docData.sections) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    } else {
      checkPageBreak(30);
    }

    if (section.type === 'company_info') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, currentY, 196, currentY);
      currentY += 4;

      const d = section.data;
      const companyTableData = [
        [{ content: 'Razão Social', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: d.razaoSocial || '-' }],
        [{ content: 'Nome Fantasia', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: d.nomeFantasia || '-' }],
        [{ content: 'CNPJ', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: d.cnpj || '-' }],
        [{ content: 'Grau de Risco (NR-04)', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: d.grauDeRisco || '-' }],
        [{ content: 'Atividade Principal (CNAE)', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: d.cnae || '-' }],
        [{ content: 'Endereço da Matriz', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: d.enderecoMatriz || '-' }],
        [{ content: 'Estabelecimento Avaliado', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: d.estabelecimento || '-' }],
        [{ content: 'Responsável no Local', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: d.representanteLegal || '-' }],
        [{ content: 'Total de Trabalhadores', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: d.totalTrabalhadores || '-' }],
      ];

      autoTable(doc, {
        startY: currentY,
        body: companyTableData as any,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
        margin: { left: 14, right: 14 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 8;

    } else if (section.type === 'responsibles_info') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, currentY, 196, currentY);
      currentY += 4;

      const el = section.elaborador;
      const med = section.medicoPcmso;

      const respTableData: any[] = [];
      if (el) {
        respTableData.push(
          [{ content: 'Responsável Técnico pela Elaboração do PGR', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }],
          [{ content: 'Nome do Profissional', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: el.nome || '-' }],
          [{ content: 'Qualificação / Cargo', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: el.cargo || '-' }],
          [{ content: 'Registro Profissional', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: el.conselho || '-' }],
          [{ content: 'ART / RRT Vinculada', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: el.art || '-' }],
          [{ content: 'Consultoria Especializada', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: el.empresaConsultoria || '-' }]
        );
      }

      if (med) {
        respTableData.push(
          [{ content: 'Médico Coordenador do PCMSO (NR-07)', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }],
          [{ content: 'Nome do Médico', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: med.nome || '-' }],
          [{ content: 'Registro CRM', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: med.conselho || '-' }]
        );
      }

      autoTable(doc, {
        startY: currentY,
        body: respTableData as any,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
        margin: { left: 14, right: 14 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 8;

    } else if (section.type === 'text') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, currentY, 196, currentY);
      currentY += 4;

      const blocks = parseContentWithTables(section.content);
      for (const block of blocks) {
        if (block.type === 'text') {
          const paras = block.content.split('\n\n');
          for (const para of paras) {
            if (!para.trim()) continue;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(51, 65, 85);
            const cleanText = para.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
            const lines = doc.splitTextToSize(cleanText, 182);
            checkPageBreak(lines.length * 3.6 + 4);
            doc.text(lines, 14, currentY);
            currentY += lines.length * 3.6 + 3.5;
          }
        } else if (block.type === 'table') {
          checkPageBreak(25);
          const cleanHeaders = block.headers.map(h => h.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'));
          const cleanRows = block.rows.map(row => row.map(cell => cell.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')));
          autoTable(doc, {
            startY: currentY,
            head: [cleanHeaders],
            body: cleanRows,
            theme: 'grid',
            headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
            styles: { fontSize: 7, cellPadding: 2 },
            margin: { left: 14, right: 14 },
            didParseCell: (data) => {
              if (data.section === 'body') {
                const text = String(data.cell.raw || '').trim();
                if (/\(TRI\)/i.test(text)) {
                  data.cell.styles.fillColor = [16, 185, 129]; // Emerald 500
                  data.cell.styles.textColor = [255, 255, 255];
                  data.cell.styles.fontStyle = 'bold';
                  data.cell.styles.halign = 'center';
                } else if (/\(TOL\)/i.test(text)) {
                  data.cell.styles.fillColor = [132, 204, 22]; // Lime 500
                  data.cell.styles.textColor = [255, 255, 255];
                  data.cell.styles.fontStyle = 'bold';
                  data.cell.styles.halign = 'center';
                } else if (/\(MOD\)/i.test(text)) {
                  data.cell.styles.fillColor = [245, 158, 11]; // Amber 500
                  data.cell.styles.textColor = [255, 255, 255];
                  data.cell.styles.fontStyle = 'bold';
                  data.cell.styles.halign = 'center';
                } else if (/\(SUB\)/i.test(text)) {
                  data.cell.styles.fillColor = [249, 115, 22]; // Orange 500
                  data.cell.styles.textColor = [255, 255, 255];
                  data.cell.styles.fontStyle = 'bold';
                  data.cell.styles.halign = 'center';
                } else if (/\(INT\)/i.test(text)) {
                  data.cell.styles.fillColor = [225, 29, 72]; // Rose 600
                  data.cell.styles.textColor = [255, 255, 255];
                  data.cell.styles.fontStyle = 'bold';
                  data.cell.styles.halign = 'center';
                }
              }
            }
          });
          currentY = (doc as any).lastAutoTable.finalY + 6;
        }
      }
      currentY += 3;

    } else if (section.type === 'sectors_list') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, currentY, 196, currentY);
      currentY += 4;

      for (const s of section.sectors) {
        checkPageBreak(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`Setor: ${s.name}`, 14, currentY);
        currentY += 3.5;

        if (s.description) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          const descLines = doc.splitTextToSize(`Descrição: ${s.description}`, 182);
          doc.text(descLines, 14, currentY);
          currentY += descLines.length * 3.2 + 2;
        }

        if (s.characteristics && s.characteristics.floorType) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          const structText = `Estrutura Física: Piso ${s.characteristics.floorType || '-'} | Paredes ${s.characteristics.wallType || '-'} | Cobertura ${s.characteristics.roofType || '-'} | Ventilação ${s.characteristics.ventilationType || '-'} | Iluminação ${s.characteristics.lightingType || '-'}`;
          const structLines = doc.splitTextToSize(structText, 182);
          doc.text(structLines, 14, currentY);
          currentY += structLines.length * 3.2 + 4;
        } else {
          currentY += 2;
        }
      }
      currentY += 4;

    } else if (section.type === 'risk_inventory_table') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, currentY, 196, currentY);
      currentY += 5;

      const items = section.items;
      if (!items || items.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Nenhum risco registrado no inventário.', 14, currentY);
        currentY += 8;
      } else {
        for (const item of items) {
          const sec = ctx.sectors.find(s => s.id === item.sectorId);
          const pos = ctx.positions.find(p => p.id === item.positionId);
          const ghe = ctx.ghes.find(g => g.id === item.gheId);
          const catConfig = HAZARD_CATEGORY_CONFIG[item.hazardCategory as HazardCategory];
          const catRgb = hexToRgb(catConfig?.color || '#16a34a');

          const posTitle = pos?.title ? `Cargo / Função: ${pos.title}${pos.cbo ? ` (CBO: ${pos.cbo})` : ''}` : (ghe?.name ? `Cargo / Função: ${ghe.name}` : 'Cargo / Função: Geral');
          const sectorInfo = `Setor: ${sec?.name || '-'} | Efetivo Exposto: ${pos?.workerCount || ghe?.workerCount || 1} trabalhador(es)`;
          const rawActivity = pos?.activityDescription || pos?.routineActivities || pos?.description || ghe?.description || 'Não identificada';
          const cleanActivity = rawActivity.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
          const actLines = doc.splitTextToSize(`Descrição da Atividade: ${cleanActivity}`, 182);

          checkPageBreak(75 + actLines.length * 3.5);

          // Header do Cargo / Função & Atividades acima de cada APR-HO
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(posTitle, 14, currentY);
          currentY += 4;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          doc.text(sectorInfo, 14, currentY);
          currentY += 3.5;

          doc.text(actLines, 14, currentY);
          currentY += actLines.length * 3.2 + 2.5;

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
              { content: headerTitle, colSpan: 4, styles: { fillColor: headerGray, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 8 } }
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
            // Row 14: Headers Severidade, Probabilidade, Status, Prioridade
            [
              { content: 'Severidade', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold', halign: 'center' } },
              { content: 'Probabilidade', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold', halign: 'center' } },
              { content: 'Status do agente', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold', halign: 'center' } },
              { content: 'Prioridade de ação', colSpan: 1, styles: { fillColor: labelGray, fontStyle: 'bold', halign: 'center' } }
            ],
            // Row 15: Values
            [
              { content: item.severity, colSpan: 1, styles: { halign: 'center', fontStyle: 'bold' } },
              { content: item.probability, colSpan: 1, styles: { halign: 'center', fontStyle: 'bold' } },
              { content: statusAgente, colSpan: 1, styles: { halign: 'center', fontStyle: 'bold' } },
              { content: prioridade, colSpan: 1, styles: { halign: 'center' } }
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
            styles: { fontSize: 7, cellPadding: 1.8, textColor: [30, 41, 59] },
            margin: { left: 14, right: 14 },
          });

          currentY = (doc as any).lastAutoTable.finalY + 8;
        }
      }

    } else if (section.type === 'action_plan_table') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, currentY, 196, currentY);
      currentY += 5;

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

      const actionRows = (!actions || actions.length === 0)
        ? [
            [{ content: gesLabel, colSpan: 6, styles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'center' } }],
            ...defaultMetas
          ]
        : [
            [{ content: gesLabel, colSpan: 6, styles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'center' } }],
            ...actions.map((act: ActionPlanItem) => [
              act.what,
              '2',
              'Contínuo',
              act.whenDate ? (act.whenDate.includes('-') ? act.whenDate.split('-').reverse().join('/') : act.whenDate) : 'Contínuo',
              act.who || 'SESMT',
              act.status.replace('_', ' ').toUpperCase(),
            ])
          ];

      autoTable(doc, {
        startY: currentY,
        head: [['Metas', 'Grau de Prioridade', 'Prazo Inicial', 'Prazo Final', 'Responsável', 'Status']],
        body: actionRows as any,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
        styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 72 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 22, halign: 'center' },
          4: { cellWidth: 26, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;

    } else if (section.type === 'closing_signatures') {
      checkPageBreak(45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, currentY);
      currentY += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, currentY, 196, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const closeLines = doc.splitTextToSize(section.text, 182);
      doc.text(closeLines, 14, currentY);
      currentY += closeLines.length * 3.6 + 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${section.city}/${section.state}, ${section.date}.`, 196, currentY, { align: 'right' });
      currentY += 18;

      checkPageBreak(30);
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.5);
      doc.line(20, currentY, 95, currentY);
      doc.text(docData.header.techRespName, 57.5, currentY + 4, { align: 'center' });
      doc.line(115, currentY, 190, currentY);
      doc.text(ctx.company.legalRepresentative, 152.5, currentY + 4, { align: 'center' });
      currentY += 20;
    }
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`PGR — Programa de Gerenciamento de Riscos (NR-01) | ${docData.header.companyName}`, 14, 9);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, 11, 196, 11);
    doc.line(14, 283, 196, 283);
    doc.text(`${docData.header.code} (v${docData.header.version}) | Vigência: ${docData.header.validityPeriod}`, 14, 287);
    doc.text(`Página ${p} de ${totalPages}`, 196, 287, { align: 'right' });
  }

  const sanitizedCompany = ctx.company.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`PGR_${sanitizedCompany}_${docData.header.code}.pdf`);
}
