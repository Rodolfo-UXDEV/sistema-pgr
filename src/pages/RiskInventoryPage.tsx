import React, { useState, useMemo } from 'react';
import { usePgr } from '@/context/PgrContext';
import { GHE } from '@/types/pgr';
import { RiskInventoryTable } from '@/components/inventory/RiskInventoryTable';
import { RiskFormModal } from '@/components/inventory/RiskFormModal';
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
import { 
  ShieldCheck, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  GripVertical, 
  ArrowLeft, 
  Download, 
  Info,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { generatePgrPdf } from '@/lib/pdf-generator';

export const RiskInventoryPage: React.FC = () => {
  const { 
    activeCompany, 
    activeEstablishment, 
    establishments,
    sectors,
    positions,
    ghes,
    professionals,
    riskInventory,
    actionPlans,
    activePgr,
    pgrDocuments,
    stats,
    addGhe,
    updateGhe,
    deleteGhe,
    duplicateGhe,
    reorderGhes
  } = usePgr();

  // Estado de navegação interna: se selecionado, exibe os riscos do GES; se nulo, exibe a grid de GESs
  const [selectedGheId, setSelectedGheId] = useState<string | null>(null);

  // Estados do Modal de GES
  const [isGesModalOpen, setIsGesModalOpen] = useState(false);
  const [editingGhe, setEditingGhe] = useState<GHE | null>(null);
  const [establishmentId, setEstablishmentId] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [code, setCode] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [workerCount, setWorkerCount] = useState(1);
  const [isSavingGes, setIsSavingGes] = useState(false);

  // Modal de Adicionar Risco direto no GES ativo
  const [isAddRiskModalOpen, setIsAddRiskModalOpen] = useState(false);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  const companyEstablishments = useMemo(
    () => establishments.filter(e => !activeCompany || e.companyId === activeCompany.id),
    [establishments, activeCompany]
  );

  // Lista de GESs ordenados sequencialmente para o estabelecimento ativo
  const currentGhes = useMemo(() => {
    const list = ghes.filter(g => companyEstablishments.some(e => e.id === g.establishmentId));
    return [...list].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return (a.code || '').localeCompare(b.code || '', undefined, { numeric: true });
    });
  }, [ghes, companyEstablishments]);

  const availableSectors = useMemo(
    () => sectors.filter(s => !establishmentId || s.establishmentId === establishmentId),
    [sectors, establishmentId]
  );

  const availablePositions = useMemo(
    () => positions.filter(p => !sectorId || p.sectorId === sectorId),
    [positions, sectorId]
  );

  const selectedGhe = useMemo(
    () => ghes.find(g => g.id === selectedGheId) || null,
    [ghes, selectedGheId]
  );

  const selectedGheSector = useMemo(
    () => sectors.find(s => s.id === selectedGhe?.sectorId),
    [sectors, selectedGhe]
  );

  const selectedGheRisks = useMemo(
    () => riskInventory.filter(r => r.gheId === selectedGheId),
    [riskInventory, selectedGheId]
  );

  // Função geradora de código sequencial de GES (ex: GES-01, GES-02, GES-03...)
  const generateNextGesCode = () => {
    let maxNum = 0;
    currentGhes.forEach(g => {
      const match = (g.code || '').match(/(?:GES|GHE)-?0*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `GES-${String(maxNum + 1).padStart(2, '0')}`;
  };

  const openNewGesModal = () => {
    setEditingGhe(null);
    const firstEst = activeEstablishment?.id || companyEstablishments[0]?.id || '';
    setEstablishmentId(firstEst);
    const firstSec = sectors.find(s => s.establishmentId === firstEst)?.id || '';
    setSectorId(firstSec);
    setCode(generateNextGesCode());
    setSelectedPositions([]);
    setWorkerCount(1);
    setIsGesModalOpen(true);
  };

  const openEditGesModal = (ghe: GHE) => {
    setEditingGhe(ghe);
    setEstablishmentId(ghe.establishmentId);
    setSectorId(ghe.sectorId);
    setCode((ghe.code || '').replace(/\bGHE\b/gi, 'GES').replace(/GHE-/gi, 'GES-'));
    setSelectedPositions(ghe.positionIds || []);
    setWorkerCount(ghe.workerCount || 1);
    setIsGesModalOpen(true);
  };

  const handleSaveGes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentId || !sectorId || !code.trim()) {
      alert('Preencha os campos obrigatórios (Código, Estabelecimento e Setor do GES).');
      return;
    }

    setIsSavingGes(true);
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
        order: editingGhe ? editingGhe.order : (currentGhes.length + 1),
      };

      if (editingGhe) {
        await updateGhe(editingGhe.id, gheData);
      } else {
        const created = await addGhe(gheData);
        setSelectedGheId(created.id);
      }

      setIsGesModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar GES.');
    } finally {
      setIsSavingGes(false);
    }
  };

  const handleDuplicate = async (ghe: GHE) => {
    setIsDuplicating(ghe.id);
    try {
      await duplicateGhe(ghe.id);
    } catch (err) {
      console.error(err);
      alert('Erro ao duplicar GES.');
    } finally {
      setIsDuplicating(null);
    }
  };

  // Modal de confirmação de exclusão de GES
  const [gesToDelete, setGesToDelete] = useState<GHE | null>(null);
  const [isDeletingGes, setIsDeletingGes] = useState(false);

  const handleConfirmDeleteGes = async () => {
    if (!gesToDelete) return;
    setIsDeletingGes(true);
    try {
      if (selectedGheId === gesToDelete.id) {
        setSelectedGheId(null);
      }
      await deleteGhe(gesToDelete.id);
      setGesToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir GES.');
    } finally {
      setIsDeletingGes(false);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reordered = [...currentGhes];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    setDraggedIndex(null);
    await reorderGhes(reordered);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...currentGhes];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    await reorderGhes(reordered);
  };

  const handleMoveDown = async (index: number) => {
    if (index === currentGhes.length - 1) return;
    const reordered = [...currentGhes];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    await reorderGhes(reordered);
  };

  const handleExportPdf = () => {
    if (!activeCompany) return;
    const est = activeEstablishment || establishments[0];
    const pgr = activePgr || pgrDocuments[0] || {
      id: 'pgr-default',
      companyId: activeCompany.id,
      establishmentId: est?.id || '',
      code: 'PGR-2026',
      title: `Inventário de Riscos - ${activeCompany.name}`,
      version: '1.0',
      year: 2026,
      validityStart: '2026-01-01',
      validityEnd: '2027-12-31',
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    generatePgrPdf({
      company: activeCompany,
      establishment: est,
      pgr,
      sectors,
      positions,
      ghes,
      professionals,
      riskInventory,
      actionPlans,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              Inventário de Riscos Ocupacionais
            </h1>
            <Badge variant="outline" className="text-xs">
              NR-01.5.7
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Empresa: <strong className="text-foreground">{activeCompany?.name}</strong> • Unidade:{' '}
            <strong className="text-foreground">{activeEstablishment?.name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs bg-muted/60 px-3 py-1.5 rounded-lg border border-border">
            <span className="text-muted-foreground">Grupos (GES):</span>
            <strong className="text-foreground font-bold">{currentGhes.length}</strong>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">Riscos:</span>
            <strong className="text-foreground font-bold">{stats.totalRisks}</strong>
            <span className="text-muted-foreground">|</span>
            <span className="text-rose-600 font-bold">{stats.criticalRisksCount} críticos</span>
          </div>

          <Button
            size="sm"
            onClick={openNewGesModal}
            className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            title="Cadastrar novo Grupo de Exposição Similar sequencial"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar GES</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="text-xs gap-1.5 border-slate-200 text-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900 font-semibold"
            title="Exportar documento oficial em PDF"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>Exportar PDF</span>
          </Button>
        </div>
      </div>

      {/* VIEW STATE 1: VISÃO GERAL DE GRUPOS (GESs) */}
      {!selectedGheId ? (
        <div className="space-y-4">
          {/* Info Alert Box */}
          <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              O inventário é estruturado por <strong>Grupos de Exposição Similar (GES)</strong>. 
              Clique em <strong>Editar</strong> para gerenciar e cadastrar os riscos específicos de cada grupo, 
              <strong> Duplicar</strong> para criar rapidamente novos grupos similares ou <strong>arraste</strong> as linhas para ajustar a sequência.
            </p>
          </div>

          {/* Grid Sequencial de GESs */}
          <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">Ordem</TableHead>
                  <TableHead className="w-36">Código do GES</TableHead>
                  <TableHead>Setor / Lotação</TableHead>
                  <TableHead className="text-center w-28">Trabalhadores</TableHead>
                  <TableHead className="text-center w-40">Quantidade de Riscos</TableHead>
                  <TableHead className="text-right w-44">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentGhes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-xs">
                      Nenhum Grupo de Exposição Similar (GES) cadastrado. Clique no botão acima para cadastrar o <strong>GES-01</strong>.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentGhes.map((ghe, idx) => {
                    const sec = sectors.find(s => s.id === ghe.sectorId);
                    const displayCode = (ghe.code || '').replace(/\bGHE\b/gi, 'GES').replace(/GHE-/gi, 'GES-');
                    const risksCount = riskInventory.filter(r => r.gheId === ghe.id).length;
                    const isBeingDragged = draggedIndex === idx;

                    return (
                      <TableRow
                        key={ghe.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(idx)}
                        className={`transition-colors ${
                          isBeingDragged ? 'opacity-40 bg-muted/60' : 'hover:bg-muted/40'
                        }`}
                      >
                        {/* Drag Handle & Order */}
                        <TableCell className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span 
                              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                              title="Arraste para reordenar a sequência de GES"
                            >
                              <GripVertical className="h-4 w-4" />
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground font-bold">
                              {idx + 1}
                            </span>
                          </div>
                        </TableCell>

                        {/* Código do GES */}
                        <TableCell className="font-semibold text-xs">
                          <span className="font-bold text-foreground font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {displayCode}
                          </span>
                        </TableCell>

                        {/* Setor */}
                        <TableCell className="text-xs text-foreground font-medium">
                          {sec?.name || '-'}
                        </TableCell>

                        {/* Trabalhadores */}
                        <TableCell className="text-center text-xs font-bold">
                          {ghe.workerCount || 1}
                        </TableCell>

                        {/* Quantidade de Riscos */}
                        <TableCell className="text-center">
                          <Badge 
                            variant={risksCount > 0 ? "success" : "outline"}
                            className="text-[11px] font-bold px-2 py-0.5"
                          >
                            {risksCount} {risksCount === 1 ? 'perigo' : 'perigos'}
                          </Badge>
                        </TableCell>

                        {/* Ações */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Reordenação via botões (acessibilidade) */}
                            <div className="hidden sm:flex flex-col mr-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveUp(idx)}
                                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                title="Mover para cima"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === currentGhes.length - 1}
                                onClick={() => handleMoveDown(idx)}
                                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                title="Mover para baixo"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Editar: abre o inventário do GES */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1 font-semibold border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100"
                              onClick={() => setSelectedGheId(ghe.id)}
                              title="Abrir Inventário e Gerenciar Riscos deste GES"
                            >
                              <Edit className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Editar</span>
                            </Button>

                            {/* Duplicar: clona o GES e seus riscos */}
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isDuplicating === ghe.id}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => handleDuplicate(ghe)}
                              title="Duplicar GES e seus perigos"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>

                            {/* Excluir */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setGesToDelete(ghe)}
                              title="Excluir GES"
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
        </div>
      ) : (
        /* VIEW STATE 2: INVENTÁRIO DO GES SELECIONADO */
        <div className="space-y-4">
          {/* Breadcrumb / Botão de Voltar */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedGheId(null)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold px-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Lista de GES</span>
            </Button>
          </div>

          {/* Card de Destaque do GES Ativo */}
          {selectedGhe && (
            <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      {selectedGhe.code}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {selectedGheSector?.name || 'Setor Geral'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span>
                      Efetivo exposto:{' '}
                      <strong className="text-foreground font-bold">{selectedGhe.workerCount || 1}</strong> trabalhadores
                    </span>
                    <span>•</span>
                    <span>
                      Riscos cadastrados:{' '}
                      <strong className="text-foreground font-bold">{selectedGheRisks.length}</strong> perigos
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditGesModal(selectedGhe)}
                  className="h-8 text-xs gap-1.5 font-semibold"
                  title="Editar informações cadastrais do GES"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Editar Dados do GES</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => setIsAddRiskModalOpen(true)}
                  className="h-8 text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  title="Adicionar um novo perigo diretamente a este GES"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Adicionar Risco</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setGesToDelete(selectedGhe)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Excluir este GES"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Tabela de Riscos filtrada exclusivamente para este GES */}
          <RiskInventoryTable selectedGheId={selectedGheId} />

          {/* Modal para Adicionar Risco rápido pré-vinculado ao GES ativo */}
          {isAddRiskModalOpen && selectedGhe && (
            <RiskFormModal
              isOpen={isAddRiskModalOpen}
              onClose={() => setIsAddRiskModalOpen(false)}
              defaultGheId={selectedGhe.id}
              defaultSectorId={selectedGhe.sectorId}
            />
          )}
        </div>
      )}

      {/* Modal de Criação / Edição de GES */}
      {isGesModalOpen && (
        <Dialog open={isGesModalOpen} onOpenChange={setIsGesModalOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-emerald-600" />
                <span>{editingGhe ? 'Editar Dados do GES' : 'Cadastrar Novo GES'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Agrupamento de trabalhadores com exposição a riscos similares para a NR-01.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveGes} className="space-y-3 pt-2">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
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
                  <Label className="text-xs font-semibold">Quantidade de Expostos</Label>
                  <Input
                    type="number"
                    min="1"
                    value={workerCount}
                    onChange={(e) => setWorkerCount(Number(e.target.value))}
                    className="h-9 mt-1 text-xs font-bold"
                  />
                </div>
              </div>

              {availablePositions.length > 0 && (
                <div className="pt-1">
                  <Label className="text-xs font-semibold">Cargos Vinculados (Opcional)</Label>
                  <div className="mt-1 max-h-32 overflow-y-auto rounded-md border border-input p-2 space-y-1 bg-muted/20">
                    {availablePositions.map((pos) => {
                      const isChecked = selectedPositions.includes(pos.id);
                      return (
                        <label
                          key={pos.id}
                          className="flex items-center gap-2 text-xs text-foreground cursor-pointer hover:bg-muted/50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPositions(prev => [...prev, pos.id]);
                              } else {
                                setSelectedPositions(prev => prev.filter(id => id !== pos.id));
                              }
                            }}
                            className="rounded border-input text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                          />
                          <span>{pos.title} {pos.cbo ? `(CBO: ${pos.cbo})` : ''}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsGesModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSavingGes} 
                  className="font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSavingGes ? 'Salvando...' : editingGhe ? 'Salvar Alterações' : 'Cadastrar GES'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Confirmação para Exclusão de GES */}
      {gesToDelete && (
        <Dialog open={!!gesToDelete} onOpenChange={(open) => !open && !isDeletingGes && setGesToDelete(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50 mb-2">
                <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <DialogTitle className="text-center text-lg font-bold text-foreground">
                Excluir Grupo de Exposição Similar
              </DialogTitle>
              <div className="text-center text-xs text-muted-foreground pt-1 space-y-2">
                <p>
                  Tem certeza que deseja excluir o{' '}
                  <strong className="text-foreground">
                    {(gesToDelete.code || '').replace(/\bGHE\b/gi, 'GES').replace(/GHE-/gi, 'GES-')}
                  </strong>
                  ?
                </p>
                {(() => {
                  const risksCount = riskInventory.filter(r => r.gheId === gesToDelete.id).length;
                  const sec = sectors.find(s => s.id === gesToDelete.sectorId);
                  return (
                    <div className="bg-muted/40 p-3 rounded-lg border border-border text-left text-xs space-y-1">
                      <div>
                        <span className="text-muted-foreground">Setor:</span>{' '}
                        <strong className="text-foreground">{sec?.name || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trabalhadores expostos:</span>{' '}
                        <strong className="text-foreground">{gesToDelete.workerCount || 1}</strong>
                      </div>
                      {risksCount > 0 ? (
                        <div className="text-rose-600 dark:text-rose-400 font-semibold pt-1 border-t border-border mt-1">
                          ⚠️ Atenção: Há {risksCount} {risksCount === 1 ? 'perigo associado' : 'perigos associados'} que também {risksCount === 1 ? 'será excluído' : 'serão excluídos'} do inventário.
                        </div>
                      ) : (
                        <div className="text-muted-foreground pt-1 border-t border-border mt-1">
                          Nenhum perigo associado a este grupo.
                        </div>
                      )}
                    </div>
                  );
                })()}
                <p className="text-[11px] text-muted-foreground">
                  Esta ação é irreversível e removerá permanentemente os registros vinculados.
                </p>
              </div>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGesToDelete(null)}
                disabled={isDeletingGes}
                className="text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDeleteGes}
                disabled={isDeletingGes}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-1.5 shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeletingGes ? 'Excluindo...' : 'Excluir Definitivamente'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
