export type HazardCategory = 'FISICO' | 'QUIMICO' | 'BIOLOGICO' | 'ERGONOMICO' | 'ACIDENTE';

export type RiskLevel = 'TRIVIAL' | 'TOLERAVEL' | 'MODERADO' | 'SUBSTANCIAL' | 'INTOLERAVEL';

export type ActionStatus = 'NAO_INICIADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ATRASADA' | 'CANCELADA';

export type PgrDocumentStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'ARCHIVED';

export type ExposureType = 
  | 'HABITUAL_PERMANENTE' 
  | 'HABITUAL_INTERMITENTE' 
  | 'EVENTUAL_INTERMITENTE' 
  | 'EVENTUAL' 
  | 'PERMANENTE' 
  | 'INTERMITENTE' 
  | 'HABITUAL' 
  | 'CONTINUA';

export interface Company {
  id: string;
  name: string;
  tradeName?: string;
  cnpj: string;
  cnae: string;
  cnaeDescription: string;
  riskGrade: 1 | 2 | 3 | 4; // Grau de Risco conforme Quadro I da NR-04
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone?: string;
  email?: string;
  legalRepresentative: string;
  representativeRole: string;
  logoUrl?: string;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Establishment {
  id: string;
  companyId: string;
  name: string;
  code: string;
  type: 'MATRIZ' | 'FILIAL' | 'OBRA' | 'POSTO_AVANCADO';
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  managerName?: string;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sector {
  id: string;
  establishmentId: string;
  name: string;
  description: string;
  physicalCharacteristics: {
    floorType: string;
    wallType: string;
    roofType: string;
    ventilationType: 'NATURAL' | 'ARTIFICIAL' | 'MISTA';
    lightingType: 'NATURAL' | 'ARTIFICIAL' | 'MISTA';
  };
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  establishmentId: string;
  sectorId: string;
  title: string;
  cbo: string; // Classificação Brasileira de Ocupações
  activityDescription?: string; // Descrição da Atividade
  description?: string; // Legado
  routineActivities?: string; // Legado
  nonRoutineActivities?: string; // Legado
  workerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GES {
  id: string;
  establishmentId: string;
  sectorId: string;
  code: string; // Ex: GES-01, GES-PROD-02
  name?: string;
  description?: string;
  positionIds?: string[];
  workerCount: number;
  createdAt: string;
  updatedAt: string;
}

export type GHE = GES;

export interface Professional {
  id: string;
  name: string;
  role: 'ENGENHEIRO_SEGURANCA' | 'TECNICO_SEGURANCA' | 'MEDICO_TRABALHO' | 'HIGIENISTA_OCUPACIONAL';
  registrationCouncil: string; // CREA, MTE, CRM, etc.
  registrationNumber: string;
  registrationState: string;
  artRrt?: string; // Número da ART/RRT
  email?: string;
  phone?: string;
  signatureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HazardItem {
  id: string;
  category: HazardCategory;
  code: string; // Código eSocial Tabela 24 ou padrão interno
  name: string;
  description: string;
  possibleDamages: string;
  suggestedEpc?: string;
  suggestedEpi?: string;
  suggestedAdminMeasures?: string;
  isCustom?: boolean;
}

export interface EpiControl {
  name: string;
  ca: string; // Certificado de Aprovação
  validity?: string;
  attenuationRating?: string;
}

export interface EnvironmentalMeasurement {
  id: string;
  agentName: string;
  unit?: string; // dB(A), °C IBUTG, Lux, ppm, mg/m³
  measuredValue?: number;
  criteria?: string; // Critério (ex: Quantitativo NR-15, NHO-01, Qualitativo)
  technique?: string; // Técnica Utilizada (ex: Dosimetria, Termômetro de Globo)
  measurementDate?: string; // Data da Medição (ex: YYYY-MM-DD)
  resultText?: string; // Resultado (ex: 84.5 dB(A))
  toleranceLimitText?: string; // LT - Limite de Tolerância (ex: 85.0 dB(A))
  actionLevel?: number;
  toleranceLimit?: number;
  methodology?: string; // NHO-01, NHO-06, NR-15 Anexo 1, etc.
  equipmentUsed?: string;
  calibrationDate?: string;
  resultStatus?: 'ABAIXO_NIVEL_ACAO' | 'ACIMA_NIVEL_ACAO' | 'ACIMA_LIMITE_TOLERANCIA';
}

export interface RiskInventoryItem {
  id: string;
  pgrId: string;
  companyId: string;
  establishmentId: string;
  sectorId: string;
  gheId?: string;
  positionId?: string;
  hazardId?: string;
  hazardCategory: HazardCategory;
  hazardName: string;
  hazardCode?: string;
  sourceDescription: string; // Fonte geradora
  healthDamage: string; // Possíveis lesões ou agravos / Efeitos à saúde
  penetrationRoute?: string; // Via de penetração (Cutânea, Respiratória, etc.)
  trajectory?: string; // Trajetória (ex: Ar, Contato direto, Propagação aérea)
  exposedCount: number;
  exposureType: ExposureType;
  
  // Gradação de Risco (Matriz 5x5)
  probability: number; // 1 (Raríssima) a 5 (Muito Frequente/Certa)
  severity: number; // 1 (Leve) a 5 (Catastrófico/Morte)
  riskScore: number; // 1 a 25
  riskLevel: RiskLevel;
  
  // Medidas de Prevenção e Controle
  epcExisting: string[];
  adminMeasuresExisting: string[];
  epiExisting: EpiControl[];
  
  // Avaliações Ambientais / Medições
  measurements?: EnvironmentalMeasurement[];
  
  // Recomendações
  recommendations?: string;
  
  // Avaliações e Resultados (Imagens / Gráficos / Planilhas)
  evaluationImages?: string[];
  
  // Necessita de Ação?
  actionRequired: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface ActionPlanItem {
  id: string;
  pgrId: string;
  companyId: string;
  establishmentId: string;
  riskInventoryId?: string;
  
  // Metodologia 5W2H
  what: string; // O que fazer
  why: string; // Por que fazer
  whereLoc: string; // Onde será feito (Setor/Ambiente)
  who: string; // Quem é o responsável
  whenDate: string; // Quando (Prazo limite)
  how: string; // Como será executado
  howMuch?: number; // Custo estimado (R$)
  
  status: ActionStatus;
  completionDate?: string;
  evidenceNotes?: string;
  efficacyVerified?: boolean;
  efficacyNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface PGRDocument {
  id: string;
  companyId: string;
  establishmentId: string;
  code: string; // Ex: PGR-2026-001
  title: string;
  version: string; // Ex: 1.0, 2.0
  year: number;
  validityStart: string;
  validityEnd: string;
  status: PgrDocumentStatus;
  
  elaborationDate: string;
  approvalDate?: string;
  revisionReason?: string;
  
  technicalResponsibleId?: string;
  medicalResponsibleId?: string;
  
  generalObjectives: string;
  methodologyDescription: string;
  scopeDescription: string;
  responsibilitiesMatrix: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface IssuerCompanyConfig {
  name: string; // Razão Social da Empresa Emissora / Consultoria SST
  tradeName?: string; // Nome Fantasia
  cnpj: string; // CNPJ da Emissora
  registrationCouncil: string; // ex: 'CREA-SP: 01.194.103'
  phone?: string;
  email?: string;
  website?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  technicalManager?: {
    name: string;
    role: string;
    council: string;
    cpf?: string;
  };
  logoUrl?: string; // Logotipo da Consultoria em Base64 ou URL
  updatedAt?: string;
}
