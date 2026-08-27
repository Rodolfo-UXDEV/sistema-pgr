import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { 
  Company, 
  Establishment, 
  Sector, 
  Position, 
  GHE, 
  Professional, 
  HazardItem, 
  PGRDocument, 
  RiskInventoryItem, 
  ActionPlanItem 
} from '@/types/pgr';
import { DEFAULT_HAZARDS } from '@/lib/default-hazards';

// Nomes das coleções no Firestore
export const COLLECTIONS = {
  COMPANIES: 'companies',
  ESTABLISHMENTS: 'establishments',
  SECTORS: 'sectors',
  POSITIONS: 'positions',
  GHES: 'ghes',
  PROFESSIONALS: 'professionals',
  HAZARDS_CATALOG: 'hazards_catalog',
  PGR_DOCUMENTS: 'pgr_documents',
  RISK_INVENTORY: 'risk_inventory',
  ACTION_PLANS: 'action_plans',
};

// ==========================================
// 1. LEITURA COMPLETA DO FIRESTORE
// ==========================================

export async function fetchAllFromFirestore() {
  if (!isFirebaseConfigured) return null;

  try {
    const [
      companiesSnap,
      establishmentsSnap,
      sectorsSnap,
      positionsSnap,
      ghesSnap,
      professionalsSnap,
      hazardsSnap,
      pgrDocsSnap,
      riskInvSnap,
      actionsSnap,
    ] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.COMPANIES)),
      getDocs(collection(db, COLLECTIONS.ESTABLISHMENTS)),
      getDocs(collection(db, COLLECTIONS.SECTORS)),
      getDocs(collection(db, COLLECTIONS.POSITIONS)),
      getDocs(collection(db, COLLECTIONS.GHES)),
      getDocs(collection(db, COLLECTIONS.PROFESSIONALS)),
      getDocs(collection(db, COLLECTIONS.HAZARDS_CATALOG)),
      getDocs(collection(db, COLLECTIONS.PGR_DOCUMENTS)),
      getDocs(collection(db, COLLECTIONS.RISK_INVENTORY)),
      getDocs(collection(db, COLLECTIONS.ACTION_PLANS)),
    ]);

    const companies = companiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Company));
    const establishments = establishmentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Establishment));
    const sectors = sectorsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Sector));
    const positions = positionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Position));
    const ghes = ghesSnap.docs.map(d => ({ id: d.id, ...d.data() } as GHE));
    const professionals = professionalsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Professional));
    const hazards = hazardsSnap.docs.map(d => ({ id: d.id, ...d.data() } as HazardItem));
    const pgrDocuments = pgrDocsSnap.docs.map(d => ({ id: d.id, ...d.data() } as PGRDocument));
    const riskInventory = riskInvSnap.docs.map(d => ({ id: d.id, ...d.data() } as RiskInventoryItem));
    const actionPlans = actionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as ActionPlanItem));

    return {
      companies,
      establishments,
      sectors,
      positions,
      ghes,
      professionals,
      hazards,
      pgrDocuments,
      riskInventory,
      actionPlans,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do Firestore:', error);
    return null;
  }
}

// ==========================================
// 2. GRAVAÇÃO & EXCLUSÃO INDIVIDUAL
// ==========================================

export function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore).filter(v => v !== undefined);
  }
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = cleanForFirestore(value);
      }
    }
    return clean;
  }
  return obj;
}

export async function saveToFirestore<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, collectionName, item.id);
    const sanitized = cleanForFirestore(item);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    console.error(`Erro ao salvar documento em ${collectionName}/${item.id}:`, error);
  }
}

