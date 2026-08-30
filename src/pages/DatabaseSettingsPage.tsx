import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  firebaseConfig, 
  isFirebaseConfigured, 
  saveFirebaseConfig, 
  clearFirebaseConfig 
} from '@/lib/firebase';
import { Database, ShieldCheck, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, Server, Flame, Sparkles } from 'lucide-react';

export const DatabaseSettingsPage: React.FC = () => {
  const { 
    clearAllData, 
    loadDemoData, 
    refreshFromFirebase, 
    seedDatabase,
    isLoadingDb, 
    companies, 
    establishments,
    sectors, 
    positions, 
    ghes,
    professionals,
    hazards,
    pgrDocuments,
    riskInventory, 
    actionPlans 
  } = usePgr();
  
  const [config, setConfig] = useState(firebaseConfig);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await refreshFromFirebase();
    setIsSyncing(false);
    alert('Dados sincronizados com o Cloud Firestore com sucesso!');
  };

  const handleSeed = async () => {
    if (window.confirm('Deseja popular o Firebase Firestore com os dados oficiais da empresa modelo Metalúrgica Brasil Sul?')) {
      setIsSeeding(true);
      const ok = await seedDatabase();
      setIsSeeding(false);
      if (ok) {
        alert('Firebase Firestore populado com sucesso!');
      } else {
        alert('Erro ao popular o Firebase Firestore.');
      }
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    saveFirebaseConfig(config);
  };

  const handleClear = () => {
    if (window.confirm('Deseja desconectar o Firebase e voltar para o modo padrão?')) {
      clearFirebaseConfig();
    }
  };

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Ajustar com Firebase Auth em produção
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Flame className="h-6 w-6 text-amber-500" />
            Configuração de Banco de Dados & Firebase
          </h1>
          <Badge variant={isFirebaseConfigured ? 'success' : 'warning'} className="text-xs">
            {isFirebaseConfigured ? 'Firebase Conectado' : 'Armazenamento Local Ativo'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Gerenciamento da conexão com o Google Cloud Firestore, persistência em tempo real e coleções do Sistema PGR.
        </p>
      </div>

      {/* Connection Status Card */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Server className="h-4 w-4 text-amber-500" />
                Status da Conexão Firebase
              </CardTitle>
              <CardDescription className="text-xs">
                {isFirebaseConfigured 
                  ? `Conectado ao projeto ${firebaseConfig.projectId} com Cloud Firestore ativo.`
                  : 'Modo Offline / LocalStorage Ativo com persistência completa no navegador.'}
              </CardDescription>
            </div>
            {isFirebaseConfigured ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                <span>Online (Firestore)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span>Local Storage</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Project ID</Label>
                <Input
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  placeholder="sistema-pgr"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Auth Domain</Label>
                <Input
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  placeholder="sistema-pgr.firebaseapp.com"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">API Key</Label>
                <Input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Inserir chave da API do Firebase..."
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Storage Bucket</Label>
                <Input
                  value={config.storageBucket}
                  onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                  placeholder="sistema-pgr.firebasestorage.app"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Restaurar Padrão
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSeed}
                  disabled={isSeeding || isLoadingDb}
                  className="text-xs gap-1.5 border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? 'Populando...' : 'Popular Base Firebase'}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing || isLoadingDb}
                  className="text-xs gap-1.5 border-emerald-300 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing || isLoadingDb ? 'animate-spin' : ''}`} />
                  <span>{isSyncing || isLoadingDb ? 'Sincronizando...' : 'Sincronizar Firestore'}</span>
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="font-semibold text-xs shadow-xs"
                >
                  {isSaving ? 'Salvando...' : 'Salvar e Recarregar'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Registros Sincronizados no Firestore */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Coleções do Cloud Firestore
          </CardTitle>
          <CardDescription className="text-xs">
            Contagem de documentos sincronizados e disponíveis em tempo real.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-muted/40 rounded-lg text-center border border-border">
              <div className="text-xl font-bold text-foreground">{companies.length}</div>
              <div className="text-[11px] text-muted-foreground">Empresas</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center border border-border">
              <div className="text-xl font-bold text-foreground">{establishments.length}</div>
              <div className="text-[11px] text-muted-foreground">Unidades</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center border border-border">
              <div className="text-xl font-bold text-foreground">{sectors.length}</div>
              <div className="text-[11px] text-muted-foreground">Setores</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center border border-border">
              <div className="text-xl font-bold text-foreground">{positions.length}</div>
              <div className="text-[11px] text-muted-foreground">Cargos</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center border border-border">
              <div className="text-xl font-bold text-foreground">{ghes.length}</div>
              <div className="text-[11px] text-muted-foreground">GESs</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center border border-border">
              <div className="text-xl font-bold text-foreground">{professionals.length}</div>
              <div className="text-[11px] text-muted-foreground">Profissionais</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center border border-border">
              <div className="text-xl font-bold text-foreground">{hazards.length}</div>
              <div className="text-[11px] text-muted-foreground">Catálogo Riscos</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center border border-border">
              <div className="text-xl font-bold text-foreground">{pgrDocuments.length}</div>
              <div className="text-[11px] text-muted-foreground">Docs PGR</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center border border-border">
              <div className="text-xl font-bold text-foreground">{riskInventory.length}</div>
              <div className="text-[11px] text-muted-foreground">Inventário 5x5</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center border border-border">
              <div className="text-xl font-bold text-foreground">{actionPlans.length}</div>
              <div className="text-[11px] text-muted-foreground">Ações 5W2H</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Firestore Security Rules */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Regras de Segurança do Firestore (Rules)</CardTitle>
              <CardDescription className="text-xs">
                Configuração para o console do Firebase em <code className="bg-muted px-1 py-0.5 rounded font-mono">firestore.rules</code>.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyRules}
              className="text-xs gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Regras'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
            <p className="text-amber-400">// Coleções do Sistema PGR no Cloud Firestore:</p>
            <p>1. companies (Empresas)</p>
            <p>2. establishments (Unidades/Estabelecimentos)</p>
            <p>3. sectors (Setores com características físicas)</p>
            <p>4. positions (Cargos, CBO e Atividades)</p>
            <p>5. ghes (Grupos de Exposição Similar - GES)</p>
            <p>6. professionals (Responsáveis Técnicos e ART)</p>
            <p>7. hazards_catalog (Catálogo de Riscos eSocial)</p>
            <p>8. pgr_documents (Documentos PGR e Versões)</p>
            <p>9. risk_inventory (Inventário e Matriz 5x5)</p>
            <p>10. action_plans (Plano de Ação 5W2H)</p>
          </div>
        </CardContent>
      </Card>

      {/* Factory Reset */}
      <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-rose-700 dark:text-rose-400">
            Zona de Manutenção / Reset Local
          </CardTitle>
          <CardDescription className="text-xs text-rose-600/80 dark:text-rose-400/80">
            Restaura o sistema para a base de dados padrão da empresa modelo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (window.confirm('Carregar os dados de demonstração da empresa modelo?')) {
                loadDemoData();
                alert('Dados de demonstração carregados com sucesso!');
              }
            }}
            className="text-xs font-semibold gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Carregar Base Demo Local</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
