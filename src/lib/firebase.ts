import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase lida via variáveis de ambiente seguras (sem expor segredos no repositório)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sistema-pgr.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sistema-pgr',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sistema-pgr.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '687732574569',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:687732574569:web:sistema-pgr'
};

function getActiveFirebaseConfig() {
  if (typeof window === 'undefined') return DEFAULT_FIREBASE_CONFIG;
  try {
    const local = localStorage.getItem('pgr_firebase_config');
    if (local) {
      const parsed = JSON.parse(local);
      return {
        ...DEFAULT_FIREBASE_CONFIG,
        ...parsed,
      };
    }
  } catch (e) {
    console.error('Erro ao ler configuração do Firebase do localStorage:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export const firebaseConfig = getActiveFirebaseConfig();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'placeholder'
);

// Inicialização segura da instância do Firebase App
export const app = getApps().length === 0 
  ? initializeApp(
      isFirebaseConfigured 
        ? firebaseConfig 
        : { ...firebaseConfig, apiKey: firebaseConfig.apiKey || 'demo-api-key' }
    ) 
  : getApp();

// Instância do Cloud Firestore
export const db = getFirestore(app);

export function saveFirebaseConfig(config: typeof DEFAULT_FIREBASE_CONFIG) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pgr_firebase_config', JSON.stringify(config));
    window.location.reload();
  }
}

export function clearFirebaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pgr_firebase_config');
    window.location.reload();
  }
}

export default app;
