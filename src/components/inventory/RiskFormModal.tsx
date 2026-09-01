import React, { useState, useEffect, useRef } from 'react';
import { usePgr } from '@/context/PgrContext';
import { 
  RiskInventoryItem, 
  HazardCategory, 
  ExposureType, 
  EpiControl, 
  EnvironmentalMeasurement 
} from '@/types/pgr';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Matrix5x5Selector } from '@/components/risk-matrix/Matrix5x5Selector';
import { calculateRiskLevel, HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
import { 
  Plus, 
  Trash2, 
  Shield, 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Calendar, 
  Gauge, 
  Layers, 
  FileText,
  Eye
} from 'lucide-react';

interface RiskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: RiskInventoryItem | null;
}

const EXPOSURE_TYPE_OPTIONS: { value: ExposureType; label: string }[] = [
  { value: 'HABITUAL_PERMANENTE', label: 'Habitual e Permanente' },
  { value: 'HABITUAL_INTERMITENTE', label: 'Habitual e Intermitente' },
  { value: 'EVENTUAL_INTERMITENTE', label: 'Eventual e Intermitente' },
  { value: 'EVENTUAL', label: 'Eventual' },
  { value: 'PERMANENTE', label: 'Permanente' },
  { value: 'INTERMITENTE', label: 'Intermitente' },
  { value: 'HABITUAL', label: 'Habitual' },
];

const PENETRATION_ROUTE_SUGGESTIONS = [
  'Respiratória (Inalação)',
  'Cutânea / Dérmica (Pele)',
  'Auditiva (Ouvido / Som)',
  'Ocular (Olhos / Radiação / Projeção)',
  'Digestiva (Ingestão)',
  'Contato Físico / Mecânico',
  'Postural / Biomecânica',
  'Aparelho auditivo',
  'Não Aplicável',
  'NAP'
];

const TRAJECTORY_SUGGESTIONS = [
  'Ar',
  'Contato direto',
  'Superfície',
  'Propagação aérea',
  'Vibração mecânica',
  'Fluido / Respingo',
  'Radiação',
  'Não Aplicável',
  'NAP'
];

