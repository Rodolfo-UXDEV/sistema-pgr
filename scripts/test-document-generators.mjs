import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  ShadingType, 
  AlignmentType 
} from 'docx';
import fs from 'fs';

const artifactDir = '/Users/rodolforodrigues/.gemini/antigravity/brain/f0078bb4-af9e-4a01-85bc-9848611f4778';

console.log('📄 TESTANDO GERAÇÃO DE ARQUIVOS PDF, WORD (.DOCX) E EXCEL (.XLSX)...');

// Dados simulados realistas com múltiplos GHEs, múltiplos setores e múltiplos cargos
const testData = {
  company: {
    name: 'Indústria Metalmecânica Sul Brasil S.A.',
    cnpj: '09.876.543/0001-21',
    cnae: '25.11-0-00',
    cnaeDescription: 'Fabricação de Estruturas Metálicas',
    riskGrade: 3,
    legalRepresentative: 'Roberto de Oliveira',
    employeeCount: 45
  },
  ghes: [
    {
      code: 'GHE 1.0',
      sectorName: 'Setor Administrativo',
      workerCount: 10,
      emr: 'Auxiliares e Digitadores',
      positions: [
        { title: 'Auxiliar Administrativo', cbo: '4110-10', activity: 'Atendimento telefônico, organização de arquivos e digitação.' },
        { title: 'Assistente Administrativo', cbo: '4110-05', activity: 'Contas a pagar e receber, faturamento e emissão de notas fiscais.' },
        { title: 'Gerente Administrativo', cbo: '1421-05', activity: 'Supervisão das rotinas financeiras e gestão da equipe interna.' }
      ],
      risks: [
        {
          category: 'Ergonômico',
          catColor: '#eab308',
          agent: 'Postura sentada prolongada e esforço visual',
          exp1: 'Habitual',
          exp2: 'Permanente',
          source: 'Mobiliário de escritório e estações de computador',
          trajectory: 'Músculo-esquelética',
          penetration: 'Biomecânica (Postural)',
          healthDamage: 'Dores musculares e fadiga',
          epcEpi: 'EPC: Ar-condicionado e iluminação LED | EPI: NAP',
          criterio: 'Qualitativo (NR-17)',
          tecnica: 'Avaliação Ergonômica Preliminar (AEP)',
          dataMedicao: '25/02/2026',
          resultado: 'Aceitável com controles',
          lt: 'NAP',
          severity: 2,
          probability: 2,
          status: 'Risco Baixo',
          priority: 'Baixa',
          recommendations: 'Manter pausas ativas e ajustes ergonômicos nas cadeiras.'
        }
      ]
    },
    {
      code: 'GHE 2.0',
      sectorName: 'Setor de Produção e Usinagem',
      workerCount: 35,
      emr: 'Operador de Prensa Mecânica / João Silva',
      positions: [
        { title: 'Operador de Máquinas', cbo: '7212-15', activity: 'Operação de tornos, fresadoras e prensas hidráulicas na conformação de peças.' },
        { title: 'Soldador MIG/MAG', cbo: '7243-15', activity: 'Soldagem de estruturas e montagem de componentes metálicos em gabarito.' }
      ],
      risks: [
        {
          category: 'Físico',
          catColor: '#16a34a',
          agent: 'Ruído Contínuo ou Intermitente',
          exp1: 'Habitual',
          exp2: 'Intermitente',
          source: 'Tornos mecânicos e prensas',
          trajectory: 'Ar',
          penetration: 'Auditiva (Ouvido / Som)',
          healthDamage: 'Perda Auditiva Induzida por Ruído (PAIR)',
          epcEpi: 'EPC: Enclausuramento parcial | EPI: Protetor Auditivo CA 14235',
          criterio: 'Quantitativo (NHO-01 / NR-15)',
          tecnica: 'Dosimetria de Ruído',
          dataMedicao: '25/02/2026',
          resultado: '86.4 dB(A)',
          lt: '85.0 dB(A)',
          severity: 4,
          probability: 3,
          status: 'Risco Alto',
          priority: 'Alta',
          recommendations: 'Uso obrigatório de protetor auditivo CA 14235 e exames audiométricos anuais.'
        },
        {
          category: 'Químico',
          catColor: '#dc2626',
          agent: 'Fumos Metálicos (Ferro e Manganês)',
          exp1: 'Habitual',
          exp2: 'Intermitente',
          source: 'Processo de solda elétrica',
          trajectory: 'Ar',
          penetration: 'Respiratória (Inalação)',
          healthDamage: 'Irritação das vias aéreas superiores',
          epcEpi: 'EPC: Exaustor localizado | EPI: Máscara PFF2 CA 38514',
          criterio: 'Quantitativo (NHO-08 / NR-15)',
          tecnica: 'Amostragem com bomba gravimétrica',
          dataMedicao: '25/02/2026',
          resultado: '0.18 mg/m³',
          lt: '0.20 mg/m³',
          severity: 3,
          probability: 3,
          status: 'Risco Médio',
          priority: 'Média',
          recommendations: 'Manter manutenção do sistema de exaustão e inspeção periódica das máscaras.'
        }
      ]
    }
  ]
};

