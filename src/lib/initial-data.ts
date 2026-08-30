import { 
  Company, 
  Establishment, 
  Sector, 
  Position, 
  GHE, 
  Professional, 
  PGRDocument, 
  RiskInventoryItem, 
  ActionPlanItem 
} from '@/types/pgr';
import { DEFAULT_CLIENTE_LOGO } from '@/lib/default-logos';

// Base limpa por padrão para testes do zero
export const INITIAL_COMPANIES: Company[] = [];
export const INITIAL_ESTABLISHMENTS: Establishment[] = [];
export const INITIAL_SECTORS: Sector[] = [];
export const INITIAL_POSITIONS: Position[] = [];
export const INITIAL_GHES: GHE[] = [];
export const INITIAL_PROFESSIONALS: Professional[] = [];
export const INITIAL_PGR_DOCUMENTS: PGRDocument[] = [];
export const INITIAL_RISK_INVENTORY: RiskInventoryItem[] = [];
export const INITIAL_ACTION_PLANS: ActionPlanItem[] = [];

// Base de demonstração para recarga sob demanda
export const DEMO_COMPANIES: Company[] = [
  {
    id: 'comp-01',
    name: 'Horizonte Engenharia e Manufatura Ltda',
    tradeName: 'Horizonte Industrial',
    cnpj: '12.345.678/0001-90',
    cnae: '25.39-0-01',
    cnaeDescription: 'Serviços de usinagem, torneamento e solda',
    riskGrade: 3,
    address: {
      street: 'Av. Industrial das Nações',
      number: '1500',
      complement: 'Galpão 04',
      neighborhood: 'Distrito Industrial',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89219-500',
    },
    phone: '(47) 3456-7890',
    email: 'seguranca@horizonteindustrial.com.br',
    legalRepresentative: 'Carlos Eduardo Silveira',
    representativeRole: 'Diretor Industrial',
    employeeCount: 68,
    logoUrl: DEFAULT_CLIENTE_LOGO,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const DEMO_ESTABLISHMENTS: Establishment[] = [
  {
    id: 'est-01',
    companyId: 'comp-01',
    name: 'Unidade Fabril Matriz - Joinville',
    code: 'EST-001',
    type: 'MATRIZ',
    address: {
      street: 'Av. Industrial das Nações',
      number: '1500',
      neighborhood: 'Distrito Industrial',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89219-500',
    },
    managerName: 'Roberto Mendes da Silva',
    employeeCount: 52,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
