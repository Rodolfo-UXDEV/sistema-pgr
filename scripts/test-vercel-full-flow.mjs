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

async function testVercelFlow() {
  console.log('🚀 Iniciando teste de cadastro na Vercel (https://sistema-pgr.vercel.app)...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Acessa Config Banco na Vercel e injeta a chave no localStorage
  console.log('🌐 1. Configurando conexão na Vercel...');
  await page.goto('https://sistema-pgr.vercel.app/config-banco', { waitUntil: 'domcontentloaded' });
  await page.evaluate((cfg) => {
    localStorage.setItem('pgr_firebase_config', JSON.stringify(cfg));
  }, firebaseConfig);
  await page.goto('https://sistema-pgr.vercel.app/config-banco', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${artifactDir}/vercel_01_config_banco.png` });

  // 2. Acessa Empresas na Vercel
  console.log('🏢 2. Acessando Empresas na Vercel...');
  await page.goto('https://sistema-pgr.vercel.app/empresas', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // Clica no botão "Nova Empresa"
  const btnNova = await page.waitForSelector('button', { timeout: 5000 });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Nova Empresa'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Digita nos campos com page.type
  const uniqueId = Date.now().toString().slice(-4);
  const newCompanyName = `AeroTech Indústria Metalmecânica ${uniqueId}`;
  console.log('Digitando nome da nova empresa:', newCompanyName);

  await page.waitForSelector('input[placeholder="Ex: Indústria Metalúrgica Horizonte Ltda"]', { timeout: 5000 });
  await page.type('input[placeholder="Ex: Indústria Metalúrgica Horizonte Ltda"]', newCompanyName, { delay: 20 });
  await page.type('input[placeholder="Ex: Horizonte Industrial"]', 'AeroTech Brasil', { delay: 20 });
  await page.type('input[placeholder="00.000.000/0001-00"]', '45.678.901/0001-22', { delay: 20 });

  await page.screenshot({ path: `${artifactDir}/vercel_02_modal_digitado.png` });

  // Clica no botão Salvar
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find(b => b.textContent?.includes('Salvar Empresa') || (b.getAttribute('type') === 'submit' && b.closest('form')));
    if (saveBtn) saveBtn.click();
  });
  console.log('Botão Salvar Empresa clicado!');
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: `${artifactDir}/vercel_03_empresas_pos_salvar.png` });

  // 3. Acessa Setores na Vercel
  console.log('🏭 3. Acessando Setores na Vercel...');
  await page.goto('https://sistema-pgr.vercel.app/setores', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Novo Setor'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const sectorName = `Corte a Laser & Conformação ${uniqueId}`;
  await page.waitForSelector('input[placeholder="Ex: Usinagem CNC, Montagem, Solda..."]', { timeout: 5000 });
  await page.type('input[placeholder="Ex: Usinagem CNC, Montagem, Solda..."]', sectorName, { delay: 20 });

  await page.screenshot({ path: `${artifactDir}/vercel_04_modal_setor_digitado.png` });

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find(b => b.textContent?.includes('Salvar Setor') || (b.getAttribute('type') === 'submit' && b.closest('form')));
    if (saveBtn) saveBtn.click();
  });
  console.log('Botão Salvar Setor clicado!');
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: `${artifactDir}/vercel_05_setores_pos_salvar.png` });

  await browser.close();
  console.log('✅ Interações no navegador da Vercel concluídas com sucesso!');

  // 4. Consulta o Firestore para confirmar a gravação direta
  console.log('\n🔥 4. Verificando persistência em tempo real no Cloud Firestore...');
  const companiesSnap = await getDocs(collection(db, 'companies'));
  console.log(`\n🏢 Empresas no Cloud Firestore (${companiesSnap.size} cadastradas):`);
  companiesSnap.docs.forEach(d => {
    console.log(`  - [${d.id}]: ${d.data().name} | CNPJ: ${d.data().cnpj}`);
  });

  const sectorsSnap = await getDocs(collection(db, 'sectors'));
  console.log(`\n🏭 Setores no Cloud Firestore (${sectorsSnap.size} cadastrados):`);
  sectorsSnap.docs.forEach(d => {
    console.log(`  - [${d.id}]: ${d.data().name}`);
  });
}

testVercelFlow().catch(console.error);
