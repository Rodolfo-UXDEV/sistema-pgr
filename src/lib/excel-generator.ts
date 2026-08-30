import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PgrDocumentContext, buildPgrFullDocument } from '@/lib/pgr-official-template';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
import { HazardCategory, RiskInventoryItem } from '@/types/pgr';

export async function generatePgrExcel(ctx: PgrDocumentContext): Promise<void> {
  const docData = buildPgrFullDocument(ctx);
  const wb = XLSX.utils.book_new();

  // =========================================================================
  // ABA 1: INVENTÁRIO DE RISCOS (APR-HO) NO FORMATO ESTRUTURADO IDÊNTICO AO ANEXO
  // =========================================================================
  const wsRiskData: (string | number)[][] = [];
  const merges: XLSX.Range[] = [];
  let currentRow = 0;

  // Título da Planilha
  wsRiskData.push(['INVENTÁRIO DE RISCOS OCUPACIONAIS (NR-01.5.7) — MODELO OFICIAL APR-HO']);
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
  currentRow++;

  wsRiskData.push([`Empresa: ${ctx.company.name} | CNPJ: ${docData.header.cnpj} | Unidade: ${ctx.establishment?.name || 'Matriz'}`]);
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
  currentRow++;

  wsRiskData.push([]);
  currentRow++;

  if (!ctx.riskInventory || ctx.riskInventory.length === 0) {
    wsRiskData.push(['Nenhum risco registrado no inventário.']);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
    currentRow++;
  } else {
    ctx.riskInventory.forEach((item: RiskInventoryItem) => {
      const sec = ctx.sectors.find(s => s.id === item.sectorId);
      const pos = ctx.positions.find(p => p.id === item.positionId);
      const ghe = ctx.ghes.find(g => g.id === item.gheId);
      const catConfig = HAZARD_CATEGORY_CONFIG[item.hazardCategory as HazardCategory];

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

      // Row 1: Header Dark Gray
      wsRiskData.push([headerTitle, '', '', '']);
      merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Row 2: Risco Categoria & Agente
      wsRiskData.push([`Risco ${catConfig?.label || 'Físico'}`, `Agente: ${item.hazardName}`, '', '']);
      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Row 3: Tipo de Exposição
      wsRiskData.push(['Tipo de Exposição', expPart1, expPart2, '']);
      merges.push({ s: { r: currentRow, c: 2 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Row 4: Fontes ou circunstância
      wsRiskData.push(['Fontes ou circunstância', item.sourceDescription || 'NAP', '', '']);
      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Row 5: Trajetória
      wsRiskData.push(['Trajetória', item.trajectory || 'Ar', '', '']);
      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Row 6: Via de penetração
      wsRiskData.push(['Via de penetração', item.penetrationRoute || 'NAP', '', '']);
      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Row 7: Efeitos a saúde
      wsRiskData.push(['Efeitos a saúde', item.healthDamage || 'NAP', '', '']);
      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Row 8: EPC/EPI
      wsRiskData.push(['EPC/EPI', epcEpiFinal, '', '']);
      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Section Header: Medição
      wsRiskData.push(['Medição', '', '', '']);
      merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Row 10: Critério & Técnica
      wsRiskData.push([`Critério: ${criterio}`, '', `Técnica utilizada: ${tecnica}`, '']);
      merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 1 } });
      merges.push({ s: { r: currentRow, c: 2 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Row 11: Data da medição | Resultado | LT Headers
      wsRiskData.push(['Data da medição', 'Resultado', '', 'LT']);
      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
      currentRow++;

      // Row 12: Data da medição | Resultado | LT Values
      wsRiskData.push([dataMedicao, resultado, '', lt]);
      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
      currentRow++;

      // Section Header: Categorização do risco/perigo
      wsRiskData.push(['Categorização do risco/perigo', '', '', '']);
      merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Row 14: Severidade | Probabilidade | Status do agente | Prioridade Headers
      wsRiskData.push(['Severidade', 'Probabilidade', 'Status do agente', 'Prioridade de ação']);
      currentRow++;

      // Row 15: Severidade | Probabilidade | Status do agente | Prioridade Values
      wsRiskData.push([item.severity, item.probability, statusAgente, prioridade]);
      currentRow++;

      // Section Header: Recomendações
      wsRiskData.push(['Recomendações', '', '', '']);
      merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Row 17: Recomendações Values
      wsRiskData.push(['Recomendações', item.recommendations || 'NAP', '', '']);
      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 3 } });
      currentRow++;

      // Linha vazia separadora entre riscos
      wsRiskData.push([]);
      currentRow++;
    });
  }

  const wsRisks = XLSX.utils.aoa_to_sheet(wsRiskData);
  wsRisks['!merges'] = merges;
  wsRisks['!cols'] = [
    { wch: 28 },
    { wch: 32 },
    { wch: 28 },
    { wch: 32 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRisks, 'Inventário de Riscos (APR-HO)');

  // =========================================================================
  // ABA 2: PLANO DE AÇÃO (5W2H)
  // =========================================================================
  const wsActionData: (string | number)[][] = [
    ['PLANO DE AÇÃO E CRONOGRAMA DE PREVENÇÃO (NR-01.5.5 — 5W2H)'],
    [`Empresa: ${ctx.company.name} | CNPJ: ${docData.header.cnpj}`],
    [],
    [
      'O que (Ação)',
      'Por que (Motivo)',
      'Onde (Setor/Local)',
      'Quem (Responsável)',
      'Quando (Prazo)',
      'Como (Método/Recursos)',
      'Custo Estimado (R$)',
      'Status',
      'Eficácia Verificada'
    ],
  ];

  if (!ctx.actionPlans || ctx.actionPlans.length === 0) {
    wsActionData.push(['Nenhuma ação cadastrada no plano de prevenção.', '', '', '', '', '', '', '', '']);
  } else {
    ctx.actionPlans.forEach((act) => {
      wsActionData.push([
        act.what,
        act.why,
        act.whereLoc || 'Unidade Geral',
        act.who,
        act.whenDate,
        act.how || 'Procedimento operacional e normas internas',
        Number(act.howMuch || 0),
        act.status.replace('_', ' ').toUpperCase(),
        act.efficacyVerified ? 'Comprovada' : 'Pendente'
      ]);
    });
  }

  const wsActions = XLSX.utils.aoa_to_sheet(wsActionData);
  wsActions['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
  ];
  wsActions['!cols'] = [
    { wch: 35 },
    { wch: 30 },
    { wch: 22 },
    { wch: 22 },
    { wch: 15 },
    { wch: 35 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsActions, 'Plano de Ação (5W2H)');

  // =========================================================================
  // ABA 3: ESTRUTURA ORGANIZACIONAL & CADASTROS
  // =========================================================================
  const wsOrgData: (string | number)[][] = [
    ['ESTRUTURA ORGANIZACIONAL DA EMPRESA'],
    [`Razão Social: ${ctx.company.name} | Nome Fantasia: ${ctx.company.tradeName || ctx.company.name}`],
    [`CNPJ: ${docData.header.cnpj} | CNAE: ${ctx.company.cnae} - ${ctx.company.cnaeDescription} | Grau de Risco: ${ctx.company.riskGrade}`],
    [`Endereço: ${ctx.company.address.street}, ${ctx.company.address.number} - ${ctx.company.address.city}/${ctx.company.address.state}`],
    [],
    ['SETOR', 'CARGO / FUNÇÃO', 'CBO', 'GES', 'TRABALHADORES EXPOSTOS', 'DESCRIÇÃO DA ATIVIDADE'],
  ];

  if (ctx.positions && ctx.positions.length > 0) {
    ctx.positions.forEach((p) => {
      const sec = ctx.sectors.find(s => s.id === p.sectorId);
      const ghe = ctx.ghes.find(g => g.sectorId === p.sectorId || g.positionIds?.includes(p.id));
      wsOrgData.push([
        sec?.name || '-',
        p.title,
        p.cbo,
        ghe?.code ? `GES ${ghe.code}` : '-',
        p.workerCount,
        p.activityDescription || p.description || '-'
      ]);
    });
  } else {
    wsOrgData.push(['Nenhum cargo cadastrado.', '', '', '', '', '']);
  }

  const wsOrg = XLSX.utils.aoa_to_sheet(wsOrgData);
  wsOrg['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },
  ];
  wsOrg['!cols'] = [
    { wch: 25 },
    { wch: 28 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsOrg, 'Estrutura Organizacional');

  // Gerar e salvar arquivo Excel (.xlsx)
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const sanitizedCompany = ctx.company.name.replace(/[^a-zA-Z0-9]/g, '_');
  saveAs(blob, `PGR_${sanitizedCompany}_${docData.header.code}.xlsx`);
}
