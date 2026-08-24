import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const artifactDir = '/Users/rodolforodrigues/.gemini/antigravity/brain/f0078bb4-af9e-4a01-85bc-9848611f4778';

async function runVisualTest() {
  console.log('🚀 Iniciando Teste Visual Automatizado E2E do Sistema PGR...');

  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // 1. DASHBOARD
  console.log('📸 1. Testando Dashboard Executivo...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, '01_dashboard.png'), fullPage: false });

  // 2. INVENTÁRIO DE RISCOS
  console.log('📸 2. Testando Inventário de Riscos (Tabela)...');
  await page.goto('http://localhost:3000/inventario', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '02_inventario_tabela.png'), fullPage: false });

  // 3. MODAL DE NOVO RISCO COM MATRIZ 5X5
  console.log('📸 3. Testando Modal de Novo Risco com Matriz 5x5...');
  const addRiskBtn = await page.waitForSelector('button:has-text("Adicionar Risco")', { timeout: 5000 }).catch(() => null);
  if (addRiskBtn) {
    await addRiskBtn.click();
  } else {
    // fallback click first button with "Adicionar Risco"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent?.includes('Adicionar Risco') || b.textContent?.includes('Novo Risco'));
      if (btn) btn.click();
    });
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '03_modal_novo_risco_matriz.png'), fullPage: false });

  // Close modal with Escape key
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // 4. PLANO DE AÇÃO (TABELA 5W2H)
  console.log('📸 4. Testando Plano de Ação (Tabela 5W2H)...');
  await page.goto('http://localhost:3000/plano-de-acao', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '04_plano_de_acao_tabela.png'), fullPage: false });

  // 5. PLANO DE AÇÃO (KANBAN)
  console.log('📸 5. Testando Plano de Ação (Quadro Kanban)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const kanbanBtn = buttons.find(b => b.textContent?.includes('Kanban'));
    if (kanbanBtn) kanbanBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '05_plano_de_acao_kanban.png'), fullPage: false });

  // 6. DOCUMENTOS DO PGR (LISTAGEM)
  console.log('📸 6. Testando Documentos do PGR...');
  await page.goto('http://localhost:3000/documentos-pgr', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '06_documentos_pgr_lista.png'), fullPage: false });

  // 7. VISUALIZADOR DO DOCUMENTO PGR FORMAL
  console.log('📸 7. Testando Visualizador do Documento PGR Formal...');
  await page.goto('http://localhost:3000/documentos-pgr/pgr-01', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, '07_documento_pgr_visualizador.png'), fullPage: false });

  // 8. EMPRESAS
  console.log('📸 8. Testando Gestão de Empresas...');
  await page.goto('http://localhost:3000/empresas', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '08_empresas.png'), fullPage: false });

  // 9. SETORES
  console.log('📸 9. Testando Setores e Ambientes...');
  await page.goto('http://localhost:3000/setores', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '09_setores.png'), fullPage: false });

  // 10. CARGOS
  console.log('📸 10. Testando Cargos e Funções...');
  await page.goto('http://localhost:3000/cargos', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '10_cargos.png'), fullPage: false });

  // 11. GHES
  console.log('📸 11. Testando Grupos Homogêneos de Exposição (GHE)...');
  await page.goto('http://localhost:3000/ghes', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '11_ghes.png'), fullPage: false });

  // 12. PROFISSIONAIS RT
  console.log('📸 12. Testando Profissionais RT...');
  await page.goto('http://localhost:3000/profissionais', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '12_profissionais.png'), fullPage: false });

  // 13. CATÁLOGO DE PERIGOS
  console.log('📸 13. Testando Catálogo de Perigos eSocial...');
  await page.goto('http://localhost:3000/catalogo-perigos', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '13_catalogo_perigos.png'), fullPage: false });

  // 14. BANCO DE DADOS & SUPABASE
  console.log('📸 14. Testando Configurações de Banco e Supabase...');
  await page.goto('http://localhost:3000/config-banco', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, '14_config_banco.png'), fullPage: false });

  await browser.close();
  console.log('✅ Todos os testes visuais e capturas foram concluídos com sucesso!');
}

runVisualTest().catch(err => {
  console.error('❌ Erro no teste visual:', err);
  process.exit(1);
});