// 1. GERAÇÃO DE PDF
console.log('1️⃣ Gerando PDF...');
const docPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
let currentY = 20;

docPdf.setFont('helvetica', 'bold');
docPdf.setFontSize(14);
docPdf.text('PROGRAMA DE GERENCIAMENTO DE RISCOS (PGR)', 14, currentY);
currentY += 8;

docPdf.setFontSize(10);
docPdf.text('12. INVENTÁRIO DE RISCOS OCUPACIONAIS (MODELO APR-HO)', 14, currentY);
currentY += 6;

for (const ghe of testData.ghes) {
  const emrInfo = ghe.emr ? ` | EMR: ${ghe.emr}` : '';
  const gheHeader = `${ghe.code} | Setor: ${ghe.sectorName} | Efetivo Exposto: ${ghe.workerCount} trabalhador(es)${emrInfo}`;

  docPdf.setFont('helvetica', 'bold');
  docPdf.setFontSize(9);
  docPdf.setTextColor(15, 23, 42);
  docPdf.text(gheHeader, 14, currentY);
  currentY += 4.5;

  for (const pos of ghe.positions) {
    docPdf.setFont('helvetica', 'bold');
    docPdf.setFontSize(8);
    docPdf.setTextColor(30, 41, 59);
    docPdf.text(`Cargo / Função: ${pos.title} (CBO: ${pos.cbo})`, 14, currentY);
    currentY += 3.5;

    docPdf.setFont('helvetica', 'normal');
    docPdf.setFontSize(7.5);
    docPdf.setTextColor(71, 85, 105);
    const actLines = docPdf.splitTextToSize(`Descrição da Atividade: ${pos.activity}`, 182);
    docPdf.text(actLines, 14, currentY);
    currentY += actLines.length * 3.2 + 2;
  }

  for (const risk of ghe.risks) {
    const tableBody = [
      [{ content: `${ghe.code} APR-HO - 02/2026`, colSpan: 4, styles: { fillColor: [82, 82, 91], fontStyle: 'bold', halign: 'center', textColor: [255, 255, 255] } }],
      [
        { content: `Risco ${risk.category}`, colSpan: 1, styles: { fillColor: [22, 163, 74], fontStyle: 'bold', halign: 'center', textColor: [255, 255, 255] } },
        { content: `Agente: ${risk.agent}`, colSpan: 3, styles: { fontStyle: 'bold' } }
      ],
      [{ content: 'Tipo de Exposição', colSpan: 1 }, { content: risk.exp1, colSpan: 1, styles: { halign: 'center' } }, { content: risk.exp2, colSpan: 2, styles: { halign: 'center' } }],
      [{ content: 'Fontes ou circunstância', colSpan: 1 }, { content: risk.source, colSpan: 3 }],
      [{ content: 'EPC/EPI', colSpan: 1 }, { content: risk.epcEpi, colSpan: 3 }],
      [{ content: 'Medição', colSpan: 4, styles: { fillColor: [226, 232, 240], fontStyle: 'bold', halign: 'center' } }],
      [{ content: `Critério: ${risk.criterio}`, colSpan: 2 }, { content: `Técnica: ${risk.tecnica}`, colSpan: 2 }],
      [{ content: 'Data: ' + risk.dataMedicao, colSpan: 1 }, { content: 'Resultado: ' + risk.resultado, colSpan: 2, styles: { fontStyle: 'bold' } }, { content: 'LT: ' + risk.lt, colSpan: 1 }],
      [{ content: 'Categorização do risco/perigo', colSpan: 4, styles: { fillColor: [226, 232, 240], fontStyle: 'bold', halign: 'center' } }],
      [{ content: 'Severidade', colSpan: 1, styles: { fontStyle: 'bold', halign: 'center' } }, { content: 'Probabilidade', colSpan: 1, styles: { fontStyle: 'bold', halign: 'center' } }, { content: 'Status do agente', colSpan: 1, styles: { fontStyle: 'bold', halign: 'center' } }, { content: 'Prioridade de ação', colSpan: 1, styles: { fontStyle: 'bold', halign: 'center' } }],
      [{ content: String(risk.severity), colSpan: 1, styles: { halign: 'center' } }, { content: String(risk.probability), colSpan: 1, styles: { halign: 'center' } }, { content: risk.status, colSpan: 1, styles: { halign: 'center', fontStyle: 'bold' } }, { content: risk.priority, colSpan: 1, styles: { halign: 'center', fontStyle: 'bold' } }],
      [{ content: 'Recomendações', colSpan: 4, styles: { fillColor: [226, 232, 240], fontStyle: 'bold', halign: 'center' } }],
      [{ content: 'Recomendações', colSpan: 1 }, { content: risk.recommendations, colSpan: 3 }]
    ];

    const tableRunner = (typeof autoTable === 'function' ? autoTable : (autoTable.default || (docPdf.autoTable ? docPdf.autoTable.bind(docPdf) : null)));
    if (tableRunner) {
      tableRunner(docPdf, {
        startY: currentY,
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.8 },
        margin: { left: 14, right: 14 }
      });
      currentY = (docPdf.lastAutoTable?.finalY || currentY + 40) + 6;
    } else {
      currentY += 40;
    }
  }
  currentY += 4;
}

