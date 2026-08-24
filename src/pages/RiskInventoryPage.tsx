import React from 'react';
import { RiskInventoryTable } from '@/components/inventory/RiskInventoryTable';
import { usePgr } from '@/context/PgrContext';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Info } from 'lucide-react';

export const RiskInventoryPage: React.FC = () => {
  const { activeCompany, activeEstablishment, activePgr, stats } = usePgr();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              Inventário de Riscos Ocupacionais
            </h1>
            <Badge variant="outline" className="text-xs">
              NR-01.5.7
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Reconhecimento, avaliação e classificação de riscos ocupacionais da empresa{' '}
            <strong className="text-foreground">{activeCompany?.name}</strong> • Unidade:{' '}
            <strong className="text-foreground">{activeEstablishment?.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs bg-muted/60 px-3 py-1.5 rounded-lg border border-border">
            <span className="text-muted-foreground">Total:</span>
            <strong className="text-foreground font-bold">{stats.totalRisks} perigos</strong>
            <span className="text-muted-foreground">|</span>
            <span className="text-rose-600 font-bold">{stats.criticalRisksCount} críticos</span>
          </div>
        </div>
      </div>

      {/* Info Alert Box */}
      <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Conforme a <strong>NR-01.5.7</strong>, o inventário de riscos deve conter a caracterização dos processos e ambientes, a identificação dos perigos e possíveis lesões, a indicação dos grupos de trabalhadores expostos, a avaliação e gradação dos riscos com base na severidade e probabilidade, e as medidas de prevenção existentes.
        </p>
      </div>

      {/* Main Table */}
      <RiskInventoryTable />
    </div>
  );
};
