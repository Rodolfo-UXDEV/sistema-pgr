import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { ActionPlanTable } from '@/components/action-plan/ActionPlanTable';
import { ActionPlanKanban } from '@/components/action-plan/ActionPlanKanban';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Table as TableIcon, LayoutGrid, DollarSign, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ActionPlanModal } from '@/components/action-plan/ActionPlanModal';

export const ActionPlansPage: React.FC = () => {
  const { activeCompany, activeEstablishment, stats } = usePgr();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-emerald-600" />
              Plano de Ação (5W2H)
            </h1>
            <Badge variant="outline" className="text-xs">
              NR-01.5.5
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Planejamento, acompanhamento e eficácia das medidas de prevenção da{' '}
            <strong className="text-foreground">{activeCompany?.name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Investment badge */}
          {stats.totalInvestment > 0 && (
            <div className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono">
              <DollarSign className="h-3.5 w-3.5" />
              <span>Total: {formatCurrency(stats.totalInvestment)}</span>
            </div>
          )}

          {/* View switcher */}
          <div className="flex items-center bg-muted p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'table' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Tabela 5W2H</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'kanban' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Ação</span>
          </Button>
        </div>
      </div>

      {/* Main Content (Table or Kanban) */}
      {viewMode === 'table' ? <ActionPlanTable /> : <ActionPlanKanban />}

      {/* Creation Modal */}
      {isModalOpen && (
        <ActionPlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
