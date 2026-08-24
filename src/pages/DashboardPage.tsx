import React from 'react';
import { usePgr } from '@/context/PgrContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { RiskMatrixHeatmap } from '@/components/dashboard/RiskMatrixHeatmap';
import { HazardDistributionChart } from '@/components/dashboard/HazardDistributionChart';
import { ActionPlanOverview } from '@/components/dashboard/ActionPlanOverview';
import { RiskLevelBadge } from '@/components/risk-matrix/RiskLevelBadge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Layers, 
  Briefcase, 
  AlertTriangle, 
  CheckSquare, 
  FileText, 
  ShieldAlert, 
  Flame, 
  Plus, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCNPJ } from '@/lib/utils';

export const DashboardPage: React.FC = () => {
  const { activeCompany, activeEstablishment, activePgr, stats, riskInventory } = usePgr();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Top Banner / Company Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-2 py-0.5">
              NR-01 • PGR Vigente
            </Badge>
            {activePgr && (
              <span className="text-xs text-slate-300">
                Código: <strong className="text-white">{activePgr.code}</strong> (Versão {activePgr.version})
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {activeCompany?.tradeName || activeCompany?.name || 'Sistema de Gerenciamento de Riscos'}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>CNPJ: {activeCompany ? formatCNPJ(activeCompany.cnpj) : '-'}</span>
            <span>•</span>
            <span>Grau de Risco: <strong>Grau {activeCompany?.riskGrade || 3}</strong></span>
            <span>•</span>
            <span>Unidade: <strong>{activeEstablishment?.name || 'Todas as Unidades'}</strong></span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => navigate('/inventario')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4 mr-1" /> Novo Risco
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/documentos-pgr')}
            className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white text-xs"
          >
            <FileText className="h-4 w-4 mr-1" /> Emitir PGR em PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Trabalhadores Protegidos"
          value={stats.totalEmployees}
          subtitle={`${stats.totalPositions} cargos em ${stats.totalSectors} setores`}
          icon={Users}
          iconColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          onClick={() => navigate('/cargos')}
        />

        <StatCard
          title="Perigos Mapeados"
          value={stats.totalRisks}
          subtitle={`${stats.risksByLevel.TRIVIAL + stats.risksByLevel.TOLERAVEL} baixos • ${stats.risksByLevel.MODERADO} médios`}
          icon={AlertTriangle}
          iconColor="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
          onClick={() => navigate('/inventario')}
        />

        <StatCard
          title="Riscos Críticos / Altos"
          value={stats.criticalRisksCount}
          subtitle={stats.criticalRisksCount > 0 ? "Exigem intervenção imediata" : "Nenhum risco crítico"}
          icon={Flame}
          iconColor={stats.criticalRisksCount > 0 ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse" : "bg-slate-100 text-slate-700"}
          trend={{ value: stats.criticalRisksCount > 0 ? "Atenção" : "Em conformidade", isPositive: stats.criticalRisksCount === 0 }}
          onClick={() => navigate('/inventario')}
        />

        <StatCard
          title="Ações no Plano (5W2H)"
          value={stats.totalActions}
          subtitle={`${stats.completedActions} concluídas • ${stats.delayedActions} atrasadas`}
          icon={CheckSquare}
          iconColor="bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
          onClick={() => navigate('/plano-de-acao')}
        />
      </div>

      {/* Main Charts & Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matriz 5x5 Heatmap */}
        <RiskMatrixHeatmap />

        {/* Distribuição por Grupo Ocupacional */}
        <HazardDistributionChart />
      </div>

      {/* Action Plan Summary Section */}
      <ActionPlanOverview />
    </div>
  );
};
