import puppeteer from 'puppeteer';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocs, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDehKtMDOvtOrXjGmsSIOBXsAzmiIK8lL4",
  authDomain: "sistema-pgr.firebaseapp.com",
  projectId: "sistema-pgr",
  storageBucket: "sistema-pgr.firebasestorage.app",
  messagingSenderId: "687732574569",
  appId: "1:687732574569:web:sistema-pgr"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const artifactDir = '/Users/rodolforodrigues/.gemini/antigravity/brain/f0078bb4-af9e-4a01-85bc-9848611f4778';

async function testCompanyAndRisk() {
  console.log('🚀 Cadastrando Nova Empresa e Novo Risco na Vercel...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Injetar configuração no localStorage na Vercel
  await page.goto('https://sistema-pgr.vercel.app/config-banco', { waitUntil: 'domcontentloaded' });
  await page.evaluate((cfg) => {
    localStorage.setItem('pgr_firebase_config', JSON.stringify(cfg));
  }, firebaseConfig);

  // 2. CADASTRO DE NOVA EMPRESA
  console.log('🏢 Cadastrando Nova Empresa...');
  await page.goto('https://sistema-pgr.vercel.app/empresas', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Cadastrar Empresa') || b.textContent?.includes('Nova Empresa'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const uniqueId = Date.now().toString().slice(-4);
  const companyName = `SulMetal Estruturas Metálicas ${uniqueId}`;
  const cnpj = `11.222.333/0001-${uniqueId.slice(-2)}`;

  await page.waitForSelector('input[placeholder="Ex: Indústria Metalúrgica Horizonte Ltda"]', { timeout: 5000 });
  await page.type('input[placeholder="Ex: Indústria Metalúrgica Horizonte Ltda"]', companyName, { delay: 10 });
  await page.type('input[placeholder="Ex: Horizonte Industrial"]', 'SulMetal Brasil', { delay: 10 });
  await page.type('input[placeholder="00.000.000/0001-00"]', cnpj, { delay: 10 });

  // Clica no botão verde "Cadastrar" do modal de empresa
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const saveBtn = btns.find(b => b.textContent?.trim() === 'Cadastrar' && b.closest('[role="dialog"]'));
    if (saveBtn) saveBtn.click();
  });
  console.log('Empresa salva! Aguardando Firestore...');
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: `${artifactDir}/vercel_07_empresas_salva_confirmada.png` });

  // 3. CADASTRO DE NOVO RISCO NA MATRIZ 5X5
  console.log('⚠️ Cadastrando Novo Risco na Matriz 5x5...');
  await page.goto('https://sistema-pgr.vercel.app/inventario', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Adicionar Risco') || b.textContent?.includes('Novo Risco'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: `${artifactDir}/vercel_08_modal_novo_risco.png` });

  await browser.close();

  // 4. CONSULTA FIRESTORE
  console.log('\n🔥 CONSULTANDO GOOGLE CLOUD FIRESTORE:');
  const compSnap = await getDocs(collection(db, 'companies'));
  console.log(`\n🏢 Empresas no Firestore (${compSnap.size}):`);
  compSnap.docs.forEach(d => {
    console.log(`   👉 ID: ${d.id} | Nome: "${d.data().name}" | CNPJ: ${d.data().cnpj}`);
  });

  const secSnap = await getDocs(collection(db, 'sectors'));
  console.log(`\n🏭 Setores no Firestore (${secSnap.size}):`);
  secSnap.docs.forEach(d => {
    console.log(`   👉 ID: ${d.id} | Nome: "${d.data().name}"`);
  });
}

testCompanyAndRisk().catch(console.error);
