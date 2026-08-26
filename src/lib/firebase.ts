import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração padrão do Firebase para o projeto sistema-pgr
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDehKtMDOvtOrXjGmsSIOBXsAzmiIK8lL4",
  authDomain: "sistema-pgr.firebaseapp.com",
  projectId: "sistema-pgr",
  storageBucket: "sistema-pgr.firebasestorage.app",
  messagingSenderId: "687732574569",
  appId: "1:687732574569:web:sistema-pgr"
};

function getActiveFirebaseConfig() {
  if (typeof window === 'undefined') return DEFAULT_FIREBASE_CONFIG;
  try {
    const local = localStorage.getItem('pgr_firebase_config');
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {
    console.error('Erro ao ler configuração do Firebase do localStorage:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export const firebaseConfig = getActiveFirebaseConfig();

// Inicialização segura da instância do Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Instância do Cloud Firestore
export const db = getFirestore(app);

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'placeholder'
);

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
