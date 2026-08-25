import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { PGRDocument, PgrDocumentStatus } from '@/types/pgr';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import { formatDate } from '@/lib/utils';
import { generatePgrPdf } from '@/lib/pdf-generator';
import { generatePgrDocx } from '@/lib/docx-generator';
import { generatePgrFromMasterTemplate } from '@/lib/docx-template-engine';
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  CheckCircle, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  Award,
  Clock,
  FileCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PgrDocumentsPage: React.FC = () => {
  const { 
    pgrDocuments, 
    activeCompany, 
    activeEstablishment, 
    establishments, 
    sectors, 
    positions, 
    ghes, 
    professionals, 
    riskInventory, 
    actionPlans, 
    addPgrDocument, 
    updatePgrDocument, 
    deletePgrDocument,
    setActivePgr
  } = usePgr();

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<PGRDocument | null>(null);

  // Form states
  const [establishmentId, setEstablishmentId] = useState('');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('1.0');
  const [year, setYear] = useState(new Date().getFullYear());
  const [validityStart, setValidityStart] = useState('');
  const [validityEnd, setValidityEnd] = useState('');
  const [status, setStatus] = useState<PgrDocumentStatus>('DRAFT');
  const [technicalResponsibleId, setTechnicalResponsibleId] = useState('');
  const [medicalResponsibleId, setMedicalResponsibleId] = useState('');
  const [generalObjectives, setGeneralObjectives] = useState('');
  const [methodologyDescription, setMethodologyDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const companyDocs = pgrDocuments.filter(d => !activeCompany || d.companyId === activeCompany.id);
  const companyEstablishments = establishments.filter(e => !activeCompany || e.companyId === activeCompany.id);

  const openNewDocModal = () => {
    setEditingDoc(null);
    setEstablishmentId(activeEstablishment?.id || companyEstablishments[0]?.id || '');
    setCode(`PGR-${new Date().getFullYear()}-${String(companyDocs.length + 1).padStart(3, '0')}`);
    setTitle(`Programa de Gerenciamento de Riscos - ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
    setVersion('1.0');
    setYear(new Date().getFullYear());
    setValidityStart(new Date().toISOString().split('T')[0]);
    setValidityEnd(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setStatus('DRAFT');
    setTechnicalResponsibleId(professionals.find(p => p.role === 'ENGENHEIRO_SEGURANCA' || p.role === 'TECNICO_SEGURANCA')?.id || '');
    setMedicalResponsibleId(professionals.find(p => p.role === 'MEDICO_TRABALHO')?.id || '');
    setGeneralObjectives('Estabelecer diretrizes e requisitos para o gerenciamento de riscos ocupacionais e medidas de prevenção em SST na empresa, em cumprimento à NR-01.');
    setMethodologyDescription('Utilização da Matriz de Risco 5x5 (Severidade x Probabilidade) com inventário de riscos ocupacionais e plano de ação estruturado em 5W2H.');
    setIsModalOpen(true);
  };

  const openEditModal = (doc: PGRDocument) => {
    setEditingDoc(doc);
    setEstablishmentId(doc.establishmentId);
    setCode(doc.code);
    setTitle(doc.title);
    setVersion(doc.version);
    setYear(doc.year);
    setValidityStart(doc.validityStart);
    setValidityEnd(doc.validityEnd);
    setStatus(doc.status);
    setTechnicalResponsibleId(doc.technicalResponsibleId || '');
    setMedicalResponsibleId(doc.medicalResponsibleId || '');
    setGeneralObjectives(doc.generalObjectives);
    setMethodologyDescription(doc.methodologyDescription);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) {
      alert('Selecione uma empresa.');
      return;
    }
    if (!establishmentId || !code.trim() || !title.trim()) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      const docData: Omit<PGRDocument, 'id' | 'createdAt' | 'updatedAt'> = {
        companyId: activeCompany.id,
        establishmentId,
        code: code.trim(),
        title: title.trim(),
        version: version.trim() || '1.0',
        year: Number(year),
        validityStart,
        validityEnd,
        status,
        elaborationDate: editingDoc ? editingDoc.elaborationDate : new Date().toISOString().split('T')[0],
        technicalResponsibleId: technicalResponsibleId || undefined,
        medicalResponsibleId: medicalResponsibleId || undefined,
        generalObjectives: generalObjectives.trim(),
        methodologyDescription: methodologyDescription.trim(),
        scopeDescription: 'Abrangência total dos postos e instalações da unidade avaliada.',
        responsibilitiesMatrix: 'Empregador, SESMT, CIPA e Empregados conforme NR-01.',
      };

      if (editingDoc) {
        await updatePgrDocument(editingDoc.id, docData);
      } else {
        await addPgrDocument(docData);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar documento do PGR.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = (doc: PGRDocument) => {
    if (!activeCompany) return;
    const est = establishments.find(e => e.id === doc.establishmentId) || establishments[0];
    generatePgrPdf({
      company: activeCompany,
      establishment: est,
      pgr: doc,
      sectors,
      positions,
      ghes,
      professionals,
      riskInventory,
      actionPlans,
    });
  };

  const handleDownloadDocx = async (doc: PGRDocument) => {
    if (!activeCompany) return;
    const est = establishments.find(e => e.id === doc.establishmentId) || establishments[0];
    const ctx = {
      company: activeCompany,
      establishment: est,
      pgr: doc,
      sectors,
      positions,
      ghes,
      professionals,
      riskInventory,
      actionPlans,
    };
    try {
      await generatePgrDocx(ctx);
    } catch (err) {
      console.error('Erro ao gerar DOCX:', err);
      alert('Erro ao gerar arquivo Word.');
    }
  };

  const getStatusBadge = (status: PgrDocumentStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success" className="text-[10px]">Vigente / Aprovado</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="warning" className="text-[10px]">Em Revisão</Badge>;
      case 'ARCHIVED':
        return <Badge variant="secondary" className="text-[10px]">Arquivado / Histórico</Badge>;
      case 'DRAFT':
      default:
        return <Badge variant="outline" className="text-[10px]">Rascunho</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-600" />
              Documentos & Emissões do PGR
            </h1>
            <Badge variant="outline" className="text-xs">
              NR-01.5.3
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Controle de versões, vigências, emissão formal e exportação para PDF técnico da empresa{' '}
            <strong className="text-foreground">{activeCompany?.name}</strong>
          </p>
        </div>

        <Button
          size="sm"
          onClick={openNewDocModal}
          className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Nova Versão do PGR</span>
        </Button>
      </div>

      {/* Tabela de Documentos PGR */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código & Título</TableHead>
              <TableHead>Unidade / Estabelecimento</TableHead>
              <TableHead className="text-center">Versão</TableHead>
              <TableHead>Vigência</TableHead>
              <TableHead>Responsável Técnico (RT)</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações & Exportação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companyDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                  Nenhum documento PGR gerado para esta empresa.
                </TableCell>
              </TableRow>
            ) : (
              companyDocs.map((doc) => {
                const est = establishments.find(e => e.id === doc.establishmentId);
                const techResp = professionals.find(p => p.id === doc.technicalResponsibleId);

                return (
                  <TableRow key={doc.id}>
                    <TableCell className="font-semibold text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{doc.code}</span>
                        <span className="text-[11px] text-muted-foreground">{doc.title}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <span className="font-medium text-foreground">{est?.name || 'Matriz Geral'}</span>
                    </TableCell>

                    <TableCell className="text-center text-xs font-mono font-bold">
                      v{doc.version}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {formatDate(doc.validityStart)} a {formatDate(doc.validityEnd)}
                    </TableCell>

                    <TableCell className="text-xs">
                      {techResp ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{techResp.name}</span>
                          <span className="text-[10px] text-muted-foreground">{techResp.registrationCouncil}: {techResp.registrationNumber}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {getStatusBadge(doc.status)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActivePgr(doc);
                            navigate(`/documentos-pgr/${doc.id}`);
                          }}
                          className="h-8 text-xs gap-1"
                          title="Visualizar documento completo na tela"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Visualizar</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleDownloadPdf(doc)}
                          className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          title="Baixar PDF Oficial"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>PDF</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadDocx(doc)}
                          className="h-8 text-xs gap-1 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 font-semibold"
                          title="Baixar Word (.docx)"
                        >
                          <FileCode className="h-3.5 w-3.5" />
                          <span>DOCX</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditModal(doc)}
                          title="Editar metadados do documento"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={async () => {
                            if (window.confirm('Excluir esta versão do PGR?')) {
                              await deletePgrDocument(doc.id);
                            }
                          }}
                          title="Excluir"
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

      {/* Modal de Criação / Edição do Documento PGR */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-emerald-600" />
                <span>{editingDoc ? 'Editar Documento PGR' : 'Elaborar Nova Versão do PGR (NR-01)'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Defina o código, vigência, responsáveis técnicos e diretrizes gerais do programa.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <Label className="text-xs">Status do Documento</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PgrDocumentStatus)}
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring font-semibold"
                  >
                    <option value="DRAFT">Rascunho (Em Elaboração)</option>
                    <option value="IN_REVIEW">Em Revisão Técnica</option>
                    <option value="APPROVED">Aprovado / Vigente Oficial</option>
                    <option value="ARCHIVED">Arquivado / Histórico</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Código do Documento *</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: PGR-2026-001"
                    required
                    className="h-9 mt-1 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs">Número da Versão</Label>
                  <Input
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="Ex: 1.0"
                    className="h-9 mt-1 text-xs font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs">Título do Programa *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Programa de Gerenciamento de Riscos - Matriz 2026"
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Início da Vigência *</Label>
                  <Input
                    type="date"
                    value={validityStart}
                    onChange={(e) => setValidityStart(e.target.value)}
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Fim da Vigência *</Label>
                  <Input
                    type="date"
                    value={validityEnd}
                    onChange={(e) => setValidityEnd(e.target.value)}
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Responsável Técnico (Eng./Téc. Segurança)</Label>
                  <select
                    value={technicalResponsibleId}
                    onChange={(e) => setTechnicalResponsibleId(e.target.value)}
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Selecione o Profissional RT...</option>
                    {professionals.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role} - {p.registrationCouncil})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Médico Coordenador do PCMSO</Label>
                  <select
                    value={medicalResponsibleId}
                    onChange={(e) => setMedicalResponsibleId(e.target.value)}
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Selecione o Médico...</option>
                    {professionals.filter(p => p.role === 'MEDICO_TRABALHO').map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (CRM: {p.registrationNumber})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Objetivos Gerais (NR-01)</Label>
                <Textarea
                  value={generalObjectives}
                  onChange={(e) => setGeneralObjectives(e.target.value)}
                  className="mt-1 text-xs min-h-[60px]"
                />
              </div>

              <div>
                <Label className="text-xs">Descrição da Metodologia de Avaliação</Label>
                <Textarea
                  value={methodologyDescription}
                  onChange={(e) => setMethodologyDescription(e.target.value)}
                  className="mt-1 text-xs min-h-[60px]"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="font-semibold shadow-sm">
                  {isSaving ? 'Salvando...' : editingDoc ? 'Salvar Alterações' : 'Criar Documento'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
