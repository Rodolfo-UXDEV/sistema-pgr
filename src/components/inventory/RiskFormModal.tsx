import React, { useState, useEffect } from 'react';
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
import { Plus, Trash2, Shield, AlertTriangle, Activity, Sparkles } from 'lucide-react';

interface RiskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: RiskInventoryItem | null;
}

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

  // Form states
  const [sectorId, setSectorId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [gheId, setGheId] = useState('');
  
  const [hazardCategory, setHazardCategory] = useState<HazardCategory>('FISICO');
  const [selectedHazardId, setSelectedHazardId] = useState('');
  const [hazardName, setHazardName] = useState('');
  const [hazardCode, setHazardCode] = useState('');
  const [sourceDescription, setSourceDescription] = useState('');
  const [healthDamage, setHealthDamage] = useState('');
  
  const [exposedCount, setExposedCount] = useState(1);
  const [exposureType, setExposureType] = useState<ExposureType>('CONTINUA');

  // Matrix states
  const [severity, setSeverity] = useState(3);
  const [probability, setProbability] = useState(3);

  // Prevention controls
  const [epcInput, setEpcInput] = useState('');
  const [epcList, setEpcList] = useState<string[]>([]);
  const [adminInput, setAdminInput] = useState('');
  const [adminList, setAdminList] = useState<string[]>([]);

  // EPIs
  const [epiList, setEpiList] = useState<EpiControl[]>([]);
  const [newEpiName, setNewEpiName] = useState('');
  const [newEpiCa, setNewEpiCa] = useState('');
  const [newEpiVal, setNewEpiVal] = useState('');

  // Environmental Measurements
  const [hasMeasurement, setHasMeasurement] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [unit, setUnit] = useState('dB(A)');
  const [measuredValue, setMeasuredValue] = useState<number>(0);
  const [actionLevel, setActionLevel] = useState<number>(0);
  const [toleranceLimit, setToleranceLimit] = useState<number>(0);
  const [methodology, setMethodology] = useState('');
  const [equipmentUsed, setEquipmentUsed] = useState('');

  const [actionRequired, setActionRequired] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Available options
  const companySectors = sectors.filter(
    s => !activeEstablishment || s.establishmentId === activeEstablishment.id
  );
  const sectorPositions = positions.filter(p => !sectorId || p.sectorId === sectorId);
  const sectorGhes = ghes.filter(g => !sectorId || g.sectorId === sectorId);

  // Populate or reset form
  useEffect(() => {
    if (initialItem) {
      setSectorId(initialItem.sectorId);
      setPositionId(initialItem.positionId || '');
      setGheId(initialItem.gheId || '');
      setHazardCategory(initialItem.hazardCategory);
      setHazardName(initialItem.hazardName);
      setHazardCode(initialItem.hazardCode || '');
      setSourceDescription(initialItem.sourceDescription);
      setHealthDamage(initialItem.healthDamage);
      setExposedCount(initialItem.exposedCount);
      setExposureType(initialItem.exposureType);
      setSeverity(initialItem.severity);
      setProbability(initialItem.probability);
      setEpcList(initialItem.epcExisting || []);
      setAdminList(initialItem.adminMeasuresExisting || []);
      setEpiList(initialItem.epiExisting || []);
      setActionRequired(initialItem.actionRequired);

      if (initialItem.measurements && initialItem.measurements.length > 0) {
        const m = initialItem.measurements[0];
        setHasMeasurement(true);
        setAgentName(m.agentName);
        setUnit(m.unit);
        setMeasuredValue(m.measuredValue);
        setActionLevel(m.actionLevel || 0);
        setToleranceLimit(m.toleranceLimit || 0);
        setMethodology(m.methodology);
        setEquipmentUsed(m.equipmentUsed);
      } else {
        setHasMeasurement(false);
      }
    } else {
      // Default reset
      const firstSector = companySectors[0]?.id || '';
      setSectorId(firstSector);
      setPositionId('');
      setGheId('');
      setHazardCategory('FISICO');
      setSelectedHazardId('');
      setHazardName('');
      setHazardCode('');
      setSourceDescription('');
      setHealthDamage('');
      setExposedCount(1);
      setExposureType('CONTINUA');
      setSeverity(3);
      setProbability(3);
      setEpcList([]);
      setAdminList([]);
      setEpiList([]);
      setHasMeasurement(false);
      setActionRequired(true);
    }
  }, [initialItem, isOpen]);

  // When catalog item is chosen
  const handleSelectHazardFromCatalog = (hazardId: string) => {
    setSelectedHazardId(hazardId);
    const item = hazards.find(h => h.id === hazardId);
    if (item) {
      setHazardCategory(item.category);
      setHazardName(item.name);
      setHazardCode(item.code);
      setHealthDamage(item.possibleDamages);
      if (item.suggestedEpc && epcList.length === 0) setEpcList([item.suggestedEpc]);
      if (item.suggestedAdminMeasures && adminList.length === 0) setAdminList([item.suggestedAdminMeasures]);
      if (item.suggestedEpi && epiList.length === 0) {
        setEpiList([{ name: item.suggestedEpi, ca: 'Consulte CA' }]);
      }
    }
  };

  const handleAddEpc = () => {
    if (epcInput.trim()) {
      setEpcList([...epcList, epcInput.trim()]);
      setEpcInput('');
    }
  };

  const handleAddAdmin = () => {
    if (adminInput.trim()) {
      setAdminList([...adminList, adminInput.trim()]);
      setAdminInput('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || !activeEstablishment || !activePgr) {
      alert('Selecione uma empresa, estabelecimento e documento PGR ativos.');
      return;
    }
    if (!sectorId) {
      alert('Selecione o setor de trabalho.');
      return;
    }
    if (!hazardName.trim()) {
      alert('Informe o nome ou descrição do perigo/fator de risco.');
      return;
    }

    setIsSaving(true);
    try {
      const { score, level } = calculateRiskLevel(severity, probability);

      let measurements: EnvironmentalMeasurement[] | undefined = undefined;
      if (hasMeasurement && agentName.trim()) {
        let resultStatus: 'ABAIXO_NIVEL_ACAO' | 'ACIMA_NIVEL_ACAO' | 'ACIMA_LIMITE_TOLERANCIA' = 'ABAIXO_NIVEL_ACAO';
        if (toleranceLimit > 0 && measuredValue >= toleranceLimit) {
          resultStatus = 'ACIMA_LIMITE_TOLERANCIA';
        } else if (actionLevel > 0 && measuredValue >= actionLevel) {
          resultStatus = 'ACIMA_NIVEL_ACAO';
        }

        measurements = [
          {
            id: 'meas-' + Date.now(),
            agentName: agentName.trim(),
            unit,
            measuredValue: Number(measuredValue),
            actionLevel: actionLevel ? Number(actionLevel) : undefined,
            toleranceLimit: toleranceLimit ? Number(toleranceLimit) : undefined,
            methodology: methodology || 'Norma de Higiene Ocupacional (NHO / Fundacentro)',
            equipmentUsed: equipmentUsed || 'Medidor de Leitura Direta Calibrado',
            resultStatus,
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
        exposedCount: Number(exposedCount) || 1,
        exposureType,
        probability,
        severity,
        riskScore: score,
        riskLevel: level,
        epcExisting: epcList,
        adminMeasuresExisting: adminList,
        epiExisting: epiList,
        measurements,
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
      alert('Erro ao salvar item no inventário de riscos.');
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
            <span>{initialItem ? 'Editar Risco no Inventário' : 'Novo Levantamento de Risco (NR-01.5.7)'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Preencha os dados da identificação de perigos, medidas de controle existentes e gradação na Matriz 5x5.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* 1. Localização e População Exposta */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              1. Localização & Trabalhadores Expostos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Setor / Ambiente *</Label>
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  required
                  className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="">Selecione o Setor</option>
                  {companySectors.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Cargo / Função (Opcional)</Label>
                <select
                  value={positionId}
                  onChange={(e) => setPositionId(e.target.value)}
                  className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="">Todos / Específico</option>
                  {sectorPositions.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} (CBO: {p.cbo})</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">GHE (Grupo Homogêneo)</Label>
                <select
                  value={gheId}
                  onChange={(e) => setGheId(e.target.value)}
                  className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="">Nenhum / Selecionar GHE</option>
                  {sectorGhes.map((g) => (
                    <option key={g.id} value={g.id}>{g.code} - {g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <Label className="text-xs">Quantidade de Trabalhadores Expostos</Label>
                <Input
                  type="number"
                  min="1"
                  value={exposedCount}
                  onChange={(e) => setExposedCount(Number(e.target.value))}
                  className="h-9 mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Regime de Exposição</Label>
                <select
                  value={exposureType}
                  onChange={(e) => setExposureType(e.target.value as ExposureType)}
                  className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="CONTINUA">Contínua (Durante toda a jornada)</option>
                  <option value="INTERMITENTE">Intermitente (Periódica / Em ciclos)</option>
                  <option value="EVENTUAL">Eventual (Esporádica / Ocasional)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Identificação do Perigo / Fator de Risco */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Identificação do Perigo (NR-01.5.4)
              </h4>
              <Badge variant="outline" className="text-[10px]">
                {HAZARD_CATEGORY_CONFIG[hazardCategory].label}
              </Badge>
            </div>

            {/* Category Selector Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {(['FISICO', 'QUIMICO', 'BIOLOGICO', 'ERGONOMICO', 'ACIDENTE'] as HazardCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setHazardCategory(cat);
                    setSelectedHazardId('');
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    hazardCategory === cat
                      ? 'bg-foreground text-background shadow-xs'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {HAZARD_CATEGORY_CONFIG[cat].label}
                </button>
              ))}
            </div>

            {/* Quick Catalog Picker */}
            <div className="pt-1">
              <Label className="text-xs flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Importar do Catálogo Padrão (Sugestão Automática):</span>
              </Label>
              <select
                value={selectedHazardId}
                onChange={(e) => handleSelectHazardFromCatalog(e.target.value)}
                className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
              >
                <option value="">Selecione para preenchimento automático...</option>
                {filteredHazards.map((h) => (
                  <option key={h.id} value={h.id}>
                    [{h.code}] {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="md:col-span-2">
                <Label className="text-xs">Nome do Perigo / Fator de Risco *</Label>
                <Input
                  value={hazardName}
                  onChange={(e) => setHazardName(e.target.value)}
                  placeholder="Ex: Ruído Contínuo gerado por torno"
                  required
                  className="h-9 mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Código eSocial (Tabela 24)</Label>
                <Input
                  value={hazardCode}
                  onChange={(e) => setHazardCode(e.target.value)}
                  placeholder="Ex: 01.01.001"
                  className="h-9 mt-1 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Fonte Geradora / Circunstância *</Label>
              <Textarea
                value={sourceDescription}
                onChange={(e) => setSourceDescription(e.target.value)}
                placeholder="Descreva detalhadamente como o perigo se manifesta no setor..."
                className="mt-1 text-xs min-h-[60px]"
              />
            </div>

            <div>
              <Label className="text-xs">Possíveis Danos ou Agravos à Saúde *</Label>
              <Textarea
                value={healthDamage}
                onChange={(e) => setHealthDamage(e.target.value)}
                placeholder="Ex: Perda Auditiva Induzida por Ruído (PAIR), zumbido, estresse..."
                className="mt-1 text-xs min-h-[60px]"
              />
            </div>
          </div>

          {/* 3. Avaliação e Gradação de Risco (Matriz 5x5) */}
          <Matrix5x5Selector
            severity={severity}
            probability={probability}
            onChange={(s, p) => {
              setSeverity(s);
              setProbability(p);
            }}
          />

          {/* 4. Medidas de Prevenção e Controle Existentes */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              4. Medidas de Prevenção & Controle Existentes
            </h4>

            {/* EPCs */}
            <div>
              <Label className="text-xs">Proteção Coletiva (EPC)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={epcInput}
                  onChange={(e) => setEpcInput(e.target.value)}
                  placeholder="Ex: Enclausuramento acústico, Exaustor..."
                  className="h-8 text-xs"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEpc(); } }}
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddEpc} className="h-8 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {epcList.map((epc, i) => (
                  <Badge key={i} variant="secondary" className="text-[11px] gap-1 pr-1">
                    {epc}
                    <button type="button" onClick={() => setEpcList(epcList.filter((_, idx) => idx !== i))} className="hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medidas Administrativas */}
            <div>
              <Label className="text-xs">Medidas Administrativas / Organizacionais</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                  placeholder="Ex: Pausas programadas, Treinamentos, Rodízio..."
                  className="h-8 text-xs"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAdmin(); } }}
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddAdmin} className="h-8 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {adminList.map((adm, i) => (
                  <Badge key={i} variant="secondary" className="text-[11px] gap-1 pr-1">
                    {adm}
                    <button type="button" onClick={() => setAdminList(adminList.filter((_, idx) => idx !== i))} className="hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* EPIs com CA */}
            <div>
              <Label className="text-xs">Equipamentos de Proteção Individual (EPI com CA)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                <Input
                  value={newEpiName}
                  onChange={(e) => setNewEpiName(e.target.value)}
                  placeholder="Nome do EPI (ex: Protetor auricular)"
                  className="h-8 text-xs sm:col-span-1"
                />
                <Input
                  value={newEpiCa}
                  onChange={(e) => setNewEpiCa(e.target.value)}
                  placeholder="Nº CA (ex: 14235)"
                  className="h-8 text-xs font-mono"
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddEpi} className="h-8 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Adicionar EPI
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {epiList.map((epi, i) => (
                  <Badge key={i} variant="outline" className="text-[11px] gap-1.5 p-1.5 pr-2 bg-background">
                    <span className="font-semibold">{epi.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">(CA: {epi.ca})</span>
                    <button type="button" onClick={() => setEpiList(epiList.filter((_, idx) => idx !== i))} className="hover:text-destructive ml-1">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Avaliação Quantitativa / Medições (Opcional) */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  5. Avaliação Ambiental Quantitativa (Opcional)
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Inclua dosimetrias de ruído, IBUTG de calor, iluminância ou laudos químicos
                </p>
              </div>
              <Switch checked={hasMeasurement} onCheckedChange={setHasMeasurement} />
            </div>

            {hasMeasurement && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <Label className="text-xs">Agente Medido</Label>
                  <Input
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Ex: Nível de Pressão Sonora"
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Unidade</Label>
                  <Input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Ex: dB(A), °C IBUTG, Lux"
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Valor Medido</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={measuredValue}
                    onChange={(e) => setMeasuredValue(Number(e.target.value))}
                    className="h-8 text-xs mt-1 font-mono font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs">Nível de Ação (NA)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={actionLevel}
                    onChange={(e) => setActionLevel(Number(e.target.value))}
                    placeholder="Ex: 80.0"
                    className="h-8 text-xs mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">Limite de Tolerância (LT)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={toleranceLimit}
                    onChange={(e) => setToleranceLimit(Number(e.target.value))}
                    placeholder="Ex: 85.0"
                    className="h-8 text-xs mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">Equipamento Utilizado</Label>
                  <Input
                    value={equipmentUsed}
                    onChange={(e) => setEquipmentUsed(e.target.value)}
                    placeholder="Ex: Audiodosímetro Calibrado"
                    className="h-8 text-xs mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Required toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                Gerar Item no Plano de Ação (5W2H)?
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Se marcado, o sistema criará automaticamente uma tarefa no cronograma de melhorias.
              </span>
            </div>
            <Switch checked={actionRequired} onCheckedChange={setActionRequired} />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="font-semibold shadow-sm">
              {isSaving ? 'Salvando...' : initialItem ? 'Salvar Alterações' : 'Adicionar ao Inventário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
