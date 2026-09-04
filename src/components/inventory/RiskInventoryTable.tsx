import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { RiskInventoryItem, HazardCategory, RiskLevel } from '@/types/pgr';
import { sortRisksByNormativeCategory } from '@/lib/pgr-groups';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RiskLevelBadge } from '@/components/risk-matrix/RiskLevelBadge';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Layers, 
  Activity, 
  CheckSquare, 
  Filter 
} from 'lucide-react';
import { RiskFormModal } from '@/components/inventory/RiskFormModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface RiskInventoryTableProps {
  selectedGheId?: string;
}

export const RiskInventoryTable: React.FC<RiskInventoryTableProps> = ({ selectedGheId }) => {
  const { 
    riskInventory, 
    activeCompany, 
    activeEstablishment, 
    sectors, 
    positions, 
    ghes, 
    deleteRiskItem 
  } = usePgr();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RiskInventoryItem | null>(null);

  // Filter and sort items by normative category (Físico > Químico > Biológico > Ergonômico > Acidentes)
  const filteredRisks = sortRisksByNormativeCategory(
    riskInventory.filter((r) => {
      if (activeCompany && r.companyId !== activeCompany.id) return false;
      if (activeEstablishment && r.establishmentId !== activeEstablishment.id) return false;
      if (selectedGheId && r.gheId !== selectedGheId) return false;

      if (selectedCategory !== 'ALL' && r.hazardCategory !== selectedCategory) return false;
      if (selectedLevel !== 'ALL' && r.riskLevel !== selectedLevel) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const sectorName = sectors.find(s => s.id === r.sectorId)?.name.toLowerCase() || '';
        const posName = positions.find(p => p.id === r.positionId)?.title.toLowerCase() || '';
        const gheMatch = ghes.find(g => g.id === r.gheId);
        const gheName = (gheMatch?.code || gheMatch?.name || '').toLowerCase();
        const matchName = r.hazardName.toLowerCase().includes(term);
        const matchSource = r.sourceDescription.toLowerCase().includes(term);
        const matchDamage = r.healthDamage.toLowerCase().includes(term);
        const matchCode = (r.hazardCode || '').toLowerCase().includes(term);

        return matchName || matchSource || matchDamage || matchCode || sectorName.includes(term) || posName.includes(term) || gheName.includes(term);
      }

      return true;
    })
  );

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (item: RiskInventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Modal de confirmação de exclusão de risco
  const [riskToDelete, setRiskToDelete] = useState<RiskInventoryItem | null>(null);
  const [isDeletingRisk, setIsDeletingRisk] = useState(false);

  const handleConfirmDeleteRisk = async () => {
    if (!riskToDelete) return;
    setIsDeletingRisk(true);
    try {
      await deleteRiskItem(riskToDelete.id);
      setRiskToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir perigo do inventário.');
    } finally {
      setIsDeletingRisk(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por perigo, fonte geradora, danos, setor ou cargo..."
            className="pl-9 text-xs h-9 bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 text-xs rounded-md border border-input bg-background focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">Todos os Grupos (NR-01)</option>
            <option value="FISICO">Físicos</option>
            <option value="QUIMICO">Químicos</option>
            <option value="BIOLOGICO">Biológicos</option>
            <option value="ERGONOMICO">Ergonômicos</option>
            <option value="ACIDENTE">Acidentes / Mecânicos</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="h-9 px-3 text-xs rounded-md border border-input bg-background focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">Todas as Gradações</option>
            <option value="TRIVIAL">Trivial (1-2)</option>
            <option value="TOLERAVEL">Tolerável (3-4)</option>
            <option value="MODERADO">Moderado (5-9)</option>
            <option value="SUBSTANCIAL">Substancial (10-16)</option>
            <option value="INTOLERAVEL">Intolerável (20-25)</option>
          </select>

          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Risco</span>
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Setor / Posto / GES</TableHead>
              <TableHead>Perigo / Fator de Risco</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead className="text-center">Exp.</TableHead>
              <TableHead className="text-center">Prob. x Sev.</TableHead>
              <TableHead className="text-center">Nível de Risco</TableHead>
              <TableHead className="text-center">Plano Ação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRisks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground text-xs">
                  Nenhum risco encontrado para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filteredRisks.map((item) => {
                const sector = sectors.find(s => s.id === item.sectorId);
                const position = positions.find(p => p.id === item.positionId);
                const ghe = ghes.find(g => g.id === item.gheId);
                const isExpanded = Boolean(expandedRows[item.id]);
                const catConfig = HAZARD_CATEGORY_CONFIG[item.hazardCategory];

                return (
                  <React.Fragment key={item.id}>
                    <TableRow className={isExpanded ? 'bg-muted/30' : ''}>
                      <TableCell className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleRowExpand(item.id)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground"
                          title="Ver detalhes de controles e medições"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </TableCell>

                      <TableCell className="font-medium text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{sector?.name || 'Setor Geral'}</span>
                          {ghe && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              {ghe.code}
                            </span>
                          )}
                          {position && (
                            <span className="text-[10px] text-muted-foreground">
                              {position.title}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="flex flex-col max-w-[240px]">
                          <span className="font-semibold text-foreground">{item.hazardName}</span>
                          <span className="text-[10px] text-muted-foreground truncate" title={item.sourceDescription}>
                            Fonte: {item.sourceDescription}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`text-[10px] font-bold ${catConfig.badgeClass}`}
                        >
                          {catConfig.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center text-xs">
                        <span className="font-semibold text-foreground">{item.exposedCount}</span>
                        <span 
                          className="block text-[9px] text-muted-foreground truncate max-w-[90px] mx-auto cursor-help"
                          title={item.exposureObservation ? `${item.exposureType.replace(/_/g, ' ')} (${item.exposureObservation})` : item.exposureType.replace(/_/g, ' ')}
                        >
                          {item.exposureType.slice(0, 4)}
                          {item.exposureObservation ? ` (${item.exposureObservation})` : ''}
                        </span>
                      </TableCell>

                      <TableCell className="text-center text-xs font-mono">
                        <span className="font-bold">P{item.probability} × S{item.severity}</span>
                        <span className="block text-[10px] text-muted-foreground font-semibold">
                          = {item.riskScore}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <RiskLevelBadge level={item.riskLevel} size="sm" />
                      </TableCell>

                      <TableCell className="text-center">
                        {item.actionRequired ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <Badge variant="success" className="text-[9px] px-1.5 py-0">
                              Exigido
                            </Badge>
                            {item.actionPriority && (
                              <span className="text-[9px] font-semibold text-muted-foreground">
                                Prio: {item.actionPriority}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Controlado</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEdit(item)}
                            title="Editar este risco"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setRiskToDelete(item)}
                            title="Excluir risco"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Linha Expandida de Detalhes (NR-01) */}
                    {isExpanded && (
                      <TableRow className="bg-muted/40 border-b border-border">
                        <TableCell colSpan={9} className="p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            {/* Danos à Saúde & Via de Penetração */}
                            <div className="p-3 rounded-lg bg-card border border-border space-y-1.5">
                              <span className="font-bold text-foreground flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                                Efeitos à Saúde & Exposição:
                              </span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {item.healthDamage}
                              </p>
                              <div className="pt-1 text-[11px] text-foreground font-medium space-y-0.5">
                                <div>
                                  <span className="text-muted-foreground">Regime de Exposição:</span>{' '}
                                  <span className="font-semibold">{item.exposureType.replace(/_/g, ' ')}</span>
                                  {item.exposureObservation && (
                                    <span className="text-emerald-700 dark:text-emerald-300 font-medium"> ({item.exposureObservation})</span>
                                  )}
                                </div>
                                {item.trajectory && (
                                  <div><span className="text-muted-foreground">Trajetória:</span> {item.trajectory}</div>
                                )}
                                {item.penetrationRoute && (
                                  <div><span className="text-muted-foreground">Via de Penetração:</span> {item.penetrationRoute}</div>
                                )}
                                {item.highestRiskExposed && (
                                  <div><span className="text-muted-foreground">Exposto Maior Risco (EMR):</span> <span className="font-semibold text-foreground">{item.highestRiskExposed}</span></div>
                                )}
                              </div>
                            </div>

                            {/* Medidas de Prevenção EPC & EPI */}
                            <div className="p-3 rounded-lg bg-card border border-border space-y-1.5">
                              <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                Medidas Coletivas & Proteção:
                              </span>
                              <div className="text-[11px] text-muted-foreground space-y-1">
                                <p><strong>EPCs:</strong> {item.epcExisting?.length ? item.epcExisting.join(', ') : 'Nenhum registrado'}</p>
                                {item.epiExisting?.length ? (
                                  <div>
                                    <strong>EPIs (com C.A.):</strong>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.epiExisting.map((epi, idx) => (
                                        <span key={idx} className="inline-flex items-center text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                                          {epi.name} (CA: {epi.ca})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p><strong>EPIs:</strong> Nenhum EPI específico exigido</p>
                                )}
                              </div>
                            </div>

                            {/* Recomendações Técnicas */}
                            <div className="p-3 rounded-lg bg-card border border-border space-y-1.5">
                              <span className="font-bold text-foreground flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                Recomendações & Propostas:
                              </span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {item.recommendations || 'Manter os controles preventivos existentes e monitoramento periódico.'}
                              </p>
                              <div className="pt-1 text-[10px]">
                                {item.actionRequired ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Vinculado ao Plano de Ação (5W2H)</span>
                                ) : (
                                  <span className="text-muted-foreground">Risco considerado sob controle contínuo</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Medições Quantitativas se houver */}
                          {item.measurements && item.measurements.length > 0 && (
                            <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                              <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-2">
                                <Activity className="h-3.5 w-3.5" />
                                Medição & Avaliação Ambiental:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-[11px]">
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">CRITÉRIO</span>
                                  <strong>{item.measurements[0].criteria || item.measurements[0].methodology || 'Quantitativo NR-15 / NHO'}</strong>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">TÉCNICA UTILIZADA</span>
                                  <strong>{item.measurements[0].technique || item.measurements[0].equipmentUsed || 'Leitura Direta'}</strong>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">DATA DA MEDIÇÃO</span>
                                  <strong className="font-mono">{item.measurements[0].measurementDate || '-'}</strong>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">RESULTADO</span>
                                  <strong className="text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                                    {item.measurements[0].resultText || (item.measurements[0].measuredValue ? `${item.measurements[0].measuredValue} ${item.measurements[0].unit || ''}` : '-')}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">LT (LIMITE TOLERÂNCIA)</span>
                                  <strong className="font-mono">
                                    {item.measurements[0].toleranceLimitText || (item.measurements[0].toleranceLimit ? `${item.measurements[0].toleranceLimit} ${item.measurements[0].unit || ''}` : '-')}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Avaliações e Resultados: Galeria de Imagens se houver */}
                          {item.evaluationImages && item.evaluationImages.length > 0 && (
                            <div className="p-3 rounded-lg bg-card border border-border space-y-2">
                              <span className="font-bold text-foreground text-xs block">
                                Avaliações e Resultados (Gráficos e Planilhas Anexadas):
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {item.evaluationImages.map((img, i) => (
                                  <img
                                    key={i}
                                    src={img}
                                    alt={`Avaliação ${i + 1}`}
                                    className="h-20 w-28 object-cover rounded-md border border-border shadow-xs hover:opacity-95 transition-opacity"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <RiskFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          initialItem={editingItem}
          defaultGheId={selectedGheId}
          defaultSectorId={ghes.find(g => g.id === selectedGheId)?.sectorId}
        />
      )}

      {/* Modal de Confirmação para Exclusão de Risco */}
      {riskToDelete && (
        <Dialog open={!!riskToDelete} onOpenChange={(open) => !open && !isDeletingRisk && setRiskToDelete(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50 mb-2">
                <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <DialogTitle className="text-center text-lg font-bold text-foreground">
                Excluir Risco Ocupacional
              </DialogTitle>
              <div className="text-center text-xs text-muted-foreground pt-1 space-y-2">
                <p>
                  Tem certeza que deseja excluir o perigo{' '}
                  <strong className="text-foreground">{riskToDelete.hazardName}</strong>?
                </p>
                {(() => {
                  const sec = sectors.find(s => s.id === riskToDelete.sectorId);
                  const ghe = ghes.find(g => g.id === riskToDelete.gheId);
                  const displayGhe = ghe?.code ? (ghe.code.replace(/\bGHE\b/gi, 'GES').replace(/GHE-/gi, 'GES-')) : '-';
                  return (
                    <div className="bg-muted/40 p-3 rounded-lg border border-border text-left text-xs space-y-1">
                      <div>
                        <span className="text-muted-foreground">Grupo:</span>{' '}
                        <strong className="text-foreground">{HAZARD_CATEGORY_CONFIG[riskToDelete.hazardCategory]?.label || riskToDelete.hazardCategory}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">GES / Setor:</span>{' '}
                        <strong className="text-foreground">{displayGhe} • {sec?.name || '-'}</strong>
                      </div>
                      {riskToDelete.healthDamage && (
                        <div>
                          <span className="text-muted-foreground">Possíveis danos:</span>{' '}
                          <span className="text-foreground font-medium">{riskToDelete.healthDamage}</span>
                        </div>
                      )}
                      {riskToDelete.actionRequired && (
                        <div className="text-amber-600 dark:text-amber-400 font-semibold pt-1 border-t border-border mt-1">
                          ⚠️ Nota: Este risco possui plano de ação vinculado que também será desvinculado/removido.
                        </div>
                      )}
                    </div>
                  );
                })()}
                <p className="text-[11px] text-muted-foreground">
                  Esta ação é irreversível e removerá permanentemente este perigo do inventário de riscos.
                </p>
              </div>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRiskToDelete(null)}
                disabled={isDeletingRisk}
                className="text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDeleteRisk}
                disabled={isDeletingRisk}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-1.5 shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeletingRisk ? 'Excluindo...' : 'Excluir Definitivamente'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