export async function deleteFromFirestore(collectionName: string, id: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Erro ao deletar documento em ${collectionName}/${id}:`, error);
  }
}

// ==========================================
// 3. CARGA INICIAL (SEED) DO FIRESTORE
// ==========================================

export async function seedFirestoreDatabase(): Promise<boolean> {
  if (!isFirebaseConfigured) {
    console.error('Firebase não configurado para executar seed.');
    return false;
  }

  try {
    const batch = writeBatch(db);

    // 1. Empresa Modelo
    const company: Company = {
      id: 'comp-01',
      name: 'Metalúrgica Brasil Sul Ltda',
      tradeName: 'Brasil Sul Metais',
      cnpj: '12.345.678/0001-90',
      cnae: '25.39-0-01',
      cnaeDescription: 'Serviços de usinagem, torneamento e solda',
      riskGrade: 3,
      address: {
        street: 'Av. das Indústrias',
        number: '1500',
        complement: 'Galpão 02',
        neighborhood: 'Distrito Industrial',
        city: 'Joinville',
        state: 'SC',
        zipCode: '89219-500',
      },
      phone: '(47) 3456-7890',
      email: 'contato@brasilsulmetais.com.br',
      legalRepresentative: 'Carlos Eduardo Silveira',
      representativeRole: 'Diretor Geral',
      employeeCount: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    batch.set(doc(db, COLLECTIONS.COMPANIES, company.id), company);

    // 2. Estabelecimento Matriz
    const establishment: Establishment = {
      id: 'est-01',
      companyId: 'comp-01',
      name: 'Unidade Fabril Matriz - Joinville',
      code: 'EST-001',
      type: 'MATRIZ',
      address: {
        street: 'Av. das Indústrias',
        number: '1500',
        neighborhood: 'Distrito Industrial',
        city: 'Joinville',
        state: 'SC',
        zipCode: '89219-500',
      },
      managerName: 'Roberto Mendes da Silva',
      employeeCount: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    batch.set(doc(db, COLLECTIONS.ESTABLISHMENTS, establishment.id), establishment);

    // 3. Setores
    const sectors: Sector[] = [
      {
        id: 'sec-usinagem',
        establishmentId: 'est-01',
        name: 'Usinagem e Torneamento',
        description: 'Setor de usinagem com tornos CNC, tornos universais e fresadoras',
        physicalCharacteristics: {
          floorType: 'Concreto polido de alta resistência',
          wallType: 'Alvenaria rebocada e pintada',
          roofType: 'Estrutura metálica com telhas termoacústicas',
          ventilationType: 'NATURAL',
          lightingType: 'NATURAL',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sec-solda',
        establishmentId: 'est-01',
        name: 'Soldagem e Caldeiraria',
        description: 'Setor de montagem estrutural, corte a plasma e soldagem MIG/MAG/TIG',
        physicalCharacteristics: {
          floorType: 'Concreto usinado reforçado',
          wallType: 'Alvenaria com divisórias antichamas',
          roofType: 'Estrutura metálica com exaustores',
          ventilationType: 'ARTIFICIAL',
          lightingType: 'ARTIFICIAL',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    sectors.forEach(s => batch.set(doc(db, COLLECTIONS.SECTORS, s.id), s));

    // 4. Cargos
    const positions: Position[] = [
      {
        id: 'pos-torneiro',
        establishmentId: 'est-01',
        sectorId: 'sec-usinagem',
        title: 'Torneiro Mecânico CNC',
        cbo: '7212-15',
        description: 'Operador de tornos convencionais e CNC',
        routineActivities: 'Operar tornos mecânicos e CNC, preparar ferramentas de corte, efetuar medições com paquímetro e micrômetro, realizar limpeza e lubrificação básica da máquina.',
        nonRoutineActivities: 'Auxiliar na movimentação de peças pesadas com ponte rolante e troca de fluído de corte.',
        workerCount: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pos-soldador',
        establishmentId: 'est-01',
        sectorId: 'sec-solda',
        title: 'Soldador MIG/MAG',
        cbo: '7243-15',
        description: 'Profissional de soldagem de conjuntos metálicos',
        routineActivities: 'Efetuar soldagem de estruturas metálicas pelo processo MIG/MAG e eletrodo revestido, preparar chanfros com esmerilhadeira, inspecionar cordões de solda.',
        nonRoutineActivities: 'Troca de cilindros de gases de proteção e limpeza de bicos de tocha.',
        workerCount: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    positions.forEach(p => batch.set(doc(db, COLLECTIONS.POSITIONS, p.id), p));

    // 5. GHEs
    const ghes: GHE[] = [
      {
        id: 'ghe-01',
        establishmentId: 'est-01',
        sectorId: 'sec-usinagem',
        code: 'GHE-01',
        name: 'GHE Usinagem',
        description: 'Grupo de operadores de máquinas-ferramenta e tornos',
        positionIds: ['pos-torneiro'],
        workerCount: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ghe-02',
        establishmentId: 'est-01',
        sectorId: 'sec-solda',
        code: 'GHE-02',
        name: 'GHE Caldeiraria e Solda',
        description: 'Grupo de soldadores e operadores de corte térmico',
        positionIds: ['pos-soldador'],
        workerCount: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    ghes.forEach(g => batch.set(doc(db, COLLECTIONS.GHES, g.id), g));

    // 6. Profissional SST
    const professional: Professional = {
      id: 'prof-01',
      name: 'Eng. Carlos Eduardo Mendes',
      role: 'ENGENHEIRO_SEGURANCA',
      registrationCouncil: 'CREA',
      registrationNumber: '123456/D',
      registrationState: 'SC',
      artRrt: 'ART-2026/SC-987654321',
      email: 'carlos.mendes@engenhariasst.com.br',
      phone: '(47) 98888-7766',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    batch.set(doc(db, COLLECTIONS.PROFESSIONALS, professional.id), professional);

    // 7. Catálogo de Perigos
    DEFAULT_HAZARDS.forEach(h => {
      batch.set(doc(db, COLLECTIONS.HAZARDS_CATALOG, h.id), h);
    });

    // 8. Documento PGR Oficial
    const pgrDoc: PGRDocument = {
      id: 'pgr-2026-001',
      companyId: 'comp-01',
      establishmentId: 'est-01',
      code: 'PGR-2026-001',
      title: 'Programa de Gerenciamento de Riscos - Metalúrgica Brasil Sul 2026',
      version: '01',
      year: 2026,
      validityStart: '2026-01-01',
      validityEnd: '2028-01-01',
      status: 'APPROVED',
      elaborationDate: '2026-01-01',
      approvalDate: '2026-01-02',
      revisionReason: 'Emissão Inicial do Programa de Gerenciamento de Riscos (NR-01)',
      technicalResponsibleId: 'prof-01',
      generalObjectives: 'Identificar perigos, avaliar riscos ocupacionais e implementar plano de controle.',
      methodologyDescription: 'Metodologia Matriz 5x5 de acordo com a NR-01.',
      scopeDescription: 'Unidade Fabril Matriz de Joinville/SC.',
      responsibilitiesMatrix: 'Empregador, Trabalhadores e SESMT.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    batch.set(doc(db, COLLECTIONS.PGR_DOCUMENTS, pgrDoc.id), pgrDoc);

    // 9. Inventário de Riscos (Matriz 5x5)
    const riskInventory: RiskInventoryItem[] = [
      {
        id: 'risk-01',
        pgrId: 'pgr-2026-001',
        companyId: 'comp-01',
        establishmentId: 'est-01',
        sectorId: 'sec-usinagem',
        gheId: 'ghe-01',
        positionId: 'pos-torneiro',
        hazardId: 'haz-fis-01',
        hazardCategory: 'FISICO',
        hazardName: 'Ruído Contínuo ou Intermitente',
        hazardCode: '01.01.001',
        sourceDescription: 'Funcionamento de tornos CNC e maquinários de usinagem pesada',
        healthDamage: 'Perda Auditiva Induzida por Ruído (PAIR), estresse, cefaleia e fadiga auditiva',
        exposedCount: 12,
        exposureType: 'CONTINUA',
        probability: 3,
        severity: 3,
        riskScore: 9,
        riskLevel: 'MODERADO',
        epcExisting: ['Enclausuramento acústico de compressores', 'Manutenção preventiva periódica'],
        adminMeasuresExisting: ['Treinamento de PCA (Programa de Conservação Auditiva)', 'Sinalização de área'],
        epiExisting: [{ name: 'Protetor Auditivo tipo Concha', ca: '35123', attenuationRating: '22 dB' }],
        actionRequired: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'risk-02',
        pgrId: 'pgr-2026-001',
        companyId: 'comp-01',
        establishmentId: 'est-01',
        sectorId: 'sec-solda',
        gheId: 'ghe-02',
        positionId: 'pos-soldador',
        hazardId: 'haz-qui-02',
        hazardCategory: 'QUIMICO',
        hazardName: 'Fumos Metálicos e Vapores de Solda',
        hazardCode: '02.01.003',
        sourceDescription: 'Processo de fusão e soldagem MIG/MAG em chapas de aço carbono',
        healthDamage: 'Febre dos fumos metálicos, irritação das vias aéreas superiores, bronquite crônica',
        exposedCount: 8,
        exposureType: 'CONTINUA',
        probability: 3,
        severity: 4,
        riskScore: 12,
        riskLevel: 'SUBSTANCIAL',
        epcExisting: ['Coifas de exaustão móveis nas cabines'],
        adminMeasuresExisting: ['Treinamento de segurança em processos de soldagem', 'Ventilação forçada'],
        epiExisting: [
          { name: 'Respirador Semifacial PFF2 para Fumos', ca: '41234' },
          { name: 'Máscara de Solda com Escurecimento Automático', ca: '38921' }
        ],
        actionRequired: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    riskInventory.forEach(r => batch.set(doc(db, COLLECTIONS.RISK_INVENTORY, r.id), r));

    // 10. Planos de Ação 5W2H
    const actionPlans: ActionPlanItem[] = [
      {
        id: 'act-01',
        pgrId: 'pgr-2026-001',
        companyId: 'comp-01',
        establishmentId: 'est-01',
        riskInventoryId: 'risk-01',
        what: 'Instalação de barreira acústica e revisão de coxins antivibração',
        why: 'Reduzir a propagação sonora de tornos mecânicos e compressores no setor de Usinagem',
        whereLoc: 'Setor de Usinagem - Galpão 02',
        who: 'Engenharia de Manutenção / SESMT',
        whenDate: '2026-06-30',
        how: 'Contratar empresa de acústica industrial para dimensionar e instalar mantas fonoabsorventes',
        howMuch: 8500,
        status: 'EM_ANDAMENTO',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'act-02',
        pgrId: 'pgr-2026-001',
        companyId: 'comp-01',
        establishmentId: 'est-01',
        riskInventoryId: 'risk-02',
        what: 'Instalação de novos braços articulados de exaustão pontual para solda',
        why: 'Capturar fumos metálicos diretamente na fonte geradora antes de atingir a zona respiratória',
        whereLoc: 'Bancadas de Solda 01 a 04',
        who: 'SESMT / Coordenação de Caldeiraria',
        whenDate: '2026-04-15',
        how: 'Aquisição e instalação de 4 braços extratores de fumos com filtragem eletrostática',
        howMuch: 14200,
        status: 'NAO_INICIADA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    actionPlans.forEach(a => batch.set(doc(db, COLLECTIONS.ACTION_PLANS, a.id), a));

    await batch.commit();
    console.log('Seed do Firebase Firestore concluído com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao executar seed no Firestore:', error);
    return false;
  }
}
