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

async function testVercelE2E() {
  console.log('🚀 Iniciando teste E2E na Vercel (https://sistema-pgr.vercel.app)...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Acessa Vercel Config Banco e define o localStorage
  console.log('🌐 1. Acessando https://sistema-pgr.vercel.app/config-banco...');
  await page.goto('https://sistema-pgr.vercel.app/config-banco', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate((cfg) => {
    localStorage.setItem('pgr_firebase_config', JSON.stringify(cfg));
  }, firebaseConfig);

  await page.goto('https://sistema-pgr.vercel.app/config-banco', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${artifactDir}/vercel_01_config_banco.png` });

  // 2. Acessa a página de Empresas para Cadastrar Nova Empresa
  console.log('🏢 2. Acessando tela de Empresas na Vercel...');
  await page.goto('https://sistema-pgr.vercel.app/empresas', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // Clica no botão de Nova Empresa
  const btnClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent?.includes('Nova Empresa') || btn.textContent?.includes('Adicionar') || btn.textContent?.includes('Cadastrar'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  console.log('Botão Nova Empresa clicado:', btnClicked);
  await new Promise(r => setTimeout(r, 1000));

  const uniqueSuffix = Date.now().toString().slice(-4);
  const newCompanyName = `AeroTech Indústria Metalmecânica ${uniqueSuffix}`;

  // Preenche campos do modal
  await page.evaluate((compName) => {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    inputs.forEach(input => {
      const el = input;
      const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
      const id = (el.getAttribute('id') || '').toLowerCase();
      const name = (el.getAttribute('name') || '').toLowerCase();
      
      if (placeholder.includes('razão') || placeholder.includes('empresa') || id.includes('name') || name.includes('name')) {
        el.value = compName;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (placeholder.includes('fantasia') || id.includes('trade') || name.includes('trade')) {
        el.value = 'AeroTech Brasil';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (placeholder.includes('cnpj') || id.includes('cnpj') || name.includes('cnpj')) {
        el.value = '45.678.901/0001-22';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (placeholder.includes('cnae') || id.includes('cnae') || name.includes('cnae')) {
        el.value = '25.39-0-01';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (placeholder.includes('descrição') || id.includes('desc') || name.includes('cnaedescription')) {
        el.value = 'Usinagem e corte a laser de alta precisão';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (placeholder.includes('representante') || id.includes('rep') || name.includes('legalrepresentative')) {
        el.value = 'Mariana Vasconcelos';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (placeholder.includes('cargo') || id.includes('role') || name.includes('role')) {
        el.value = 'Diretora Operacional';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (placeholder.includes('colaboradores') || placeholder.includes('funcionários') || id.includes('count') || name.includes('employeecount')) {
        el.value = '35';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }, newCompanyName);

  await page.screenshot({ path: `${artifactDir}/vercel_02_modal_nova_empresa.png` });

  // Clica no botão Salvar do modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find(b => b.textContent?.includes('Salvar') || b.textContent?.includes('Cadastrar') || b.getAttribute('type') === 'submit');
    if (saveBtn) saveBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: `${artifactDir}/vercel_03_empresas_salvo.png` });

  // 3. Cadastrar Novo Setor na Vercel
  console.log('🏭 3. Cadastrando Novo Setor na Vercel...');
  await page.goto('https://sistema-pgr.vercel.app/setores', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent?.includes('Novo Setor') || btn.textContent?.includes('Adicionar'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const newSectorName = `Corte a Laser & Dobra ${uniqueSuffix}`;
  await page.evaluate((secName) => {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    inputs.forEach(input => {
      const el = input;
      const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
      if (placeholder.includes('nome') || placeholder.includes('setor')) {
        el.value = secName;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (placeholder.includes('descrição')) {
        el.value = 'Setor de corte térmico por fibra óptica e conformação mecânica';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }, newSectorName);

  await page.screenshot({ path: `${artifactDir}/vercel_04_modal_novo_setor.png` });

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find(b => b.textContent?.includes('Salvar') || b.getAttribute('type') === 'submit');
    if (saveBtn) saveBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: `${artifactDir}/vercel_05_setores_salvo.png` });

  // 4. Acessa a tela do Dashboard na Vercel
  console.log('📊 4. Validando Dashboard na Vercel...');
  await page.goto('https://sistema-pgr.vercel.app/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${artifactDir}/vercel_06_dashboard_final.png` });

  await browser.close();
  console.log('✅ Teste automatizado na Vercel concluído!');

  // 5. Consulta direta no Firebase Firestore para provar a gravação
  console.log('\n🔥 5. Verificando dados gravados no Cloud Firestore...');
  const companiesSnap = await getDocs(collection(db, 'companies'));
  const savedCompanies = companiesSnap.docs.map(d => ({ id: d.id, name: d.data().name }));
  console.log('Empresas no Firestore:', savedCompanies);

  const sectorsSnap = await getDocs(collection(db, 'sectors'));
  const savedSectors = sectorsSnap.docs.map(d => ({ id: d.id, name: d.data().name }));
  console.log('Setores no Firestore:', savedSectors);
}

testVercelE2E().catch(console.error);
