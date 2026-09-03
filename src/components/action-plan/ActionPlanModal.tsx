import React, { useState, useEffect } from 'react';
import { usePgr } from '@/context/PgrContext';
import { ActionPlanItem, ActionStatus } from '@/types/pgr';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CheckSquare, DollarSign, Calendar, User, MapPin } from 'lucide-react';

interface ActionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: ActionPlanItem | null;
}

export const ActionPlanModal: React.FC<ActionPlanModalProps> = ({
  isOpen,
  onClose,
  initialItem,
}) => {
  const { 
    activeCompany, 
    activeEstablishment, 
    activePgr, 
    riskInventory, 
    addActionPlan, 
    updateActionPlan 
  } = usePgr();

  const [riskInventoryId, setRiskInventoryId] = useState('');
  const [what, setWhat] = useState('');
  const [why, setWhy] = useState('');
  const [whereLoc, setWhereLoc] = useState('');
  const [who, setWho] = useState('');
  const [startDate, setStartDate] = useState('');
  const [whenDate, setWhenDate] = useState('');
  const [priority, setPriority] = useState<string>('Média');
  const [how, setHow] = useState('');
  const [howMuch, setHowMuch] = useState<number>(0);
  const [status, setStatus] = useState<ActionStatus>('NAO_INICIADA');
  const [completionDate, setCompletionDate] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [efficacyVerified, setEfficacyVerified] = useState(false);
  const [efficacyNotes, setEfficacyNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const companyRisks = riskInventory.filter(
    r => !activeCompany || r.companyId === activeCompany.id
  );

  useEffect(() => {
    if (initialItem) {
      setRiskInventoryId(initialItem.riskInventoryId || '');
      setWhat(initialItem.what);
      setWhy(initialItem.why);
      setWhereLoc(initialItem.whereLoc);
      setWho(initialItem.who);
      setStartDate(initialItem.startDate || '');
      setWhenDate(initialItem.whenDate);
      setPriority(initialItem.priority || 'Média');
      setHow(initialItem.how);
      setHowMuch(initialItem.howMuch || 0);
      setStatus(initialItem.status);
      setCompletionDate(initialItem.completionDate || '');
      setEvidenceNotes(initialItem.evidenceNotes || '');
      setEfficacyVerified(Boolean(initialItem.efficacyVerified));
      setEfficacyNotes(initialItem.efficacyNotes || '');
    } else {
      setRiskInventoryId('');
      setWhat('');
      setWhy('');
      setWhereLoc(activeEstablishment?.name || '');
      setWho(activeEstablishment?.managerName || '');
      setStartDate(new Date().toISOString().split('T')[0]);
      setWhenDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setPriority('Média');
      setHow('');
      setHowMuch(0);
      setStatus('NAO_INICIADA');
      setCompletionDate('');
      setEvidenceNotes('');
      setEfficacyVerified(false);
      setEfficacyNotes('');
    }
  }, [initialItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || !activeEstablishment || !activePgr) {
      alert('Selecione uma empresa, estabelecimento e PGR ativos.');
      return;
    }
    if (!what.trim() || !why.trim() || !whereLoc.trim() || !who.trim() || !whenDate) {
      alert('Por favor, preencha todos os campos obrigatórios da metodologia 5W2H.');
      return;
    }

    setIsSaving(true);
    try {
      const planData: Omit<ActionPlanItem, 'id' | 'createdAt' | 'updatedAt'> = {
        pgrId: activePgr.id,
        companyId: activeCompany.id,
        establishmentId: activeEstablishment.id,
        riskInventoryId: riskInventoryId || undefined,
        what: what.trim(),
        why: why.trim(),
        whereLoc: whereLoc.trim(),
        who: who.trim(),
        startDate: startDate || undefined,
        whenDate,
        priority: priority || 'Média',
        how: how.trim() || 'Conforme especificação técnica',
        howMuch: Number(howMuch) || 0,
        status,
        completionDate: status === 'CONCLUIDA' ? (completionDate || new Date().toISOString().split('T')[0]) : undefined,
        evidenceNotes: evidenceNotes.trim() || undefined,
        efficacyVerified,
        efficacyNotes: efficacyNotes.trim() || undefined,
      };

      if (initialItem) {
        await updateActionPlan(initialItem.id, planData);
      } else {
        await addActionPlan(planData);
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar item do plano de ação.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CheckSquare className="h-5 w-5 text-emerald-600" />
            <span>{initialItem ? 'Editar Ação do PGR (5W2H)' : 'Nova Ação no Plano de Ação (NR-01.5.5)'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Estrutura metodológica 5W2H para controle, eliminação e mitigação de perigos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Vínculo com Risco */}
          <div>
            <Label className="text-xs">Vincular a um Risco do Inventário (Opcional)</Label>
            <select
              value={riskInventoryId}
              onChange={(e) => {
                const rId = e.target.value;
                setRiskInventoryId(rId);
                const r = riskInventory.find(item => item.id === rId);
                if (r && !what) {
                  setWhat(`Controle de ${r.hazardName}: implementar medidas de proteção`);
                  setWhy(`Mitigar risco classificado como ${r.riskLevel} na matriz.`);
                }
              }}
              className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
            >
              <option value="">Ação Geral / Sem vínculo direto</option>
              {companyRisks.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.riskLevel}] {r.hazardName} ({r.sourceDescription.slice(0, 40)}...)
                </option>
              ))}
            </select>
          </div>

          {/* 5W2H Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* What */}
            <div className="md:col-span-2">
              <Label className="text-xs font-bold text-foreground">
                WHAT? - O que será feito? (Ação Preventiva/Corretiva) *
              </Label>
              <Input
                value={what}
                onChange={(e) => setWhat(e.target.value)}
                placeholder="Ex: Instalar linha de vida fixa na cobertura do galpão"
                required
                className="h-9 mt-1 text-xs"
              />
            </div>

            {/* Why */}
            <div className="md:col-span-2">
              <Label className="text-xs font-bold text-foreground">
                WHY? - Por que será feito? (Justificativa / Redução de Risco) *
              </Label>
              <Textarea
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder="Ex: Eliminar o risco de queda em altura durante a manutenção de calhas (NR-35)"
                required
                className="mt-1 text-xs min-h-[50px]"
              />
            </div>

            {/* Where */}
            <div>
              <Label className="text-xs font-bold text-foreground">
                WHERE? - Onde será feito? (Local / Setor) *
              </Label>
              <Input
                value={whereLoc}
                onChange={(e) => setWhereLoc(e.target.value)}
                placeholder="Ex: Cobertura do Galpão Industrial"
                required
                className="h-9 mt-1 text-xs"
              />
            </div>

            {/* Who */}
            <div>
              <Label className="text-xs font-bold text-foreground">
                WHO? - Quem é o responsável? (Nome / Cargo) *
              </Label>
              <Input
                value={who}
                onChange={(e) => setWho(e.target.value)}
                placeholder="Ex: Eng. Roberto / Coord. de Manutenção"
                required
                className="h-9 mt-1 text-xs"
              />
            </div>

            {/* Prazo Inicial e Prazo Final */}
            <div>
              <Label className="text-xs font-bold text-foreground">
                Prazo Inicial (Data de Início)
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-foreground">
                WHEN? - Prazo Final / Término *
              </Label>
              <Input
                type="date"
                value={whenDate}
                onChange={(e) => setWhenDate(e.target.value)}
                required
                className="h-9 mt-1 text-xs"
              />
            </div>

            {/* Priority */}
            <div>
              <Label className="text-xs font-bold text-foreground">
                Grau de Prioridade (NR-01)
              </Label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring font-medium"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            {/* How Much */}
            <div>
              <Label className="text-xs font-bold text-foreground">
                HOW MUCH? - Custo / Investimento Estimado (R$)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={howMuch}
                onChange={(e) => setHowMuch(Number(e.target.value))}
                placeholder="0.00"
                className="h-9 mt-1 text-xs font-mono"
              />
            </div>

            {/* How */}
            <div className="md:col-span-2">
              <Label className="text-xs font-bold text-foreground">
                HOW? - Como será feito? (Procedimento / Etapas)
              </Label>
              <Textarea
                value={how}
                onChange={(e) => setHow(e.target.value)}
                placeholder="Ex: Contratação de empresa especializada com ART, fixação de pontos de ancoragem e teste de tração..."
                className="mt-1 text-xs min-h-[50px]"
              />
            </div>
          </div>

          {/* Status & Eficácia */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Acompanhamento & Ciclo PDCA
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Status da Ação</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ActionStatus)}
                  className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring font-semibold"
                >
                  <option value="NAO_INICIADA">Não Iniciada</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="CONCLUIDA">Concluída</option>
                  <option value="ATRASADA">Atrasada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              {status === 'CONCLUIDA' && (
                <div>
                  <Label className="text-xs">Data Efetiva de Conclusão</Label>
                  <Input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="h-9 mt-1 text-xs"
                  />
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs">Evidências / Observações de Execução</Label>
              <Input
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                placeholder="Ex: Relatório fotográfico arquivado, laudo de ancoragem ART nº 12345..."
                className="h-8 text-xs mt-1"
              />
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Verificação de Eficácia (NR-01.5.5.2)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Confirmou-se que a medida eliminou ou reduziu o risco ao nível aceitável?
                </span>
              </div>
              <Switch checked={efficacyVerified} onCheckedChange={setEfficacyVerified} />
            </div>

            {efficacyVerified && (
              <div>
                <Label className="text-xs">Parecer Técnico da Eficácia</Label>
                <Input
                  value={efficacyNotes}
                  onChange={(e) => setEfficacyNotes(e.target.value)}
                  placeholder="Ex: Nova medição indicou ruído de 74 dB(A), abaixo do nível de ação."
                  className="h-8 text-xs mt-1"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="font-semibold shadow-sm">
              {isSaving ? 'Salvando...' : initialItem ? 'Salvar Alterações' : 'Criar Ação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
