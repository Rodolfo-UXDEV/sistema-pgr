import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { Sector } from '@/types/pgr';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Layers, Plus, Edit, Trash2 } from 'lucide-react';

export const SectorsPage: React.FC = () => {
  const { 
    sectors, 
    establishments, 
    activeCompany, 
    activeEstablishment, 
    addSector, 
    updateSector, 
    deleteSector 
  } = usePgr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);

  const [establishmentId, setEstablishmentId] = useState('');
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const companyEstablishments = establishments.filter(e => !activeCompany || e.companyId === activeCompany.id);
  const currentSectors = sectors.filter(s => companyEstablishments.some(e => e.id === s.establishmentId));

  const openNewModal = () => {
    setEditingSector(null);
    setEstablishmentId(activeEstablishment?.id || companyEstablishments[0]?.id || '');
    setName('');
    setIsModalOpen(true);
  };

  const openEditModal = (sec: Sector) => {
    setEditingSector(sec);
    setEstablishmentId(sec.establishmentId);
    setName(sec.name);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId || !name.trim()) {
      alert('Selecione o estabelecimento e informe o nome do setor.');
      return;
    }

    setIsSaving(true);
    try {
      const sectorData: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'> = {
        establishmentId,
        name: name.trim(),
        description: editingSector?.description,
        physicalCharacteristics: editingSector?.physicalCharacteristics,
      };

      if (editingSector) {
        await updateSector(editingSector.id, sectorData);
      } else {
        await addSector(sectorData);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar setor.');
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
              <Layers className="h-6 w-6 text-emerald-600" />
              Setores & Ambientes de Trabalho
            </h1>
            <Badge variant="outline" className="text-xs">
              {currentSectors.length} Setores
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Cadastro de setores e ambientes de trabalho da empresa <strong className="text-foreground">{activeCompany?.name}</strong>
          </p>
        </div>

        <Button
          size="sm"
          onClick={openNewModal}
          className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Setor</span>
        </Button>
      </div>

      {/* Tabela de Setores Simplificada */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setor / Ambiente</TableHead>
              <TableHead>Unidade / Estabelecimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-xs text-muted-foreground">
                  Nenhum setor cadastrado para esta empresa.
                </TableCell>
              </TableRow>
            ) : (
              currentSectors.map((sec) => {
                const est = establishments.find(e => e.id === sec.establishmentId);
                return (
                  <TableRow key={sec.id}>
                    <TableCell className="font-bold text-xs text-foreground">
                      {sec.name}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {est?.name || '-'}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditModal(sec)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={async () => {
                            if (window.confirm('Excluir este setor e todos os riscos vinculados?')) {
                              await deleteSector(sec.id);
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

      {/* Modal Simplificada */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-emerald-600" />
                <span>{editingSector ? 'Editar Setor' : 'Cadastrar Setor / Ambiente'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Informe a unidade e o nome do setor ou ambiente de trabalho.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Unidade / Estabelecimento *</Label>
                  <select
                    value={establishmentId}
                    onChange={(e) => setEstablishmentId(e.target.value)}
                    required
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                  >
                    {companyEstablishments.map((est) => (
                      <option key={est.id} value={est.id}>{est.name} ({est.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Nome do Setor / Ambiente *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Usinagem e Torneamento CNC"
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="font-semibold shadow-xs">
                  {isSaving ? 'Salvando...' : editingSector ? 'Salvar Alterações' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
