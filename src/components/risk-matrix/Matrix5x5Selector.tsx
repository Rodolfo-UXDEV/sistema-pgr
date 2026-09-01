import React from 'react';
import { 
  PROBABILITY_SCALE, 
  SEVERITY_SCALE, 
  MATRIX_5X5, 
  RISK_LEVEL_CONFIG,
  calculateRiskLevel 
} from '@/lib/risk-matrix';
import { RiskLevel } from '@/types/pgr';
import { RiskLevelBadge } from '@/components/risk-matrix/RiskLevelBadge';
import { cn } from '@/lib/utils';
import { HelpCircle, Info } from 'lucide-react';

interface Matrix5x5SelectorProps {
  severity: number;
  probability: number;
  actionPriority?: string;
  onChange: (severity: number, probability: number, level: RiskLevel, score: number) => void;
  onPriorityChange?: (priority: string) => void;
}

export const Matrix5x5Selector: React.FC<Matrix5x5SelectorProps> = ({
  severity,
  probability,
  actionPriority,
  onChange,
  onPriorityChange,
}) => {
  const currentResult = calculateRiskLevel(severity, probability);
  const currentConfig = RISK_LEVEL_CONFIG[currentResult.level];

  const handleCellClick = (s: number, p: number) => {
    const { score, level } = calculateRiskLevel(s, p);
    onChange(s, p, level, score);
  };

  const getCellColor = (s: number, p: number, isSelected: boolean) => {
    const level = MATRIX_5X5[s]?.[p] || 'MODERADO';
    const config = RISK_LEVEL_CONFIG[level];

    let baseBg = '';
    switch (level) {
      case 'TRIVIAL':
        baseBg = 'bg-emerald-500/80 hover:bg-emerald-500 text-white';
        break;
      case 'TOLERAVEL':
        baseBg = 'bg-lime-500/80 hover:bg-lime-500 text-white';
        break;
      case 'MODERADO':
        baseBg = 'bg-amber-500/85 hover:bg-amber-500 text-white';
        break;
      case 'SUBSTANCIAL':
        baseBg = 'bg-orange-500/90 hover:bg-orange-500 text-white';
        break;
      case 'INTOLERAVEL':
        baseBg = 'bg-rose-600 hover:bg-rose-700 text-white';
        break;
    }

    return cn(
      baseBg,
      isSelected ? 'ring-4 ring-foreground ring-offset-2 scale-105 z-10 font-bold shadow-lg' : 'opacity-85 hover:opacity-100 hover:scale-102'
    );
  };

  return (
    <div className="space-y-4">
      {/* Interactive Matrix Grid */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Matriz de Risco 5x5 (NR-01)
              <span className="text-[11px] font-normal text-muted-foreground">(Clique em uma célula ou ajuste os seletores)</span>
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Classificação:</span>
            <RiskLevelBadge level={currentResult.level} showScore={currentResult.score} size="md" />
          </div>
        </div>

        {/* Matrix Graphic */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[420px]">
            {/* Grid Container */}
            <div className="grid grid-cols-[120px_repeat(5,1fr)] gap-1.5 text-center">
              {/* Top Header Corner */}
              <div className="flex items-center justify-center p-1 text-[11px] font-semibold text-muted-foreground bg-muted/60 rounded-md">
                Severidade \ Prob.
              </div>

              {/* Probability Columns (1 to 5) */}
              {PROBABILITY_SCALE.map((prob) => (
                <div 
                  key={prob.value} 
                  className={cn(
                    "p-1.5 text-[11px] font-bold rounded-md transition-colors",
                    probability === prob.value 
                      ? "bg-primary/15 text-primary border border-primary/30" 
                      : "bg-muted text-muted-foreground"
                  )}
                  title={prob.desc}
                >
                  <div>P{prob.value}</div>
                  <div className="text-[9px] font-normal truncate">{prob.label.split('-')[1]?.trim()}</div>
                </div>
              ))}

              {/* Severity Rows (5 to 1 - Standard Top-down for High Severity) */}
              {[5, 4, 3, 2, 1].map((s) => {
                const sevInfo = SEVERITY_SCALE.find(item => item.value === s);
                return (
                  <React.Fragment key={`row-${s}`}>
                    {/* Severity Header */}
                    <div 
                      className={cn(
                        "flex flex-col justify-center text-left p-1.5 rounded-md text-[11px] font-bold transition-colors",
                        severity === s 
                          ? "bg-primary/15 text-primary border border-primary/30" 
                          : "bg-muted text-muted-foreground"
                      )}
                      title={sevInfo?.desc}
                    >
                      <span>S{s}</span>
                      <span className="text-[9px] font-normal truncate">{sevInfo?.label.split('-')[1]?.trim()}</span>
                    </div>

                    {/* 5 Cells for this Severity */}
                    {[1, 2, 3, 4, 5].map((p) => {
                      const isSelected = severity === s && probability === p;
                      const score = s * p;
                      return (
                        <button
                          key={`cell-${s}-${p}`}
                          type="button"
                          onClick={() => handleCellClick(s, p)}
                          className={cn(
                            "h-11 rounded-lg flex flex-col items-center justify-center transition-all duration-150 cursor-pointer shadow-xs text-xs font-semibold",
                            getCellColor(s, p, isSelected)
                          )}
                        >
                          <span>{score}</span>
                          <span className="text-[8px] uppercase tracking-tighter opacity-80">
                            {MATRIX_5X5[s]?.[p]?.slice(0, 3)}
                          </span>
                        </button>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Severity and Probability Selectors Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
          {/* Probability Detail */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Probabilidade de Ocorrência:</span>
              <span className="text-primary font-bold">P{probability} - {PROBABILITY_SCALE[probability - 1]?.label.split('-')[1]}</span>
            </label>
            <select
              value={probability}
              onChange={(e) => {
                const newP = Number(e.target.value);
                const { score, level } = calculateRiskLevel(severity, newP);
                onChange(severity, newP, level, score);
              }}
              className="w-full text-xs rounded-md border border-input bg-background p-2 focus:ring-1 focus:ring-ring"
            >
              {PROBABILITY_SCALE.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label} - {p.desc}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {PROBABILITY_SCALE[probability - 1]?.desc}
            </p>
          </div>

          {/* Severity Detail */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Severidade / Gravidade do Dano:</span>
              <span className="text-primary font-bold">S{severity} - {SEVERITY_SCALE[severity - 1]?.label.split('-')[1]}</span>
            </label>
            <select
              value={severity}
              onChange={(e) => {
                const newS = Number(e.target.value);
                const { score, level } = calculateRiskLevel(newS, probability);
                onChange(newS, probability, level, score);
              }}
              className="w-full text-xs rounded-md border border-input bg-background p-2 focus:ring-1 focus:ring-ring"
            >
              {SEVERITY_SCALE.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} - {s.desc}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {SEVERITY_SCALE[severity - 1]?.desc}
            </p>
          </div>
        </div>

        {/* Prioridade de ação */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="space-y-1.5 max-w-xs">
            <label className="text-xs font-semibold text-foreground">
              Prioridade de ação:
            </label>
            <select
              value={actionPriority || 'Média'}
              onChange={(e) => onPriorityChange?.(e.target.value)}
              className="w-full text-xs font-medium rounded-md border border-input bg-background p-2 focus:ring-1 focus:ring-ring"
            >
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>

        {/* Action requirement message according to NR-01 */}
        <div className="mt-4 p-3 rounded-lg bg-card border border-border flex items-start gap-2.5">
          <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-foreground">Diretriz de Controle (NR-01.5.5): </strong>
            <span className="text-muted-foreground">{currentConfig.actionRequirement}</span>
            <span className="block text-[11px] text-primary font-medium mt-0.5">
              Prazo limite sugerido para controle: {currentConfig.deadlineDays} dias.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