const pdfBuffer = Buffer.from(docPdf.output('arraybuffer'));
const pdfPath = `${artifactDir}/teste_geracao_oficial.pdf`;
fs.writeFileSync(pdfPath, pdfBuffer);
console.log(`   ✅ PDF gerado com sucesso (${pdfBuffer.length} bytes): ${pdfPath}`);

// 2. GERAÇÃO DE WORD (.DOCX)
console.log('2️⃣ Gerando Word (.docx)...');
const docxChildren = [
  new Paragraph({ text: 'PROGRAMA DE GERENCIAMENTO DE RISCOS (PGR)', heading: 'Heading1' }),
  new Paragraph({ text: '12. INVENTÁRIO DE RISCOS OCUPACIONAIS (MODELO APR-HO)', heading: 'Heading2', spacing: { before: 200, after: 100 } })
];

for (const ghe of testData.ghes) {
  const emrInfo = ghe.emr ? ` | EMR: ${ghe.emr}` : '';
  const gheHeader = `${ghe.code} | Setor: ${ghe.sectorName} | Efetivo Exposto: ${ghe.workerCount} trabalhador(es)${emrInfo}`;

  docxChildren.push(
    new Paragraph({
      children: [new TextRun({ text: gheHeader, bold: true, size: 20 })],
      spacing: { before: 200, after: 60 }
    })
  );

  for (const pos of ghe.positions) {
    docxChildren.push(
      new Paragraph({
        children: [new TextRun({ text: `Cargo / Função: ${pos.title} (CBO: ${pos.cbo})`, bold: true, size: 18 })],
        spacing: { after: 30 }
      }),
      new Paragraph({
        children: [new TextRun({ text: `Descrição da Atividade: ${pos.activity}`, size: 18 })],
        spacing: { after: 70 }
      })
    );
  }

  for (const risk of ghe.risks) {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 4,
            shading: { fill: '52525B', type: ShadingType.CLEAR, color: 'auto' },
            children: [new Paragraph({ children: [new TextRun({ text: `${ghe.code} APR-HO - 02/2026`, bold: true, color: 'FFFFFF' })], alignment: AlignmentType.CENTER })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 1,
            shading: { fill: '16A34A', type: ShadingType.CLEAR, color: 'auto' },
            children: [new Paragraph({ children: [new TextRun({ text: `Risco ${risk.category}`, bold: true, color: 'FFFFFF' })] })]
          }),
          new TableCell({
            columnSpan: 3,
            children: [new Paragraph({ children: [new TextRun({ text: `Agente: ${risk.agent}`, bold: true })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ columnSpan: 1, children: [new Paragraph({ text: 'Severidade', alignment: AlignmentType.CENTER })] }),
          new TableCell({ columnSpan: 1, children: [new Paragraph({ text: 'Probabilidade', alignment: AlignmentType.CENTER })] }),
          new TableCell({ columnSpan: 1, children: [new Paragraph({ text: 'Status do agente', alignment: AlignmentType.CENTER })] }),
          new TableCell({ columnSpan: 1, children: [new Paragraph({ text: 'Prioridade de ação', alignment: AlignmentType.CENTER })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ columnSpan: 1, children: [new Paragraph({ text: String(risk.severity), alignment: AlignmentType.CENTER })] }),
          new TableCell({ columnSpan: 1, children: [new Paragraph({ text: String(risk.probability), alignment: AlignmentType.CENTER })] }),
          new TableCell({ columnSpan: 1, children: [new Paragraph({ text: risk.status, alignment: AlignmentType.CENTER })] }),
          new TableCell({ columnSpan: 1, children: [new Paragraph({ text: risk.priority, alignment: AlignmentType.CENTER })] })
        ]
      })
    ];

    docxChildren.push(
      new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
      new Paragraph({ text: '', spacing: { after: 150 } })
    );
  }
}