export const RiskFormModal: React.FC<RiskFormModalProps> = ({
  isOpen,
  onClose,
  initialItem,
}) => {
  const {
    activeCompany,
    activeEstablishment,
    activePgr,
    sectors,
    positions,
    ghes,
    hazards,
    addRiskItem,
    updateRiskItem,
  } = usePgr();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Lotação / População Exposta
  const [sectorId, setSectorId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [gheId, setGheId] = useState('');
  const [exposedCount, setExposedCount] = useState(1);

  // 2. Risco & Agente
  const [hazardCategory, setHazardCategory] = useState<HazardCategory>('FISICO');
  const [selectedHazardId, setSelectedHazardId] = useState('');
  const [hazardName, setHazardName] = useState('');
  const [hazardCode, setHazardCode] = useState('');
  const [exposureType, setExposureType] = useState<ExposureType>('HABITUAL_PERMANENTE');
  const [trajectory, setTrajectory] = useState('Ar');
  const [penetrationRoute, setPenetrationRoute] = useState('Respiratória (Inalação)');
  const [healthDamage, setHealthDamage] = useState('');
  const [sourceDescription, setSourceDescription] = useState('');

  // Prevenção e Controles (EPC / EPI)
  const [epcInput, setEpcInput] = useState('');
  const [epcList, setEpcList] = useState<string[]>([]);
  const [newEpiName, setNewEpiName] = useState('');
  const [newEpiCa, setNewEpiCa] = useState('');
  const [newEpiVal, setNewEpiVal] = useState('');
  const [epiList, setEpiList] = useState<EpiControl[]>([]);

  // 3. Medição
  const [hasMeasurement, setHasMeasurement] = useState(false);
  const [measurementCriteria, setMeasurementCriteria] = useState('Quantitativo (NR-15 / NHO)');
  const [measurementTechnique, setMeasurementTechnique] = useState('');
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0]);
  const [measurementResultText, setMeasurementResultText] = useState('');
  const [measurementToleranceLimitText, setMeasurementToleranceLimitText] = useState('');

  // 4. Categorização do Risco (Matriz 5x5)
  const [severity, setSeverity] = useState(3);
  const [probability, setProbability] = useState(3);

  // 5. Recomendações & Plano de Ação
  const [recommendations, setRecommendations] = useState('');
  const [actionRequired, setActionRequired] = useState(true);

  // 6. Avaliações e Resultados (Imagens)
  const [evaluationImages, setEvaluationImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Opções filtradas
  const companySectors = sectors.filter(
    s => !activeEstablishment || s.establishmentId === activeEstablishment.id
  );
  const sectorPositions = positions.filter(p => !sectorId || p.sectorId === sectorId);
  const sectorGhes = ghes.filter(g => !sectorId || g.sectorId === sectorId);

  // Preenchimento ou Reset do Formulário
  useEffect(() => {
    if (initialItem) {
      setSectorId(initialItem.sectorId);
      setPositionId(initialItem.positionId || '');
      setGheId(initialItem.gheId || '');
      setExposedCount(initialItem.exposedCount || 1);

      setHazardCategory(initialItem.hazardCategory);
      setHazardName(initialItem.hazardName);
      setHazardCode(initialItem.hazardCode || '');
      setExposureType(initialItem.exposureType || 'HABITUAL_PERMANENTE');
      setTrajectory(initialItem.trajectory || 'Ar');
      setPenetrationRoute(initialItem.penetrationRoute || 'Respiratória (Inalação)');
      setHealthDamage(initialItem.healthDamage || '');
      setSourceDescription(initialItem.sourceDescription || '');

      setEpcList(initialItem.epcExisting || []);
      setEpiList(initialItem.epiExisting || []);

      if (initialItem.measurements && initialItem.measurements.length > 0) {
        const m = initialItem.measurements[0];
        setHasMeasurement(true);
        setMeasurementCriteria(m.criteria || m.methodology || 'Quantitativo (NR-15 / NHO)');
        setMeasurementTechnique(m.technique || m.equipmentUsed || '');
        setMeasurementDate(m.measurementDate || new Date().toISOString().split('T')[0]);
        setMeasurementResultText(m.resultText || (m.measuredValue ? `${m.measuredValue} ${m.unit || ''}` : ''));
        setMeasurementToleranceLimitText(m.toleranceLimitText || (m.toleranceLimit ? `${m.toleranceLimit} ${m.unit || ''}` : ''));
      } else {
        setHasMeasurement(false);
        setMeasurementCriteria('Quantitativo (NR-15 / NHO)');
        setMeasurementTechnique('');
        setMeasurementDate(new Date().toISOString().split('T')[0]);
        setMeasurementResultText('');
        setMeasurementToleranceLimitText('');
      }

      setSeverity(initialItem.severity || 3);
      setProbability(initialItem.probability || 3);

      setRecommendations(initialItem.recommendations || '');
      setActionRequired(initialItem.actionRequired ?? true);

      setEvaluationImages(initialItem.evaluationImages || []);
    } else {
      // Padrão limpo para novo cadastro
      const firstSector = companySectors[0]?.id || '';
      setSectorId(firstSector);
      setPositionId('');
      setGheId('');
      setExposedCount(1);

      setHazardCategory('FISICO');
      setSelectedHazardId('');
      setHazardName('');
      setHazardCode('');
      setExposureType('HABITUAL_PERMANENTE');
      setTrajectory('Ar');
      setPenetrationRoute('Auditiva (Ouvido / Som)');
      setHealthDamage('');
      setSourceDescription('');

      setEpcList([]);
      setEpiList([]);

      setHasMeasurement(false);
      setMeasurementCriteria('Quantitativo (NR-15 / NHO)');
      setMeasurementTechnique('');
      setMeasurementDate(new Date().toISOString().split('T')[0]);
      setMeasurementResultText('');
      setMeasurementToleranceLimitText('');

      setSeverity(3);
      setProbability(3);

      setRecommendations('');
      setActionRequired(true);
      setEvaluationImages([]);
    }
  }, [initialItem, isOpen]);

  // Ao selecionar perigo do catálogo de sugestões
  const handleSelectHazardFromCatalog = (hazardId: string) => {
    setSelectedHazardId(hazardId);
    const item = hazards.find(h => h.id === hazardId);
    if (item) {
      setHazardCategory(item.category);
      setHazardName(item.name);
      setHazardCode(item.code);
      setHealthDamage(item.possibleDamages);
      if (item.suggestedEpc && epcList.length === 0) setEpcList([item.suggestedEpc]);
      if (item.suggestedEpi && epiList.length === 0) {
        setEpiList([{ name: item.suggestedEpi, ca: 'Consulte CA' }]);
      }
      // Sugestão de via de penetração inteligente
      if (item.category === 'FISICO') {
        if (item.name.toLowerCase().includes('ruído') || item.name.toLowerCase().includes('som')) {
          setPenetrationRoute('Auditiva (Ouvido / Som)');
        } else if (item.name.toLowerCase().includes('calor') || item.name.toLowerCase().includes('frio')) {
          setPenetrationRoute('Cutânea / Dérmica (Pele)');
        } else {
          setPenetrationRoute('Contato Físico / Mecânico');
        }
      } else if (item.category === 'QUIMICO') {
        setPenetrationRoute('Respiratória (Inalação)');
      } else if (item.category === 'ERGONOMICO') {
        setPenetrationRoute('Postural / Biomecânica');
      } else if (item.category === 'ACIDENTE') {
        setPenetrationRoute('Contato Físico / Mecânico');
      }
    }
  };

  const handleAddEpc = () => {
    if (epcInput.trim()) {
      setEpcList([...epcList, epcInput.trim()]);
      setEpcInput('');
    }
  };

  const handleAddEpi = () => {
    if (newEpiName.trim()) {
      setEpiList([
        ...epiList,
        {
          name: newEpiName.trim(),
          ca: newEpiCa.trim() || 'Pendente',
          validity: newEpiVal || undefined,
        },
      ]);
      setNewEpiName('');
      setNewEpiCa('');
      setNewEpiVal('');
    }
  };

  // Upload de Imagens para Avaliações e Resultados
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`O arquivo ${file.name} não é uma imagem válida.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const base64 = loadEvt.target?.result as string;
        if (base64) {
          setEvaluationImages((prev) => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setEvaluationImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Salvar no Contexto e Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || !activeEstablishment || !activePgr) {
      alert('Selecione uma empresa, estabelecimento e documento PGR ativos.');
      return;
    }
    if (!sectorId) {
      alert('Selecione o setor/ambiente de trabalho.');
      return;
    }
    if (!hazardName.trim()) {
      alert('Informe o nome ou descrição do perigo/agente de risco.');
      return;
    }

    setIsSaving(true);
    try {
      const { score, level } = calculateRiskLevel(severity, probability);

      let measurements: EnvironmentalMeasurement[] | undefined = undefined;
      if (hasMeasurement) {
        measurements = [
          {
            id: 'meas-' + Date.now(),
            agentName: hazardName.trim(),
            criteria: measurementCriteria.trim(),
            technique: measurementTechnique.trim(),
            measurementDate: measurementDate,
            resultText: measurementResultText.trim(),
            toleranceLimitText: measurementToleranceLimitText.trim(),
            methodology: measurementCriteria.trim(),
            equipmentUsed: measurementTechnique.trim(),
            resultStatus: 'ABAIXO_NIVEL_ACAO',
          },
        ];
      }

      const riskData: Omit<RiskInventoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
        pgrId: activePgr.id,
        companyId: activeCompany.id,
        establishmentId: activeEstablishment.id,
        sectorId,
        positionId: positionId || undefined,
        gheId: gheId || undefined,
        hazardCategory,
        hazardName: hazardName.trim(),
        hazardCode: hazardCode.trim() || undefined,
        sourceDescription: sourceDescription.trim() || 'Processos operacionais do setor',
        healthDamage: healthDamage.trim() || 'Lesões decorrentes de exposição desprotegida',
        trajectory: trajectory.trim() || 'Ar',
        penetrationRoute: penetrationRoute.trim(),
        exposedCount: Number(exposedCount) || 1,
        exposureType,
        probability,
        severity,
        riskScore: score,
        riskLevel: level,
        epcExisting: epcList,
        adminMeasuresExisting: [],
        epiExisting: epiList,
        measurements,
        recommendations: recommendations.trim() || undefined,
        evaluationImages: evaluationImages.length > 0 ? evaluationImages : undefined,
        actionRequired,
      };

      if (initialItem) {
        await updateRiskItem(initialItem.id, riskData);
      } else {
        await addRiskItem(riskData);
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar item no levantamento de riscos.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredHazards = hazards.filter(h => h.category === hazardCategory);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-emerald-600" />
            <span>{initialItem ? 'Editar Levantamento de Risco (NR-01.5.7)' : 'Novo Levantamento de Risco (NR-01.5.7)'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Identificação de perigos, agentes, via de penetração, medições, matriz de gradação e plano de controle.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          
          {/* =========================================================
              SEQUÊNCIA 1: SETOR/AMBIENTE - CARGO/FUNÇÃO - GES (GHE)
             ========================================================= */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-600" />
                <span>1. Lotação & Trabalhadores Expostos</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">SETOR / AMBIENTE *</Label>
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  required
                  className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring font-medium"
                >
                  <option value="">Selecione o Setor</option>
                  {companySectors.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">CARGO / FUNÇÃO</Label>
                <select
                  value={positionId}
                  onChange={(e) => setPositionId(e.target.value)}
                  className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="">Todos os Cargos / Específico</option>
                  {sectorPositions.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} (CBO: {p.cbo})</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">GES (GRUPO DE EXPOSIÇÃO SIMILAR)</Label>
                <select
                  value={gheId}
                  onChange={(e) => setGheId(e.target.value)}
                  className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="">Nenhum / Selecionar GES</option>
                  {sectorGhes.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.code}{g.name && g.name !== g.code ? ` - ${g.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">QUANTIDADE DE TRABALHADORES EXPOSTOS</Label>
                <Input
                  type="number"
                  min="1"
                  value={exposedCount}
                  onChange={(e) => setExposedCount(Number(e.target.value))}
                  className="h-9 mt-1 text-xs w-full font-bold"
                />
              </div>
            </div>
          </div>

          {/* =========================================================
              SEQUÊNCIA 2: RISCO, AGENTE, TIPO DE EXPOSIÇÃO, VIA DE PENETRAÇÃO, EFEITOS, EPC/EPI
             ========================================================= */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>2. Identificação do Risco & Agente</span>
              </h4>
              <Badge variant="outline" className={`text-[10px] font-bold ${HAZARD_CATEGORY_CONFIG[hazardCategory].badgeClass}`}>
                {HAZARD_CATEGORY_CONFIG[hazardCategory].label}
              </Badge>
            </div>

            {/* RISCO: Categoria */}
            <div>
              <Label className="text-xs font-semibold block mb-1.5">RISCO (CATEGORIA):</Label>
              <div className="flex flex-wrap gap-2">
                {(['FISICO', 'QUIMICO', 'BIOLOGICO', 'ERGONOMICO', 'ACIDENTE'] as HazardCategory[]).map((cat) => {
                  const cfg = HAZARD_CATEGORY_CONFIG[cat];
                  const isSelected = hazardCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setHazardCategory(cat);
                        setSelectedHazardId('');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? cfg.buttonActiveClass
                          : cfg.buttonInactiveClass
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AGENTE */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">AGENTE / PERIGO *</Label>
                  <Input
                    value={hazardName}
                    onChange={(e) => setHazardName(e.target.value)}
                    placeholder="Ex: Ruído Contínuo, Poeiras Minerais, Esforço Físico Intenso..."
                    required
                    className="h-9 mt-1 text-xs font-medium"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">CÓDIGO ESOCIAL (TAB. 24)</Label>
                  <Input
                    value={hazardCode}
                    onChange={(e) => setHazardCode(e.target.value)}
                    placeholder="Ex: 01.01.001"
                    className="h-9 mt-1 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Sugestão do catálogo */}
              <div className="p-2 rounded-lg bg-background/60 border border-border/60">
                <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Preenchimento Rápido via Catálogo eSocial:</span>
                </Label>
                <select
                  value={selectedHazardId}
                  onChange={(e) => handleSelectHazardFromCatalog(e.target.value)}
                  className="w-full h-8 mt-1 rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="">Selecione um agente pré-cadastrado...</option>
                  {filteredHazards.map((h) => (
                    <option key={h.id} value={h.id}>
                      [{h.code}] {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TIPO DE EXPOSIÇÃO, TRAJETÓRIA & VIA DE PENETRAÇÃO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">TIPO DE EXPOSIÇÃO *</Label>
                <select
                  value={exposureType}
                  onChange={(e) => setExposureType(e.target.value as ExposureType)}
                  className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs font-medium focus:ring-1 focus:ring-ring"
                >
                  {EXPOSURE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">TRAJETÓRIA</Label>
                <Input
                  value={trajectory}
                  onChange={(e) => setTrajectory(e.target.value)}
                  placeholder="Ex: Ar, Contato direto, Propagação..."
                  className="h-9 mt-1 text-xs"
                  list="trajectory-suggestions"
                />
                <datalist id="trajectory-suggestions">
                  {TRAJECTORY_SUGGESTIONS.map((s, idx) => (
                    <option key={idx} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <Label className="text-xs font-semibold">VIA DE PENETRAÇÃO</Label>
                <Input
                  value={penetrationRoute}
                  onChange={(e) => setPenetrationRoute(e.target.value)}
                  placeholder="Ex: Aparelho auditivo, Respiratória..."
                  className="h-9 mt-1 text-xs"
                  list="penetration-suggestions"
                />
                <datalist id="penetration-suggestions">
                  {PENETRATION_ROUTE_SUGGESTIONS.map((s, idx) => (
                    <option key={idx} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* EFEITOS A SAÚDE */}
            <div>
              <Label className="text-xs font-semibold">EFEITOS A SAÚDE (LESÕES OU AGRAVOS) *</Label>
              <Textarea
                value={healthDamage}
                onChange={(e) => setHealthDamage(e.target.value)}
                placeholder="Ex: Perda Auditiva Induzida por Ruído (PAIR), estresse, cefaleia, lombalgia, dermatite de contato..."
                required
                className="mt-1 text-xs min-h-[55px]"
              />
            </div>

            {/* FONTE GERADORA */}
            <div>
              <Label className="text-xs font-semibold">FONTE GERADORA / CIRCUNSTÂNCIA</Label>
              <Input
                value={sourceDescription}
                onChange={(e) => setSourceDescription(e.target.value)}
                placeholder="Ex: Operação contínua de tornos mecânicos e fresadoras..."
                className="h-9 mt-1 text-xs"
              />
            </div>

            {/* EPC / EPI (NOME E C.A) */}
            <div className="pt-2 border-t border-border/60 space-y-3">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wide block">
                EPC / EPI (NOME E C.A)
              </Label>

              {/* EPCs */}
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground font-semibold">Proteção Coletiva (EPC):</Label>
                <div className="flex gap-2">
                  <Input
                    value={epcInput}
                    onChange={(e) => setEpcInput(e.target.value)}
                    placeholder="Nome do EPC (ex: Enclausuramento acústico, Sistema de exaustão...)"
                    className="h-8 text-xs flex-1"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEpc(); } }}
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddEpc} className="h-8 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Adicionar EPC
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {epcList.map((epc, i) => (
                    <Badge key={i} variant="secondary" className="text-[11px] gap-1 pr-1.5 py-0.5">
                      {epc}
                      <button type="button" onClick={() => setEpcList(epcList.filter((_, idx) => idx !== i))} className="hover:text-destructive ml-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* EPIs com Nome e CA */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-[11px] text-muted-foreground font-semibold">Equipamentos de Proteção Individual (EPI - Nome e C.A.):</Label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <Input
                    value={newEpiName}
                    onChange={(e) => setNewEpiName(e.target.value)}
                    placeholder="Nome do EPI (ex: Protetor Auricular tipo Plug)"
                    className="h-8 text-xs sm:col-span-2"
                  />
                  <Input
                    value={newEpiCa}
                    onChange={(e) => setNewEpiCa(e.target.value)}
                    placeholder="Nº C.A. (ex: 14235)"
                    className="h-8 text-xs font-mono"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddEpi} className="h-8 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Adicionar EPI
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {epiList.map((epi, i) => (
                    <Badge key={i} variant="outline" className="text-[11px] gap-1.5 p-1.5 pr-2 bg-background border-border">
                      <span className="font-semibold">{epi.name}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">(C.A.: {epi.ca})</span>
                      <button type="button" onClick={() => setEpiList(epiList.filter((_, idx) => idx !== i))} className="hover:text-destructive ml-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              SEQUÊNCIA 3: MEDIÇÃO (CRITÉRIO, TÉCNICA UTILIZADA, DATA DA MEDIÇÃO, RESULTADO, LT)
             ========================================================= */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-emerald-600" />
                  <span>3. Medição Ambiental</span>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Habilite para registrar avaliações quantitativas ou qualitativas de higiene ocupacional.
                </p>
              </div>
              <Switch checked={hasMeasurement} onCheckedChange={setHasMeasurement} />
            </div>

            {hasMeasurement && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <Label className="text-xs font-semibold">CRITÉRIO</Label>
                  <Input
                    value={measurementCriteria}
                    onChange={(e) => setMeasurementCriteria(e.target.value)}
                    placeholder="Ex: Quantitativo NR-15 Anexo 1 / NHO-01"
                    className="h-8 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">TÉCNICA UTILIZADA</Label>
                  <Input
                    value={measurementTechnique}
                    onChange={(e) => setMeasurementTechnique(e.target.value)}
                    placeholder="Ex: Dosimetria com Audiodosímetro Calibrado"
                    className="h-8 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>DATA DA MEDIÇÃO</span>
                  </Label>
                  <Input
                    type="date"
                    value={measurementDate}
                    onChange={(e) => setMeasurementDate(e.target.value)}
                    className="h-8 text-xs mt-1 font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">RESULTADO</Label>
                  <Input
                    value={measurementResultText}
                    onChange={(e) => setMeasurementResultText(e.target.value)}
                    placeholder="Ex: 84.5 dB(A) / 0.015 mg/m³ / 26.8 °C"
                    className="h-8 text-xs mt-1 font-bold text-emerald-700 dark:text-emerald-400 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">LT (LIMITE DE TOLERÂNCIA)</Label>
                  <Input
                    value={measurementToleranceLimitText}
                    onChange={(e) => setMeasurementToleranceLimitText(e.target.value)}
                    placeholder="Ex: 85.0 dB(A) / Nível de Ação: 80.0 dB(A)"
                    className="h-8 text-xs mt-1 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* =========================================================
              SEQUÊNCIA 4: CATEGORIZAÇÃO DO RISCO/PERIGO: MATRIZ
             ========================================================= */}
          <div className="space-y-2">
            <div className="px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-600" />
                <span>4. Categorização do Risco/Perigo: Matriz (NR-01)</span>
              </h4>
            </div>
            <Matrix5x5Selector
              severity={severity}
              probability={probability}
              onChange={(s, p) => {
                setSeverity(s);
                setProbability(p);
              }}
            />
          </div>

          {/* =========================================================
              SEQUÊNCIA 5: RECOMENDAÇÕES (COM SELEÇÃO PARA PLANO DE AÇÃO)
             ========================================================= */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span>5. Recomendações & Medidas Propostas</span>
            </h4>

            <div>
              <Label className="text-xs font-semibold">RECOMENDAÇÕES (CAMPO DE TEXTO):</Label>
              <Textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Descreva as medidas de engenharia, melhorias administrativas, treinamentos ou adequações recomendadas para eliminar ou controlar o risco..."
                className="mt-1 text-xs min-h-[65px]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 mt-2">
              <div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                  Enviar esta Recomendação para o Plano de Ação (5W2H)?
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Ao marcar, o sistema vinculará e gerará automaticamente o plano de melhoria com prazos e responsáveis.
                </span>
              </div>
              <Switch checked={actionRequired} onCheckedChange={setActionRequired} />
            </div>
          </div>

          {/* =========================================================
              SEQUÊNCIA 6: AVALIAÇÕES E RESULTADOS (INCLUSÃO DE IMAGENS)
             ========================================================= */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-emerald-600" />
                  <span>6. AVALIAÇÕES E RESULTADOS (GRÁFICOS E PLANILHAS)</span>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Anexe imagens de gráficos dosimétricos, tabelas, planilhas escaneadas ou relatórios de ensaios.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-xs gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Anexar Imagem</span>
                </Button>
              </div>
            </div>

            {/* Galeria de imagens anexadas */}
            {evaluationImages.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground/60 mb-1" />
                <p className="text-xs text-muted-foreground font-medium">
                  Clique ou arraste imagens aqui para anexar relatórios fotográficos, gráficos ou planilhas.
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  Formatos suportados: PNG, JPG, JPEG, WEBP
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {evaluationImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg border border-border overflow-hidden bg-background">
                    <img 
                      src={img} 
                      alt={`Avaliação ${idx + 1}`} 
                      className="w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setPreviewImage(img)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImage(img)}
                        className="p-1 rounded bg-black/60 text-white hover:bg-black/80"
                        title="Ampliar"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 rounded bg-red-600/80 text-white hover:bg-red-700"
                        title="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="font-semibold shadow-xs">
              {isSaving ? 'Salvando...' : initialItem ? 'Salvar Alterações' : 'Adicionar ao Inventário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Modal de Preview Ampliado da Imagem */}
      {previewImage && (
        <Dialog open={Boolean(previewImage)} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-3 flex flex-col items-center">
            <div className="w-full flex justify-between items-center pb-2 border-b border-border">
              <span className="text-xs font-bold text-foreground">Visualização da Imagem de Avaliação</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPreviewImage(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-full overflow-auto max-h-[75vh] flex justify-center py-2">
              <img src={previewImage} alt="Visualização Completa" className="max-w-full h-auto rounded-lg shadow-md" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};
