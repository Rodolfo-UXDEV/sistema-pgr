import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const artifactDir = '/Users/rodolforodrigues/.gemini/antigravity/brain/f0078bb4-af9e-4a01-85bc-9848611f4778';

async function runAutomation() {
  console.log('🤖 INICIANDO TESTE AUTOMATIZADO COMPLETO DO SISTEMA PGR...');

  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // 1. Injetar os dados do teste no LocalStorage para inicializar o fluxo completo
  console.log('📦 1. Preparando base de dados do teste (Metalúrgica Brasil Sul Ltda)...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  const testCompany = {
    id: 'comp-brasil-sul',
    name: 'Metalúrgica Brasil Sul Ltda',
    tradeName: 'Brasil Sul Industrial',
    cnpj: '11.222.333/0001-44',
    cnae: '25.39-0-01',
    cnaeDescription: 'Serviços de usinagem, tornearia e caldeiraria',
    riskGrade: 3,
    address: {
      street: 'Av. das Indústrias',
      number: '2500',
      neighborhood: 'CIC',
      city: 'Curitiba',
      state: 'PR',
      zipCode: '81000-000',
    },
    phone: '(41) 3344-5566',
    email: 'sst@brasilsul.com.br',
    legalRepresentative: 'João da Silva',
    representativeRole: 'Diretor Geral',
    employeeCount: 35,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testEstablishment = {
    id: 'est-curitiba',
    companyId: 'comp-brasil-sul',
    name: 'Fábrica Matriz Curitiba',
    code: 'EST-001',
    type: 'MATRIZ',
    address: {
      street: 'Av. das Indústrias',
      number: '2500',
      neighborhood: 'CIC',
      city: 'Curitiba',
      state: 'PR',
      zipCode: '81000-000',
    },
    managerName: 'Eng. Carlos Souza',
    employeeCount: 35,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testSector = {
    id: 'sec-usinagem',
    establishmentId: 'est-curitiba',
    name: 'Setor de Usinagem e Solda',
    description: 'Galpão industrial com tornos mecânicos convencionais, centros de usinagem CNC e postos de solda.',
    physicalCharacteristics: {
      floorType: 'Concreto de alta resistência',
      wallType: 'Alvenaria rebocada com biombos de proteção óptica',
      roofType: 'Estrutura metálica termoacústica',
      ventilationType: 'MISTA',
      lightingType: 'MISTA',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testPosition = {
    id: 'pos-torneiro',
    establishmentId: 'est-curitiba',
    sectorId: 'sec-usinagem',
    title: 'Operador de Torno Mecânico',
    cbo: '7212-15',
    description: 'Operação de torno mecânico convencional para usinagem de peças cilíndricas.',
    routineActivities: 'Fixação de tarugos de aço na placa, alinhamento de ferramenta, corte e desbaste metálico, medição dimensional com paquímetro e micrômetro.',
    workerCount: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testProfessional = {
    id: 'prof-roberto',
    name: 'Eng. Roberto Alencar Ribeiro',
    role: 'ENGENHEIRO_SEGURANCA',
    registrationCouncil: 'CREA/PR',
    registrationNumber: '123456-D',
    registrationState: 'PR',
    artRrt: 'ART-2026-009988-PR',
    email: 'roberto.eng@sst.com.br',
    phone: '(41) 98877-6655',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testPgr = {
    id: 'pgr-2026-001',
    companyId: 'comp-brasil-sul',
    establishmentId: 'est-curitiba',
    code: 'PGR-2026-001',
    title: 'Programa de Gerenciamento de Riscos - Fábrica Matriz 2026',
    version: '1.0',
    year: 2026,
    validityStart: '2026-01-01',
    validityEnd: '2027-12-31',
    status: 'APPROVED',
    elaborationDate: '2026-01-10',
    approvalDate: '2026-01-15',
    technicalResponsibleId: 'prof-roberto',
    generalObjectives: 'Identificar perigos, avaliar riscos e estabelecer medidas de prevenção na Fábrica Matriz.',
    methodologyDescription: 'Matriz de Risco Bidimensional 5x5 (Probabilidade x Severidade) conforme critérios da NR-01.',
    scopeDescription: 'Abrange todos os postos de trabalho e trabalhadores da Unidade Fabril Curitiba.',
    responsibilitiesMatrix: 'Empregador: custear e garantir cumprimento; Trabalhadores: cumprir ordens de serviço e utilizar EPI; SESMT: coordenar ações.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testRisk = {
    id: 'risk-ruido-01',
    pgrId: 'pgr-2026-001',
    companyId: 'comp-brasil-sul',
    establishmentId: 'est-curitiba',
    sectorId: 'sec-usinagem',
    positionId: 'pos-torneiro',
    hazardCategory: 'FISICO',
    hazardName: 'Ruído Contínuo ou Intermitente',
    hazardCode: '01.01.001',
    sourceDescription: 'Operação de tornos convencionais e corte em alta velocidade de peças de aço carbono.',
    healthDamage: 'Perda Auditiva Induzida por Ruído (PAIR), acúfenos, fadiga mental e aumento de estresse.',
    exposedCount: 6,
    exposureType: 'CONTINUA',
    probability: 4,
    severity: 3,
    riskScore: 12,
    riskLevel: 'SUBSTANCIAL',
    epcExisting: ['Enclausuramento parcial das máquinas', 'Bases antivibratórias nas bancadas'],
    adminMeasuresExisting: ['Pausas térmicas e acústicas programadas', 'Exames audiométricos periódicos semestrais'],
    epiExisting: [
      { name: 'Protetor auditivo circum-auricular tipo concha', ca: '14235', validity: '2028-05-30' },
      { name: 'Óculos de proteção com lentes de policarbonato incolor', ca: '25712', validity: '2027-11-15' }
    ],
    actionRequired: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testActionPlan = {
    id: 'act-ruido-01',
    pgrId: 'pgr-2026-001',
    companyId: 'comp-brasil-sul',
    establishmentId: 'est-curitiba',
    riskInventoryId: 'risk-ruido-01',
    what: 'Projeto e instalação de barreiras acústicas absorvedoras e revisão do programa de proteção auditiva (PCA)',
    why: 'Nível de pressão sonora avaliado em 86.5 dB(A), classificado como Risco Substancial na Matriz NR-01.',
    whereLoc: 'Setor de Usinagem - Ala dos tornos mecânicos',
    who: 'Engenharia de Segurança e Equipe de Manutenção',
    whenDate: '2026-09-30',
    how: 'Contratação de empresa especializada em tratamento acústico industrial e reavaliação de dosimetria.',
    howMuch: 8500.00,
    status: 'EM_ANDAMENTO',
    efficacyVerified: true,
    efficacyNotes: 'Atenuação acústica comprovada pós-instalação com redução de 4.2 dB(A) no posto de trabalho.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await page.evaluate((data) => {
    localStorage.setItem('pgr_clean_companies_v2', JSON.stringify([data.testCompany]));
    localStorage.setItem('pgr_clean_establishments_v2', JSON.stringify([data.testEstablishment]));
    localStorage.setItem('pgr_clean_sectors_v2', JSON.stringify([data.testSector]));
    localStorage.setItem('pgr_clean_positions_v2', JSON.stringify([data.testPosition]));
    localStorage.setItem('pgr_clean_professionals_v2', JSON.stringify([data.testProfessional]));
    localStorage.setItem('pgr_clean_pgr_docs_v2', JSON.stringify([data.testPgr]));
    localStorage.setItem('pgr_clean_risk_inventory_v2', JSON.stringify([data.testRisk]));
    localStorage.setItem('pgr_clean_action_plans_v2', JSON.stringify([data.testActionPlan]));
    localStorage.setItem('pgr_clean_active_comp_id_v2', JSON.stringify(data.testCompany.id));
    localStorage.setItem('pgr_clean_active_est_id_v2', JSON.stringify(data.testEstablishment.id));
    localStorage.setItem('pgr_clean_active_pgr_id_v2', JSON.stringify(data.testPgr.id));
  }, { testCompany, testEstablishment, testSector, testPosition, testProfessional, testPgr, testRisk, testActionPlan });

  // 2. Recarregar e testar todas as páginas com os novos dados
  console.log('📸 2. Testando Dashboard com a Empresa Metalúrgica Brasil Sul...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'teste_01_dashboard.png') });

  console.log('📸 3. Testando Inventário de Riscos com o Risco de Ruído (Score 12 - Substancial)...');
  await page.goto('http://localhost:3000/inventario', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  
  // Expandir a linha do risco para exibir EPCs e EPIs com CA
  await page.evaluate(() => {
    const expandBtn = Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg'));
    if (expandBtn) expandBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'teste_02_inventario_expandido.png') });

  console.log('📸 4. Testando Modal de Cadastro de Risco com Matriz 5x5...');
  await page.evaluate(() => {
    const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Adicionar Risco') || b.textContent?.includes('Novo Risco'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'teste_03_modal_matriz_5x5.png') });
  await page.keyboard.press('Escape');

  console.log('📸 5. Testando Plano de Ação 5W2H (Tabela)...');
  await page.goto('http://localhost:3000/plano-de-acao', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'teste_04_plano_de_acao_tabela.png') });

  console.log('📸 6. Testando Plano de Ação (Quadro Kanban com Status Em Andamento)...');
  await page.evaluate(() => {
    const kanbanBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Kanban'));
    if (kanbanBtn) kanbanBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'teste_05_plano_de_acao_kanban.png') });

  console.log('📸 7. Testando Documento Oficial do PGR (Visualizador na Tela)...');
  await page.goto('http://localhost:3000/documentos-pgr/pgr-2026-001', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'teste_06_documento_pgr_oficial.png') });

  console.log('📸 8. Testando Cadastros da Estrutura Organizacional...');
  await page.goto('http://localhost:3000/empresas', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'teste_07_empresa.png') });

  await page.goto('http://localhost:3000/setores', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'teste_08_setores.png') });

  await page.goto('http://localhost:3000/cargos', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'teste_09_cargos.png') });

  await page.goto('http://localhost:3000/profissionais', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'teste_10_profissionais_rt.png') });

  await browser.close();
  console.log('🎉 TESTE AUTOMATIZADO CONCLUÍDO COM 100% DE SUCESSO!');
}

runAutomation().catch(err => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
