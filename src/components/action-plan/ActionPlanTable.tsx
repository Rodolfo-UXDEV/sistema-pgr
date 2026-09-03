import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { ActionPlanItem, ActionStatus } from '@/types/pgr';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Plus, Edit, Trash2, CheckCircle, AlertCircle, Clock, CheckSquare } from 'lucide-react';
import { ActionPlanModal } from '@/components/action-plan/ActionPlanModal';

export const ActionPlanTable: React.FC = () => {
  const { actionPlans, activeCompany, activeEstablishment, deleteActionPlan, updateActionPlan } = usePgr();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionPlanItem | null>(null);

  const filteredActions = actionPlans.filter((a) => {
    if (activeCompany && a.companyId !== activeCompany.id) return false;
    if (activeEstablishment && a.establishmentId !== activeEstablishment.id) return false;

    if (selectedStatus !== 'ALL' && a.status !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchWhat = a.what.toLowerCase().includes(term);
      const matchWhy = a.why.toLowerCase().includes(term);
      const matchWho = a.who.toLowerCase().includes(term);
      const matchWhere = a.whereLoc.toLowerCase().includes(term);
      return matchWhat || matchWhy || matchWho || matchWhere;
    }

    return true;
  });

  const handleEdit = (item: ActionPlanItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja excluir esta ação do plano de gerenciamento?')) {
      await deleteActionPlan(id);
    }
  };

  const handleQuickStatusToggle = async (item: ActionPlanItem) => {
    const nextStatus: ActionStatus = item.status === 'CONCLUIDA' ? 'EM_ANDAMENTO' : 'CONCLUIDA';
    await updateActionPlan(item.id, {
      status: nextStatus,
      completionDate: nextStatus === 'CONCLUIDA' ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  const getStatusBadge = (status: ActionStatus, whenDate: string) => {
    const isDelayed = status !== 'CONCLUIDA' && new Date(whenDate) < new Date();
    if (isDelayed || status === 'ATRASADA') {
      return <Badge variant="danger" className="text-[10px]">Atrasada</Badge>;
    }
    switch (status) {
      case 'CONCLUIDA':
        return <Badge variant="success" className="text-[10px]">Concluída</Badge>;
      case 'EM_ANDAMENTO':
        return <Badge variant="info" className="text-[10px]">Em Andamento</Badge>;
      case 'CANCELADA':
        return <Badge variant="destructive" className="text-[10px]">Cancelada</Badge>;
      case 'NAO_INICIADA':
      default:
        return <Badge variant="secondary" className="text-[10px]">Não Iniciada</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por o quê, por que, quem ou onde..."
            className="pl-9 text-xs h-9 bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 text-xs rounded-md border border-input bg-background focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">Todos os Status</option>
            <option value="NAO_INICIADA">Não Iniciada</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDA">Concluída</option>
            <option value="ATRASADA">Atrasada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>

          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Ação</span>
          </Button>
        </div>
      </div>

      {/* Tabela 5W2H */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">OK</TableHead>
              <TableHead className="min-w-[200px]">O que fazer? (What)</TableHead>
              <TableHead className="min-w-[180px]">Por que? (Why)</TableHead>
              <TableHead>Onde? (Where)</TableHead>
              <TableHead>Quem? (Who)</TableHead>
              <TableHead>Quando? (When)</TableHead>
              <TableHead className="text-right">Custo (How Much)</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground text-xs">
                  Nenhuma ação encontrada para os filtros ativos.
                </TableCell>
              </TableRow>
            ) : (
              filteredActions.map((action) => (
                <TableRow key={action.id} className={action.status === 'CONCLUIDA' ? 'bg-muted/20 opacity-80' : ''}>
                  <TableCell className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleQuickStatusToggle(action)}
                      className="p-1 rounded hover:bg-muted"
                      title={action.status === 'CONCLUIDA' ? 'Marcar como Em Andamento' : 'Marcar como Concluída'}
                    >
                      <CheckCircle 
                        className={`h-4 w-4 ${action.status === 'CONCLUIDA' ? 'text-emerald-600 fill-emerald-100 dark:fill-emerald-950' : 'text-muted-foreground'}`} 
                      />
                    </button>
                  </TableCell>

                  <TableCell className="font-semibold text-xs text-foreground">
                    <div>
                      <span>{action.what}</span>
                      {action.priority && (
                        <Badge 
                          variant={action.priority === 'Urgente' ? 'destructive' : action.priority === 'Alta' ? 'warning' : 'outline'} 
                          className="ml-1.5 text-[9px] px-1 py-0"
                        >
                          {action.priority}
                        </Badge>
                      )}
                      {action.efficacyVerified && (
                        <Badge variant="success" className="ml-1.5 text-[9px] px-1 py-0">
                          Eficácia OK
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {action.why}
                  </TableCell>

                  <TableCell className="text-xs">
                    <span className="font-medium text-foreground">{action.whereLoc}</span>
                  </TableCell>

                  <TableCell className="text-xs">
                    <span className="font-medium text-foreground">{action.who}</span>
                  </TableCell>

                  <TableCell className="text-xs">
                    <span className="font-mono text-muted-foreground text-[11px]">
                      {action.startDate ? `${formatDate(action.startDate)} - ${formatDate(action.whenDate)}` : formatDate(action.whenDate)}
                    </span>
                  </TableCell>

                  <TableCell className="text-right text-xs font-mono font-medium">
                    {action.howMuch ? formatCurrency(action.howMuch) : '-'}
                  </TableCell>

                  <TableCell className="text-center">
                    {getStatusBadge(action.status, action.whenDate)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(action)}
                        title="Editar ação"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(action.id)}
                        title="Excluir ação"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
