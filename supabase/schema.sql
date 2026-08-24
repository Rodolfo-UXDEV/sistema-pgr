-- ==============================================================================
-- SISTEMA PGR (PROGRAMA DE GERENCIAMENTO DE RISCOS - NR-01)
-- SCHEMA POSTGRESQL / SUPABASE COM RLS (ROW LEVEL SECURITY)
-- ==============================================================================

-- Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE EMPRESAS (COMPANIES)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    cnae VARCHAR(20) NOT NULL,
    cnae_description TEXT NOT NULL,
    risk_grade INT NOT NULL CHECK (risk_grade BETWEEN 1 AND 4),
    address JSONB NOT NULL DEFAULT '{}'::jsonb,
    phone VARCHAR(50),
    email VARCHAR(255),
    legal_representative VARCHAR(255) NOT NULL,
    representative_role VARCHAR(100) NOT NULL,
    logo_url TEXT,
    employee_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA DE ESTABELECIMENTOS / UNIDADES (ESTABLISHMENTS)
CREATE TABLE IF NOT EXISTS public.establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'MATRIZ' CHECK (type IN ('MATRIZ', 'FILIAL', 'OBRA', 'POSTO_AVANCADO')),
    address JSONB NOT NULL DEFAULT '{}'::jsonb,
    manager_name VARCHAR(255),
    employee_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA DE SETORES / AMBIENTES DE TRABALHO (SECTORS)
CREATE TABLE IF NOT EXISTS public.sectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    physical_characteristics JSONB NOT NULL DEFAULT '{"floorType": "Concreto", "wallType": "Alvenaria", "roofType": "Telhas", "ventilationType": "NATURAL", "lightingType": "MISTA"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA DE CARGOS / FUNÇÕES (POSITIONS)
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    cbo VARCHAR(20) NOT NULL,
    description TEXT,
    routine_activities TEXT NOT NULL,
    non_routine_activities TEXT,
    worker_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABELA DE GRUPOS HOMOGÊNEOS DE EXPOSIÇÃO (GHES)
CREATE TABLE IF NOT EXISTS public.ghes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position_ids TEXT[] NOT NULL DEFAULT '{}',
    worker_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABELA DE PROFISSIONAIS RESPONSÁVEIS (PROFESSIONALS)
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL CHECK (role IN ('ENGENHEIRO_SEGURANCA', 'TECNICO_SEGURANCA', 'MEDICO_TRABALHO', 'HIGIENISTA_OCUPACIONAL')),
    registration_council VARCHAR(50) NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    registration_state VARCHAR(2) NOT NULL,
    art_rrt VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    signature_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABELA DE CATÁLOGO DE PERIGOS (HAZARDS_CATALOG)
CREATE TABLE IF NOT EXISTS public.hazards_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL CHECK (category IN ('FISICO', 'QUIMICO', 'BIOLOGICO', 'ERGONOMICO', 'ACIDENTE')),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    possible_damages TEXT NOT NULL,
    suggested_epc TEXT,
    suggested_epi TEXT,
    suggested_admin_measures TEXT,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TABELA DE DOCUMENTOS PGR (PGR_DOCUMENTS)
CREATE TABLE IF NOT EXISTS public.pgr_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    year INT NOT NULL,
    validity_start DATE NOT NULL,
    validity_end DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'ARCHIVED')),
    elaboration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    approval_date DATE,
    revision_reason TEXT,
    technical_responsible_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    medical_responsible_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    general_objectives TEXT NOT NULL,
    methodology_description TEXT NOT NULL,
    scope_description TEXT NOT NULL,
    responsibilities_matrix TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TABELA DE INVENTÁRIO DE RISCOS OCUPACIONAIS (RISK_INVENTORY)
