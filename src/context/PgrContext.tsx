import React, { createContext, useContext, useState, useEffect } from 'react';
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
  ActionPlanItem,
  RiskLevel
} from '@/types/pgr';
import {
  INITIAL_COMPANIES,
  INITIAL_ESTABLISHMENTS,
  INITIAL_SECTORS,
  INITIAL_POSITIONS,
  INITIAL_GHES,
  INITIAL_PROFESSIONALS,
  INITIAL_PGR_DOCUMENTS,
  INITIAL_RISK_INVENTORY,
  INITIAL_ACTION_PLANS,
  DEMO_COMPANIES,
  DEMO_ESTABLISHMENTS
} from '@/lib/initial-data';
import { DEFAULT_HAZARDS } from '@/lib/default-hazards';
import { generateId } from '@/lib/utils';
import { isFirebaseConfigured } from '@/lib/firebase';
import { 
  fetchAllFromFirestore,
  saveToFirestore,
  deleteFromFirestore,
  COLLECTIONS,
  seedFirestoreDatabase,
} from '@/lib/firebase-service';

interface PgrContextType {
  // Estado ativo
  activeCompany: Company | null;
  setActiveCompany: (company: Company | null) => void;
  activeEstablishment: Establishment | null;
  setActiveEstablishment: (establishment: Establishment | null) => void;
  activePgr: PGRDocument | null;
  setActivePgr: (pgr: PGRDocument | null) => void;

  // Listagens
  companies: Company[];
  establishments: Establishment[];
  sectors: Sector[];
  positions: Position[];
  ghes: GHE[];
  professionals: Professional[];
  hazards: HazardItem[];
  pgrDocuments: PGRDocument[];
  riskInventory: RiskInventoryItem[];
  actionPlans: ActionPlanItem[];

  // Estado da Conexão Firebase
  isLoadingDb: boolean;
  refreshFromFirebase: () => Promise<void>;
  seedDatabase: () => Promise<boolean>;

