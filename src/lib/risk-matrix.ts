import { RiskLevel, HazardCategory } from '@/types/pgr';

export interface MatrixLevelInfo {
  level: RiskLevel;
  label: string;
  badgeColor: string; // Tailwind class
  bgColor: string;
  textColor: string;
  borderColor: string;
  actionRequirement: string;
  deadlineDays: number;
}

export const RISK_LEVEL_CONFIG: Record<RiskLevel, MatrixLevelInfo> = {
  TRIVIAL: {
    level: 'TRIVIAL',
    label: 'Trivial / Muito Baixo',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    bgColor: '#10b981',
    textColor: '#ffffff',
    borderColor: '#059669',
    actionRequirement: 'Nenhuma ação adicional é necessária. Manter medidas de controle existentes.',
    deadlineDays: 365,
  },
  TOLERAVEL: {
    level: 'TOLERAVEL',
    label: 'Tolerável / Baixo',
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-950/60 dark:text-lime-300 dark:border-lime-800',
    bgColor: '#84cc16',
    textColor: '#ffffff',
    borderColor: '#65a30d',
    actionRequirement: 'Monitorar periodicamente para assegurar que os controles permaneçam eficazes.',
    deadlineDays: 180,
  },
  MODERADO: {
    level: 'MODERADO',
    label: 'Moderado / Médio',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    bgColor: '#f59e0b',
    textColor: '#ffffff',
    borderColor: '#d97706',
    actionRequirement: 'Necessário estabelecer plano de ação corretivo e preventivo para redução do risco.',
    deadlineDays: 90,
  },
  SUBSTANCIAL: {
    level: 'SUBSTANCIAL',
    label: 'Substancial / Alto',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
    bgColor: '#f97316',
    textColor: '#ffffff',
    borderColor: '#ea580c',
    actionRequirement: 'Ação prioritária e urgente. Não iniciar ou restringir atividade até medidas de mitigação.',
    deadlineDays: 30,
  },
  INTOLERAVEL: {
    level: 'INTOLERAVEL',
    label: 'Intolerável / Crítico',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 animate-pulse',
    bgColor: '#ef4444',
    textColor: '#ffffff',
    borderColor: '#dc2626',
    actionRequirement: 'INTERRUPÇÃO IMEDIATA da atividade até implantação de medidas que reduzam o risco a níveis aceitáveis.',
    deadlineDays: 7,
  },
};

export const PROBABILITY_SCALE = [
  { value: 1, label: '1 - Raríssima', desc: 'Praticamente impossível de ocorrer; medidas de proteção altamente eficazes e redundantes.' },
  { value: 2, label: '2 - Pouco Provável', desc: 'Rara ocorrência conhecida; medidas de controle existentes com boa eficácia.' },
  { value: 3, label: '3 - Provável / Ocasional', desc: 'Pode ocorrer durante a vida útil da instalação; controles parciais ou falhas eventuais.' },
  { value: 4, label: '4 - Frequente', desc: 'Ocorre com frequência no histórico de operações; medidas de controle deficientes.' },
  { value: 5, label: '5 - Muito Frequente / Certa', desc: 'Ocorrência sistemática ou contínua; ausência de medidas de controle aplicadas.' },
];

export const SEVERITY_SCALE = [
  { value: 1, label: '1 - Leve / Desprezível', desc: 'Pequenos ferimentos sem necessidade de afastamento ou primeiros socorros simples.' },
  { value: 2, label: '2 - Menor / Moderada', desc: 'Lesão leve com atendimento médico e retorno rápido ao trabalho (< 3 dias).' },
  { value: 3, label: '3 - Moderada / Grave', desc: 'Lesão severa reversível, afastamento temporário significativo (> 15 dias).' },
  { value: 4, label: '4 - Crítica / Severa', desc: 'Incapacidade permanente parcial ou total, amputações, perda auditiva severa.' },
  { value: 5, label: '5 - Catastrófica / Fatal', desc: 'Morte de um ou mais trabalhadores, desastre operacional ou colapso ambiental.' },
];

// Matriz de Risco 5x5 (Linhas: Severidade 1-5, Colunas: Probabilidade 1-5)
export const MATRIX_5X5: Record<number, Record<number, RiskLevel>> = {
  1: { 1: 'TRIVIAL', 2: 'TRIVIAL', 3: 'TOLERAVEL', 4: 'TOLERAVEL', 5: 'MODERADO' },
  2: { 1: 'TRIVIAL', 2: 'TOLERAVEL', 3: 'MODERADO', 4: 'MODERADO', 5: 'SUBSTANCIAL' },
  3: { 1: 'TOLERAVEL', 2: 'MODERADO', 3: 'MODERADO', 4: 'SUBSTANCIAL', 5: 'INTOLERAVEL' },
  4: { 1: 'TOLERAVEL', 2: 'MODERADO', 3: 'SUBSTANCIAL', 4: 'SUBSTANCIAL', 5: 'INTOLERAVEL' },
  5: { 1: 'MODERADO', 2: 'SUBSTANCIAL', 3: 'INTOLERAVEL', 4: 'INTOLERAVEL', 5: 'INTOLERAVEL' },
};

export function calculateRiskLevel(severity: number, probability: number): { score: number; level: RiskLevel } {
  const s = Math.min(Math.max(severity, 1), 5);
  const p = Math.min(Math.max(probability, 1), 5);
  const score = s * p;
  const level = MATRIX_5X5[s]?.[p] || 'MODERADO';
  return { score, level };
}

export const HAZARD_CATEGORY_CONFIG: Record<HazardCategory, { label: string; color: string; iconBg: string; textClass: string }> = {
  FISICO: {
    label: 'Físico',
    color: '#0284c7',
    iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
    textClass: 'text-sky-600 dark:text-sky-400',
  },
  QUIMICO: {
    label: 'Químico',
    color: '#dc2626',
    iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    textClass: 'text-rose-600 dark:text-rose-400',
  },
  BIOLOGICO: {
    label: 'Biológico',
    color: '#9333ea',
    iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    textClass: 'text-purple-600 dark:text-purple-400',
  },
  ERGONOMICO: {
    label: 'Ergonômico',
    color: '#f59e0b',
    iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  ACIDENTE: {
    label: 'Acidente / Mecânico',
    color: '#ea580c',
    iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
    textClass: 'text-orange-600 dark:text-orange-400',
  },
};
