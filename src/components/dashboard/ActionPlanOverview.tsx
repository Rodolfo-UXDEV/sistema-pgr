import React from 'react';
import { usePgr } from '@/context/PgrContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertCircle, ArrowUpRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '@/lib/utils';

export const ActionPlanOverview: React.FC = () => {
  const { actionPlans, activeCompany, stats } = usePgr();
  const navigate = useNavigate();

  const companyActions = actionPlans.filter(a => !activeCompany || a.companyId === activeCompany.id);
  const total = companyActions.length || 1;
  const completionRate = Math.round((stats.completedActions / total) * 100);

  const getStatusBadge = (status: string, whenDate: string) => {
    const isDelayed = status !== 'CONCLUIDA' && whenDate && !whenDate.toLowerCase().includes('continuo') && !whenDate.toLowerCase().includes('contínuo') && !isNaN(new Date(whenDate).getTime()) && new Date(whenDate) < new Date();
    if (isDelayed || status === 'ATRASADA') {
      return <Badge variant="danger" className="text-[10px]">Atrasada</Badge>;
    }
    switch (status) {
      case 'CONCLUIDA':
        return <Badge variant="success" className="text-[10px]">Concluída</Badge>;
      case 'EM_ANDAMENTO':
        return <Badge variant="info" className="text-[10px]">Em Andamento</Badge>;
      case 'NAO_INICIADA':
      default:
        return <Badge variant="secondary" className="text-[10px]">Não Iniciada</Badge>;
    }
  };

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Status do Plano de Ação (5W2H)</CardTitle>
            <CardDescription className="text-xs">
              Acompanhamento de metas e cronograma de implementação das melhorias
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/plano-de-acao')}
            className="text-xs text-primary flex items-center gap-1 p-0 h-auto hover:bg-transparent"
          >
            <span>Ver Todos</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Taxa de Conclusão do Cronograma</span>
            <span className="font-bold text-emerald-600">{completionRate}%</span>
          </div>
          <Progress value={completionRate} indicatorColor="bg-emerald-600" className="h-2" />
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px]">
            <div>
              <span className="text-muted-foreground block text-[10px]">Concluídas</span>
              <span className="font-bold text-emerald-600">{stats.completedActions}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Em Andamento</span>
              <span className="font-bold text-sky-600">{stats.inProgressActions}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Atrasadas</span>
              <span className="font-bold text-rose-600">{stats.delayedActions}</span>
            </div>
          </div>
        </div>

        {/* Investment summary */}
        {stats.totalInvestment > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">Investimento Estimado em SST:</span>
            </div>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 font-mono">
              {formatCurrency(stats.totalInvestment)}
            </span>
          </div>
        )}

        {/* Action list preview */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Próximas Ações Prioritárias
          </span>
          {companyActions.slice(0, 3).map((action) => (
            <div
              key={action.id}
              onClick={() => navigate('/plano-de-acao')}
              className="p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{action.what}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>Resp: {action.who}</span>
                  <span>•</span>
                  <span>Prazo: {formatDate(action.whenDate)}</span>
                </div>
              </div>
              <div>
                {getStatusBadge(action.status, action.whenDate)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
