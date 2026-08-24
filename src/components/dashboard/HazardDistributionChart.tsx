import React from 'react';
import { usePgr } from '@/context/PgrContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
import { HazardCategory } from '@/types/pgr';
import { Progress } from '@/components/ui/progress';

export const HazardDistributionChart: React.FC = () => {
  const { riskInventory, activeCompany } = usePgr();

  const companyRisks = riskInventory.filter(r => !activeCompany || r.companyId === activeCompany.id);
  const total = companyRisks.length || 1;

  const categories: HazardCategory[] = ['FISICO', 'QUIMICO', 'BIOLOGICO', 'ERGONOMICO', 'ACIDENTE'];

  const categoryCounts = categories.map(cat => {
    const count = companyRisks.filter(r => r.hazardCategory === cat).length;
    const percentage = Math.round((count / total) * 100);
    return {
      category: cat,
      config: HAZARD_CATEGORY_CONFIG[cat],
      count,
      percentage,
    };
  });

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Riscos por Grupo Ocupacional</CardTitle>
        <CardDescription className="text-xs">
          Classificação conforme as 5 categorias da NR-01 / eSocial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryCounts.map(({ category, config, count, percentage }) => (
          <div key={category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground flex items-center gap-2">
                <span 
                  className="h-2.5 w-2.5 rounded-full inline-block"
                  style={{ backgroundColor: config.color }} 
                />
                {config.label}
              </span>
              <span className="font-bold text-muted-foreground">
                {count} {count === 1 ? 'risco' : 'riscos'} ({percentage}%)
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: config.color 
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
