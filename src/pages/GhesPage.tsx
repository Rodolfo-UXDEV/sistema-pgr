import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { GHE } from '@/types/pgr';
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
import { Users, Plus, Edit, Trash2 } from 'lucide-react';

export const GhesPage: React.FC = () => {
  const { 
    ghes, 
    sectors, 
    positions, 
    establishments, 
    activeCompany, 
    activeEstablishment, 
    addGhe, 
    updateGhe, 
    deleteGhe 
  } = usePgr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGhe, setEditingGhe] = useState<GHE | null>(null);

  const [establishmentId, setEstablishmentId] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [code, setCode] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [workerCount, setWorkerCount] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const companyEstablishments = establishments.filter(e => !activeCompany || e.companyId === activeCompany.id);
  const currentGhes = ghes.filter(g => companyEstablishments.some(e => e.id === g.establishmentId));
  const availableSectors = sectors.filter(s => !establishmentId || s.establishmentId === establishmentId);
  const availablePositions = positions.filter(p => !sectorId || p.sectorId === sectorId);

  const openNewModal = () => {
    setEditingGhe(null);
    const firstEst = activeEstablishment?.id || companyEstablishments[0]?.id || '';
    setEstablishmentId(firstEst);
    const firstSec = sectors.find(s => s.establishmentId === firstEst)?.id || '';
    setSectorId(firstSec);
    setCode(`GES-0${currentGhes.length + 1}`);
    setSelectedPositions([]);
    setWorkerCount(1);
    setIsModalOpen(true);
  };

  const openEditModal = (ghe: GHE) => {
    setEditingGhe(ghe);
    setEstablishmentId(ghe.establishmentId);
    setSectorId(ghe.sectorId);
    setCode((ghe.code || '').replace(/\bGHE\b/gi, 'GES').replace(/GHE-/gi, 'GES-'));
    setSelectedPositions(ghe.positionIds || []);
    setWorkerCount(ghe.workerCount);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId || !sectorId || !code.trim()) {
      alert('Preencha os campos obrigatórios (Código, Estabelecimento e Setor do GES).');
      return;
    }

    setIsSaving(true);
    try {
      const sanitizedCode = code.trim().replace(/\bGHE\b/gi, 'GES').replace(/GHE-/gi, 'GES-');

      const gheData: Omit<GHE, 'id' | 'createdAt' | 'updatedAt'> = {
        establishmentId,
        sectorId,
        code: sanitizedCode,
        name: sanitizedCode,
        description: '',
        positionIds: selectedPositions,
        workerCount: Number(workerCount) || 1,
      };

      if (editingGhe) {
        await updateGhe(editingGhe.id, gheData);
      } else {
        await addGhe(gheData);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar GES.');
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
              <Users className="h-6 w-6 text-emerald-600" />
              Grupos de Exposição Similar (GES)
            </h1>
            <Badge variant="outline" className="text-xs">
              {currentGhes.length} GESs
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Agrupamento de trabalhadores submetidos a condições e perigos similares para fins da NR-01.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openNewModal}
          className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar GES</span>
        </Button>
      </div>

      {/* Tabela de GESs */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código do GES</TableHead>
              <TableHead>Setor / Lotação</TableHead>
              <TableHead className="text-center">Trabalhadores</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentGhes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground text-xs">
                  Nenhum Grupo de Exposição Similar (GES) cadastrado para este estabelecimento.
                </TableCell>
              </TableRow>
            ) : (
              currentGhes.map((ghe) => {
                const sec = sectors.find(s => s.id === ghe.sectorId);
                const displayCode = (ghe.code || '').replace(/\bGHE\b/gi, 'GES').replace(/GHE-/gi, 'GES-');

                return (
                  <TableRow key={ghe.id}>
                    <TableCell className="font-semibold text-xs">
                      <span className="font-bold text-foreground font-mono text-emerald-700 dark:text-emerald-400">{displayCode}</span>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {sec?.name || '-'}
                    </TableCell>

                    <TableCell className="text-center text-xs font-bold">
                      {ghe.workerCount}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditModal(ghe)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={async () => {
                            if (window.confirm('Excluir este GES?')) {
                              await deleteGhe(ghe.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-emerald-600" />
                <span>{editingGhe ? 'Editar GES' : 'Cadastrar Novo GES'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Agrupamento por semelhança de perigos e ambiente de trabalho.
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
                  <Label className="text-xs font-semibold">Setor *</Label>
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
                  <Label className="text-xs font-semibold">Código do GES *</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: GES-01"
                    required
                    className="h-9 mt-1 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Quantidade Total de Expostos</Label>
                  <Input
                    type="number"
                    min="1"
                    value={workerCount}
                    onChange={(e) => setWorkerCount(Number(e.target.value))}
                    className="h-9 mt-1 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="font-semibold shadow-xs">
                  {isSaving ? 'Salvando...' : editingGhe ? 'Salvar Alterações' : 'Cadastrar GES'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
