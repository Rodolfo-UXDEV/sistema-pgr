import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { Sector } from '@/types/pgr';
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
  const [description, setDescription] = useState('');
  const [floorType, setFloorType] = useState('Concreto polido');
  const [wallType, setWallType] = useState('Alvenaria rebocada e pintada');
  const [roofType, setRoofType] = useState('Estrutura metálica com telhas termoacústicas');
  const [ventilationType, setVentilationType] = useState<'NATURAL' | 'ARTIFICIAL' | 'MISTA'>('MISTA');
  const [lightingType, setLightingType] = useState<'NATURAL' | 'ARTIFICIAL' | 'MISTA'>('MISTA');
  const [isSaving, setIsSaving] = useState(false);

  const companyEstablishments = establishments.filter(e => !activeCompany || e.companyId === activeCompany.id);
  const currentSectors = sectors.filter(s => companyEstablishments.some(e => e.id === s.establishmentId));

  const openNewModal = () => {
    setEditingSector(null);
    setEstablishmentId(activeEstablishment?.id || companyEstablishments[0]?.id || '');
    setName('');
    setDescription('');
    setFloorType('Concreto industrial');
    setWallType('Alvenaria');
    setRoofType('Telhas metálicas');
    setVentilationType('MISTA');
    setLightingType('MISTA');
    setIsModalOpen(true);
  };

  const openEditModal = (sec: Sector) => {
    setEditingSector(sec);
    setEstablishmentId(sec.establishmentId);
    setName(sec.name);
    setDescription(sec.description);
    setFloorType(sec.physicalCharacteristics.floorType);
    setWallType(sec.physicalCharacteristics.wallType);
    setRoofType(sec.physicalCharacteristics.roofType);
    setVentilationType(sec.physicalCharacteristics.ventilationType);
    setLightingType(sec.physicalCharacteristics.lightingType);
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
        description: description.trim(),
        physicalCharacteristics: {
          floorType: floorType.trim(),
          wallType: wallType.trim(),
          roofType: roofType.trim(),
          ventilationType,
          lightingType,
        },
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
            Caracterização física e ambiental dos locais de trabalho da empresa <strong className="text-foreground">{activeCompany?.name}</strong>
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

      {/* Tabela de Setores */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setor / Ambiente</TableHead>
              <TableHead>Estabelecimento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Ventilação & Iluminação</TableHead>
              <TableHead>Piso & Cobertura</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSectors.map((sec) => {
              const est = establishments.find(e => e.id === sec.establishmentId);
              return (
                <TableRow key={sec.id}>
                  <TableCell className="font-bold text-xs text-foreground">
                    {sec.name}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {est?.name || '-'}
                  </TableCell>

                  <TableCell className="text-xs max-w-[250px] truncate" title={sec.description}>
                    {sec.description || 'Ambiente fabril / operacional'}
                  </TableCell>

                  <TableCell className="text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      Vent: <strong>{sec.physicalCharacteristics.ventilationType}</strong> • Ilum: <strong>{sec.physicalCharacteristics.lightingType}</strong>
                    </span>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    <span className="text-[11px]">
                      {sec.physicalCharacteristics.floorType} / {sec.physicalCharacteristics.roofType}
                    </span>
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
                <Layers className="h-5 w-5 text-emerald-600" />
                <span>{editingSector ? 'Editar Setor' : 'Cadastrar Setor / Ambiente'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Caracterização física do ambiente conforme a NR-01.5.7.1.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
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

                <div className="md:col-span-2">
                  <Label className="text-xs">Nome do Setor / Ambiente *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Usinagem e Torneamento CNC"
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs">Descrição das Atividades no Setor</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva as características operacionais gerais do ambiente..."
                    className="mt-1 text-xs min-h-[50px]"
                  />
                </div>

                <div>
                  <Label className="text-xs">Tipo de Piso</Label>
                  <Input
                    value={floorType}
                    onChange={(e) => setFloorType(e.target.value)}
                    placeholder="Ex: Concreto polido"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Tipo de Paredes</Label>
                  <Input
                    value={wallType}
                    onChange={(e) => setWallType(e.target.value)}
                    placeholder="Ex: Alvenaria"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Tipo de Cobertura / Teto</Label>
                  <Input
                    value={roofType}
                    onChange={(e) => setRoofType(e.target.value)}
                    placeholder="Ex: Telhas metálicas"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Ventilação</Label>
                  <select
                    value={ventilationType}
                    onChange={(e) => setVentilationType(e.target.value as any)}
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                  >
                    <option value="NATURAL">Natural</option>
                    <option value="ARTIFICIAL">Artificial (Exaustores / AC)</option>
                    <option value="MISTA">Mista (Natural + Exaustão)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Iluminação</Label>
                  <select
                    value={lightingType}
                    onChange={(e) => setLightingType(e.target.value as any)}
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                  >
                    <option value="NATURAL">Natural</option>
                    <option value="ARTIFICIAL">Artificial (Lâmpadas LED)</option>
                    <option value="MISTA">Mista</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="font-semibold shadow-sm">
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
