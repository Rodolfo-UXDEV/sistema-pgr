import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PgrDocumentContext, buildPgrFullDocument, filterContextForCompany, OFFICIAL_PGR_TEXTS } from '@/lib/pgr-official-template';
import { parseContentWithTables } from '@/lib/table-parser';
import { HAZARD_CATEGORY_CONFIG, getNormativeRiskMatrix } from '@/lib/risk-matrix';
import { HazardCategory, ActionPlanItem } from '@/types/pgr';
import { getIssuerCompanyConfig } from '@/lib/issuer-company-service';
import { groupInventoryByGhe, isNoExposureRisk } from '@/lib/pgr-groups';
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

/**
 * Tokeniza parágrafo preservando trechos em negrito (**texto**)
 */
function parseMarkdownTokens(text: string): { text: string; bold: boolean }[] {
  const rawTokens: { text: string; bold: boolean }[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      rawTokens.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    rawTokens.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    rawTokens.push({ text: text.slice(lastIndex), bold: false });
  }
  return rawTokens;
}

/**
 * Renderiza blocos de texto/markdown com suporte a subtítulos, listas, alíneas e
 * alinhamento JUSTIFICADO nativo (preenchendo exatamente a largura com word spacing do PDF).
 * A última linha de cada bloco mantém alinhamento natural à esquerda.
 */
function renderMarkdownParagraphToPdf(
  doc: jsPDF,
  text: string,
  cursor: { y: number },
  checkPageBreak: (needed: number) => boolean,
  startX: number = 14,
  maxWidth: number = 182,
  lineHeight: number = 3.8
): void {
  const rawLines = text.replace(/\r\n/g, '\n').split('\n');

  let currentBlock: string[] = [];
  let currentType: 'para' | 'bullet' | 'alinea' | 'subalinea' | 'heading' = 'para';
  let prefix = '';
  let baseIndent = 0;
  let textIndent = 0;

  const flushBlock = () => {
    if (currentBlock.length === 0) return;
    const fullText = currentBlock.join(' ').replace(/\s+/g, ' ').trim();
    currentBlock = [];
    if (!fullText) return;

    if (currentType === 'heading') {
      checkPageBreak(lineHeight + 4);
      cursor.y += 1.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(fullText, startX, cursor.y);
      cursor.y += lineHeight + 1;
      return;
    }

    const itemStartX = startX + textIndent;
    const availWidth = maxWidth - textIndent;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    const wrapped: string[] = doc.splitTextToSize(fullText, availWidth);
    for (let i = 0; i < wrapped.length; i++) {
      checkPageBreak(lineHeight + 2);

      if (i === 0 && prefix) {
        if (currentType === 'subalinea') {
          doc.setFont('helvetica', 'bold');
          doc.text(prefix, itemStartX - 1.8, cursor.y, { align: 'right' });
          doc.setFont('helvetica', 'normal');
        } else if (currentType === 'alinea') {
          doc.setFont('helvetica', 'bold');
          doc.text(prefix, startX + baseIndent, cursor.y);
          doc.setFont('helvetica', 'normal');
        } else if (currentType === 'bullet') {
          doc.setFont('helvetica', 'normal');
          doc.text(prefix, startX + baseIndent, cursor.y);
        }
      }

      const isLastLine = (i === wrapped.length - 1);
      const lineText = wrapped[i];
      if (!isLastLine && lineText.includes(' ')) {
        doc.text([lineText, ''], itemStartX, cursor.y, { align: 'justify', maxWidth: availWidth });
      } else {
        doc.text(lineText, itemStartX, cursor.y);
      }
      cursor.y += lineHeight;
    }
    cursor.y += 1.2;
  };

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushBlock();
      continue;
    }

    // Identificação de títulos e subtítulos
    const isMarkdownHeader = /^#{1,6}\s+/.test(trimmed);
    const isSpecialHeader = /^CABE AO (EMPREGADOR|TRABALHADOR):?$/i.test(trimmed) ||
                           /^Principais referências normativas:?$/i.test(trimmed) ||
                           /^Tabela\s+\d+/i.test(trimmed);
    const isSectionNumberHeader = /^(\d+\.)+\s+[A-Z]/.test(trimmed) && trimmed.length < 80 && !/[;]$/.test(trimmed);
    const isAllCapsHeader = /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ0-9\s\.\-]{5,60}:$/.test(trimmed);

    const isHeading = isMarkdownHeader || isSpecialHeader || isSectionNumberHeader || isAllCapsHeader;

    // Marcadores de lista
    const bulletMatch = trimmed.match(/^([•\-\*])\s+(.*)$/);

    // Alíneas a) b) c)
    const alineaMatch = trimmed.match(/^([a-z]\))\s+(.*)$/i);

    // Numeração romana I. II. III.
    const romanMatch = trimmed.match(/^([IVXLCDM]+\.)\s+(.*)$/);

    if (isHeading) {
      flushBlock();
      currentType = 'heading';
      prefix = '';
      baseIndent = 0;
      textIndent = 0;
      currentBlock.push(trimmed.replace(/^#{1,6}\s+/, '').replace(/\*\*/g, ''));
      flushBlock();
    } else if (romanMatch) {
      flushBlock();
      currentType = 'subalinea';
      prefix = romanMatch[1];
      baseIndent = 6;
      textIndent = 12;
      currentBlock.push(romanMatch[2]);
    } else if (alineaMatch) {
      flushBlock();
      currentType = 'alinea';
      prefix = alineaMatch[1];
      baseIndent = 2;
      textIndent = 7;
      currentBlock.push(alineaMatch[2]);
    } else if (bulletMatch) {
      flushBlock();
      currentType = 'bullet';
      prefix = '•';
      baseIndent = 2;
      textIndent = 6;
      currentBlock.push(bulletMatch[2]);
    } else {
      if (currentBlock.length === 0) {
        currentType = 'para';
        prefix = '';
        baseIndent = 0;
        textIndent = 0;
      }
      currentBlock.push(trimmed);
    }
  }
  flushBlock();
}

