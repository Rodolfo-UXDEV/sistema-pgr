import { Sector, Position, GHE, RiskInventoryItem } from '@/types/pgr';

export interface GheGroupData {
  id: string;
  gheCode: string;
  sectorName: string;
  workerCount: number;
  emr?: string;
  positions: Array<{
    id: string;
    title: string;
    cbo?: string;
    activityDescription: string;
  }>;
  risks: RiskInventoryItem[];
}

/**
 * Retorna o peso numérico da categoria para ordenação fixa normativa:
 * 1º Físico
 * 2º Químico
 * 3º Biológico
 * 4º Ergonômico / Psicossocial
 * 5º Acidentes / Mecânico
 */
export function getCategoryOrderWeight(cat?: string): number {
  if (!cat) return 99;
  const clean = cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (clean.includes('fisic')) return 1;
  if (clean.includes('quimic')) return 2;
  if (clean.includes('biolog')) return 3;
  if (clean.includes('ergo') || clean.includes('psico')) return 4;
  if (clean.includes('acident') || clean.includes('mecanic')) return 5;
  return 99;
}

export const HAZARD_CATEGORY_ORDER: Record<string, number> = {
  fisico: 1,
  quimico: 2,
  biologico: 3,
  ergonomico: 4,
  psicossocial: 4,
  acidente: 5,
  acidentes: 5,
  FISICO: 1,
  QUIMICO: 2,
  BIOLOGICO: 3,
  ERGONOMICO: 4,
  PSICOSSOCIAL: 4,
  ACIDENTE: 5,
  ACIDENTES: 5,
};

/**
 * Identifica se o risco foi cadastrado como 'Não há exposição / Não se aplica'
 * ou ausência de risco, permitindo renderização condensada de 1 linha.
 */
export function isNoExposureRisk(item: RiskInventoryItem): boolean {
  const name = (item.hazardName || '').toLowerCase().trim();
  const desc = (item.sourceDescription || '').toLowerCase().trim();
  const health = (item.healthDamage || '').toLowerCase().trim();
  const code = (item.hazardCode || '').toLowerCase().trim();
  
  const keywords = [
    'não há exposição',
    'nao ha exposicao',
    'não se aplica',
    'nao se aplica',
    'ausência de risco',
    'ausencia de risco',
    'sem exposição',
    'sem exposicao',
    'inexistente',
    'ausente',
    'nap'
  ];

  if (name === 'nap' || desc === 'nap' || health === 'nap' || code === 'nap') return true;
  return keywords.some(k => name.includes(k) || desc.includes(k) || health.includes(k));
}

/**
 * Ordena os riscos pela sequência normativa padrão:
 * 1º Físico, 2º Químico, 3º Biológico, 4º Ergonômico, 5º Acidentes
 */
export function sortRisksByNormativeCategory(items: RiskInventoryItem[]): RiskInventoryItem[] {
  return [...items].sort((a, b) => {
    const orderA = getCategoryOrderWeight(a.hazardCategory);
    const orderB = getCategoryOrderWeight(b.hazardCategory);
    if (orderA !== orderB) return orderA - orderB;
    return (a.hazardName || '').localeCompare(b.hazardName || '');
  });
}

/**
 * Agrupa o inventário de riscos hierarquicamente por GHE / Setor,
 * contendo seus respectivos cargos, descrições de atividades e tabelas APR-HO.
 */
