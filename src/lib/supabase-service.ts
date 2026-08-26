import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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

// ==========================================
// 1. MAPEADORES DE SUPABASE -> FRONTEND
// ==========================================

export function mapCompanyFromDb(row: any): Company {
  return {
    id: row.id,
    name: row.name,
    tradeName: row.trade_name,
    cnpj: row.cnpj,
    cnae: row.cnae,
    cnaeDescription: row.cnae_description,
    riskGrade: row.risk_grade,
    address: row.address || {},
    phone: row.phone,
    email: row.email,
    legalRepresentative: row.legal_representative,
    representativeRole: row.representative_role,
    logoUrl: row.logo_url,
    employeeCount: row.employee_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCompanyToDb(comp: Partial<Company>): any {
  const payload: any = {};
  if (comp.id) payload.id = comp.id;
  if (comp.name !== undefined) payload.name = comp.name;
  if (comp.tradeName !== undefined) payload.trade_name = comp.tradeName;
  if (comp.cnpj !== undefined) payload.cnpj = comp.cnpj;
  if (comp.cnae !== undefined) payload.cnae = comp.cnae;
  if (comp.cnaeDescription !== undefined) payload.cnae_description = comp.cnaeDescription;
  if (comp.riskGrade !== undefined) payload.risk_grade = comp.riskGrade;
  if (comp.address !== undefined) payload.address = comp.address;
  if (comp.phone !== undefined) payload.phone = comp.phone;
  if (comp.email !== undefined) payload.email = comp.email;
  if (comp.legalRepresentative !== undefined) payload.legal_representative = comp.legalRepresentative;
  if (comp.representativeRole !== undefined) payload.representative_role = comp.representativeRole;
  if (comp.logoUrl !== undefined) payload.logo_url = comp.logoUrl;
  if (comp.employeeCount !== undefined) payload.employee_count = comp.employeeCount;
  return payload;
}

export function mapEstablishmentFromDb(row: any): Establishment {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    code: row.code,
    type: row.type,
    address: row.address || {},
    managerName: row.manager_name,
    employeeCount: row.employee_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEstablishmentToDb(est: Partial<Establishment>): any {
  const payload: any = {};
  if (est.id) payload.id = est.id;
  if (est.companyId !== undefined) payload.company_id = est.companyId;
  if (est.name !== undefined) payload.name = est.name;
  if (est.code !== undefined) payload.code = est.code;
  if (est.type !== undefined) payload.type = est.type;
  if (est.address !== undefined) payload.address = est.address;
  if (est.managerName !== undefined) payload.manager_name = est.managerName;
  if (est.employeeCount !== undefined) payload.employee_count = est.employeeCount;
  return payload;
}

export function mapSectorFromDb(row: any): Sector {
  return {
    id: row.id,
    establishmentId: row.establishment_id,
    name: row.name,
    description: row.description || '',
    physicalCharacteristics: row.physical_characteristics || {
      floorType: 'Concreto',
      wallType: 'Alvenaria',
      roofType: 'Metálico',
      ventilationType: 'NATURAL',
      lightingType: 'NATURAL',
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSectorToDb(sec: Partial<Sector>): any {
  const payload: any = {};
  if (sec.id) payload.id = sec.id;
  if (sec.establishmentId !== undefined) payload.establishment_id = sec.establishmentId;
  if (sec.name !== undefined) payload.name = sec.name;
  if (sec.description !== undefined) payload.description = sec.description;
  if (sec.physicalCharacteristics !== undefined) payload.physical_characteristics = sec.physicalCharacteristics;
  return payload;
}

export function mapPositionFromDb(row: any): Position {
  return {
    id: row.id,
    establishmentId: row.establishment_id,
    sectorId: row.sector_id,
    title: row.title,
    cbo: row.cbo,
    description: row.description || '',
    routineActivities: row.routine_activities,
    nonRoutineActivities: row.non_routine_activities,
    workerCount: row.worker_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPositionToDb(pos: Partial<Position>): any {
  const payload: any = {};
  if (pos.id) payload.id = pos.id;
  if (pos.establishmentId !== undefined) payload.establishment_id = pos.establishmentId;
  if (pos.sectorId !== undefined) payload.sector_id = pos.sectorId;
  if (pos.title !== undefined) payload.title = pos.title;
  if (pos.cbo !== undefined) payload.cbo = pos.cbo;
  if (pos.description !== undefined) payload.description = pos.description;
  if (pos.routineActivities !== undefined) payload.routine_activities = pos.routineActivities;
  if (pos.nonRoutineActivities !== undefined) payload.non_routine_activities = pos.nonRoutineActivities;
  if (pos.workerCount !== undefined) payload.worker_count = pos.workerCount;
  return payload;
}

export function mapGheFromDb(row: any): GHE {
  return {
    id: row.id,
    establishmentId: row.establishment_id,
    sectorId: row.sector_id,
    code: row.code,
    name: row.name,
    description: row.description || '',
    positionIds: row.position_ids || [],
    workerCount: row.worker_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapGheToDb(ghe: Partial<GHE>): any {
  const payload: any = {};
  if (ghe.id) payload.id = ghe.id;
  if (ghe.establishmentId !== undefined) payload.establishment_id = ghe.establishmentId;
  if (ghe.sectorId !== undefined) payload.sector_id = ghe.sectorId;
  if (ghe.code !== undefined) payload.code = ghe.code;
  if (ghe.name !== undefined) payload.name = ghe.name;
  if (ghe.description !== undefined) payload.description = ghe.description;
  if (ghe.positionIds !== undefined) payload.position_ids = ghe.positionIds;
  if (ghe.workerCount !== undefined) payload.worker_count = ghe.workerCount;
  return payload;
}

export function mapProfessionalFromDb(row: any): Professional {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    registrationCouncil: row.registration_council,
    registrationNumber: row.registration_number,
    registrationState: row.registration_state,
    artRrt: row.art_rrt,
    email: row.email,
    phone: row.phone,
    signatureUrl: row.signature_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProfessionalToDb(prof: Partial<Professional>): any {
  const payload: any = {};
  if (prof.id) payload.id = prof.id;
  if (prof.name !== undefined) payload.name = prof.name;
  if (prof.role !== undefined) payload.role = prof.role;
  if (prof.registrationCouncil !== undefined) payload.registration_council = prof.registrationCouncil;
  if (prof.registrationNumber !== undefined) payload.registration_number = prof.registrationNumber;
  if (prof.registrationState !== undefined) payload.registration_state = prof.registrationState;
  if (prof.artRrt !== undefined) payload.art_rrt = prof.artRrt;
  if (prof.email !== undefined) payload.email = prof.email;
  if (prof.phone !== undefined) payload.phone = prof.phone;
  if (prof.signatureUrl !== undefined) payload.signature_url = prof.signatureUrl;
  return payload;
}

export function mapHazardFromDb(row: any): HazardItem {
  return {
    id: row.id,
    category: row.category,
    code: row.code,
    name: row.name,
    description: row.description || '',
    possibleDamages: row.possible_damages,
    suggestedEpc: row.suggested_epc,
    suggestedEpi: row.suggested_epi,
    suggestedAdminMeasures: row.suggested_admin_measures,
    isCustom: row.is_custom,
  };
}

export function mapPgrDocumentFromDb(row: any): PGRDocument {
  return {
    id: row.id,
    companyId: row.company_id,
    establishmentId: row.establishment_id,
    code: row.code,
    title: row.title,
    version: row.version,
    year: row.year,
    validityStart: row.validity_start,
    validityEnd: row.validity_end,
    status: row.status,
    elaborationDate: row.elaboration_date,
    approvalDate: row.approval_date,
    revisionReason: row.revision_reason,
    technicalResponsibleId: row.technical_responsible_id,
    medicalResponsibleId: row.medical_responsible_id,
    generalObjectives: row.general_objectives,
    methodologyDescription: row.methodology_description,
    scopeDescription: row.scope_description,
    responsibilitiesMatrix: row.responsibilities_matrix,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPgrDocumentToDb(doc: Partial<PGRDocument>): any {
  const payload: any = {};
  if (doc.id) payload.id = doc.id;
  if (doc.companyId !== undefined) payload.company_id = doc.companyId;
  if (doc.establishmentId !== undefined) payload.establishment_id = doc.establishmentId;
  if (doc.code !== undefined) payload.code = doc.code;
  if (doc.title !== undefined) payload.title = doc.title;
  if (doc.version !== undefined) payload.version = doc.version;
  if (doc.year !== undefined) payload.year = doc.year;
  if (doc.validityStart !== undefined) payload.validity_start = doc.validityStart;
  if (doc.validityEnd !== undefined) payload.validity_end = doc.validityEnd;
  if (doc.status !== undefined) payload.status = doc.status;
  if (doc.elaborationDate !== undefined) payload.elaboration_date = doc.elaborationDate;
  if (doc.approvalDate !== undefined) payload.approval_date = doc.approvalDate;
  if (doc.revisionReason !== undefined) payload.revision_reason = doc.revisionReason;
  if (doc.technicalResponsibleId !== undefined) payload.technical_responsible_id = doc.technicalResponsibleId;
  if (doc.medicalResponsibleId !== undefined) payload.medical_responsible_id = doc.medicalResponsibleId;
  if (doc.generalObjectives !== undefined) payload.general_objectives = doc.generalObjectives;
  if (doc.methodologyDescription !== undefined) payload.methodology_description = doc.methodologyDescription;
  if (doc.scopeDescription !== undefined) payload.scope_description = doc.scopeDescription;
  if (doc.responsibilitiesMatrix !== undefined) payload.responsibilities_matrix = doc.responsibilitiesMatrix;
  return payload;
}

export function mapRiskInventoryFromDb(row: any): RiskInventoryItem {
  return {
    id: row.id,
    pgrId: row.pgr_id,
    companyId: row.company_id,
    establishmentId: row.establishment_id,
    sectorId: row.sector_id,
    gheId: row.ghe_id,
    positionId: row.position_id,
    hazardId: row.hazard_id,
    hazardCategory: row.hazard_category,
    hazardName: row.hazard_name,
    hazardCode: row.hazard_code,
    sourceDescription: row.source_description,
    healthDamage: row.health_damage,
    exposedCount: row.exposed_count,
    exposureType: row.exposure_type,
    probability: row.probability,
    severity: row.severity,
    riskScore: row.risk_score,
    riskLevel: row.risk_level,
    epcExisting: row.epc_existing || [],
    adminMeasuresExisting: row.admin_measures_existing || [],
    epiExisting: row.epi_existing || [],
    actionRequired: row.action_required,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapRiskInventoryToDb(item: Partial<RiskInventoryItem>): any {
  const payload: any = {};
  if (item.id) payload.id = item.id;
  if (item.pgrId !== undefined) payload.pgr_id = item.pgrId;
  if (item.companyId !== undefined) payload.company_id = item.companyId;
  if (item.establishmentId !== undefined) payload.establishment_id = item.establishmentId;
  if (item.sectorId !== undefined) payload.sector_id = item.sectorId;
  if (item.gheId !== undefined) payload.ghe_id = item.gheId;
  if (item.positionId !== undefined) payload.position_id = item.positionId;
  if (item.hazardCategory !== undefined) payload.hazard_category = item.hazardCategory;
  if (item.hazardName !== undefined) payload.hazard_name = item.hazardName;
  if (item.hazardCode !== undefined) payload.hazard_code = item.hazardCode;
  if (item.sourceDescription !== undefined) payload.source_description = item.sourceDescription;
  if (item.healthDamage !== undefined) payload.health_damage = item.healthDamage;
  if (item.exposedCount !== undefined) payload.exposed_count = item.exposedCount;
  if (item.exposureType !== undefined) payload.exposure_type = item.exposureType;
  if (item.probability !== undefined) payload.probability = item.probability;
  if (item.severity !== undefined) payload.severity = item.severity;
  if (item.riskScore !== undefined) payload.risk_score = item.riskScore;
  if (item.riskLevel !== undefined) payload.risk_level = item.riskLevel;
  if (item.epcExisting !== undefined) payload.epc_existing = item.epcExisting;
  if (item.adminMeasuresExisting !== undefined) payload.admin_measures_existing = item.adminMeasuresExisting;
  if (item.epiExisting !== undefined) payload.epi_existing = item.epiExisting;
  if (item.actionRequired !== undefined) payload.action_required = item.actionRequired;
  return payload;
}

export function mapActionPlanFromDb(row: any): ActionPlanItem {
  return {
    id: row.id,
    pgrId: row.pgr_id,
    companyId: row.company_id,
    establishmentId: row.establishment_id,
    riskInventoryId: row.risk_inventory_id,
    what: row.what,
    why: row.why,
    whereLoc: row.where_loc,
    who: row.who,
    whenDate: row.when_date,
    how: row.how,
    howMuch: row.how_much ? Number(row.how_much) : undefined,
    status: row.status,
    completionDate: row.completion_date,
    evidenceNotes: row.evidence_notes,
    efficacyVerified: row.efficacy_verified,
    efficacyNotes: row.efficacy_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapActionPlanToDb(act: Partial<ActionPlanItem>): any {
  const payload: any = {};
  if (act.id) payload.id = act.id;
  if (act.pgrId !== undefined) payload.pgr_id = act.pgrId;
  if (act.companyId !== undefined) payload.company_id = act.companyId;
  if (act.establishmentId !== undefined) payload.establishment_id = act.establishmentId;
  if (act.riskInventoryId !== undefined) payload.risk_inventory_id = act.riskInventoryId;
  if (act.what !== undefined) payload.what = act.what;
  if (act.why !== undefined) payload.why = act.why;
  if (act.whereLoc !== undefined) payload.where_loc = act.whereLoc;
  if (act.who !== undefined) payload.who = act.who;
  if (act.whenDate !== undefined) payload.when_date = act.whenDate;
  if (act.how !== undefined) payload.how = act.how;
  if (act.howMuch !== undefined) payload.how_much = act.howMuch;
  if (act.status !== undefined) payload.status = act.status;
  if (act.completionDate !== undefined) payload.completion_date = act.completionDate;
  if (act.evidenceNotes !== undefined) payload.evidence_notes = act.evidenceNotes;
  if (act.efficacyVerified !== undefined) payload.efficacy_verified = act.efficacyVerified;
  if (act.efficacyNotes !== undefined) payload.efficacy_notes = act.efficacyNotes;
  return payload;
}

// ==========================================
// 2. FUNÇÕES DE FETCH & SYNC COM SUPABASE
// ==========================================

export async function fetchAllFromSupabase() {
  if (!isSupabaseConfigured) return null;

  try {
    const [
      companiesRes,
      establishmentsRes,
      sectorsRes,
      positionsRes,
      ghesRes,
      professionalsRes,
      hazardsRes,
      pgrDocsRes,
      riskInvRes,
      actionsRes,
    ] = await Promise.all([
      supabase.from('companies').select('*').order('name'),
      supabase.from('establishments').select('*').order('name'),
      supabase.from('sectors').select('*').order('name'),
      supabase.from('positions').select('*').order('title'),
      supabase.from('ghes').select('*').order('code'),
      supabase.from('professionals').select('*').order('name'),
      supabase.from('hazards_catalog').select('*').order('code'),
      supabase.from('pgr_documents').select('*').order('created_at', { ascending: false }),
      supabase.from('risk_inventory').select('*').order('hazard_category'),
      supabase.from('action_plans').select('*').order('when_date'),
    ]);

    return {
      companies: (companiesRes.data || []).map(mapCompanyFromDb),
      establishments: (establishmentsRes.data || []).map(mapEstablishmentFromDb),
      sectors: (sectorsRes.data || []).map(mapSectorFromDb),
      positions: (positionsRes.data || []).map(mapPositionFromDb),
      ghes: (ghesRes.data || []).map(mapGheFromDb),
      professionals: (professionalsRes.data || []).map(mapProfessionalFromDb),
      hazards: (hazardsRes.data || []).map(mapHazardFromDb),
      pgrDocuments: (pgrDocsRes.data || []).map(mapPgrDocumentFromDb),
      riskInventory: (riskInvRes.data || []).map(mapRiskInventoryFromDb),
      actionPlans: (actionsRes.data || []).map(mapActionPlanFromDb),
    };
  } catch (error) {
    console.error('Erro ao buscar dados do Supabase:', error);
    return null;
  }
}