export async function generatePgrPdf(rawCtx: PgrDocumentContext): Promise<void> {
  const ctx = filterContextForCompany(rawCtx);
  const docData = buildPgrFullDocument(ctx);
  const issuerConfig = getIssuerCompanyConfig();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const emissoraLogoUrl = issuerConfig.logoUrl || DEFAULT_EMISSORA_LOGO;
  const clienteLogoUrl = docData.header.companyLogo || DEFAULT_CLIENTE_LOGO;

  const emissoraPng = await ensurePngDataUrl(emissoraLogoUrl, 600, 150);
  const clientePng = await ensurePngDataUrl(clienteLogoUrl, 600, 150);

  const primaryColor: [number, number, number] = [51, 65, 85]; // Hex #334155 (Cinza Chumbo)
  const secondaryColor: [number, number, number] = [71, 85, 105];
  const headerGray: [number, number, number] = [82, 82, 91];
  const sectionGray: [number, number, number] = [226, 232, 240];
  const labelGray: [number, number, number] = [248, 250, 252];

  const cursor = { y: 20 };

  const checkPageBreak = (neededHeight: number = 20): boolean => {
    if (cursor.y + neededHeight > 272) {
      doc.addPage();
      cursor.y = 20;
      return true;
    }
    return false;
  };

  const ensureNewPage = (): void => {
    if (cursor.y > 20) {
      doc.addPage();
      cursor.y = 20;
    }
  };

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 12, 'F');
  doc.rect(0, 285, 210, 12, 'F');

  // Logo da ES no Topo da Capa (com proporção preservada para nunca desconfigurar)
  if (emissoraPng && emissoraPng.startsWith('data:image/')) {
    try {
      const imgProps = doc.getImageProperties(emissoraPng);
      const maxW = 75;
      const maxH = 22;
      const ratio = Math.min(maxW / imgProps.width, maxH / imgProps.height);
      const w = imgProps.width * ratio;
      const h = imgProps.height * ratio;
      const x = (210 - w) / 2;
      doc.addImage(emissoraPng, 'PNG', x, 16 + (maxH - h) / 2, w, h, undefined, 'FAST');
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
      const cProps = doc.getImageProperties(clientePng);
      const maxW = 75;
      const maxH = 20;
      const ratio = Math.min(maxW / cProps.width, maxH / cProps.height);
      const w = cProps.width * ratio;
      const h = cProps.height * ratio;
      const x = (210 - w) / 2;
      doc.addImage(clientePng, 'PNG', x, 95 + (maxH - h) / 2, w, h, undefined, 'FAST');
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
  doc.roundedRect(30, 155, 150, 38, 3, 3, 'FD');
  doc.setDrawColor(203, 213, 225);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`DOCUMENTO TÉCNICO: ${docData.header.code} (REV: ${docData.header.version})`, 35, 164);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Responsável Técnico: ${docData.header.techRespName}`, 35, 172);
  doc.text(`Registro de Classe: ${docData.header.techRespCouncil}`, 35, 180);
  doc.text(`Data de Elaboração: ${docData.header.elaborationDate}`, 35, 188);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${ctx.company.address.city}/${ctx.company.address.state} — ${docData.header.year}`, 105, 265, { align: 'center' });

  cursor.y = 265;
  ensureNewPage();

  for (const section of docData.sections) {
    if (section.id === 'sec-1' || section.title.toLowerCase().includes('indice')) {
      ensureNewPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, cursor.y);
      cursor.y += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, cursor.y, 196, cursor.y);
      cursor.y += 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('SEQUÊNCIA DO PROGRAMA DE GERENCIAMENTO DE RISCOS (PGR):', 14, cursor.y);
      cursor.y += 5;

      const rawLines = (section.content || '').split('\n');
      for (const line of rawLines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'SEQUÊNCIA DO PGR') continue;

        const isSubItem = line.startsWith('  ') || line.startsWith('\t') || trimmed.startsWith('GES') || trimmed.startsWith('- GES');
        const cleanText = trimmed.replace(/^-\s*/, '').replace(/^\*\s*/, '');

        checkPageBreak(6);

        if (isSubItem) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          doc.text(`   •  ${cleanText}`, 18, cursor.y);
          cursor.y += 4.2;
        } else {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          doc.text(`•  ${cleanText}`, 14, cursor.y);
          cursor.y += 4.6;
        }
      }

      cursor.y += 6;
      ensureNewPage();
      continue;
    }

    // Controle estrito de quebras de página por seção
    if (section.id === 'sec-2' || section.id === 'sec-3' || section.id === 'sec-4' || section.id === 'sec-5' || section.id === 'sec-6') {
      ensureNewPage();
    } else if (section.type === 'risk_inventory_table' || section.type === 'action_plan_table' || section.type === 'closing_signatures' || section.id === 'sec-17') {
      ensureNewPage();
    } else {
      checkPageBreak(25);
    }

    if (section.type === 'company_info') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, cursor.y);
      cursor.y += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, cursor.y, 196, cursor.y);
      cursor.y += 4;

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
        startY: cursor.y,
        body: companyTableData as any,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
        margin: { left: 14, right: 14 },
      });
      cursor.y = (doc as any).lastAutoTable.finalY + 8;
      // Página exclusiva para Seção 3 (Dados Cadastrais)
      ensureNewPage();
      continue;

    } else if (section.type === 'responsibles_info') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, cursor.y);
      cursor.y += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, cursor.y, 196, cursor.y);
      cursor.y += 4;

      const el = section.elaborador;
      const med = section.medicoPcmso;

      const respTableData: any[] = [];
      if (el) {
        const qualifText = el.qualificacoes && el.qualificacoes.length > 0
          ? el.qualificacoes.join('\n• ') ? '• ' + el.qualificacoes.join('\n• ') : el.cargo || '-'
          : el.cargo || '-';

        respTableData.push(
          [{ content: 'Responsável Técnico pela Elaboração do PGR', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } }],
          [{ content: 'Nome do Profissional', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: el.nome || '-' }],
          [{ content: 'Qualificações / Cargos Habilitados', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: qualifText }],
          [{ content: 'Registro Profissional', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: el.conselho || '-' }]
        );
        if (el.cpf) {
          respTableData.push(
            [{ content: 'CPF do Responsável', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: el.cpf }]
          );
        }
        if (el.art && el.art !== 'ART Emitida' && el.art !== '-' && el.art.trim() !== '') {
          respTableData.push(
            [{ content: 'ART / RRT Vinculada', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 } }, { content: el.art }]
          );
        }
        respTableData.push(
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
        startY: cursor.y,
        body: respTableData as any,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
        margin: { left: 14, right: 14 },
      });
      cursor.y = (doc as any).lastAutoTable.finalY + 8;
      // Página exclusiva para Seção 4 (Responsável Técnico)
      ensureNewPage();
      continue;

    } else if (section.type === 'text') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, cursor.y);
      cursor.y += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, cursor.y, 196, cursor.y);
      cursor.y += 4;

      const blocks = parseContentWithTables(section.content);
      for (const block of blocks) {
        if (block.type === 'text') {
          const paras = block.content.split('\n\n');
          for (const para of paras) {
            if (!para.trim()) continue;
            renderMarkdownParagraphToPdf(doc, para, cursor, checkPageBreak, 14, 182, 3.8);
          }
        } else if (block.type === 'table') {
          checkPageBreak(25);
          const isMatrixTable = block.headers.some(h => /Insignificante|Severidade|Probabilidade/i.test(h));
          const isPriorityTable = block.headers.some(h => /Faixa de Pontuação|Prioridade|Classificação/i.test(h));
          const cleanHeaders = block.headers.map(h => h.replace(/[🟥🟧🟨🟩]/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim());
          const cleanRows = block.rows.map(row => row.map(cell => cell.replace(/[🟥🟧🟨🟩]/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim()));
          
          autoTable(doc, {
            startY: cursor.y,
            head: [cleanHeaders],
            body: cleanRows,
            theme: 'grid',
            headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
            styles: { fontSize: 7, cellPadding: 2 },
            margin: { left: 14, right: 14 },
            didParseCell: (data) => {
              if (data.section === 'body') {
                const text = String(data.cell.raw || '').trim();

                // 1. Cores das Categorias de Risco (Item 10.2 do Desenvolvimento do PGR)
                if (data.column.index === 0) {
                  if (/Agentes Físicos/i.test(text)) {
                    data.cell.styles.fillColor = [22, 163, 74]; // Verde
                    data.cell.styles.textColor = [255, 255, 255];
                    data.cell.styles.fontStyle = 'bold';
                  } else if (/Agentes Químicos/i.test(text)) {
                    data.cell.styles.fillColor = [220, 38, 38]; // Vermelho
                    data.cell.styles.textColor = [255, 255, 255];
                    data.cell.styles.fontStyle = 'bold';
                  } else if (/Agentes Biológicos/i.test(text)) {
                    data.cell.styles.fillColor = [120, 53, 15]; // Marrom
                    data.cell.styles.textColor = [255, 255, 255];
                    data.cell.styles.fontStyle = 'bold';
                  } else if (/Riscos Ergonômicos/i.test(text)) {
                    data.cell.styles.fillColor = [234, 179, 8]; // Amarelo
                    data.cell.styles.textColor = [30, 41, 59];
                    data.cell.styles.fontStyle = 'bold';
                  } else if (/Riscos Psicossociais/i.test(text)) {
                    data.cell.styles.fillColor = [234, 179, 8]; // Amarelo
                    data.cell.styles.textColor = [30, 41, 59];
                    data.cell.styles.fontStyle = 'bold';
                  } else if (/Riscos de Acidentes/i.test(text)) {
                    data.cell.styles.fillColor = [37, 99, 235]; // Azul
                    data.cell.styles.textColor = [255, 255, 255];
                    data.cell.styles.fontStyle = 'bold';
                  }
                }

                // 2. Cores da Matriz 5x5 e Prioridades
                if (/\(TRI\)/i.test(text) || /\(TOL\)/i.test(text)) {
                  data.cell.styles.fillColor = [16, 185, 129]; // Emerald 500
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
                } else if (isMatrixTable && data.column.index > 0 && /^([1-9]|1[0-9]|2[0-5])$/.test(text)) {
                  const num = parseInt(text, 10);
                  if (num >= 16) {
                    data.cell.styles.fillColor = [225, 29, 72]; // Rose 600
                    data.cell.styles.textColor = [255, 255, 255];
                  } else if (num >= 10) {
                    data.cell.styles.fillColor = [249, 115, 22]; // Orange 500
                    data.cell.styles.textColor = [255, 255, 255];
                  } else if (num >= 5) {
                    data.cell.styles.fillColor = [245, 158, 11]; // Amber 500
                    data.cell.styles.textColor = [255, 255, 255];
                  } else {
                    data.cell.styles.fillColor = [16, 185, 129]; // Emerald 500
                    data.cell.styles.textColor = [255, 255, 255];
                  }
                  data.cell.styles.fontStyle = 'bold';
                  data.cell.styles.halign = 'center';
                } else if (isPriorityTable) {
                  if (text.includes('16 a 25') || text === 'Intolerável' || text === 'Urgente' || text === 'Extremo') {
                    data.cell.styles.fillColor = [254, 226, 226];
                    data.cell.styles.textColor = [159, 18, 57];
                    data.cell.styles.fontStyle = 'bold';
                  } else if (text.includes('10 a 15') || text === 'Substancial' || text === 'Alta' || text === 'Alto') {
                    data.cell.styles.fillColor = [255, 237, 213];
                    data.cell.styles.textColor = [154, 52, 18];
                    data.cell.styles.fontStyle = 'bold';
                  } else if (text.includes('5 a 9') || text === 'Moderado' || text === 'Média' || text === 'Médio') {
                    data.cell.styles.fillColor = [254, 243, 199];
                    data.cell.styles.textColor = [146, 64, 14];
                    data.cell.styles.fontStyle = 'bold';
                  } else if (text.includes('1 a 4') || text === 'Tolerável' || text === 'Baixa' || text === 'Baixo') {
                    data.cell.styles.fillColor = [209, 250, 229];
                    data.cell.styles.textColor = [6, 95, 70];
                    data.cell.styles.fontStyle = 'bold';
                  }
                }
              }
            }
          });
          cursor.y = (doc as any).lastAutoTable.finalY + 6;
        }
      }
      cursor.y += 3;

      // Páginas exclusivas para Seção 2 (Controle de Revisões) e Seção 5 (Introdução)
      if (section.id === 'sec-2' || section.id === 'sec-5') {
        ensureNewPage();
        continue;
      }

    } else if (section.type === 'risk_inventory_table') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, cursor.y);
      cursor.y += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, cursor.y, 196, cursor.y);
      cursor.y += 5;

      const gheGroups = groupInventoryByGhe(ctx.sectors, ctx.positions, ctx.ghes, ctx.riskInventory);

      if (!gheGroups || gheGroups.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Nenhum setor ou risco registrado no inventário.', 14, cursor.y);
        cursor.y += 8;
      } else {
        gheGroups.forEach((group, gIdx) => {
          if (gIdx > 0) {
            ensureNewPage();
          }

          const emrInfo = group.emr ? ` | EMR: ${group.emr}` : '';
          const gheHeader = `${group.gheCode} | Setor: ${group.sectorName} | Efetivo Exposto: ${group.workerCount} trabalhador(es)${emrInfo}`;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(gheHeader, 14, cursor.y);
          cursor.y += 4.5;

          for (const pos of group.positions) {
            checkPageBreak(25);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(30, 41, 59);
            const posLine = `Cargo / Função: ${pos.title}${pos.cbo ? ` (CBO: ${pos.cbo})` : ''}`;
            doc.text(posLine, 14, cursor.y);
            cursor.y += 3.5;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.2);
            doc.setTextColor(71, 85, 105);
            const rawAct = pos.activityDescription || 'Atividades operacionais e rotinas da função.';
            const cleanAct = rawAct.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\s+/g, ' ').trim();
            const actLines: string[] = doc.splitTextToSize(`Descrição da Atividade: ${cleanAct}`, 182);
            for (let i = 0; i < actLines.length; i++) {
              checkPageBreak(3.5);
              const isLast = (i === actLines.length - 1);
              const lineStr = actLines[i];
              if (!isLast && lineStr.includes(' ')) {
                doc.text([lineStr, ''], 14, cursor.y, { align: 'justify', maxWidth: 182 });
              } else {
                doc.text(lineStr, 14, cursor.y);
              }
              cursor.y += 3.2;
            }
            cursor.y += 2;
          }

          cursor.y += 1.5;

          if (group.risks.length === 0) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text('Nenhum risco ocupacional identificado para este setor/GHE.', 14, cursor.y);
            cursor.y += 6;
          } else {
            ensureNewPage();

            const headerGray: [number, number, number] = [82, 82, 91];
            const sectionGray: [number, number, number] = [226, 232, 240];
            const labelGray: [number, number, number] = [248, 250, 252];

            for (const item of group.risks) {
              const catConfig = HAZARD_CATEGORY_CONFIG[item.hazardCategory as HazardCategory];
              const catRgb = hexToRgb(catConfig?.color || '#16a34a');

              if (isNoExposureRisk(item)) {
                checkPageBreak(8);

                const catLabel = catConfig?.label ? `Risco ${catConfig.label}` : `Risco ${item.hazardCategory}`;
                const agentText = item.hazardName && item.hazardName.toLowerCase() !== 'nap'
                  ? item.hazardName
                  : 'Não há exposição / Não se Aplica';

                const rawCondition = (item.sourceDescription || item.healthDamage || '').trim();
                const isGenericNap = !rawCondition || rawCondition.toLowerCase() === 'nap' || rawCondition.toLowerCase().includes('não se aplica') || rawCondition.toLowerCase().includes('não há exposição');
                const condText = isGenericNap
                  ? 'NAP'
                  : `NAP (${rawCondition})`;

                const noExpRow: any[] = [
                  [
                    {
                      content: catLabel,
                      styles: {
                        fillColor: catRgb,
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        halign: 'center',
                        valign: 'middle',
                        cellWidth: 34,
                        fontSize: 7
                      }
                    },
                    {
                      content: `Agente: ${agentText}   |   Condição: ${condText}`,
                      styles: {
                        fillColor: [248, 250, 252],
                        textColor: [30, 41, 59],
                        valign: 'middle',
                        cellPadding: 1.6,
                        fontSize: 7,
                        cellWidth: 148
                      }
                    }
                  ]
                ];

                autoTable(doc, {
                  startY: cursor.y,
                  body: noExpRow,
                  theme: 'grid',
                  tableLineWidth: 0.15,
                  tableLineColor: [203, 213, 225],
                  styles: { cellPadding: 1.6 },
                  margin: { left: 14, right: 14 },
                });

                cursor.y = (doc as any).lastAutoTable.finalY + 2.5;
                continue;
              }

              const headerTitle = `${group.gheCode} APR-HO - ${docData.header.elaborationDate || '02/2026'}`;

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

              // Cálculo de nível de risco conforme Tabela 5 e 7 do PGR (Baixo, Médio, Alto, Extremo)
              const score = item.riskScore || (Number(item.severity || 1) * Number(item.probability || 1));
              const norm = getNormativeRiskMatrix(score);
              const displayRiskLevel = norm.displayLevel;
              const prioridadeFinal = item.actionPriority || norm.priority;

              checkPageBreak(85);

              const cardRows: any[] = [
                [
                  { content: headerTitle, styles: { fillColor: headerGray, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' } },
                  { content: 'IDENTIFICAÇÃO DO PERIGO / FATOR DE RISCO', colSpan: 3, styles: { fillColor: headerGray, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' } },
                  { content: `RISCO ${catConfig?.label?.toUpperCase() || item.hazardCategory.toUpperCase()}`, styles: { fillColor: catRgb, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' } }
                ],
                [
                  { content: '1. IDENTIFICAÇÃO E CARACTERIZAÇÃO DO AGENTE / PERIGO', colSpan: 5, styles: { fillColor: sectionGray, textColor: [15, 23, 42], fontStyle: 'bold' } }
                ],
                [
                  { content: 'Tipo do Agente / Perigo:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 38 } },
                  { content: item.hazardName || 'Não informado', colSpan: 4 }
                ],
                [
                  { content: 'Fonte ou Circunstância:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 38 } },
                  { content: item.sourceDescription || 'Não informada', colSpan: 2 },
                  { content: 'Possíveis Lesões / Danos à Saúde:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 42 } },
                  { content: item.healthDamage || 'Não informado', cellWidth: 36 }
                ],
                [
                  { content: '2. PERFIL DE EXPOSIÇÃO E MEDIDAS DE CONTROLE EXISTENTES', colSpan: 5, styles: { fillColor: sectionGray, textColor: [15, 23, 42], fontStyle: 'bold' } }
                ],
                [
                  { content: 'Meio de Propagação / Trajetória:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 38 } },
                  { content: item.trajectory || 'Não informado', colSpan: 2 },
                  { content: 'Tipo e Regime de Exposição:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 42 } },
                  { content: `${expPart1} / ${expPart2}`, cellWidth: 36 }
                ],
                [
                  { content: 'Medidas de Controle Existentes:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 38 } },
                  { content: epcEpiFinal, colSpan: 4 }
                ],
                [
                  { content: '3. AVALIAÇÃO QUANTITATIVA / QUALITATIVA DO AGENTE', colSpan: 5, styles: { fillColor: sectionGray, textColor: [15, 23, 42], fontStyle: 'bold' } }
                ],
                [
                  { content: 'Tipo de Avaliação / Critério:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 38 } },
                  { content: criterio, cellWidth: 30 },
                  { content: 'Técnica / Norma:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 34 } },
                  { content: tecnica, cellWidth: 36 },
                  { content: `Data da Avaliação: ${dataMedicao}`, styles: { fontStyle: 'bold', cellWidth: 44, halign: 'center' } }
                ],
                [
                  { content: 'Nível / Concentração Obtida:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 38 } },
                  { content: resultado, cellWidth: 30 },
                  { content: 'Limite de Tolerância (NR-15):', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 34 } },
                  { content: lt, colSpan: 2, cellWidth: 80 }
                ],
                [
                  { content: '4. CLASSIFICAÇÃO DO RISCO OCUPACIONAL (MATRIZ 5x5 - GRO)', colSpan: 5, styles: { fillColor: sectionGray, textColor: [15, 23, 42], fontStyle: 'bold' } }
                ],
                [
                  { content: 'Probabilidade:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 38 } },
                  { content: `${item.probability || '1'} (Nível ${item.probability || '1'})`, cellWidth: 30 },
                  { content: 'Severidade:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 34 } },
                  { content: `${item.severity || '1'} (Nível ${item.severity || '1'})`, cellWidth: 36 },
                  { content: `Risco: ${displayRiskLevel}`, styles: { fontStyle: 'bold', cellWidth: 44, halign: 'center', fillColor: [241, 245, 249] } }
                ],
                [
                  { content: 'Prioridade de Ação:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 38 } },
                  { content: prioridadeFinal, colSpan: 4, styles: { fontStyle: 'bold' } }
                ],
                [
                  { content: 'Medidas de Controle Propostas:', styles: { fontStyle: 'bold', fillColor: labelGray, cellWidth: 38 } },
                  { content: item.recommendations || 'Manter o monitoramento contínuo das condições ambientais e o cumprimento dos procedimentos operacionais padrão.', colSpan: 4 }
                ]
              ];

              autoTable(doc, {
                startY: cursor.y,
                body: cardRows,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 1.8, textColor: [30, 41, 59] },
                margin: { left: 14, right: 14 },
              });

              cursor.y = (doc as any).lastAutoTable.finalY + 6;
            }
          }
          cursor.y += 2;
        });
      }

    } else if (section.type === 'action_plan_table') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, cursor.y);
      cursor.y += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, cursor.y, 196, cursor.y);
      cursor.y += 5;

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

      const actionRows = (!actions || actions.length === 0)
        ? [
            [{ content: gesLabel, colSpan: 6, styles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'center' } }],
            ...defaultMetas
          ]
        : [
            [{ content: gesLabel, colSpan: 6, styles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'center' } }],
            ...actions.map((act: ActionPlanItem) => {
              const matchedRisk = ctx.riskInventory?.find((r: any) => r.id === act.riskInventoryId);
              const priorityText = act.priority || matchedRisk?.actionPriority || 'Média';
              const startDateText = act.startDate 
                ? (act.startDate.includes('-') ? act.startDate.split('-').reverse().join('/') : act.startDate)
                : 'Contínuo';
              const endDateText = act.whenDate 
                ? (act.whenDate.includes('-') ? act.whenDate.split('-').reverse().join('/') : act.whenDate)
                : 'Contínuo';
              const responsibleText = act.who || ctx.establishment?.managerName || 'SESMT';
              const statusText = act.status ? act.status.replace(/_/g, ' ').toUpperCase() : 'NÃO INICIADA';
              return [
                act.what,
                priorityText,
                startDateText,
                endDateText,
                responsibleText,
                statusText,
              ];
            })
          ];

      autoTable(doc, {
        startY: cursor.y,
        head: [['Metas', 'Grau de Prioridade', 'Prazo Inicial', 'Prazo Final', 'Responsável', 'Status']],
        body: actionRows as any,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
        styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 22, halign: 'center' },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 22, halign: 'center' },
          4: { cellWidth: 26, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
        },
      });

      cursor.y = (doc as any).lastAutoTable.finalY + 8;

    } else if (section.type === 'closing_signatures') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.title, 14, cursor.y);
      cursor.y += 2;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.3);
      doc.line(14, cursor.y, 196, cursor.y);
      cursor.y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      renderMarkdownParagraphToPdf(doc, section.text, cursor, checkPageBreak, 14, 182, 3.8);
      cursor.y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${section.city}/${section.state}, ${section.date}.`, 196, cursor.y, { align: 'right' });
      cursor.y += 18;

      checkPageBreak(30);
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.5);
      doc.line(20, cursor.y, 95, cursor.y);
      doc.text(docData.header.techRespName, 57.5, cursor.y + 4, { align: 'center' });
      doc.line(115, cursor.y, 190, cursor.y);
      doc.text(ctx.company.legalRepresentative, 152.5, cursor.y + 4, { align: 'center' });
      cursor.y += 20;
    }
  }

  // Remove última página caso tenha ficado totalmente em branco
  if (cursor.y === 20 && doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages());
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);

    if (emissoraPng && emissoraPng.startsWith('data:image/')) {
      try {
        const hProps = doc.getImageProperties(emissoraPng);
        const maxH = 6;
        const maxW = 32;
        const ratio = Math.min(maxW / hProps.width, maxH / hProps.height);
        const w = hProps.width * ratio;
        const h = hProps.height * ratio;
        doc.addImage(emissoraPng, 'PNG', 14, 5.5 + (maxH - h) / 2, w, h, undefined, 'FAST');
      } catch (e) {}
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`PGR — Programa de Gerenciamento de Riscos (NR-01) | ${docData.header.companyName}`, 50, 9.5);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, 13, 196, 13);
    doc.line(14, 283, 196, 283);

    const addr = issuerConfig.address;
    const issuerAddr = `${addr.street}, ${addr.number}${addr.complement ? ` - ${addr.complement}` : ''} - ${addr.city}/${addr.state}`;
    const footerCompanyInfo = `${issuerConfig.name} | CNPJ: ${issuerConfig.cnpj} | ${issuerAddr}`;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(footerCompanyInfo, 14, 287);
    doc.text(`Página ${p} de ${totalPages}`, 196, 287, { align: 'right' });
  }

  const sanitizedCompany = ctx.company.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`PGR_${sanitizedCompany}_${docData.header.code}.pdf`);
}