CREATE TABLE IF NOT EXISTS public.risk_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pgr_id UUID NOT NULL REFERENCES public.pgr_documents(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
    ghe_id UUID REFERENCES public.ghes(id) ON DELETE SET NULL,
    position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
    hazard_category VARCHAR(50) NOT NULL CHECK (hazard_category IN ('FISICO', 'QUIMICO', 'BIOLOGICO', 'ERGONOMICO', 'ACIDENTE')),
    hazard_name VARCHAR(255) NOT NULL,
    hazard_code VARCHAR(50),
    source_description TEXT NOT NULL,
    health_damage TEXT NOT NULL,
    exposed_count INT NOT NULL DEFAULT 1,
    exposure_type VARCHAR(50) NOT NULL DEFAULT 'CONTINUA' CHECK (exposure_type IN ('CONTINUA', 'INTERMITENTE', 'EVENTUAL')),
    probability INT NOT NULL CHECK (probability BETWEEN 1 AND 5),
    severity INT NOT NULL CHECK (severity BETWEEN 1 AND 5),
    risk_score INT NOT NULL CHECK (risk_score BETWEEN 1 AND 25),
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('TRIVIAL', 'TOLERAVEL', 'MODERADO', 'SUBSTANCIAL', 'INTOLERAVEL')),
    epc_existing JSONB NOT NULL DEFAULT '[]'::jsonb,
    admin_measures_existing JSONB NOT NULL DEFAULT '[]'::jsonb,
    epi_existing JSONB NOT NULL DEFAULT '[]'::jsonb,
    action_required BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TABELA DE PLANO DE AÇÃO 5W2H (ACTION_PLANS)
CREATE TABLE IF NOT EXISTS public.action_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pgr_id UUID NOT NULL REFERENCES public.pgr_documents(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    risk_inventory_id UUID REFERENCES public.risk_inventory(id) ON DELETE SET NULL,
    what TEXT NOT NULL,
    why TEXT NOT NULL,
    where_loc VARCHAR(255) NOT NULL,
    who VARCHAR(255) NOT NULL,
    when_date DATE NOT NULL,
    how TEXT NOT NULL,
    how_much NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'NAO_INICIADA' CHECK (status IN ('NAO_INICIADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'ATRASADA', 'CANCELADA')),
    completion_date DATE,
    evidence_notes TEXT,
    efficacy_verified BOOLEAN DEFAULT FALSE,
    efficacy_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TABELA DE MEDIÇÕES AMBIENTAIS (ENVIRONMENTAL_MEASUREMENTS)
CREATE TABLE IF NOT EXISTS public.environmental_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_inventory_id UUID NOT NULL REFERENCES public.risk_inventory(id) ON DELETE CASCADE,
    agent_name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    measured_value NUMERIC(10, 4) NOT NULL,
    action_level NUMERIC(10, 4),
    tolerance_limit NUMERIC(10, 4),
    methodology VARCHAR(255) NOT NULL,
    equipment_used VARCHAR(255) NOT NULL,
    calibration_date DATE,
    result_status VARCHAR(50) NOT NULL CHECK (result_status IN ('ABAIXO_NIVEL_ACAO', 'ACIMA_NIVEL_ACAO', 'ACIMA_LIMITE_TOLERANCIA')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- HABILITAÇÃO DO ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ==============================================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pgr_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_measurements ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO PERMISSIVAS PARA USUÁRIOS AUTENTICADOS E ANON (CONFIGURÁVEIS POR TENANT)
CREATE POLICY "Permitir leitura de empresas" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de empresas" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de empresas" ON public.companies FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de empresas" ON public.companies FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de estabelecimentos" ON public.establishments FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de estabelecimentos" ON public.establishments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de estabelecimentos" ON public.establishments FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de estabelecimentos" ON public.establishments FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de setores" ON public.sectors FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de setores" ON public.sectors FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de setores" ON public.sectors FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de setores" ON public.sectors FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de cargos" ON public.positions FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de cargos" ON public.positions FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de cargos" ON public.positions FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de cargos" ON public.positions FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de ghes" ON public.ghes FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de ghes" ON public.ghes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de ghes" ON public.ghes FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de ghes" ON public.ghes FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de profissionais" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de profissionais" ON public.professionals FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de profissionais" ON public.professionals FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de profissionais" ON public.professionals FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de catalogo de perigos" ON public.hazards_catalog FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de catalogo de perigos" ON public.hazards_catalog FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de catalogo de perigos" ON public.hazards_catalog FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de catalogo de perigos" ON public.hazards_catalog FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de pgr_documents" ON public.pgr_documents FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de pgr_documents" ON public.pgr_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de pgr_documents" ON public.pgr_documents FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de pgr_documents" ON public.pgr_documents FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de risk_inventory" ON public.risk_inventory FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de risk_inventory" ON public.risk_inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de risk_inventory" ON public.risk_inventory FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de risk_inventory" ON public.risk_inventory FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de action_plans" ON public.action_plans FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de action_plans" ON public.action_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de action_plans" ON public.action_plans FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de action_plans" ON public.action_plans FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de measurements" ON public.environmental_measurements FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de measurements" ON public.environmental_measurements FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de measurements" ON public.environmental_measurements FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de measurements" ON public.environmental_measurements FOR DELETE USING (true);
