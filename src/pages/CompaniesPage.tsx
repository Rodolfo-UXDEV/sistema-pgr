import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { Company } from '@/types/pgr';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import { formatCNPJ, maskCNPJ } from '@/lib/utils';
import { Building2, Plus, Edit, Trash2, Check, Users, MapPin } from 'lucide-react';

export const CompaniesPage: React.FC = () => {
  const { companies, activeCompany, setActiveCompany, addCompany, updateCompany, deleteCompany } = usePgr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cnae, setCnae] = useState('');
  const [cnaeDescription, setCnaeDescription] = useState('');
  const [riskGrade, setRiskGrade] = useState<1 | 2 | 3 | 4>(2);
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SC');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [legalRepresentative, setLegalRepresentative] = useState('');
  const [representativeRole, setRepresentativeRole] = useState('Diretor');
  const [employeeCount, setEmployeeCount] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  const openNewModal = () => {
    setEditingCompany(null);
    setName('');
    setTradeName('');
    setCnpj('');
    setCnae('25.39-0-01');
    setCnaeDescription('Serviços de usinagem e tornearia');
    setRiskGrade(3);
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('');
    setState('SC');
    setZipCode('');
    setPhone('');
    setEmail('');
    setLegalRepresentative('');
    setRepresentativeRole('Diretor');
    setEmployeeCount(10);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Company) => {
    setEditingCompany(c);
    setName(c.name);
    setTradeName(c.tradeName || '');
    setCnpj(c.cnpj);
    setCnae(c.cnae);
    setCnaeDescription(c.cnaeDescription);
    setRiskGrade(c.riskGrade);
    setStreet(c.address.street);
    setNumber(c.address.number);
    setNeighborhood(c.address.neighborhood);
    setCity(c.address.city);
    setState(c.address.state);
    setZipCode(c.address.zipCode);
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setLegalRepresentative(c.legalRepresentative);
    setRepresentativeRole(c.representativeRole);
    setEmployeeCount(c.employeeCount);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cnpj.trim()) {
      alert('Nome e CNPJ são obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      const companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        tradeName: tradeName.trim() || undefined,
        cnpj: cnpj.trim(),
        cnae: cnae.trim(),
        cnaeDescription: cnaeDescription.trim(),
        riskGrade,
        address: {
          street: street.trim(),
          number: number.trim(),
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
        },
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        legalRepresentative: legalRepresentative.trim() || 'Representante Legal',
        representativeRole: representativeRole.trim() || 'Diretor',
        employeeCount: Number(employeeCount) || 1,
      };

      if (editingCompany) {
        await updateCompany(editingCompany.id, companyData);
      } else {
        await addCompany(companyData);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar empresa.');
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
              <Building2 className="h-6 w-6 text-emerald-600" />
              Empresas & Clientes
            </h1>
            <Badge variant="outline" className="text-xs">
              {companies.length} Cadastradas
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Gerenciamento de empresas contratantes, CNAE, grau de risco (NR-04) e dados societários.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openNewModal}
          className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Empresa</span>
        </Button>
      </div>

      {/* Tabela de Empresas */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>CNAE & Atividade</TableHead>
              <TableHead className="text-center">Grau de Risco</TableHead>
              <TableHead className="text-center">Empregados</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((comp) => {
              const isSelected = activeCompany?.id === comp.id;
              return (
                <TableRow key={comp.id} className={isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}>
                  <TableCell className="font-semibold text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{comp.tradeName || comp.name}</span>
                        <span className="text-[10px] text-muted-foreground">{comp.name}</span>
                      </div>
                      {isSelected && (
                        <Badge variant="success" className="text-[9px] px-1.5 py-0">
                          Ativa
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs font-mono font-bold">
                    {formatCNPJ(comp.cnpj)}
                  </TableCell>

                  <TableCell className="text-xs">
                    <div className="flex flex-col max-w-[200px]">
                      <span className="font-mono font-semibold">{comp.cnae}</span>
                      <span className="text-[10px] text-muted-foreground truncate" title={comp.cnaeDescription}>
                        {comp.cnaeDescription}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant={comp.riskGrade >= 3 ? 'danger' : 'outline'} className="text-[10px]">
                      Grau {comp.riskGrade}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center text-xs font-bold">
                    {comp.employeeCount}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {comp.address.city}/{comp.address.state}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!isSelected && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveCompany(comp)}
                          className="h-7 text-[10px] px-2"
                        >
                          Selecionar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditModal(comp)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={async () => {
                          if (window.confirm('Excluir esta empresa e todos os seus dados associados?')) {
                            await deleteCompany(comp.id);
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-emerald-600" />
                <span>{editingCompany ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Dados cadastrais e enquadramento de grau de risco da NR-04.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. CNPJ */}
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">CNPJ *</Label>
                  <Input
                    value={cnpj}
                    onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                    placeholder="00.000.000/0001-00"
                    required
                    maxLength={18}
                    className="h-9 mt-1 text-xs font-mono"
                  />
                </div>

                {/* 2. RAZÃO SOCIAL */}
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Razão Social *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Indústria Metalúrgica Horizonte Ltda"
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                {/* 3. NOME FANTASIA */}
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Nome Fantasia</Label>
                  <Input
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="Ex: Horizonte Industrial"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                {/* 4. ENDEREÇO */}
                <div className="md:col-span-2 space-y-2 bg-muted/40 p-3 rounded-lg border border-border/60">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Endereço Completo</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-2">
                      <Input
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Logradouro, número, bairro (Ex: Av. das Indústrias, 1500)"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Cidade"
                        className="h-9 text-xs flex-1"
                      />
                      <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="UF"
                        maxLength={2}
                        className="h-9 text-xs w-14 uppercase font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. CNAE PRINCIPAL */}
                <div>
                  <Label className="text-xs font-semibold">Código CNAE Principal</Label>
                  <Input
                    value={cnae}
                    onChange={(e) => setCnae(e.target.value)}
                    placeholder="Ex: 25.39-0-01"
                    className="h-9 mt-1 text-xs font-mono"
                  />
                </div>

                {/* 6. GRAU DE RISCO */}
                <div>
                  <Label className="text-xs font-semibold">Grau de Risco (NR-04)</Label>
                  <select
                    value={riskGrade}
                    onChange={(e) => setRiskGrade(Number(e.target.value) as 1 | 2 | 3 | 4)}
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring font-bold"
                  >
                    <option value={1}>Grau 1 (Muito Baixo)</option>
                    <option value={2}>Grau 2 (Baixo / Comércio / Serviços)</option>
                    <option value={3}>Grau 3 (Médio / Indústrias Gerais)</option>
                    <option value={4}>Grau 4 (Alto / Mineração / Químicos)</option>
                  </select>
                </div>

                {/* DESCRIÇÃO DO CNAE */}
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Descrição da Atividade Econômica (CNAE)</Label>
                  <Input
                    value={cnaeDescription}
                    onChange={(e) => setCnaeDescription(e.target.value)}
                    placeholder="Ex: Serviços de usinagem, tornearia e solda"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                {/* 7. REPRESENTANTE LEGAL */}
                <div>
                  <Label className="text-xs font-semibold">Representante Legal</Label>
                  <Input
                    value={legalRepresentative}
                    onChange={(e) => setLegalRepresentative(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silveira"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                {/* 8. CARGO DO REPRESENTANTE */}
                <div>
                  <Label className="text-xs font-semibold">Cargo do Representante</Label>
                  <Input
                    value={representativeRole}
                    onChange={(e) => setRepresentativeRole(e.target.value)}
                    placeholder="Ex: Diretor Industrial"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                {/* 9. TOTAL DE EMPREGADOS */}
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Total de Empregados</Label>
                  <Input
                    type="number"
                    min="1"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Number(e.target.value))}
                    className="h-9 mt-1 text-xs max-w-xs"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="font-semibold shadow-xs">
                  {isSaving ? 'Salvando...' : editingCompany ? 'Salvar Alterações' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
