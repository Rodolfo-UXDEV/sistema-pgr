import puppeteer from 'puppeteer';
import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection } from 'firebase/firestore';

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

async function testVercelRegistration() {
  console.log('🚀 Iniciando teste de cadastro completo na Vercel (https://sistema-pgr.vercel.app)...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Injetar configuração no localStorage na Vercel
  console.log('🌐 1. Configurando sessão na Vercel...');
  await page.goto('https://sistema-pgr.vercel.app/config-banco', { waitUntil: 'domcontentloaded' });
  await page.evaluate((cfg) => {
    localStorage.setItem('pgr_firebase_config', JSON.stringify(cfg));
  }, firebaseConfig);
  await page.goto('https://sistema-pgr.vercel.app/config-banco', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${artifactDir}/vercel_01_config_banco.png` });

  // 2. CADASTRO DE NOVA EMPRESA NA VERCEL
  console.log('🏢 2. Cadastrando Nova Empresa na Vercel...');
  await page.goto('https://sistema-pgr.vercel.app/empresas', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // Clica no botão "Nova Empresa"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Nova Empresa') || b.textContent?.includes('Cadastrar'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const uniqueId = Date.now().toString().slice(-4);
  const newCompanyName = `AeroTech Indústria Metalmecânica ${uniqueId}`;
  const newCnpj = `45.678.901/0001-${uniqueId.slice(-2)}`;

  console.log(`Preenchendo: ${newCompanyName} (${newCnpj})`);

  // Preenche via React typing
  await page.waitForSelector('input[placeholder="Ex: Indústria Metalúrgica Horizonte Ltda"]', { timeout: 5000 });
  await page.type('input[placeholder="Ex: Indústria Metalúrgica Horizonte Ltda"]', newCompanyName, { delay: 15 });
  await page.type('input[placeholder="Ex: Horizonte Industrial"]', 'AeroTech Brasil', { delay: 15 });
  await page.type('input[placeholder="00.000.000/0001-00"]', newCnpj, { delay: 15 });

  await page.screenshot({ path: `${artifactDir}/vercel_02_empresa_form.png` });

  // Clica no botão submit do form
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"]') || Array.from(form.querySelectorAll('button')).find(b => b.textContent?.includes('Salvar') || b.textContent?.includes('Cadastrar'));
      if (submitBtn) (submitBtn).click();
    }
  });
  console.log('Empresa salva! Aguardando sincronização com Firestore...');
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: `${artifactDir}/vercel_03_empresas_list.png` });

  // 3. CADASTRO DE NOVO SETOR NA VERCEL
  console.log('🏭 3. Cadastrando Novo Setor na Vercel...');
  await page.goto('https://sistema-pgr.vercel.app/setores', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Cadastrar Setor') || b.textContent?.includes('Novo Setor'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const newSectorName = `Corte a Laser & Conformação ${uniqueId}`;
  console.log(`Preenchendo Setor: ${newSectorName}`);

  await page.waitForSelector('input[placeholder="Ex: Usinagem e Torneamento CNC"]', { timeout: 5000 });
  await page.type('input[placeholder="Ex: Usinagem e Torneamento CNC"]', newSectorName, { delay: 15 });

  await page.screenshot({ path: `${artifactDir}/vercel_04_setor_form.png` });

  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"]') || Array.from(form.querySelectorAll('button')).find(b => b.textContent?.includes('Salvar') || b.textContent?.includes('Cadastrar'));
      if (submitBtn) (submitBtn).click();
    }
  });
  console.log('Setor salvo! Aguardando sincronização com Firestore...');
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: `${artifactDir}/vercel_05_setores_list.png` });

  // 4. VALIDAÇÃO NO DASHBOARD
  console.log('📊 4. Verificando Dashboard na Vercel...');
  await page.goto('https://sistema-pgr.vercel.app/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${artifactDir}/vercel_06_dashboard.png` });

  await browser.close();
  console.log('✅ Teste na Vercel finalizado com sucesso!');

  // 5. CONSULTA DIRETA NO CLOUD FIRESTORE PARA COMPROVAR A PERSISTÊNCIA REAL
  console.log('\n🔥 5. VALIDANDO REGISTROS DIRETAMENTE NO GOOGLE CLOUD FIRESTORE:');
  const compSnap = await getDocs(collection(db, 'companies'));
  console.log(`\n🏢 Total de Empresas no Firestore: ${compSnap.size}`);
  compSnap.docs.forEach(d => {
    const data = d.data();
    console.log(`   👉 ID: ${d.id} | Nome: "${data.name}" | CNPJ: ${data.cnpj}`);
  });

  const secSnap = await getDocs(collection(db, 'sectors'));
  console.log(`\n🏭 Total de Setores no Firestore: ${secSnap.size}`);
  secSnap.docs.forEach(d => {
    const data = d.data();
    console.log(`   👉 ID: ${d.id} | Nome: "${data.name}"`);
  });
}

testVercelRegistration().catch(console.error);
