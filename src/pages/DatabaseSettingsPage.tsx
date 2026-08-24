import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  supabaseUrl, 
  supabaseAnonKey, 
  isSupabaseConfigured, 
  saveSupabaseConfig, 
  clearSupabaseConfig 
} from '@/lib/supabase';
import { Database, ShieldCheck, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, Server, Key } from 'lucide-react';

export const DatabaseSettingsPage: React.FC = () => {
  const { clearAllData, loadDemoData } = usePgr();
  const [url, setUrl] = useState(supabaseUrl);
  const [key, setKey] = useState(supabaseAnonKey);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    saveSupabaseConfig(url, key);
  };

  const handleClear = () => {
    if (window.confirm('Deseja desconectar o Supabase e voltar para o modo de armazenamento local?')) {
      clearSupabaseConfig();
    }
  };

  const sqlSchema = `-- TABELAS DO SISTEMA PGR
CREATE TABLE public.companies (...);
CREATE TABLE public.establishments (...);
CREATE TABLE public.sectors (...);
CREATE TABLE public.positions (...);
CREATE TABLE public.ghes (...);
CREATE TABLE public.professionals (...);
CREATE TABLE public.hazards_catalog (...);
CREATE TABLE public.pgr_documents (...);
CREATE TABLE public.risk_inventory (...);
CREATE TABLE public.action_plans (...);
CREATE TABLE public.environmental_measurements (...);
-- RLS HABILITADO EM TODAS AS TABELAS`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-600" />
            Configuração de Banco de Dados & Supabase
          </h1>
          <Badge variant={isSupabaseConfigured ? 'success' : 'warning'} className="text-xs">
            {isSupabaseConfigured ? 'Supabase Conectado' : 'Armazenamento Local Ativo'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Gerenciamento da conexão com o banco de dados PostgreSQL, autenticação e tabelas do Sistema PGR.
        </p>
      </div>

      {/* Connection Status Card */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-600" />
                Status da Conexão
              </CardTitle>
              <CardDescription className="text-xs">
                {isSupabaseConfigured 
                  ? 'A aplicação está conectada ao seu projeto Supabase com RLS ativo.'
                  : 'Modo Offline / LocalStorage Ativo com persistência completa no navegador.'}
              </CardDescription>
            </div>
            {isSupabaseConfigured ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                <span>Online</span>
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
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Supabase Project URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://seu-projeto.supabase.co"
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Supabase Anon Public Key (API Key)</Label>
              <Input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Limpar & Voltar para Local
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="font-semibold text-xs shadow-xs"
              >
                {isSaving ? 'Salvando...' : 'Salvar e Conectar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* SQL Script & Schema Reference */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Schema do Banco de Dados (PostgreSQL)</CardTitle>
              <CardDescription className="text-xs">
                O arquivo oficial com todas as tabelas, tipos e políticas RLS está em <code className="bg-muted px-1 py-0.5 rounded font-mono">supabase/schema.sql</code>.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copySql}
              className="text-xs gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Resumo'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
            <p className="text-emerald-400">-- Tabelas estruturadas da NR-01:</p>
            <p>1. public.companies (Empresas)</p>
            <p>2. public.establishments (Unidades/Estabelecimentos)</p>
            <p>3. public.sectors (Setores com características físicas)</p>
            <p>4. public.positions (Cargos, CBO e Atividades)</p>
            <p>5. public.ghes (Grupos Homogêneos de Exposição)</p>
            <p>6. public.professionals (Responsáveis Técnicos e ART)</p>
            <p>7. public.hazards_catalog (Catálogo de Riscos eSocial)</p>
            <p>8. public.pgr_documents (Documentos PGR e Versões)</p>
            <p>9. public.risk_inventory (Inventário e Matriz 5x5)</p>
            <p>10. public.action_plans (Plano de Ação 5W2H)</p>
            <p>11. public.environmental_measurements (Medições NHO)</p>
          </div>
        </CardContent>
      </Card>

      {/* Factory Reset */}
      <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-rose-700 dark:text-rose-400">
            Zona de Manutenção / Reset de Dados de Demonstração
          </CardTitle>
          <CardDescription className="text-xs text-rose-600/80 dark:text-rose-400/80">
            Restaura o sistema para a base de dados padrão da empresa modelo Horizonte Industrial.
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
            <span>Carregar Base Demo</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
