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
import { Award, Plus, Edit, Trash2, Mail, Phone, ShieldCheck } from 'lucide-react';

export const ProfessionalsPage: React.FC = () => {
  const { professionals, addProfessional, updateProfessional, deleteProfessional } = usePgr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<Professional | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState<'ENGENHEIRO_SEGURANCA' | 'TECNICO_SEGURANCA' | 'MEDICO_TRABALHO' | 'HIGIENISTA_OCUPACIONAL'>('ENGENHEIRO_SEGURANCA');
  const [registrationCouncil, setRegistrationCouncil] = useState('CREA/SC');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [registrationState, setRegistrationState] = useState('SC');
  const [artRrt, setArtRrt] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openNewModal = () => {
    setEditingProf(null);
    setName('');
    setRole('ENGENHEIRO_SEGURANCA');
    setRegistrationCouncil('CREA/SC');
    setRegistrationNumber('');
    setRegistrationState('SC');
    setArtRrt('');
    setEmail('');
    setPhone('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Professional) => {
    setEditingProf(p);
    setName(p.name);
    setRole(p.role);
    setRegistrationCouncil(p.registrationCouncil);
    setRegistrationNumber(p.registrationNumber);
    setRegistrationState(p.registrationState);
    setArtRrt(p.artRrt || '');
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

    setIsSaving(true);
    try {
      const profData: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        role,
        registrationCouncil: registrationCouncil.trim(),
        registrationNumber: registrationNumber.trim(),
        registrationState: registrationState.trim(),
        artRrt: artRrt.trim() || undefined,
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
            Engenheiros, técnicos e médicos responsáveis pela elaboração, ART e coordenação técnica do PGR.
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
              <TableHead>ART / RRT</TableHead>
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
                  {getRoleBadge(prof.role)}
                </TableCell>

                <TableCell className="text-xs font-mono font-semibold">
                  {prof.registrationCouncil}: {prof.registrationNumber}/{prof.registrationState}
                </TableCell>

                <TableCell className="text-xs font-mono text-muted-foreground">
                  {prof.artRrt || '-'}
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
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-emerald-600" />
                <span>{editingProf ? 'Editar Profissional RT' : 'Cadastrar Responsável Técnico'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Registro profissional e dados para assinatura e emissão de ART do PGR.
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

                <div>
                  <Label className="text-xs">Qualificação / Função</Label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value as any;
                      setRole(newRole);
                      if (newRole === 'ENGENHEIRO_SEGURANCA') setRegistrationCouncil('CREA');
                      if (newRole === 'MEDICO_TRABALHO') setRegistrationCouncil('CRM');
                      if (newRole === 'TECNICO_SEGURANCA') setRegistrationCouncil('MTE');
                    }}
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                  >
                    <option value="ENGENHEIRO_SEGURANCA">Engenheiro de Seg. do Trabalho</option>
                    <option value="TECNICO_SEGURANCA">Técnico de Seg. do Trabalho</option>
                    <option value="MEDICO_TRABALHO">Médico do Trabalho</option>
                    <option value="HIGIENISTA_OCUPACIONAL">Higienista Ocupacional</option>
                  </select>
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
                    placeholder="Ex: 089452-1"
                    required
                    className="h-9 mt-1 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs">UF do Registro</Label>
                  <Input
                    value={registrationState}
                    onChange={(e) => setRegistrationState(e.target.value)}
                    placeholder="SC"
                    className="h-9 mt-1 text-xs uppercase font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs">Número da ART / RRT (CREA / CAU)</Label>
                  <Input
                    value={artRrt}
                    onChange={(e) => setArtRrt(e.target.value)}
                    placeholder="Ex: ART-2026-9812440-SC"
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
                    placeholder="(47) 99876-5432"
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
