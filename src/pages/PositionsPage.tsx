import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { Position } from '@/types/pgr';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Briefcase, Plus, Edit, Trash2 } from 'lucide-react';

export const PositionsPage: React.FC = () => {
  const { 
    positions, 
    sectors, 
    establishments, 
    activeCompany, 
    activeEstablishment, 
    addPosition, 
    updatePosition, 
    deletePosition 
  } = usePgr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);

  const [establishmentId, setEstablishmentId] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [title, setTitle] = useState('');
  const [cbo, setCbo] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [workerCount, setWorkerCount] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const companyEstablishments = establishments.filter(e => !activeCompany || e.companyId === activeCompany.id);
  const currentPositions = positions.filter(p => companyEstablishments.some(e => e.id === p.establishmentId));
  const availableSectors = sectors.filter(s => !establishmentId || s.establishmentId === establishmentId);

  const openNewModal = () => {
    setEditingPos(null);
    const firstEst = activeEstablishment?.id || companyEstablishments[0]?.id || '';
    setEstablishmentId(firstEst);
    const firstSec = sectors.find(s => s.establishmentId === firstEst)?.id || '';
    setSectorId(firstSec);
    setTitle('');
    setCbo('7212-15');
    setActivityDescription('');
    setWorkerCount(1);
    setIsModalOpen(true);
  };

  const openEditModal = (pos: Position) => {
    setEditingPos(pos);
    setEstablishmentId(pos.establishmentId);
    setSectorId(pos.sectorId);
    setTitle(pos.title);
    setCbo(pos.cbo);
    setActivityDescription(pos.activityDescription || pos.routineActivities || pos.description || '');
    setWorkerCount(pos.workerCount);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId || !sectorId || !title.trim() || !activityDescription.trim()) {
      alert('Preencha os campos obrigatórios (Estabelecimento, Setor, Cargo e Descrição da Atividade).');
      return;
    }

    setIsSaving(true);
    try {
      const posData: Omit<Position, 'id' | 'createdAt' | 'updatedAt'> = {
        establishmentId,
        sectorId,
        title: title.trim(),
        cbo: cbo.trim() || '9999-99',
        activityDescription: activityDescription.trim(),
        routineActivities: activityDescription.trim(), // Retrocompatibilidade
        workerCount: Number(workerCount) || 1,
      };

      if (editingPos) {
        await updatePosition(editingPos.id, posData);
      } else {
        await addPosition(posData);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cargo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-emerald-600" />
              Cargos, Funções & CBOs
            </h1>
            <Badge variant="outline" className="text-xs">
              {currentPositions.length} Cargos
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Descrição detalhada de atribuições e tarefas rotineiras/não rotineiras da empresa <strong className="text-foreground">{activeCompany?.name}</strong>
          </p>
        </div>

        <Button
          size="sm"
          onClick={openNewModal}
          className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Cargo</span>
        </Button>
      </div>

      {/* Tabela de Cargos */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cargo / Função</TableHead>
              <TableHead>CBO</TableHead>
              <TableHead>Setor / Lotação</TableHead>
              <TableHead className="text-center">Qtd. Trab.</TableHead>
              <TableHead>Descrição da Atividade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPositions.map((pos) => {
              const sec = sectors.find(s => s.id === pos.sectorId);

              return (
                <TableRow key={pos.id}>
                  <TableCell className="font-bold text-xs text-foreground">
                    {pos.title}
                  </TableCell>

                  <TableCell className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {pos.cbo}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {sec?.name || '-'}
                  </TableCell>

                  <TableCell className="text-center text-xs font-bold">
                    {pos.workerCount}
                  </TableCell>

                  <TableCell 
                    className="text-xs text-muted-foreground max-w-[320px] truncate" 
                    title={pos.activityDescription || pos.routineActivities || pos.description || '-'}
                  >
                    {pos.activityDescription || pos.routineActivities || pos.description || '-'}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditModal(pos)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={async () => {
                          if (window.confirm('Excluir este cargo?')) {
                            await deletePosition(pos.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                <span>{editingPos ? 'Editar Cargo' : 'Cadastrar Novo Cargo'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Mapeamento das atividades para análise de exposição a riscos.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Unidade / Estabelecimento *</Label>
                  <select
                    value={establishmentId}
                    onChange={(e) => setEstablishmentId(e.target.value)}
                    required
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                  >
                    {companyEstablishments.map((est) => (
                      <option key={est.id} value={est.id}>{est.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Setor de Lotação *</Label>
                  <select
                    value={sectorId}
                    onChange={(e) => setSectorId(e.target.value)}
                    required
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Selecione o Setor</option>
                    {availableSectors.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Título do Cargo / Função *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Torneiro Mecânico CNC"
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Código CBO *</Label>
                  <Input
                    value={cbo}
                    onChange={(e) => setCbo(e.target.value)}
                    placeholder="Ex: 7212-15"
                    required
                    className="h-9 mt-1 text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Número de Trabalhadores</Label>
                  <Input
                    type="number"
                    min="1"
                    value={workerCount}
                    onChange={(e) => setWorkerCount(Number(e.target.value))}
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Descrição da Atividade *</Label>
                  <Textarea
                    value={activityDescription}
                    onChange={(e) => setActivityDescription(e.target.value)}
                    placeholder="Descreva detalhadamente as atividades e tarefas executadas pelo cargo..."
                    required
                    rows={4}
                    className="mt-1 text-xs min-h-[90px]"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="font-semibold shadow-xs">
                  {isSaving ? 'Salvando...' : editingPos ? 'Salvar Alterações' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
