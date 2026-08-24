import React from 'react';
import { usePgr } from '@/context/PgrContext';
import { MATRIX_5X5, RISK_LEVEL_CONFIG, SEVERITY_SCALE, PROBABILITY_SCALE } from '@/lib/risk-matrix';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const RiskMatrixHeatmap: React.FC = () => {
  const { riskInventory, activeCompany } = usePgr();
  const navigate = useNavigate();

  const companyRisks = riskInventory.filter(r => !activeCompany || r.companyId === activeCompany.id);

  // Contagem por célula [Severidade][Probabilidade]
  const cellCounts: Record<string, number> = {};
  companyRisks.forEach(r => {
    const key = `${r.severity}-${r.probability}`;
    cellCounts[key] = (cellCounts[key] || 0) + 1;
  });

  const getCellBg = (s: number, p: number, count: number) => {
    const level = MATRIX_5X5[s]?.[p] || 'MODERADO';
    switch (level) {
      case 'TRIVIAL':
        return count > 0 ? 'bg-emerald-500 text-white font-bold' : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300';
      case 'TOLERAVEL':
        return count > 0 ? 'bg-lime-500 text-white font-bold' : 'bg-lime-500/20 text-lime-800 dark:text-lime-300';
      case 'MODERADO':
        return count > 0 ? 'bg-amber-500 text-white font-bold' : 'bg-amber-500/20 text-amber-800 dark:text-amber-300';
      case 'SUBSTANCIAL':
        return count > 0 ? 'bg-orange-500 text-white font-bold ring-2 ring-orange-400' : 'bg-orange-500/20 text-orange-800 dark:text-orange-300';
      case 'INTOLERAVEL':
        return count > 0 ? 'bg-rose-600 text-white font-bold ring-2 ring-rose-400 animate-pulse' : 'bg-rose-600/20 text-rose-800 dark:text-rose-300';
    }
  };

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Mapa de Calor dos Riscos (Matriz 5x5)</CardTitle>
            <CardDescription className="text-xs">
              Distribuição dos perigos levantados por probabilidade e severidade
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {companyRisks.length} Riscos Mapeados
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[400px]">
            <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1.5 text-center">
              {/* Header Corner */}
              <div className="p-1 text-[10px] font-semibold text-muted-foreground bg-muted/40 rounded flex items-center justify-center">
                Sev. \ Prob.
              </div>

              {/* Colunas P1 a P5 */}
              {[1, 2, 3, 4, 5].map((p) => (
                <div key={`col-${p}`} className="p-1 text-[10px] font-bold bg-muted/60 rounded text-muted-foreground">
                  P{p}
                </div>
              ))}

              {/* Linhas S5 a S1 */}
              {[5, 4, 3, 2, 1].map((s) => (
                <React.Fragment key={`heatmap-row-${s}`}>
                  <div className="p-1 text-[10px] font-bold bg-muted/60 rounded text-muted-foreground flex items-center justify-start px-2">
                    S{s} - {SEVERITY_SCALE.find(item => item.value === s)?.label.split('-')[1]?.slice(0, 8)}
                  </div>

                  {[1, 2, 3, 4, 5].map((p) => {
                    const count = cellCounts[`${s}-${p}`] || 0;
                    return (
                      <button
                        key={`h-cell-${s}-${p}`}
                        onClick={() => navigate('/inventario')}
                        title={`S${s} x P${p} (${MATRIX_5X5[s]?.[p]}): ${count} risco(s)`}
                        className={cn(
                          "h-10 rounded-md flex items-center justify-center text-xs transition-transform hover:scale-105 cursor-pointer",
                          getCellBg(s, p, count)
                        )}
                      >
                        {count > 0 ? (
                          <span className="text-sm">{count}</span>
                        ) : (
                          <span className="text-[9px] opacity-40">-</span>
                        )}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda de Níveis */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-3 border-t border-border text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Trivial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-lime-500" />
            <span className="text-muted-foreground">Tolerável</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Moderado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">Substancial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
            <span className="text-muted-foreground">Intolerável</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
