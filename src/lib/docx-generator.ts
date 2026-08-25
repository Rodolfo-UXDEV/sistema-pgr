import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
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
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
import { RiskInventoryItem, ActionPlanItem, HazardCategory } from '@/types/pgr';

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
  children.push(
    new Paragraph({
      text: OFFICIAL_PGR_TEXTS.consultingCompany,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: OFFICIAL_PGR_TEXTS.consultingCrea,
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
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
      spacing: { after: 800 },
    }),
    new Paragraph({
      text: docData.header.companyName.toUpperCase(),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `CNPJ: ${docData.header.cnpj} | ${docData.header.establishmentName}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 1400 },
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
    children.push(
      new Paragraph({
        text: `${section.number}. ${section.title}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 600, after: 200 },
      })
    );

    if (section.type === 'revision_table') {
      const rows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Revisão', bold: true })], alignment: AlignmentType.CENTER })],
              width: { size: 2000, type: WidthType.DXA },
              shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' },
              borders: cellBorder,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Data', bold: true })], alignment: AlignmentType.CENTER })],
              width: { size: 2500, type: WidthType.DXA },
              shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' },
              borders: cellBorder,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Descrição / Motivo da Revisão', bold: true })] })],
              width: { size: 5500, type: WidthType.DXA },
              shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' },
              borders: cellBorder,
            }),
          ],
        }),
        ...section.revisions.map((r) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: r.rev, alignment: AlignmentType.CENTER })], borders: cellBorder }),
              new TableCell({ children: [new Paragraph({ text: r.date, alignment: AlignmentType.CENTER })], borders: cellBorder }),
              new TableCell({ children: [new Paragraph({ text: r.description })], borders: cellBorder }),
            ],
          })
        ),
      ];

      children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    } else if (section.type === 'company_info') {
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
      const paras = section.content.split('\n\n');
      for (const p of paras) {
        children.push(new Paragraph({ text: p, spacing: { after: 150 } }));
      }
    } else if (section.type === 'responsibilities') {
      const c = section.content;
      children.push(
        new Paragraph({ children: [new TextRun({ text: '8.1 Do Empregador', bold: true })], spacing: { before: 150, after: 100 } }),
        ...c.empregador.split('\n').map((l: string) => new Paragraph({ text: l, spacing: { after: 50 } })),
        new Paragraph({ children: [new TextRun({ text: '8.2 Dos Trabalhadores', bold: true })], spacing: { before: 150, after: 100 } }),
        ...c.trabalhadores.split('\n').map((l: string) => new Paragraph({ text: l, spacing: { after: 50 } })),
        new Paragraph({ children: [new TextRun({ text: '8.3 Dos Responsáveis Técnicos e SESMT', bold: true })], spacing: { before: 150, after: 100 } }),
        ...c.sesmt.split('\n').map((l: string) => new Paragraph({ text: l, spacing: { after: 50 } }))
      );
    } else if (section.type === 'matrix_explanation') {
      children.push(
        new Paragraph({ text: section.description, spacing: { after: 200 } }),
        new Paragraph({
          children: [new TextRun({ text: 'Tabela de Gradação de Risco (Severidade x Probabilidade):', bold: true })],
          spacing: { after: 100 },
        }),
        new Paragraph({ text: '• TRIVIAL (1 a 2): Ação não necessária além de manter controles operacionais.' }),
        new Paragraph({ text: '• TOLERÁVEL (3 a 4): Monitoramento periódico. Não exige ação imediata.' }),
        new Paragraph({ text: '• MODERADO (5 a 9): Esforços necessários para redução. Prazo de adequação: 90 dias.' }),
        new Paragraph({ text: '• SUBSTANCIAL (10 a 16): Trabalho não deve iniciar sem medidas mitigadoras. Prazo: 30 dias.' }),
        new Paragraph({ text: '• INTOLERÁVEL (20 a 25): Trabalho não deve continuar até redução urgente do risco.' })
      );
    } else if (section.type === 'sectors_list') {
      for (const s of section.sectors) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Setor: ${s.name}`, bold: true })],
            spacing: { before: 200, after: 80 },
          }),
          new Paragraph({ text: `Descrição: ${s.description}` }),
          new Paragraph({
            text: `Estrutura Física: Piso ${s.characteristics.floorType} | Paredes ${s.characteristics.wallType} | Cobertura ${s.characteristics.roofType} | Ventilação ${s.characteristics.ventilationType} | Iluminação ${s.characteristics.lightingType}`,
            spacing: { after: 150 },
          })
        );
      }
    } else if (section.type === 'positions_list') {
      for (const p of section.positions) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Função: ${p.title} (CBO: ${p.cbo})`, bold: true })],
            spacing: { before: 200, after: 80 },
          }),
          new Paragraph({ text: `Setor: ${p.sectorName} | Efetivo Exposto: ${p.workers} trabalhador(es)` }),
          new Paragraph({ text: `Atividades Rotineiras: ${p.routine}` }),
          new Paragraph({ text: `Atividades Não Rotineiras: ${p.nonRoutine}`, spacing: { after: 150 } })
        );
      }
    } else if (section.type === 'risk_inventory_table') {
      const items = section.items;

      if (!items || items.length === 0) {
        children.push(new Paragraph({ text: 'Nenhum risco cadastrado no inventário.', spacing: { after: 200 } }));
      } else {
        const rows = [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Setor / Cargo', bold: true })] })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Perigo / Fator de Risco', bold: true })] })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Fonte Geradora & Danos', bold: true })] })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Matriz 5x5', bold: true })], alignment: AlignmentType.CENTER })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Medidas de Controle (EPC / EPI)', bold: true })] })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            ],
          }),
          ...items.map((item: RiskInventoryItem) => {
            const sec = ctx.sectors.find(s => s.id === item.sectorId);
            const pos = ctx.positions.find(p => p.id === item.positionId);
            const cat = HAZARD_CATEGORY_CONFIG[item.hazardCategory as HazardCategory]?.label || item.hazardCategory;

            const epiText = item.epiExisting && item.epiExisting.length > 0
              ? item.epiExisting.map((e: any) => `${e.name} (CA: ${e.ca || 'S/N'})`).join('; ')
              : 'Nenhum';

            const epcText = item.epcExisting && item.epcExisting.length > 0
              ? item.epcExisting.join('; ')
              : 'Nenhum';

            return new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: `${sec?.name || '-'}\n${pos?.title || '-'}` })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: `[${cat}]\n${item.hazardName}` })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: `Fonte: ${item.sourceDescription}\nDanos: ${item.healthDamage}` })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: `P:${item.probability} x S:${item.severity} = ${item.riskScore}\n[${item.riskLevel}]`, alignment: AlignmentType.CENTER })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: `EPC: ${epcText}\nEPI: ${epiText}` })], borders: cellBorder }),
              ],
            });
          }),
        ];

        children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }
    } else if (section.type === 'action_plan_table') {
      const actions = section.items;

      if (!actions || actions.length === 0) {
        children.push(new Paragraph({ text: 'Nenhuma ação programada no plano.', spacing: { after: 200 } }));
      } else {
        const rows = [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'O que (Ação)', bold: true })] })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Por que (Motivo)', bold: true })] })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Quem (Responsável)', bold: true })] })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Quando (Prazo)', bold: true })] })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status & Eficácia', bold: true })] })], borders: cellBorder, shading: { fill: lightGray, type: ShadingType.CLEAR, color: 'auto' } }),
            ],
          }),
          ...actions.map((act: ActionPlanItem) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: act.what })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: act.why })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: act.who })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: act.whenDate })], borders: cellBorder }),
                new TableCell({ children: [new Paragraph({ text: `${act.status}\n${act.efficacyVerified ? '✓ Eficácia Comprovada' : 'Pendente'}` })], borders: cellBorder }),
              ],
            })
          ),
        ];

        children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }
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