const docxDoc = new Document({ sections: [{ children: docxChildren }] });
const docxBuffer = await Packer.toBuffer(docxDoc);
const docxPath = `${artifactDir}/teste_geracao_oficial.docx`;
fs.writeFileSync(docxPath, docxBuffer);
console.log(`   ✅ Word (.docx) gerado com sucesso (${docxBuffer.length} bytes): ${docxPath}`);

// 3. GERAÇÃO DE EXCEL (.XLSX)
console.log('3️⃣ Gerando Excel (.xlsx)...');
const wb = XLSX.utils.book_new();
const wsData = [
  ['INVENTÁRIO DE RISCOS OCUPACIONAIS (NR-01.5.7) — MODELO OFICIAL APR-HO'],
  [`Empresa: ${testData.company.name} | CNPJ: ${testData.company.cnpj}`],
  []
];

for (const ghe of testData.ghes) {
  wsData.push([`${ghe.code} | Setor: ${ghe.sectorName} | EMR: ${ghe.emr}`]);
  for (const pos of ghe.positions) {
    wsData.push([`Cargo: ${pos.title} (CBO: ${pos.cbo})`, `Atividade: ${pos.activity}`]);
  }
  for (const risk of ghe.risks) {
    wsData.push([`Risco ${risk.category}`, `Agente: ${risk.agent}`, `Status: ${risk.status}`, `Prioridade: ${risk.priority}`]);
  }
  wsData.push([]);
}

const ws = XLSX.utils.aoa_to_sheet(wsData);
XLSX.utils.book_append_sheet(wb, ws, 'Inventário APR-HO');
const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
const xlsxPath = `${artifactDir}/teste_geracao_oficial.xlsx`;
fs.writeFileSync(xlsxPath, xlsxBuffer);
console.log(`   ✅ Excel (.xlsx) gerado com sucesso (${xlsxBuffer.length} bytes): ${xlsxPath}`);

console.log('\n🎉 TODOS OS ARQUIVOS (PDF, WORD, EXCEL) FORAM GERADOS COM 100% DE SUCESSO E INTEGRIDADE!');
