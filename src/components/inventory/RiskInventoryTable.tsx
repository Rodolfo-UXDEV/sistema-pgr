import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { RiskInventoryItem, HazardCategory, RiskLevel } from '@/types/pgr';
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

export const RiskInventoryTable: React.FC = () => {
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

  // Filter items
  const filteredRisks = riskInventory.filter((r) => {
    if (activeCompany && r.companyId !== activeCompany.id) return false;
    if (activeEstablishment && r.establishmentId !== activeEstablishment.id) return false;

    if (selectedCategory !== 'ALL' && r.hazardCategory !== selectedCategory) return false;
    if (selectedLevel !== 'ALL' && r.riskLevel !== selectedLevel) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const sectorName = sectors.find(s => s.id === r.sectorId)?.name.toLowerCase() || '';
      const posName = positions.find(p => p.id === r.positionId)?.title.toLowerCase() || '';
      const gheName = ghes.find(g => g.id === r.gheId)?.name.toLowerCase() || '';
      const matchName = r.hazardName.toLowerCase().includes(term);
      const matchSource = r.sourceDescription.toLowerCase().includes(term);
      const matchDamage = r.healthDamage.toLowerCase().includes(term);
      const matchCode = (r.hazardCode || '').toLowerCase().includes(term);

      return matchName || matchSource || matchDamage || matchCode || sectorName.includes(term) || posName.includes(term) || gheName.includes(term);
    }

    return true;
  });

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (item: RiskInventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este perigo do inventário de riscos?')) {
      await deleteRiskItem(id);
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
                          className="text-[10px] font-semibold border-border/80"
                          style={{ color: catConfig.color }}
                        >
                          {catConfig.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center text-xs">
                        <span className="font-semibold text-foreground">{item.exposedCount}</span>
                        <span className="block text-[9px] text-muted-foreground">
                          {item.exposureType.slice(0, 4)}
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
                          <Badge variant="success" className="text-[9px] px-1.5 py-0">
                            Exigido
                          </Badge>
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
                            onClick={() => handleDelete(item.id)}
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
                            {/* Danos à Saúde */}
                            <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                              <span className="font-bold text-foreground flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                                Possíveis Danos à Saúde:
                              </span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {item.healthDamage}
                              </p>
                            </div>

                            {/* Medidas de Prevenção EPC & ADM */}
                            <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                              <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                Medidas Coletivas & Administrativas:
                              </span>
                              <div className="text-[11px] text-muted-foreground space-y-0.5">
                                <p><strong>EPCs:</strong> {item.epcExisting?.length ? item.epcExisting.join(', ') : 'Nenhum registrado'}</p>
                                <p><strong>ADM:</strong> {item.adminMeasuresExisting?.length ? item.adminMeasuresExisting.join(', ') : 'Nenhum registrado'}</p>
                              </div>
                            </div>

                            {/* EPIs com CA */}
                            <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                              <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                                Equipamentos de Proteção (EPI com CA):
                              </span>
                              {item.epiExisting?.length ? (
                                <div className="space-y-1">
                                  {item.epiExisting.map((epi, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[10px] bg-muted/60 px-2 py-0.5 rounded">
                                      <span className="font-medium text-foreground">{epi.name}</span>
                                      <span className="font-mono text-muted-foreground">CA: {epi.ca}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">Nenhum EPI específico exigido</span>
                              )}
                            </div>
                          </div>

                          {/* Medições Quantitativas se houver */}
                          {item.measurements && item.measurements.length > 0 && (
                            <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs">
                              <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-1">
                                <Activity className="h-3.5 w-3.5" />
                                Avaliação Ambiental Quantitativa:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                                <div>
                                  <span className="text-muted-foreground">Agente:</span> <strong>{item.measurements[0].agentName}</strong>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Valor Medido:</span> <strong className="text-emerald-700 dark:text-emerald-300 font-mono">{item.measurements[0].measuredValue} {item.measurements[0].unit}</strong>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Nível de Ação / LT:</span> <strong>{item.measurements[0].actionLevel || '-'} / {item.measurements[0].toleranceLimit || '-'}</strong>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Método:</span> <span>{item.measurements[0].methodology}</span>
                                </div>
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
        />
      )}
    </div>
  );
};
