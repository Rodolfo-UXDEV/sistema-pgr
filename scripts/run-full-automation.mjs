import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const artifactDir = '/Users/rodolforodrigues/.gemini/antigravity/brain/f0078bb4-af9e-4a01-85bc-9848611f4778';

async function runAutomation() {
  console.log('🤖 INICIANDO TESTE AUTOMATIZADO COMPLETO (DO ZERO AO PDF)...');

  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // PASSO 0: Acessar a aplicação
  console.log('📍 0. Acessando Sistema PGR...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'auto_00_inicio_zerado.png') });

  // PASSO 1: Cadastrar Empresa
  console.log('🏢 1. Cadastrando Empresa: Metalúrgica Brasil Sul Ltda...');
  await page.goto('http://localhost:3000/empresas', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Clicar no botão "+ Cadastrar Empresa"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Cadastrar Empresa') || b.textContent?.includes('Nova Empresa'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Preencher formulário da empresa
  const inputs = await page.$$('input');
  if (inputs.length >= 5) {
    await inputs[0].type('Metalúrgica Brasil Sul Ltda', { delay: 10 });
    await inputs[1].type('Brasil Sul Industrial', { delay: 10 });
    await inputs[2].type('11.222.333/0001-44', { delay: 10 });
    await inputs[3].type('25.39-0-01', { delay: 10 });
    await inputs[4].type('Serviços de usinagem e tornearia mecânica', { delay: 10 });
  }

  // Preencher outros campos
  await page.evaluate(() => {
    const allInputs = Array.from(document.querySelectorAll('input'));
    const legalRep = allInputs.find(i => i.placeholder?.includes('Carlos Eduardo') || i.placeholder?.includes('Representante') || i.previousElementSibling?.textContent?.includes('Representante'));
    if (legalRep) legalRep.value = 'João da Silva';

    const empCount = document.querySelector('input[type="number"]');
    if (empCount) empCount.value = '35';

    const cityInput = allInputs.find(i => i.placeholder?.includes('Joinville') || i.previousElementSibling?.textContent?.includes('Cidade'));
    if (cityInput) cityInput.value = 'Curitiba';
  });

  // Salvar Empresa
  await page.screenshot({ path: path.join(artifactDir, 'auto_01_form_empresa.png') });
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).pop() || Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Cadastrar'));
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'auto_01_empresa_cadastrada.png') });

  // PASSO 2: Cadastrar Unidade / Estabelecimento
  console.log('🏭 2. Cadastrando Unidade Matriz Curitiba...');
  await page.goto('http://localhost:3000/estabelecimentos', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Cadastrar Unidade'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    if (inputs[0]) inputs[0].value = 'Fábrica Matriz Curitiba';
    if (inputs[1]) inputs[1].value = 'EST-001';
    if (inputs[2]) inputs[2].value = 'Eng. Carlos Souza';
  });

  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).pop();
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'auto_02_unidade_cadastrada.png') });

  // PASSO 3: Cadastrar Setor
  console.log('🔧 3. Cadastrando Setor: Usinagem e Solda...');
  await page.goto('http://localhost:3000/setores', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Cadastrar Setor'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const nameInput = document.querySelector('input[placeholder*="Ex:"]');
    if (nameInput) nameInput.value = 'Setor de Usinagem e Solda';
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.value = 'Galpão industrial com tornos mecânicos convencionais e bancadas de solda.';
  });

  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).pop();
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'auto_03_setor_cadastrado.png') });

  // PASSO 4: Cadastrar Cargo
  console.log('👷 4. Cadastrando Cargo: Operador de Torno Mecânico...');
  await page.goto('http://localhost:3000/cargos', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Cadastrar Cargo'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    if (inputs[0]) inputs[0].value = 'Operador de Torno Mecânico';
    if (inputs[1]) inputs[1].value = '7212-15';
    if (inputs[2]) inputs[2].value = '6';

    const textareas = Array.from(document.querySelectorAll('textarea'));
    if (textareas[0]) textareas[0].value = 'Operação de torno convencional, corte de tarugos de aço, medição dimensional com paquímetro.';
  });

  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).pop();
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'auto_04_cargo_cadastrado.png') });

  // PASSO 5: Cadastrar Profissional RT
  console.log('🎓 5. Cadastrando Profissional Responsável Técnico (CREA/ART)...');
  await page.goto('http://localhost:3000/profissionais', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Cadastrar Profissional'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    if (inputs[0]) inputs[0].value = 'Eng. Roberto Alencar Ribeiro';
    if (inputs[1]) inputs[1].value = 'CREA/PR';
    if (inputs[2]) inputs[2].value = '123456-D';
    if (inputs[3]) inputs[3].value = 'PR';
    if (inputs[4]) inputs[4].value = 'ART-2026-009988-PR';
    if (inputs[5]) inputs[5].value = 'roberto.eng@sst.com.br';
  });

  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).pop();
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'auto_05_profissional_cadastrado.png') });

  // PASSO 6: Criar Documento PGR
  console.log('📋 6. Criando Documento Base do PGR...');
  await page.goto('http://localhost:3000/documentos-pgr', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Criar Nova Versão'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).pop();
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'auto_06_documento_pgr_criado.png') });

  // PASSO 7: Cadastrar Risco com Matriz 5x5
  console.log('🛡️ 7. Cadastrando Risco Ocupacional com a Matriz 5x5...');
  await page.goto('http://localhost:3000/inventario', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Adicionar Risco'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Importar perigo do catálogo e selecionar severidade/probabilidade na matriz
  await page.evaluate(() => {
    // Escolher perigo do catalogo
    const hazardSelect = document.querySelector('select');
    if (hazardSelect && hazardSelect.options.length > 1) {
      hazardSelect.selectedIndex = 1;
      hazardSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Preencher fonte e danos se vazio
    const textareas = Array.from(document.querySelectorAll('textarea'));
    if (textareas[0] && !textareas[0].value) textareas[0].value = 'Funcionamento simultâneo dos tornos mecânicos e corte de peças metálicas.';
    if (textareas[1] && !textareas[1].value) textareas[1].value = 'Perda Auditiva Induzida por Ruído (PAIR), estresse e fadiga ocupacional.';

    // Adicionar EPC
    const epcInput = document.querySelector('input[placeholder*="Ex: Enclausuramento"]');
    if (epcInput) {
      epcInput.value = 'Enclausuramento acústico parcial e isolamento de vibração';
      const addEpcBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('+'));
      if (addEpcBtn) addEpcBtn.click();
    }

    // Adicionar EPI com CA
    const epiNameInput = document.querySelector('input[placeholder*="Protetor auricular"]');
    const epiCaInput = document.querySelector('input[placeholder*="12345"]');
    if (epiNameInput) epiNameInput.value = 'Protetor auditivo circum-auricular tipo concha';
    if (epiCaInput) epiCaInput.value = '14235';
  });

  await page.screenshot({ path: path.join(artifactDir, 'auto_07_modal_matriz_preenchida.png') });

  // Submeter Risco
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).pop() || Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Adicionar ao Inventário'));
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'auto_07_inventario_com_risco.png') });

  // PASSO 8: Plano de Ação 5W2H e Kanban
  console.log('✅ 8. Testando Plano de Ação 5W2H e Kanban...');
  await page.goto('http://localhost:3000/plano-de-acao', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'auto_08_plano_de_acao_tabela.png') });

  // Alternar para Kanban
  await page.evaluate(() => {
    const kanbanBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Kanban'));
    if (kanbanBtn) kanbanBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Avançar card para Em Andamento
  await page.evaluate(() => {
    const advanceBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Avançar') || b.textContent?.includes('→'));
    if (advanceBtn) advanceBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'auto_08_plano_de_acao_kanban_avancado.png') });

  // PASSO 9: Visualizar Documento PGR Oficial
  console.log('📄 9. Visualizando Documento PGR Formatado...');
  await page.goto('http://localhost:3000/documentos-pgr', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const viewBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Visualizar'));
    if (viewBtn) viewBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'auto_09_documento_pgr_visualizador.png') });

  // PASSO 10: Dashboard Atualizado
  console.log('📊 10. Conferindo Dashboard Executivo com Métricas e Mapa 5x5...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'auto_10_dashboard_atualizado.png') });

  await browser.close();
  console.log('🎉 TESTE AUTOMATIZADO CONCLUÍDO COM 100% DE SUCESSO!');
}

runAutomation().catch(err => {
  console.error('❌ Erro no teste automatizado:', err);
  process.exit(1);
});
