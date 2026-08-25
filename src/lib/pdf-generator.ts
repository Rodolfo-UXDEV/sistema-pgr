import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PgrDocumentContext, buildPgrFullDocument, OFFICIAL_PGR_TEXTS } from '@/lib/pgr-official-template';
import { parseContentWithTables } from '@/lib/table-parser';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';

export function generatePgrPdf(ctx: PgrDocumentContext): void {
  const docData = buildPgrFullDocument(ctx);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const primaryColor: [number, number, number] = [15, 118, 110]; // Teal 700
  const secondaryColor: [number, number, number] = [51, 65, 85]; // Slate 700

  // ==========================================
  // CAPA OFICIAL
  // ==========================================
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 15, 'F');
  doc.rect(0, 282, 210, 15, 'F');

  // Cabeçalho da Consultoria
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(OFFICIAL_PGR_TEXTS.consultingCompany, 105, 30, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(OFFICIAL_PGR_TEXTS.consultingCrea, 105, 35, { align: 'center' });

  // Título Principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PROGRAMA DE GERENCIAMENTO', 105, 65, { align: 'center' });
  doc.text('DE RISCOS - PGR', 105, 75, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('GERENCIAMENTO DE RISCOS OCUPACIONAIS (GRO) — NR-01', 105, 85, { align: 'center' });

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(40, 92, 170, 92);

  // Dados da Empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(docData.header.companyName.toUpperCase(), 105, 120, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`CNPJ: ${docData.header.cnpj}`, 105, 128, { align: 'center' });
  doc.text(`Estabelecimento: ${docData.header.establishmentName}`, 105, 134, { align: 'center' });

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
  // PÁGINA 2: CONTROLE DE REVISÕES & DADOS CADASTRAIS
  // ==========================================
  doc.addPage();
  let currentY = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const sec1 = docData.sections.find(s => s.id === 'sec-1');
  const sec1Title = sec1?.title || '1. CONTROLE DE REVISÕES DO DOCUMENTO';
  doc.text(sec1Title, 14, currentY);

  const sec1Content = (sec1 as any)?.content || `| Revisão | Data | Descrição / Motivo da Revisão |\n| :--- | :--- | :--- |\n| ${docData.header.version} | ${docData.header.elaborationDate} | ${ctx.pgr.revisionReason || 'Emissão Oficial do PGR'} |`;
  const sec1Blocks = parseContentWithTables(sec1Content);
  let tableRendered = false;

  for (const block of sec1Blocks) {
    if (block.type === 'table') {
      tableRendered = true;
      autoTable(doc, {
        startY: currentY + 4,
        head: [block.headers],
        body: block.rows,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  if (!tableRendered) {
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Revisão', 'Data', 'Descrição / Motivo da Revisão']],
      body: [[docData.header.version, docData.header.elaborationDate, ctx.pgr.revisionReason || 'Emissão Inicial do PGR e Inventário de Riscos']],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('2. INFORMAÇÕES CADASTRAIS DO EMPREGADOR E ESTABELECIMENTO', 14, currentY);

  const empData = [
    ['Razão Social:', ctx.company.name],
    ['Nome Fantasia:', ctx.company.tradeName || ctx.company.name],
    ['CNPJ:', docData.header.cnpj],
    ['CNAE Principal:', `${ctx.company.cnae} - ${ctx.company.cnaeDescription}`],
    ['Grau de Risco (NR-04):', `Grau de Risco ${ctx.company.riskGrade}`],
    ['Endereço da Matriz:', `${ctx.company.address.street}, ${ctx.company.address.number} - ${ctx.company.address.city}/${ctx.company.address.state}`],
    ['Estabelecimento Avaliado:', ctx.establishment ? `${ctx.establishment.name} (${ctx.establishment.code})` : 'Unidade Matriz'],
    ['Representante Legal:', `${ctx.company.legalRepresentative} (${ctx.company.representativeRole})`],
    ['Total de Trabalhadores:', `${ctx.company.employeeCount} colaboradores`],
  ];

  autoTable(doc, {
    startY: currentY + 4,
    body: empData,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('3. RESPONSABILIDADE TÉCNICA PELA ELABORAÇÃO', 14, currentY);

  const techResp = ctx.professionals.find(p => p.id === ctx.pgr.technicalResponsibleId) || ctx.professionals[0];
  const medResp = ctx.professionals.find(p => p.id === ctx.pgr.medicalResponsibleId);

  const profData = [
    [
      'Responsável Técnico pela Elaboração:',
      techResp ? `${techResp.name} — ${techResp.registrationCouncil}: ${techResp.registrationNumber}/${techResp.registrationState} (ART: ${techResp.artRrt || 'Emitida'})` : 'Profissional Habilitado em SST'
    ],
    [
      'Médico Coordenador do PCMSO (NR-07):',
      medResp ? `${medResp.name} — ${medResp.registrationCouncil}: ${medResp.registrationNumber}/${medResp.registrationState}` : 'Médico do Trabalho Habilitado'
    ],
  ];

  autoTable(doc, {
    startY: currentY + 4,
    body: profData,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  });

  // ==========================================
  // PÁGINA 3: INTRODUÇÃO, OBJETIVOS E FUNDAMENTAÇÃO LEGAL
  // ==========================================
  doc.addPage();
  currentY = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('4. INTRODUÇÃO E OBJETIVOS DO PROGRAMA', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const introLines = doc.splitTextToSize(OFFICIAL_PGR_TEXTS.introducao, 182);
  doc.text(introLines, 14, currentY + 5);

  currentY += 5 + (introLines.length * 4) + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('5. FUNDAMENTAÇÃO LEGAL E NORMAS REGULAMENTADORAS', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const legalLines = doc.splitTextToSize(OFFICIAL_PGR_TEXTS.fundamentacaoLegal, 182);
  doc.text(legalLines, 14, currentY + 5);

  currentY += 5 + (legalLines.length * 4) + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('6. GERENCIAMENTO DE RISCOS OCUPACIONAIS (GRO) E METODOLOGIA 5X5', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const groLines = doc.splitTextToSize(OFFICIAL_PGR_TEXTS.metodologiaGro, 182);
  doc.text(groLines, 14, currentY + 5);

  // ==========================================
  // PÁGINA 4: INVENTÁRIO DE RISCOS OCUPACIONAIS
  // ==========================================
  doc.addPage();
  currentY = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('7. INVENTÁRIO CONSOLIDADO DE RISCOS OCUPACIONAIS (NR-01.5.7)', 14, currentY);

  const riskRows = ctx.riskInventory.map((item) => {
    const sec = ctx.sectors.find(s => s.id === item.sectorId);
    const pos = ctx.positions.find(p => p.id === item.positionId);
    const cat = HAZARD_CATEGORY_CONFIG[item.hazardCategory]?.label || item.hazardCategory;

    const epiText = item.epiExisting && item.epiExisting.length > 0
      ? item.epiExisting.map(e => `${e.name} (CA:${e.ca || 'S/N'})`).join('; ')
      : 'N/A';

    return [
      `${sec?.name || '-'}\n${pos?.title || '-'}`,
      `[${cat}]\n${item.hazardName}`,
      `Fonte: ${item.sourceDescription}\nDanos: ${item.healthDamage}`,
      `${item.probability}x${item.severity}=${item.riskScore}\n(${item.riskLevel})`,
      `EPC: ${item.epcExisting?.join(', ') || 'N/A'}\nEPI: ${epiText}`,
    ];
  });

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Setor / Cargo', 'Perigo / Risco', 'Fontes & Danos', 'Matriz 5x5', 'Medidas de Controle']],
    body: riskRows.length > 0 ? riskRows : [['Nenhum risco registrado', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 35 },
      2: { cellWidth: 50 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 40 },
    },
  });

  // ==========================================
  // PÁGINA 5: PLANO DE AÇÃO & ASSINATURAS
  // ==========================================
  doc.addPage();
  currentY = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('8. PLANO DE AÇÃO E CRONOGRAMA DE PREVENÇÃO (NR-01.5.5 - 5W2H)', 14, currentY);

  const actionRows = ctx.actionPlans.map((act) => [
    act.what,
    act.why,
    act.who,
    act.whenDate,
    `R$ ${Number(act.howMuch || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    act.status,
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['O que (Ação)', 'Por que (Motivo)', 'Quem (Responsável)', 'Prazo', 'Custo', 'Status']],
    body: actionRows.length > 0 ? actionRows : [['Nenhuma ação programada', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 45 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 17 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('9. TERMO DE ENCERRAMENTO E ASSINATURAS LEGAIS', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const termoLines = doc.splitTextToSize(OFFICIAL_PGR_TEXTS.termoEncerramento, 182);
  doc.text(termoLines, 14, currentY + 5);

  currentY += 5 + (termoLines.length * 3.5) + 20;

  // Assinaturas
  doc.setDrawColor(148, 163, 184);
  doc.line(20, currentY, 90, currentY);
  doc.line(120, currentY, 190, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(docData.header.techRespName, 55, currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`${docData.header.techRespCouncil} | ${docData.header.techRespArt}`, 55, currentY + 8, { align: 'center' });
  doc.text('Responsável Técnico SST', 55, currentY + 12, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text(ctx.company.legalRepresentative, 155, currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(ctx.company.representativeRole, 155, currentY + 8, { align: 'center' });
  doc.text(ctx.company.name, 155, currentY + 12, { align: 'center' });

  // Salva o PDF
  const cleanName = ctx.company.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`PGR_${cleanName}_${docData.header.year}.pdf`);
}
