import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { Professional } from '@/types/pgr';
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
import { Award, Plus, Edit, Trash2, Mail, Phone, ShieldCheck, X } from 'lucide-react';

export const ProfessionalsPage: React.FC = () => {
  const { professionals, addProfessional, updateProfessional, deleteProfessional } = usePgr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<Professional | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState<'ENGENHEIRO_SEGURANCA' | 'TECNICO_SEGURANCA' | 'MEDICO_TRABALHO' | 'HIGIENISTA_OCUPACIONAL' | string>('ENGENHEIRO_SEGURANCA');
  const [qualifications, setQualifications] = useState<string[]>(['Engenheiro de Seg. do Trabalho']);
  const [customQualifInput, setCustomQualifInput] = useState('');
  const [registrationCouncil, setRegistrationCouncil] = useState('CREA/SC');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [registrationState, setRegistrationState] = useState('SC');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const STANDARD_QUALIFICATIONS = [
    'Engenheiro de Segurança do Trabalho',
    'Engenheiro Eletricista / Eletrônico',
    'Higienista Ocupacional',
    'Perito Judicial Trabalhista',
    'Médico do Trabalho',
    'Técnico de Seg. do Trabalho',
    'Ergonomista',
  ];

  const maskCPF = (val: string) => {
    return val
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const loadFerrariPreset = () => {
    setName('Fernando Guimarães Ferrari');
    setRole('ENGENHEIRO_SEGURANCA');
    setQualifications([
      'Engenheiro de Segurança do Trabalho',
      'Engenheiro Eletricista / Eletrônico',
      'Higienista Ocupacional',
      'Perito Judicial Trabalhista'
    ]);
    setRegistrationCouncil('CREA');
    setRegistrationNumber('5060011940 / Visto 5060011940SP');
    setRegistrationState('SP');
    setCpf('132.188.318-81');
    setEmail('contato@esengenharia.com.br');
    setPhone('(11) 4496-4320');
  };

  const toggleQualification = (qualif: string) => {
    setQualifications(prev => {
      if (prev.includes(qualif)) {
        const next = prev.filter(q => q !== qualif);
        return next.length > 0 ? next : prev; // manter pelo menos 1
      } else {
        return [...prev, qualif];
      }
    });
  };

  const handleAddCustomQualification = () => {
    if (!customQualifInput.trim()) return;
    const trimmed = customQualifInput.trim();
    if (!qualifications.includes(trimmed)) {
      setQualifications(prev => [...prev, trimmed]);
    }
    setCustomQualifInput('');
  };

  const openNewModal = () => {
    setEditingProf(null);
    setName('');
    setRole('ENGENHEIRO_SEGURANCA');
    setQualifications(['Engenheiro de Segurança do Trabalho']);
    setCustomQualifInput('');
    setRegistrationCouncil('CREA/SC');
    setRegistrationNumber('');
    setRegistrationState('SC');
    setCpf('');
    setEmail('');
    setPhone('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Professional) => {
    setEditingProf(p);
    setName(p.name);
    setRole(p.role);
    if (p.qualifications && p.qualifications.length > 0) {
      setQualifications(p.qualifications);
    } else {
      const defaultQ = p.role === 'ENGENHEIRO_SEGURANCA'
        ? 'Engenheiro de Segurança do Trabalho'
        : p.role === 'MEDICO_TRABALHO'
        ? 'Médico do Trabalho'
        : p.role === 'TECNICO_SEGURANCA'
        ? 'Técnico de Seg. do Trabalho'
        : 'Higienista Ocupacional';
      setQualifications([defaultQ]);
    }
    setCustomQualifInput('');
    setRegistrationCouncil(p.registrationCouncil);
    setRegistrationNumber(p.registrationNumber);
    setRegistrationState(p.registrationState);
    setCpf(p.cpf || '');
    setEmail(p.email || '');
    setPhone(p.phone || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !registrationNumber.trim()) {
      alert('Nome e número de registro no conselho são obrigatórios.');
      return;
    }

    if (qualifications.length === 0) {
      alert('Selecione ao menos uma qualificação técnica.');
      return;
    }

    setIsSaving(true);
    try {
      const profData: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        role: role as any,
        qualifications,
        registrationCouncil: registrationCouncil.trim(),
        registrationNumber: registrationNumber.trim(),
        registrationState: registrationState.trim(),
        artRrt: editingProf?.artRrt || undefined,
        cpf: cpf.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      };

      if (editingProf) {
        await updateProfessional(editingProf.id, profData);
      } else {
        await addProfessional(profData);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar profissional.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'ENGENHEIRO_SEGURANCA':
        return <Badge variant="success" className="text-[10px]">Engenheiro de Segurança (CREA)</Badge>;
      case 'MEDICO_TRABALHO':
        return <Badge variant="info" className="text-[10px]">Médico do Trabalho (CRM)</Badge>;
      case 'TECNICO_SEGURANCA':
        return <Badge variant="warning" className="text-[10px]">Técnico de Segurança (MTE)</Badge>;
      case 'HIGIENISTA_OCUPACIONAL':
      default:
        return <Badge variant="outline" className="text-[10px]">Higienista Ocupacional</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Award className="h-6 w-6 text-emerald-600" />
              Profissionais Técnicos Habilitados (RT)
            </h1>
            <Badge variant="outline" className="text-xs">
              {professionals.length} Cadastrados
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Engenheiros, técnicos e médicos responsáveis pela elaboração e coordenação técnica do PGR.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openNewModal}
          className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Profissional</span>
        </Button>
      </div>

      {/* Tabela de Profissionais */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profissional</TableHead>
              <TableHead>Qualificação Técnica</TableHead>
              <TableHead>Registro de Classe</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professionals.map((prof) => (
              <TableRow key={prof.id}>
                <TableCell className="font-bold text-xs text-foreground">
                  <div className="flex flex-col">
                    <span>{prof.name}</span>
                    {prof.email && (
                      <span className="text-[10px] font-normal text-muted-foreground">{prof.email}</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {prof.qualifications && prof.qualifications.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {prof.qualifications.map((q, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-foreground font-medium">
                          {q}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    getRoleBadge(prof.role)
                  )}
                </TableCell>

                <TableCell className="text-xs font-mono font-semibold">
                  <div>{prof.registrationCouncil}: {prof.registrationNumber}/{prof.registrationState}</div>
                  {prof.cpf && <div className="text-[11px] text-muted-foreground font-normal">CPF: {prof.cpf}</div>}
                </TableCell>

                <TableCell className="text-xs text-muted-foreground">
                  {prof.phone || '-'}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditModal(prof)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={async () => {
                        if (window.confirm('Excluir este profissional?')) {
                          await deleteProfessional(prof.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-emerald-600" />
                  <span>{editingProf ? 'Editar Profissional RT' : 'Cadastrar Responsável Técnico'}</span>
                </DialogTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadFerrariPreset}
                  className="text-xs h-7 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/40 cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                  Carregar Dados Oficiais (Fernando G. Ferrari)
                </Button>
              </div>
              <DialogDescription className="text-xs">
                Registro profissional e dados para assinatura e coordenação técnica do PGR.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label className="text-xs">Nome Completo *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Eng. Fernando Henrique Bittencourt"
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div className="md:col-span-2 space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">Qualificações / Cargos Habilitados *</Label>
                    <span className="text-[11px] text-muted-foreground">Pode selecionar múltiplas</span>
                  </div>
                  
                  {/* Tags de seleção rápida */}
                  <div className="flex flex-wrap gap-1.5">
                    {STANDARD_QUALIFICATIONS.map((qualif) => {
                      const isSelected = qualifications.includes(qualif);
                      return (
                        <button
                          key={qualif}
                          type="button"
                          onClick={() => {
                            toggleQualification(qualif);
                            if (qualif.includes('Engenheiro')) {
                              setRole('ENGENHEIRO_SEGURANCA');
                              setRegistrationCouncil('CREA');
                            } else if (qualif.includes('Médico')) {
                              setRole('MEDICO_TRABALHO');
                              setRegistrationCouncil('CRM');
                            } else if (qualif.includes('Técnico')) {
                              setRole('TECNICO_SEGURANCA');
                              setRegistrationCouncil('MTE');
                            }
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-2xs font-semibold'
                              : 'bg-background border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {qualif}
                        </button>
                      );
                    })}
                  </div>

                  {/* Campo para adicionar qualificação personalizada */}
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      value={customQualifInput}
                      onChange={(e) => setCustomQualifInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomQualification();
                        }
                      }}
                      placeholder="Outra qualificação personalizada (ex: Especialista em Ruído)..."
                      className="h-8 text-xs flex-1 bg-background"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustomQualification}
                      className="h-8 text-xs shrink-0"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  {/* Lista de selecionadas com botão de remoção */}
                  {qualifications.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-border/60">
                      <span className="text-[11px] font-medium text-muted-foreground mr-1">Selecionadas:</span>
                      {qualifications.map((q) => (
                        <Badge key={q} variant="secondary" className="text-[11px] gap-1 pl-2 pr-1 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <span>{q}</span>
                          <button
                            type="button"
                            onClick={() => toggleQualification(q)}
                            className="hover:text-destructive cursor-pointer ml-0.5 p-0.5 rounded-full hover:bg-emerald-200/50"
                            title="Remover qualificação"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Conselho Profissional</Label>
                  <Input
                    value={registrationCouncil}
                    onChange={(e) => setRegistrationCouncil(e.target.value)}
                    placeholder="Ex: CREA/SC ou CRM/SC"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Número de Registro no Conselho *</Label>
                  <Input
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="Ex: 5060011940 / Visto 5060011940SP"
                    required
                    className="h-9 mt-1 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs">UF do Registro</Label>
                  <Input
                    value={registrationState}
                    onChange={(e) => setRegistrationState(e.target.value)}
                    placeholder="SP"
                    className="h-9 mt-1 text-xs uppercase font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs">CPF do Responsável Técnico</Label>
                  <Input
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    placeholder="132.188.318-81"
                    maxLength={14}
                    className="h-9 mt-1 text-xs font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs">E-mail Profissional</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engenheiro@sstbrasil.com.br"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Telefone / WhatsApp</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 4496-4320"
                    className="h-9 mt-1 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="font-semibold shadow-sm">
                  {isSaving ? 'Salvando...' : editingProf ? 'Salvar Alterações' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