  // CRUD Empresas
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Company>;
  updateCompany: (id: string, data: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;

  // CRUD Estabelecimentos
  addEstablishment: (est: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Establishment>;
  updateEstablishment: (id: string, data: Partial<Establishment>) => Promise<void>;
  deleteEstablishment: (id: string) => Promise<void>;

  // CRUD Setores
  addSector: (sector: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Sector>;
  updateSector: (id: string, data: Partial<Sector>) => Promise<void>;
  deleteSector: (id: string) => Promise<void>;

  // CRUD Cargos
  addPosition: (pos: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Position>;
  updatePosition: (id: string, data: Partial<Position>) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;

  // CRUD GHEs
  addGhe: (ghe: Omit<GHE, 'id' | 'createdAt' | 'updatedAt'>) => Promise<GHE>;
  updateGhe: (id: string, data: Partial<GHE>) => Promise<void>;
  deleteGhe: (id: string) => Promise<void>;

  // CRUD Profissionais
  addProfessional: (prof: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Professional>;
  updateProfessional: (id: string, data: Partial<Professional>) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;

  // CRUD Catálogo de Perigos
  addHazard: (hazard: Omit<HazardItem, 'id'>) => Promise<HazardItem>;

  // CRUD PGRs
  addPgrDocument: (doc: Omit<PGRDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PGRDocument>;
  updatePgrDocument: (id: string, data: Partial<PGRDocument>) => Promise<void>;
  deletePgrDocument: (id: string) => Promise<void>;

  // CRUD Inventário de Riscos
  addRiskItem: (item: Omit<RiskInventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RiskInventoryItem>;
  updateRiskItem: (id: string, data: Partial<RiskInventoryItem>) => Promise<void>;
  deleteRiskItem: (id: string) => Promise<void>;

  // CRUD Plano de Ação
  addActionPlan: (plan: Omit<ActionPlanItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ActionPlanItem>;
  updateActionPlan: (id: string, data: Partial<ActionPlanItem>) => Promise<void>;
  deleteActionPlan: (id: string) => Promise<void>;

  // Funções de Reset e Limpeza
  clearAllData: () => void;
  loadDemoData: () => void;

  // Métricas Computadas
  stats: {
    totalEmployees: number;
    totalSectors: number;
    totalPositions: number;
    totalRisks: number;
    risksByLevel: Record<RiskLevel, number>;
    criticalRisksCount: number;
    totalActions: number;
    pendingActions: number;
    inProgressActions: number;
    completedActions: number;
    delayedActions: number;
    totalInvestment: number;
  };
}

const PgrContext = createContext<PgrContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COMPANIES: 'pgr_clean_companies_v2',
  ESTABLISHMENTS: 'pgr_clean_establishments_v2',
  SECTORS: 'pgr_clean_sectors_v2',
  POSITIONS: 'pgr_clean_positions_v2',
  GHES: 'pgr_clean_ghes_v2',
  PROFESSIONALS: 'pgr_clean_professionals_v2',
  HAZARDS: 'pgr_clean_hazards_v2',
  PGR_DOCUMENTS: 'pgr_clean_pgr_docs_v2',
  RISK_INVENTORY: 'pgr_clean_risk_inventory_v2',
  ACTION_PLANS: 'pgr_clean_action_plans_v2',
  ACTIVE_COMPANY_ID: 'pgr_clean_active_comp_id_v2',
  ACTIVE_ESTABLISHMENT_ID: 'pgr_clean_active_est_id_v2',
  ACTIVE_PGR_ID: 'pgr_clean_active_pgr_id_v2',
};

function loadStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return defaultValue;
  }
}

function saveStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

function normalizeGesRecord(item: GHE): { normalized: GHE; changed: boolean } {
  const newCode = (item.code || '').replace(/\bGHE\b/gi, 'GES').replace(/GHE-/gi, 'GES-');
  const newName = (item.name || '').replace(/\bGHE\b/gi, 'GES').replace(/GHE-/gi, 'GES-');
  const newDescription = item.description ? item.description.replace(/\bGHE\b/gi, 'GES').replace(/GHE-/gi, 'GES-') : item.description;
  const changed = newCode !== item.code || newName !== item.name || newDescription !== item.description;
  return {
    normalized: {
      ...item,
      code: newCode,
      name: newName,
      description: newDescription,
    },
    changed,
  };
}

export const PgrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>(() => loadStorage(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES));
  const [establishments, setEstablishments] = useState<Establishment[]>(() => loadStorage(STORAGE_KEYS.ESTABLISHMENTS, INITIAL_ESTABLISHMENTS));
  const [sectors, setSectors] = useState<Sector[]>(() => loadStorage(STORAGE_KEYS.SECTORS, INITIAL_SECTORS));
  const [positions, setPositions] = useState<Position[]>(() => loadStorage(STORAGE_KEYS.POSITIONS, INITIAL_POSITIONS));
  const [ghes, setGhes] = useState<GHE[]>(() => {
    const raw = loadStorage(STORAGE_KEYS.GHES, INITIAL_GHES);
    return raw.map(g => normalizeGesRecord(g).normalized);
  });
  const [professionals, setProfessionals] = useState<Professional[]>(() => loadStorage(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS));
  const [hazards, setHazards] = useState<HazardItem[]>(() => loadStorage(STORAGE_KEYS.HAZARDS, DEFAULT_HAZARDS));
  const [pgrDocuments, setPgrDocuments] = useState<PGRDocument[]>(() => loadStorage(STORAGE_KEYS.PGR_DOCUMENTS, INITIAL_PGR_DOCUMENTS));
  const [riskInventory, setRiskInventory] = useState<RiskInventoryItem[]>(() => loadStorage(STORAGE_KEYS.RISK_INVENTORY, INITIAL_RISK_INVENTORY));
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>(() => loadStorage(STORAGE_KEYS.ACTION_PLANS, INITIAL_ACTION_PLANS));

  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => loadStorage(STORAGE_KEYS.ACTIVE_COMPANY_ID, ''));
  const [activeEstablishmentId, setActiveEstablishmentId] = useState<string>(() => loadStorage(STORAGE_KEYS.ACTIVE_ESTABLISHMENT_ID, ''));
  const [activePgrId, setActivePgrId] = useState<string>(() => loadStorage(STORAGE_KEYS.ACTIVE_PGR_ID, ''));
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);

  // Carrega e sincroniza dados do Firebase Firestore
  const refreshFromFirebase = async () => {
    if (!isFirebaseConfigured) return;
    setIsLoadingDb(true);
    try {
      let data = await fetchAllFromFirestore();

      // Se o banco estiver vazio no Firestore, executa auto-seed
      if (data && data.companies.length === 0) {
        console.log('Banco Firestore vazio. Executando seed inicial automático...');
        await seedFirestoreDatabase();
        data = await fetchAllFromFirestore();
      }

      if (data && data.companies.length > 0) {
        setCompanies(data.companies);
        setEstablishments(data.establishments);
        setSectors(data.sectors);
        setPositions(data.positions);
        
        // Normaliza automaticamente qualquer registro legado com GHE para GES
        const normalizedGhes = data.ghes.map(g => {
          const res = normalizeGesRecord(g);
          if (res.changed) {
            saveToFirestore(COLLECTIONS.GHES, res.normalized);
          }
          return res.normalized;
        });
        setGhes(normalizedGhes);

        setProfessionals(data.professionals);
        if (data.hazards.length > 0) setHazards(data.hazards);
        setPgrDocuments(data.pgrDocuments);
        setRiskInventory(data.riskInventory);
        setActionPlans(data.actionPlans);

        if (!activeCompanyId && data.companies.length > 0) {
          setActiveCompanyId(data.companies[0].id);
          const firstEst = data.establishments.find(e => e.companyId === data.companies[0].id);
          if (firstEst) setActiveEstablishmentId(firstEst.id);
          const firstDoc = data.pgrDocuments.find(p => p.companyId === data.companies[0].id);
          if (firstDoc) setActivePgrId(firstDoc.id);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do Firebase Firestore:', err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const seedDatabase = async (): Promise<boolean> => {
    setIsLoadingDb(true);
    const success = await seedFirestoreDatabase();
    if (success) {
      await refreshFromFirebase();
    }
    setIsLoadingDb(false);
    return success;
  };

  useEffect(() => {
    refreshFromFirebase();
  }, []);

  // Sync to local storage
  useEffect(() => saveStorage(STORAGE_KEYS.COMPANIES, companies), [companies]);
  useEffect(() => saveStorage(STORAGE_KEYS.ESTABLISHMENTS, establishments), [establishments]);
  useEffect(() => saveStorage(STORAGE_KEYS.SECTORS, sectors), [sectors]);
  useEffect(() => saveStorage(STORAGE_KEYS.POSITIONS, positions), [positions]);
  useEffect(() => saveStorage(STORAGE_KEYS.GHES, ghes), [ghes]);
  useEffect(() => saveStorage(STORAGE_KEYS.PROFESSIONALS, professionals), [professionals]);
  useEffect(() => saveStorage(STORAGE_KEYS.HAZARDS, hazards), [hazards]);
  useEffect(() => saveStorage(STORAGE_KEYS.PGR_DOCUMENTS, pgrDocuments), [pgrDocuments]);
  useEffect(() => saveStorage(STORAGE_KEYS.RISK_INVENTORY, riskInventory), [riskInventory]);
  useEffect(() => saveStorage(STORAGE_KEYS.ACTION_PLANS, actionPlans), [actionPlans]);
  useEffect(() => saveStorage(STORAGE_KEYS.ACTIVE_COMPANY_ID, activeCompanyId), [activeCompanyId]);
  useEffect(() => saveStorage(STORAGE_KEYS.ACTIVE_ESTABLISHMENT_ID, activeEstablishmentId), [activeEstablishmentId]);
  useEffect(() => saveStorage(STORAGE_KEYS.ACTIVE_PGR_ID, activePgrId), [activePgrId]);

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0] || null;
  const activeEstablishment = establishments.find(e => e.id === activeEstablishmentId) || establishments.find(e => e.companyId === activeCompany?.id) || establishments[0] || null;
  const activePgr = pgrDocuments.find(p => p.id === activePgrId) || pgrDocuments.find(p => p.companyId === activeCompany?.id) || pgrDocuments[0] || null;

  const setActiveCompany = (comp: Company | null) => {
    setActiveCompanyId(comp ? comp.id : '');
    if (comp) {
      const firstEst = establishments.find(e => e.companyId === comp.id);
      if (firstEst) setActiveEstablishmentId(firstEst.id);
      const firstDoc = pgrDocuments.find(p => p.companyId === comp.id);
      if (firstDoc) setActivePgrId(firstDoc.id);
    }
  };

  const setActiveEstablishment = (est: Establishment | null) => {
    setActiveEstablishmentId(est ? est.id : '');
  };

  const setActivePgr = (pgr: PGRDocument | null) => {
    setActivePgrId(pgr ? pgr.id : '');
  };

  // CRUD EMPRESAS
  const addCompany = async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCompany: Company = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCompanies(prev => [newCompany, ...prev]);
    setActiveCompanyId(newCompany.id);
    await saveToFirestore(COLLECTIONS.COMPANIES, newCompany);
    return newCompany;
  };

  const updateCompany = async (id: string, data: Partial<Company>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    const target = companies.find(c => c.id === id);
    if (target) {
      await saveToFirestore(COLLECTIONS.COMPANIES, { ...target, ...updated, id });
    }
  };

  const deleteCompany = async (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    if (activeCompanyId === id) {
      const remaining = companies.filter(c => c.id !== id);
      setActiveCompany(remaining[0] || null);
    }
    await deleteFromFirestore(COLLECTIONS.COMPANIES, id);
  };

  // CRUD ESTABELECIMENTOS
  const addEstablishment = async (data: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEst: Establishment = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEstablishments(prev => [newEst, ...prev]);
    setActiveEstablishmentId(newEst.id);
    await saveToFirestore(COLLECTIONS.ESTABLISHMENTS, newEst);
    return newEst;
  };

  const updateEstablishment = async (id: string, data: Partial<Establishment>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setEstablishments(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    const target = establishments.find(e => e.id === id);
    if (target) {
      await saveToFirestore(COLLECTIONS.ESTABLISHMENTS, { ...target, ...updated, id });
    }
  };

  const deleteEstablishment = async (id: string) => {
    setEstablishments(prev => prev.filter(e => e.id !== id));
    await deleteFromFirestore(COLLECTIONS.ESTABLISHMENTS, id);
  };

  // CRUD SETORES
  const addSector = async (data: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSector: Sector = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSectors(prev => [newSector, ...prev]);
    await saveToFirestore(COLLECTIONS.SECTORS, newSector);
    return newSector;
  };

  const updateSector = async (id: string, data: Partial<Sector>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setSectors(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    const target = sectors.find(s => s.id === id);
    if (target) {
      await saveToFirestore(COLLECTIONS.SECTORS, { ...target, ...updated, id });
    }
  };

  const deleteSector = async (id: string) => {
    setSectors(prev => prev.filter(s => s.id !== id));
    await deleteFromFirestore(COLLECTIONS.SECTORS, id);
  };

  // CRUD CARGOS
  const addPosition = async (data: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPos: Position = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPositions(prev => [newPos, ...prev]);
    await saveToFirestore(COLLECTIONS.POSITIONS, newPos);
    return newPos;
  };

  const updatePosition = async (id: string, data: Partial<Position>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setPositions(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    const target = positions.find(p => p.id === id);
    if (target) {
      await saveToFirestore(COLLECTIONS.POSITIONS, { ...target, ...updated, id });
    }
  };

  const deletePosition = async (id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
    await deleteFromFirestore(COLLECTIONS.POSITIONS, id);
  };

  // CRUD GHES
  const addGhe = async (data: Omit<GHE, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGhe: GHE = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGhes(prev => [newGhe, ...prev]);
    await saveToFirestore(COLLECTIONS.GHES, newGhe);
    return newGhe;
  };

  const updateGhe = async (id: string, data: Partial<GHE>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setGhes(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
    const target = ghes.find(g => g.id === id);
    if (target) {
      await saveToFirestore(COLLECTIONS.GHES, { ...target, ...updated, id });
    }
  };

  const deleteGhe = async (id: string) => {
    setGhes(prev => prev.filter(g => g.id !== id));
    await deleteFromFirestore(COLLECTIONS.GHES, id);
  };

  // CRUD PROFISSIONAIS
  const addProfessional = async (data: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProf: Professional = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfessionals(prev => [newProf, ...prev]);
    await saveToFirestore(COLLECTIONS.PROFESSIONALS, newProf);
    return newProf;
  };

  const updateProfessional = async (id: string, data: Partial<Professional>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    const target = professionals.find(p => p.id === id);
    if (target) {
      await saveToFirestore(COLLECTIONS.PROFESSIONALS, { ...target, ...updated, id });
    }
  };

  const deleteProfessional = async (id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
    await deleteFromFirestore(COLLECTIONS.PROFESSIONALS, id);
  };

  // CRUD CATÁLOGO DE PERIGOS
  const addHazard = async (data: Omit<HazardItem, 'id'>) => {
    const newHazard: HazardItem = {
      ...data,
      id: 'haz-custom-' + Date.now(),
      isCustom: true,
    };
    setHazards(prev => [newHazard, ...prev]);
    await saveToFirestore(COLLECTIONS.HAZARDS_CATALOG, newHazard);
    return newHazard;
  };

  // CRUD PGRs
  const addPgrDocument = async (data: Omit<PGRDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDoc: PGRDocument = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPgrDocuments(prev => [newDoc, ...prev]);
    setActivePgrId(newDoc.id);
    await saveToFirestore(COLLECTIONS.PGR_DOCUMENTS, newDoc);
    return newDoc;
  };

  const updatePgrDocument = async (id: string, data: Partial<PGRDocument>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setPgrDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    const target = pgrDocuments.find(d => d.id === id);
    if (target) {
      await saveToFirestore(COLLECTIONS.PGR_DOCUMENTS, { ...target, ...updated, id });
    }
  };

  const deletePgrDocument = async (id: string) => {
    setPgrDocuments(prev => prev.filter(d => d.id !== id));
    await deleteFromFirestore(COLLECTIONS.PGR_DOCUMENTS, id);
  };

  // CRUD INVENTÁRIO DE RISCOS
  const addRiskItem = async (data: Omit<RiskInventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: RiskInventoryItem = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRiskInventory(prev => [newItem, ...prev]);
    await saveToFirestore(COLLECTIONS.RISK_INVENTORY, newItem);

    // Se o risco requer ação, criar automaticamente uma ação sugerida no Plano de Ação
    if (newItem.actionRequired) {
      const suggestedAction: ActionPlanItem = {
        id: generateId(),
        pgrId: newItem.pgrId,
        companyId: newItem.companyId,
        establishmentId: newItem.establishmentId,
        riskInventoryId: newItem.id,
        what: `Mitigação de ${newItem.hazardName}: implementar melhorias técnicas e controle de exposição`,
        why: `Risco classificado como ${newItem.riskLevel}. Necessidade de atendimento à NR-01.`,
        whereLoc: 'Setor operacional',
        who: 'Engenharia de Segurança e Manutenção',
        whenDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        how: 'Desenvolver projeto de enclausuramento / exaustão ou substituição de processo, complementando com EPI com CA.',
        howMuch: 0,
        status: 'NAO_INICIADA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setActionPlans(prev => [suggestedAction, ...prev]);
      await saveToFirestore(COLLECTIONS.ACTION_PLANS, suggestedAction);
    }

    return newItem;
  };

  const updateRiskItem = async (id: string, data: Partial<RiskInventoryItem>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setRiskInventory(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    const target = riskInventory.find(r => r.id === id);
    if (target) {
      await saveToFirestore(COLLECTIONS.RISK_INVENTORY, { ...target, ...updated, id });
    }
  };

  const deleteRiskItem = async (id: string) => {
    setRiskInventory(prev => prev.filter(r => r.id !== id));
    await deleteFromFirestore(COLLECTIONS.RISK_INVENTORY, id);
  };

  // CRUD PLANO DE AÇÃO
  const addActionPlan = async (data: Omit<ActionPlanItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAction: ActionPlanItem = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActionPlans(prev => [newAction, ...prev]);
    await saveToFirestore(COLLECTIONS.ACTION_PLANS, newAction);
    return newAction;
  };

  const updateActionPlan = async (id: string, data: Partial<ActionPlanItem>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setActionPlans(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
    const target = actionPlans.find(a => a.id === id);
    if (target) {
      await saveToFirestore(COLLECTIONS.ACTION_PLANS, { ...target, ...updated, id });
    }
  };

  const deleteActionPlan = async (id: string) => {
    setActionPlans(prev => prev.filter(a => a.id !== id));
    await deleteFromFirestore(COLLECTIONS.ACTION_PLANS, id);
  };

  // LIMPEZA TOTAL (RESET DO ZERO)
  const clearAllData = () => {
    setCompanies([]);
    setEstablishments([]);
    setSectors([]);
    setPositions([]);
    setGhes([]);
    setProfessionals([]);
    setPgrDocuments([]);
    setRiskInventory([]);
    setActionPlans([]);
    setActiveCompanyId('');
    setActiveEstablishmentId('');
    setActivePgrId('');
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    }
  };

  // CARREGAR DEMO
  const loadDemoData = () => {
    setCompanies(DEMO_COMPANIES);
    setEstablishments(DEMO_ESTABLISHMENTS);
  };

  // MÉTRICAS COMPUTADAS
  const companyRisks = riskInventory.filter(r => !activeCompany || r.companyId === activeCompany.id);
  const companyActions = actionPlans.filter(a => !activeCompany || a.companyId === activeCompany.id);

  const risksByLevel: Record<RiskLevel, number> = {
    TRIVIAL: companyRisks.filter(r => r.riskLevel === 'TRIVIAL').length,
    TOLERAVEL: companyRisks.filter(r => r.riskLevel === 'TOLERAVEL').length,
    MODERADO: companyRisks.filter(r => r.riskLevel === 'MODERADO').length,
    SUBSTANCIAL: companyRisks.filter(r => r.riskLevel === 'SUBSTANCIAL').length,
    INTOLERAVEL: companyRisks.filter(r => r.riskLevel === 'INTOLERAVEL').length,
  };

  const stats = {
    totalEmployees: activeCompany?.employeeCount || 0,
    totalSectors: sectors.filter(s => establishments.filter(e => !activeCompany || e.companyId === activeCompany.id).some(e => e.id === s.establishmentId)).length,
    totalPositions: positions.filter(p => establishments.filter(e => !activeCompany || e.companyId === activeCompany.id).some(e => e.id === p.establishmentId)).length,
    totalRisks: companyRisks.length,
    risksByLevel,
    criticalRisksCount: risksByLevel.SUBSTANCIAL + risksByLevel.INTOLERAVEL,
    totalActions: companyActions.length,
    pendingActions: companyActions.filter(a => a.status === 'NAO_INICIADA').length,
    inProgressActions: companyActions.filter(a => a.status === 'EM_ANDAMENTO').length,
    completedActions: companyActions.filter(a => a.status === 'CONCLUIDA').length,
    delayedActions: companyActions.filter(a => a.status === 'ATRASADA' || (a.status !== 'CONCLUIDA' && new Date(a.whenDate) < new Date())).length,
    totalInvestment: companyActions.reduce((acc, curr) => acc + (curr.howMuch || 0), 0),
  };

  return (
    <PgrContext.Provider
      value={{
        activeCompany,
        setActiveCompany,
        activeEstablishment,
        setActiveEstablishment,
        activePgr,
        setActivePgr,
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
        isLoadingDb,
        refreshFromFirebase,
        seedDatabase,
        addCompany,
        updateCompany,
        deleteCompany,
        addEstablishment,
        updateEstablishment,
        deleteEstablishment,
        addSector,
        updateSector,
        deleteSector,
        addPosition,
        updatePosition,
        deletePosition,
        addGhe,
        updateGhe,
        deleteGhe,
        addProfessional,
        updateProfessional,
        deleteProfessional,
        addHazard,
        addPgrDocument,
        updatePgrDocument,
        deletePgrDocument,
        addRiskItem,
        updateRiskItem,
        deleteRiskItem,
        addActionPlan,
        updateActionPlan,
        deleteActionPlan,
        clearAllData,
        loadDemoData,
        stats,
      }}
    >
      {children}
    </PgrContext.Provider>
  );
};

export const usePgr = () => {
  const context = useContext(PgrContext);
  if (!context) {
    throw new Error('usePgr deve ser utilizado dentro de um PgrProvider');
  }
  return context;
};
