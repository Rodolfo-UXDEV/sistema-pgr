import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { ActionPlanItem, ActionStatus } from '@/types/pgr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus, Clock, User, DollarSign, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ActionPlanModal } from '@/components/action-plan/ActionPlanModal';

export const ActionPlanKanban: React.FC = () => {
  const { actionPlans, activeCompany, activeEstablishment, updateActionPlan } = usePgr();
  const [editingItem, setEditingItem] = useState<ActionPlanItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const companyActions = actionPlans.filter(
    a => (!activeCompany || a.companyId === activeCompany.id) &&
         (!activeEstablishment || a.establishmentId === activeEstablishment.id)
  );

  const columns: { status: ActionStatus; title: string; color: string; badgeVariant: 'secondary' | 'info' | 'success' }[] = [
    { status: 'NAO_INICIADA', title: 'A Fazer / Não Iniciadas', color: 'border-t-muted-foreground', badgeVariant: 'secondary' },
    { status: 'EM_ANDAMENTO', title: 'Em Execução / Andamento', color: 'border-t-sky-500', badgeVariant: 'info' },
    { status: 'CONCLUIDA', title: 'Concluídas & Eficácia', color: 'border-t-emerald-500', badgeVariant: 'success' },
  ];

  const handleMove = async (item: ActionPlanItem, newStatus: ActionStatus) => {
    await updateActionPlan(item.id, {
      status: newStatus,
      completionDate: newStatus === 'CONCLUIDA' ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(({ status, title, color, badgeVariant }) => {
        const columnItems = companyActions.filter(a => a.status === status);

        return (
          <div key={status} className="flex flex-col bg-muted/40 rounded-xl border border-border p-3 space-y-3">
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-foreground">{title}</span>
              <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
                {columnItems.length}
              </Badge>
            </div>

            {/* Cards List */}
            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {columnItems.length === 0 ? (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-border/60 rounded-lg text-[11px] text-muted-foreground">
                  Nenhuma ação nesta coluna
                </div>
              ) : (
                columnItems.map((action) => {
                  const isDelayed = action.status !== 'CONCLUIDA' && new Date(action.whenDate) < new Date();

                  return (
                    <Card
                      key={action.id}
                      className={`shadow-xs border-border hover:shadow-md transition-all cursor-pointer border-t-4 ${
                        status === 'CONCLUIDA' ? 'border-t-emerald-500 bg-card/80' : status === 'EM_ANDAMENTO' ? 'border-t-sky-500' : 'border-t-muted-foreground'
                      }`}
                      onClick={() => {
                        setEditingItem(action);
                        setIsModalOpen(true);
                      }}
                    >
                      <CardContent className="p-3.5 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-foreground leading-snug line-clamp-2">
                            {action.what}
                          </p>
                          {isDelayed && (
                            <Badge variant="danger" className="text-[9px] shrink-0">
                              Atrasada
                            </Badge>
                          )}
                        </div>

                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {action.why}
                        </p>

                        <div className="pt-1 space-y-1 text-[11px] text-muted-foreground border-t border-border/60">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 truncate">
                              <User className="h-3 w-3" />
                              <span className="truncate">{action.who}</span>
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(action.whenDate)}</span>
                            </span>
                          </div>

                          {action.howMuch ? (
                            <div className="flex items-center justify-between font-mono text-[10px]">
                              <span>Investimento:</span>
                              <span className="font-bold text-foreground">{formatCurrency(action.howMuch)}</span>
                            </div>
                          ) : null}
                        </div>

                        {/* Quick Shift buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/40" onClick={(e) => e.stopPropagation()}>
                          {status !== 'NAO_INICIADA' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-[10px] gap-1"
                              onClick={() => handleMove(action, status === 'CONCLUIDA' ? 'EM_ANDAMENTO' : 'NAO_INICIADA')}
                            >
                              <ArrowLeft className="h-3 w-3" /> Voltar
                            </Button>
                          ) : <div />}

                          {status !== 'CONCLUIDA' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px] gap-1 text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 ml-auto"
                              onClick={() => handleMove(action, status === 'NAO_INICIADA' ? 'EM_ANDAMENTO' : 'CONCLUIDA')}
                            >
                              Avançar <ArrowRight className="h-3 w-3" />
                            </Button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 ml-auto">
                              <CheckCircle2 className="h-3 w-3" /> Concluído
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {/* Modal */}
      {isModalOpen && (
        <ActionPlanModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          initialItem={editingItem}
        />
      )}
    </div>
  );
};
