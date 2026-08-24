import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { Establishment } from '@/types/pgr';
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
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';

export const EstablishmentsPage: React.FC = () => {
  const { 
    establishments, 
    activeCompany, 
    activeEstablishment, 
    setActiveEstablishment, 
    addEstablishment, 
    updateEstablishment, 
    deleteEstablishment 
  } = usePgr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEst, setEditingEst] = useState<Establishment | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'MATRIZ' | 'FILIAL' | 'OBRA' | 'POSTO_AVANCADO'>('MATRIZ');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SC');
  const [zipCode, setZipCode] = useState('');
  const [managerName, setManagerName] = useState('');
  const [employeeCount, setEmployeeCount] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  const companyEsts = establishments.filter(e => !activeCompany || e.companyId === activeCompany.id);

  const openNewModal = () => {
    setEditingEst(null);
    setName('');
    setCode(`EST-${String(companyEsts.length + 1).padStart(3, '0')}`);
    setType('MATRIZ');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('Joinville');
    setState('SC');
    setZipCode('');
    setManagerName('');
    setEmployeeCount(10);
    setIsModalOpen(true);
  };

  const openEditModal = (est: Establishment) => {
    setEditingEst(est);
    setName(est.name);
    setCode(est.code);
    setType(est.type);
    setStreet(est.address.street);
    setNumber(est.address.number);
    setNeighborhood(est.address.neighborhood);
    setCity(est.address.city);
    setState(est.address.state);
    setZipCode(est.address.zipCode);
    setManagerName(est.managerName || '');
    setEmployeeCount(est.employeeCount);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) {
      alert('Selecione uma empresa ativa.');
      return;
    }
    if (!name.trim() || !code.trim()) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      const estData: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'> = {
        companyId: activeCompany.id,
        name: name.trim(),
        code: code.trim(),
        type,
        address: {
          street: street.trim(),
          number: number.trim(),
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
        },
        managerName: managerName.trim() || undefined,
        employeeCount: Number(employeeCount) || 1,
      };

      if (editingEst) {
        await updateEstablishment(editingEst.id, estData);
      } else {
        await addEstablishment(estData);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar estabelecimento.');
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
              <MapPin className="h-6 w-6 text-emerald-600" />
              Unidades, Filiais & Obras
            </h1>
            <Badge variant="outline" className="text-xs">
              {companyEsts.length} Unidades
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Estabelecimentos avaliados e gerenciados da empresa <strong className="text-foreground">{activeCompany?.name}</strong>
          </p>
        </div>

        <Button
          size="sm"
          onClick={openNewModal}
          className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Unidade</span>
        </Button>
      </div>

      {/* Tabela de Estabelecimentos */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código & Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Responsável Local</TableHead>
              <TableHead className="text-center">Trabalhadores</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companyEsts.map((est) => {
              const isSelected = activeEstablishment?.id === est.id;
              return (
                <TableRow key={est.id} className={isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}>
                  <TableCell className="font-semibold text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{est.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{est.code}</span>
                      </div>
                      {isSelected && (
                        <Badge variant="success" className="text-[9px] px-1.5 py-0">
                          Ativa
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {est.type}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs">
                    {est.managerName || '-'}
                  </TableCell>

                  <TableCell className="text-center text-xs font-bold">
                    {est.employeeCount}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {est.address.city}/{est.address.state}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!isSelected && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveEstablishment(est)}
                          className="h-7 text-[10px] px-2"
                        >
                          Selecionar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditModal(est)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={async () => {
                          if (window.confirm('Excluir este estabelecimento?')) {
                            await deleteEstablishment(est.id);
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
                <MapPin className="h-5 w-5 text-emerald-600" />
                <span>{editingEst ? 'Editar Unidade' : 'Cadastrar Unidade / Estabelecimento'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Defina o local de prestação de serviços para elaboração do PGR.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label className="text-xs">Nome da Unidade / Obra *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Unidade Fabril Matriz"
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Código Identificador *</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: EST-001"
                    required
                    className="h-9 mt-1 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs">Tipo de Estabelecimento</Label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                  >
                    <option value="MATRIZ">Matriz</option>
                    <option value="FILIAL">Filial</option>
                    <option value="OBRA">Canteiro de Obras</option>
                    <option value="POSTO_AVANCADO">Posto Avançado / Cliente</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Responsável Local</Label>
                  <Input
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Ex: Roberto Mendes"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Total de Trabalhadores</Label>
                  <Input
                    type="number"
                    min="1"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Number(e.target.value))}
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs">Endereço (Rua, Número, Bairro)</Label>
                  <Input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ex: Av. Industrial, 1500"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Cidade</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Joinville"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">UF</Label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="SC"
                    className="h-9 mt-1 text-xs uppercase font-mono"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="font-semibold shadow-sm">
                  {isSaving ? 'Salvando...' : editingEst ? 'Salvar Alterações' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
