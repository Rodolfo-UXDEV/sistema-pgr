import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Company, 
  Establishment, 
  PGRDocument, 
  RiskInventoryItem, 
  ActionPlanItem, 
  Professional, 
  Sector, 
  Position, 
  GHE 
} from '@/types/pgr';
import { formatDate, formatCNPJ } from '@/lib/utils';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';

interface GeneratePgrPdfOptions {
  company: Company;
  establishment: Establishment;
  pgr: PGRDocument;
  sectors: Sector[];
  positions: Position[];
  ghes: GHE[];
  professionals: Professional[];
  risks: RiskInventoryItem[];
  actions: ActionPlanItem[];
}

export function generatePgrPdf(options: GeneratePgrPdfOptions): jsPDF {
  const {
    company,
    establishment,
    pgr,
    sectors,
    positions,
    ghes,
    professionals,
    risks,
    actions,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [16, 185, 129]; // Emerald 600
  const darkColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const grayColor: [number, number, number] = [100, 116, 139]; // Slate 500

  // -------------------------------------------------------------
  // PÁGINA 1: CAPA OFICIAL DO PGR
  // -------------------------------------------------------------
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 297, 'F');

  // Faixa verde decorativa
  doc.setFillColor(...primaryColor);
  doc.rect(0, 100, 210, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('PROGRAMA DE GERENCIAMENTO', 105, 75, { align: 'center' });
  doc.text('DE RISCOS - PGR', 105, 87, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('EM CONFORMIDADE COM A NORMA REGULAMENTADORA Nº 01 (NR-01)', 105, 108, { align: 'center' });

  // Dados da Empresa na Capa
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(company.tradeName || company.name, 105, 140, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Razão Social: ${company.name}`, 105, 150, { align: 'center' });
  doc.text(`CNPJ: ${formatCNPJ(company.cnpj)}  •  Grau de Risco: ${company.riskGrade}`, 105, 157, { align: 'center' });
  doc.text(`CNAE: ${company.cnae} - ${company.cnaeDescription}`, 105, 164, { align: 'center' });
  doc.text(`Unidade: ${establishment.name} (${establishment.code})`, 105, 171, { align: 'center' });

  // Bloco de Vigência e Versão
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.rect(30, 210, 150, 30);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`CÓDIGO: ${pgr.code}  |  VERSÃO: ${pgr.version}`, 105, 220, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Vigência: ${formatDate(pgr.validityStart)} a ${formatDate(pgr.validityEnd)}`, 105, 228, { align: 'center' });
  doc.text(`Data de Elaboração: ${formatDate(pgr.elaborationDate)}`, 105, 235, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`${establishment.address.city} / ${establishment.address.state} - Brasil`, 105, 280, { align: 'center' });

  // -------------------------------------------------------------
  // PÁGINA 2: IDENTIFICAÇÃO DA EMPRESA E ESTRUTURA ORGANIZACIONAL
  // -------------------------------------------------------------
  doc.addPage();
  
  // Cabeçalho institucional
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('1. IDENTIFICAÇÃO DA EMPRESA E DO ESTABELECIMENTO', 14, 20);

  const compData = [
    ['Razão Social:', company.name],
    ['Nome Fantasia:', company.tradeName || '-'],
    ['CNPJ:', formatCNPJ(company.cnpj)],
    ['CNAE Principal:', `${company.cnae} - ${company.cnaeDescription}`],
    ['Grau de Risco (NR-04):', `Grau ${company.riskGrade}`],
    ['Endereço da Matriz:', `${company.address.street}, ${company.address.number} - ${company.address.neighborhood}, ${company.address.city}/${company.address.state}`],
    ['Representante Legal:', `${company.legalRepresentative} (${company.representativeRole})`],
    ['Total de Trabalhadores:', `${company.employeeCount} empregados`],
    ['Unidade Avaliada:', `${establishment.name} - ${establishment.address.street}, ${establishment.address.number} (${establishment.address.city}/${establishment.address.state})`],
  ];

  autoTable(doc, {
    startY: 25,
    head: [['Campo', 'Informação']],
    body: compData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 } },
  });

  // Responsáveis Técnicos
  const techResp = professionals.find(p => p.id === pgr.technicalResponsibleId);
  const medResp = professionals.find(p => p.id === pgr.medicalResponsibleId);

  const profData = [
    [
      'Responsável Técnico pela Elaboração:',
      techResp ? `${techResp.name} - ${techResp.registrationCouncil}: ${techResp.registrationNumber}/${techResp.registrationState} (ART: ${techResp.artRrt || 'Emitida'})` : 'Profissional Habilitado em SST'
    ],
    [
      'Médico Coordenador do PCMSO:',
      medResp ? `${medResp.name} - ${medResp.registrationCouncil}: ${medResp.registrationNumber}/${medResp.registrationState}` : 'Médico do Trabalho Habilitado'
    ],
  ];

  const currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.text('2. RESPONSABILIDADE TÉCNICA E LEGAL', 14, currentY);

  autoTable(doc, {
    startY: currentY + 5,
    body: profData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 65 } },
  });

  // Metodologia e Objetivos
  const currentY2 = (doc as any).lastAutoTable.finalY + 10;
  doc.text('3. OBJETIVOS E METODOLOGIA ADOTADA (NR-01)', 14, currentY2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  const objText = doc.splitTextToSize(
    pgr.generalObjectives || 'O presente Programa de Gerenciamento de Riscos (PGR) tem por finalidade estabelecer as diretrizes para a identificação de perigos, avaliação e gradação de riscos ocupacionais, bem como propor medidas preventivas para preservar a integridade física e a saúde dos trabalhadores.',
    180
  );
  doc.text(objText, 14, currentY2 + 6);

  const currentY3 = currentY2 + 6 + (objText.length * 4.5) + 4;
  const methText = doc.splitTextToSize(
    pgr.methodologyDescription || 'A gradação de riscos foi estruturada com base em Matriz Bidimensional 5x5 (Severidade x Probabilidade), gerando cinco níveis de risco: Trivial, Tolerável, Moderado, Substancial e Intolerável. Todas as medidas de controle priorizam a eliminação de perigos, proteção coletiva (EPC), medidas administrativas e, em última instância, proteção individual (EPI com CA).',
    180
  );
  doc.text(methText, 14, currentY3);

  // -------------------------------------------------------------
  // PÁGINA 3: CARACTERIZAÇÃO DE SETORES, CARGOS E GHES
  // -------------------------------------------------------------
  doc.addPage();
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('4. CARACTERIZAÇÃO DOS AMBIENTES E CARGOS', 14, 20);

  const sectorRows = sectors
    .filter(s => s.establishmentId === establishment.id)
    .map(s => [
      s.name,
      s.description || 'Ambiente fabril / operacional',
      `${s.physicalCharacteristics.floorType}, paredes de ${s.physicalCharacteristics.wallType}, ventilação ${s.physicalCharacteristics.ventilationType.toLowerCase()}`
    ]);

  autoTable(doc, {
    startY: 25,
    head: [['Setor / Ambiente', 'Descrição', 'Características Físicas']],
    body: sectorRows.length ? sectorRows : [['Geral', 'Instalações da empresa', 'Padrão']],
    theme: 'grid',
    headStyles: { fillColor: darkColor, textColor: 255 },
    styles: { fontSize: 8, cellPadding: 2.5 },
  });

  const currentYPos = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.text('Cargos e Grupos Homogêneos de Exposição (GHE)', 14, currentYPos);

  const posRows = positions
    .filter(p => p.establishmentId === establishment.id)
    .map(p => [
      p.title,
      p.cbo,
      `${p.workerCount} trab.`,
      p.routineActivities
    ]);

  autoTable(doc, {
    startY: currentYPos + 4,
    head: [['Cargo / Função', 'CBO', 'Qtd.', 'Atividades Rotineiras']],
    body: posRows.length ? posRows : [['Trabalhador Geral', '9999-99', '1', 'Atividades da função']],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: { 3: { cellWidth: 90 } },
  });

  // -------------------------------------------------------------
  // PÁGINA 4+: INVENTÁRIO DE RISCOS OCUPACIONAIS (NR-01.5.7)
  // -------------------------------------------------------------
  doc.addPage();
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('5. INVENTÁRIO DE RISCOS OCUPACIONAIS CONSOLIDADO', 14, 20);

  const companyRisks = risks.filter(r => r.companyId === company.id);

  const riskTableBody = companyRisks.map(r => {
    const sectorName = sectors.find(s => s.id === r.sectorId)?.name || 'Geral';
    const catLabel = HAZARD_CATEGORY_CONFIG[r.hazardCategory]?.label || r.hazardCategory;
    const episFormatted = r.epiExisting?.length 
      ? r.epiExisting.map(e => `${e.name} (CA ${e.ca})`).join('; ') 
      : 'N/A';
    const epcsFormatted = r.epcExisting?.length ? r.epcExisting.join('; ') : 'N/A';

    return [
      sectorName,
      `${r.hazardName}\n[${catLabel}]`,
      r.sourceDescription,
      r.healthDamage,
      `P${r.probability} × S${r.severity}\n(${r.riskScore})`,
      r.riskLevel,
      `EPC: ${epcsFormatted}\nEPI: ${episFormatted}`
    ];
  });

  autoTable(doc, {
    startY: 26,
    head: [['Setor', 'Perigo / Grupo', 'Fonte Geradora', 'Possíveis Danos', 'P x S', 'Nível de Risco', 'Medidas de Prevenção']],
    body: riskTableBody.length ? riskTableBody : [['-', 'Nenhum risco cadastrado', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: darkColor, textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28, fontStyle: 'bold' },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 42 },
    },
  });

  // -------------------------------------------------------------
  // PÁGINA N: PLANO DE AÇÃO 5W2H (NR-01.5.5)
  // -------------------------------------------------------------
  doc.addPage();
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('6. PLANO DE AÇÃO E CRONOGRAMA DE PREVENÇÃO (5W2H)', 14, 20);

  const companyActions = actions.filter(a => a.companyId === company.id);

  const actionTableBody = companyActions.map(a => [
    a.what,
    a.why,
    a.whereLoc,
    a.who,
    formatDate(a.whenDate),
    a.how,
    a.status.replace('_', ' ')
  ]);

  autoTable(doc, {
    startY: 26,
    head: [['O Que Fazer (What)', 'Por Que (Why)', 'Onde (Where)', 'Quem (Who)', 'Quando (When)', 'Como (How)', 'Status']],
    body: actionTableBody.length ? actionTableBody : [['-', 'Nenhuma ação cadastrada', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 30 },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 35 },
      6: { cellWidth: 20, halign: 'center' },
    },
  });

  // -------------------------------------------------------------
  // ENCERRAMENTO E ASSINATURAS
  // -------------------------------------------------------------
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  let signPageY = finalY;

  // Se não couber na mesma página, abre nova página
  if (finalY > 210) {
    doc.addPage();
    signPageY = 30;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('7. TERMO DE APROVAÇÃO E ENCERRAMENTO', 14, signPageY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  const closingText = doc.splitTextToSize(
    `Declaramos que o presente Programa de Gerenciamento de Riscos - PGR retrata com fidelidade as condições operacionais e de segurança observadas no estabelecimento ${establishment.name} da empresa ${company.name}, cabendo aos signatários o cumprimento integral das metas e ações aqui descritas.`,
    180
  );
  doc.text(closingText, 14, signPageY + 6);

  const signLineY = signPageY + 40;

  // Linhas de assinatura
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);

  // Assinatura Empregador
  doc.line(20, signLineY, 90, signLineY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text(company.legalRepresentative, 55, signLineY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.representativeRole} - ${company.name}`, 55, signLineY + 9, { align: 'center' });

  // Assinatura Responsável Técnico SST
  doc.line(120, signLineY, 190, signLineY);
  doc.setFont('helvetica', 'bold');
  doc.text(techResp?.name || 'Responsável Técnico SST', 155, signLineY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`${techResp?.registrationCouncil}: ${techResp?.registrationNumber}/${techResp?.registrationState}`, 155, signLineY + 9, { align: 'center' });

  // Numeração de páginas no rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (i > 1) {
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `PGR - ${company.tradeName || company.name}  •  NR-01  •  Página ${i} de ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );
    }
  }

  return doc;
}
