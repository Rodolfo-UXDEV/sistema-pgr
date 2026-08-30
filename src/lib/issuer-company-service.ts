import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { IssuerCompanyConfig } from '@/types/pgr';
import { DEFAULT_EMISSORA_LOGO } from '@/lib/default-logos';

export const ISSUER_STORAGE_KEY = 'pgr_issuer_company_config_v1';
export const ISSUER_UPDATED_EVENT = 'pgr_issuer_company_updated';

export const DEFAULT_ISSUER_COMPANY: IssuerCompanyConfig = {
  name: 'ES Engenharia de Segurança do Trabalho LTDA.',
  tradeName: 'ES Engenharia & Consultoria SST',
  cnpj: '01.234.567/0001-89',
  registrationCouncil: 'CREA-SP: 01.194.103',
  phone: '(11) 4496-4320',
  email: 'contato@esengenharia.com.br',
  website: 'www.esengenharia.com.br',
  address: {
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Andar 10 - Sala 102',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
  },
  technicalManager: {
    name: 'Fernando Guimarães Ferrari',
    role: 'Engenheiro de Segurança do Trabalho / Higienista Ocupacional',
    council: 'CREA-SP: 5.060.011.940',
    cpf: '132.188.318-81',
  },
  logoUrl: DEFAULT_EMISSORA_LOGO,
};

/**
 * Obtém a configuração da Empresa Emissora do PGR (com fallback para padrão)
 */
export function getIssuerCompanyConfig(): IssuerCompanyConfig {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem(ISSUER_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_ISSUER_COMPANY, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Erro ao ler empresa emissora do localStorage:', e);
    }
  }
  return DEFAULT_ISSUER_COMPANY;
}

/**
 * Salva a configuração no LocalStorage e sincroniza com o Firebase Firestore
 */
export async function saveIssuerCompanyConfig(config: IssuerCompanyConfig): Promise<void> {
  const updated: IssuerCompanyConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  };

  // Salva no LocalStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(ISSUER_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(ISSUER_UPDATED_EVENT));
  }

  // Sincroniza com Firebase se configurado
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'system_settings', 'issuer_company');
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.error('Erro ao salvar empresa emissora no Firestore:', err);
    }
  }
}

/**
 * Carrega a configuração atualizada do Firestore
 */
export async function fetchIssuerCompanyFromFirestore(): Promise<IssuerCompanyConfig | null> {
  if (!isFirebaseConfigured) return null;

  try {
    const docRef = doc(db, 'system_settings', 'issuer_company');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as IssuerCompanyConfig;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(ISSUER_STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event(ISSUER_UPDATED_EVENT));
      }
      return data;
    }
  } catch (err) {
    console.error('Erro ao buscar empresa emissora do Firestore:', err);
  }
  return null;
}
