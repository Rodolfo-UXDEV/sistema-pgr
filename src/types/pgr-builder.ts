export type PgrSectionType = 'text' | 'system_data' | 'hybrid';

export type PgrSectionCategory = 
  | 'pretextual'    // Capa, Revisões, Cadastros, RT
  | 'normative'     // Introdução, Objetivos, Fundamentação Legal, Responsabilidades
  | 'methodology'   // GRO, Matriz 5x5, Diretrizes de Agentes Ocupacionais
  | 'environments'  // Setores, Ambientes Físicos, Funções CBO
  | 'risks'         // Inventário Consolidado de Riscos 5x5
  | 'actions'       // Plano de Ação 5W2H e Cronograma
  | 'posttextual';  // Emergências, PCMSO, Termo de Encerramento, Recibo de EPI

export interface PgrSectionDefinition {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  category: PgrSectionCategory;
  type: PgrSectionType;
  description: string;
  defaultContent: string;
  isSystemData: boolean;
  systemDataSummary?: string;
}

export interface PgrCustomSectionData {
  title?: string;
  subtitle?: string;
  content: string;
  isModified: boolean;
  lastModifiedAt?: string;
}