export function groupInventoryByGhe(
  sectors: Sector[],
  positions: Position[],
  ghes: GHE[],
  riskInventory: RiskInventoryItem[]
): GheGroupData[] {
  const groups: GheGroupData[] = [];
  const processedRiskIds = new Set<string>();

  // 1. Se houver setores cadastrados, iterar pelos setores e seus respectivos GHEs
  if (sectors && sectors.length > 0) {
    sectors.forEach((sec, sIdx) => {
      const secGhes = ghes ? ghes.filter(g => g.sectorId === sec.id) : [];

      if (secGhes.length > 0) {
        secGhes.forEach((ghe, gIdx) => {
          const rawCode = ghe.code || `${sIdx + 1}.${gIdx + 1}`;
          const gheCode = rawCode.toUpperCase().startsWith('GHE') || rawCode.toUpperCase().startsWith('GES')
            ? rawCode
            : `GHE ${rawCode}`;

          // Cargos vinculados a este GHE ou ao Setor (caso não tenham GHE específico)
          const secPositions = positions ? positions.filter(p => p.gheId === ghe.id || ghe.positionIds?.includes(p.id) || (p.sectorId === sec.id && !p.gheId)) : [];
          
          // Riscos vinculados a este GHE ou ao Setor
          const secRisks = riskInventory ? riskInventory.filter(r => r.gheId === ghe.id || (r.sectorId === sec.id && (!r.gheId || r.gheId === ghe.id))) : [];
          secRisks.forEach(r => processedRiskIds.add(r.id));

          const totalWorkers = secPositions.reduce((acc, p) => acc + (p.workerCount || 0), 0)
            || ghe.workerCount
            || sec.workerCount
            || (secRisks.length > 0 ? secRisks[0].exposedCount : 1)
            || 1;

          const emr = secRisks.find(r => r.highestRiskExposed)?.highestRiskExposed;

          const formattedPositions = secPositions.length > 0
            ? secPositions.map(p => ({
                id: p.id,
                title: p.title,
                cbo: p.cbo,
                activityDescription: p.activityDescription || p.routineActivities || p.description || 'Execução de atividades operacionais e rotinas da função.',
              }))
            : [{
                id: `pos-${ghe.id}`,
                title: ghe.name || 'Colaboradores do Setor',
                cbo: undefined,
                activityDescription: ghe.description || 'Execução de rotinas e processos operacionais do setor.',
              }];

          groups.push({
            id: ghe.id,
            gheCode,
            sectorName: sec.name,
            workerCount: totalWorkers,
            emr,
            positions: formattedPositions,
            risks: sortRisksByNormativeCategory(secRisks),
          });
        });
      } else {
        // Setor sem GHE explícito cadastrado
        const gheCode = `GHE ${sIdx + 1}.0`;
        const secPositions = positions ? positions.filter(p => p.sectorId === sec.id) : [];
        const secRisks = riskInventory ? riskInventory.filter(r => r.sectorId === sec.id) : [];
        secRisks.forEach(r => processedRiskIds.add(r.id));

        const totalWorkers = secPositions.reduce((acc, p) => acc + (p.workerCount || 0), 0)
          || sec.workerCount
          || (secRisks.length > 0 ? secRisks[0].exposedCount : 1)
          || 1;

        const emr = secRisks.find(r => r.highestRiskExposed)?.highestRiskExposed;

        const formattedPositions = secPositions.length > 0
          ? secPositions.map(p => ({
              id: p.id,
              title: p.title,
              cbo: p.cbo,
              activityDescription: p.activityDescription || p.routineActivities || p.description || 'Execução de atividades operacionais e rotinas da função.',
            }))
          : [{
              id: `pos-${sec.id}`,
              title: 'Colaboradores do Setor',
              cbo: undefined,
              activityDescription: 'Execução de rotinas e processos operacionais do setor.',
            }];

        groups.push({
          id: sec.id,
          gheCode,
          sectorName: sec.name,
          workerCount: totalWorkers,
          emr,
          positions: formattedPositions,
          risks: sortRisksByNormativeCategory(secRisks),
        });
      }
    });
  }

  // 2. Riscos órfãos (sem setor associado ou setor excluído)
  const remainingRisks = riskInventory ? riskInventory.filter(r => !processedRiskIds.has(r.id)) : [];
  if (remainingRisks.length > 0) {
    groups.push({
      id: 'orphan-risks',
      gheCode: `GHE ${groups.length + 1}.0`,
      sectorName: 'Geral',
      workerCount: remainingRisks[0].exposedCount || 1,
      emr: remainingRisks.find(r => r.highestRiskExposed)?.highestRiskExposed,
      positions: [{
        id: 'pos-general',
        title: 'Colaboradores Gerais',
        activityDescription: 'Atividades operacionais gerais e rotinas da empresa.',
      }],
      risks: sortRisksByNormativeCategory(remainingRisks),
    });
  }

  return groups;
}
