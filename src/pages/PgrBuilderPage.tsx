import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePgr } from '@/context/PgrContext';
import { DEFAULT_PGR_SECTIONS } from '@/lib/pgr-default-sections';
import { PgrSectionDefinition } from '@/types/pgr-builder';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { generatePgrDocx } from '@/lib/docx-generator';
import { generatePgrPdf } from '@/lib/pdf-generator';
import { formatCNPJ, formatDate } from '@/lib/utils';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  Eye, 
  Download, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Building2, 
  UserCheck, 
  AlertTriangle, 
  Calendar,
  Sparkles,
  FileCode
} from 'lucide-react';

export const PgrBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    activeCompany, 
    establishments, 
    sectors, 
    positions, 
    ghes, 
    professionals, 
    pgrDocuments, 
    riskInventory, 
    actionPlans 
  } = usePgr();

  const pgr = pgrDocuments.find((p) => p.id === id) || pgrDocuments[0];
  const establishment = establishments.find((e) => e.id === pgr?.establishmentId) || establishments[0];

  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-4'); // Default to Introdução
  const [customSections, setCustomSections] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState<boolean>(false);

  // Carrega customizações salvas do localStorage para este PGR
  useEffect(() => {
    if (pgr) {
      const storageKey = `pgr_custom_sections_${pgr.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setCustomSections(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [pgr]);

  if (!pgr || !activeCompany) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Documento PGR não encontrado</h2>
        <p className="text-muted-foreground text-sm">Selecione uma empresa com um PGR cadastrado.</p>
        <Button onClick={() => navigate('/documentos-pgr')}>Voltar para Documentos</Button>
      </div>
    );
  }

  const selectedSection = DEFAULT_PGR_SECTIONS.find((s) => s.id === selectedSectionId) || DEFAULT_PGR_SECTIONS[0];
  const currentText = customSections[selectedSection.id] !== undefined 
    ? customSections[selectedSection.id] 
    : selectedSection.defaultContent;

  const isCustomized = customSections[selectedSection.id] !== undefined && 
    customSections[selectedSection.id] !== selectedSection.defaultContent;

  const handleTextChange = (text: string) => {
    setCustomSections((prev) => ({
      ...prev,
      [selectedSection.id]: text,
    }));
    setIsSaved(false);
  };

  const handleResetSection = () => {
    if (window.confirm(`Restaurar o texto padrão oficial da Seção ${selectedSection.number} (${selectedSection.title})?`)) {
      setCustomSections((prev) => {
        const next = { ...prev };
        delete next[selectedSection.id];
        return next;
      });
      setIsSaved(false);
    }
  };

  const handleSaveAll = () => {
    const storageKey = `pgr_custom_sections_${pgr.id}`;
    localStorage.setItem(storageKey, JSON.stringify(customSections));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const pgrContext = {
    company: activeCompany,
    establishment,
    sectors,
    positions,
    ghes,
    professionals,
    pgr,
    riskInventory: riskInventory.filter((r) => r.pgrId === pgr.id || r.companyId === activeCompany.id),
    actionPlans: actionPlans.filter((a) => a.pgrId === pgr.id || a.companyId === activeCompany.id),
  };

  const handleDownloadDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      await generatePgrDocx(pgrContext);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar arquivo Word.');
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  const handleDownloadPdf = () => {
    generatePgrPdf(pgrContext);
  };

  const categories = [
    { key: 'pretextual', label: '1. Capa & Estrutura Cadastral' },
    { key: 'normative', label: '2. Fundamentação & Normas' },
    { key: 'methodology', label: '3. GRO & Matriz de Risco' },
    { key: 'environments', label: '4. Setores & Cargos CBO' },
    { key: 'risks', label: '5. Inventário 5x5' },
    { key: 'actions', label: '6. Plano de Ação 5W2H' },
    { key: 'posttextual', label: '7. Emergências & Termos' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Barra Superior de Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs sticky top-20 z-20 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/documentos-pgr/${pgr.id}`)}
            className="text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Voltar ao Documento</span>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-emerald-600" />
                Construtor & Editor de Seções do PGR
              </h1>
              <Badge variant="outline" className="text-[10px] font-mono font-bold">
                {pgr.code} (v{pgr.version})
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Personalize textos técnicos ou visualize blocos integrados do sistema para a empresa <strong className="text-foreground">{activeCompany.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/documentos-pgr/${pgr.id}`)}
            className="text-xs gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Ver Documento Montado</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isGeneratingDocx}
            onClick={handleDownloadDocx}
            className="text-xs gap-1.5 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 font-semibold"
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>{isGeneratingDocx ? 'Gerando Word...' : 'Baixar Word (.docx)'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            className="text-xs gap-1.5 text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Baixar PDF</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSaveAll}
            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaved ? '✓ Salvo!' : 'Salvar Alterações'}</span>
          </Button>
        </div>
      </div>

      {/* Grid Principal: 2 Colunas (Menu Lateral de Seções + Editor Central) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: LISTA DE 18 SEÇÕES (4 COLUNAS EM TELAS GRANDES) */}
        <div className="lg:col-span-4 bg-card border border-border rounded-xl p-3 shadow-xs space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto sticky top-40">
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Capítulos do Documento (18)
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {Object.keys(customSections).length} editadas
            </span>
          </div>

          <Separator />

          <div className="space-y-4">
            {categories.map((cat) => {
              const catSections = DEFAULT_PGR_SECTIONS.filter((s) => s.category === cat.key);
              if (catSections.length === 0) return null;

              return (
                <div key={cat.key} className="space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase px-2 py-0.5">
                    {cat.label}
                  </div>

                  <div className="space-y-1">
                    {catSections.map((sec) => {
                      const isSelected = sec.id === selectedSectionId;
                      const hasCustom = customSections[sec.id] !== undefined && customSections[sec.id] !== sec.defaultContent;

                      return (
                        <button
                          key={sec.id}
                          onClick={() => setSelectedSectionId(sec.id)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start justify-between gap-2 border ${
                            isSelected
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200 font-semibold shadow-2xs'
                              : 'border-transparent hover:bg-muted/50 text-foreground'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-mono font-bold text-[11px] text-muted-foreground mt-0.5">
                              {sec.number}.
                            </span>
                            <div>
                              <div className="line-clamp-1">{sec.title}</div>
                              <div className="text-[10px] text-muted-foreground line-clamp-1 font-normal">
                                {sec.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 mt-0.5">
                            {sec.isSystemData ? (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300">
                                Sistema
                              </Badge>
                            ) : hasCustom ? (
                              <Badge variant="success" className="text-[9px] px-1 py-0">
                                Editado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground">
                                Padrão
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA: PAINEL DE EDIÇÃO DA SEÇÃO SELECIONADA */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4 bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono font-bold text-xs bg-background">
                      Seção {selectedSection.number}
                    </Badge>
                    <CardTitle className="text-lg font-bold text-foreground">
                      {selectedSection.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {selectedSection.description}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {!selectedSection.isSystemData && isCustomized && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetSection}
                      className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
                      title="Restaurar o texto padrão original da ES Engenharia"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restaurar Padrão</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* CASO 1: SEÇÃO DE DADOS DO SISTEMA */}
              {selectedSection.isSystemData ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-blue-900 dark:text-blue-300 block mb-0.5">Preenchimento Automático do Sistema</strong>
                      <p className="text-blue-700 dark:text-blue-400 leading-relaxed">
                        {selectedSection.systemDataSummary}
                      </p>
                    </div>
                  </div>

                  {/* PREVIEWS ESPECÍFICOS POR SEÇÃO DE SISTEMA */}
                  {selectedSection.id === 'sec-2' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-4 bg-muted/20 border border-border rounded-xl">
                      <div><strong className="text-muted-foreground">Razão Social:</strong> <span className="font-semibold text-foreground">{activeCompany.name}</span></div>
                      <div><strong className="text-muted-foreground">Nome Fantasia:</strong> <span className="font-semibold text-foreground">{activeCompany.tradeName || activeCompany.name}</span></div>
                      <div><strong className="text-muted-foreground">CNPJ:</strong> <span className="font-mono font-semibold text-foreground">{formatCNPJ(activeCompany.cnpj)}</span></div>
                      <div><strong className="text-muted-foreground">Grau de Risco:</strong> <span className="font-semibold text-foreground">Grau {activeCompany.riskGrade} (NR-04)</span></div>
                      <div className="sm:col-span-2"><strong className="text-muted-foreground">CNAE:</strong> <span className="text-foreground">{activeCompany.cnae} - {activeCompany.cnaeDescription}</span></div>
                      <div className="sm:col-span-2"><strong className="text-muted-foreground">Endereço Matriz:</strong> <span className="text-foreground">{activeCompany.address.street}, {activeCompany.address.number} - {activeCompany.address.city}/{activeCompany.address.state}</span></div>
                    </div>
                  )}

                  {selectedSection.id === 'sec-3' && (
                    <div className="p-4 bg-muted/20 border border-border rounded-xl text-xs space-y-2">
                      {professionals.length > 0 ? (
                        <>
                          <div><strong>Responsável Técnico (RT):</strong> {professionals[0].name} ({professionals[0].role})</div>
                          <div><strong>Registro de Classe:</strong> {professionals[0].registrationCouncil}: {professionals[0].registrationNumber}/{professionals[0].registrationState}</div>
                          <div><strong>ART / RRT:</strong> {professionals[0].artRrt || 'Emitida'}</div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">Nenhum profissional RT cadastrado.</p>
                      )}
                    </div>
                  )}

                  {selectedSection.id === 'sec-11' && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground">Setores Cadastrados ({sectors.length}):</p>
                      <div className="space-y-2">
                        {sectors.map((s) => (
                          <div key={s.id} className="p-3 bg-muted/20 border border-border rounded-lg text-xs space-y-1">
                            <span className="font-bold text-foreground">{s.name}</span>
                            <p className="text-muted-foreground text-[11px]">
                              Piso: {s.physicalCharacteristics.floorType} | Paredes: {s.physicalCharacteristics.wallType} | Ventilação: {s.physicalCharacteristics.ventilationType} | Iluminação: {s.physicalCharacteristics.lightingType}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSection.id === 'sec-12' && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground">Cargos & Funções ({positions.length}):</p>
                      <div className="space-y-2">
                        {positions.map((p) => (
                          <div key={p.id} className="p-3 bg-muted/20 border border-border rounded-lg text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground">{p.title} (CBO: {p.cbo})</span>
                              <Badge variant="outline" className="text-[10px]">{p.workerCount} expostos</Badge>
                            </div>
                            <p className="text-muted-foreground text-[11px]"><strong>Rotina:</strong> {p.routineActivities}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSection.id === 'sec-14' && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground">Riscos Ocupacionais no Inventário ({pgrContext.riskInventory.length}):</p>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50 text-[11px]">
                              <TableHead>Perigo / Agente</TableHead>
                              <TableHead>Categoria</TableHead>
                              <TableHead className="text-center">Matriz 5x5</TableHead>
                              <TableHead>Nível de Risco</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pgrContext.riskInventory.map((r) => (
                              <TableRow key={r.id} className="text-xs">
                                <TableCell className="font-semibold">{r.hazardName}</TableCell>
                                <TableCell>{HAZARD_CATEGORY_CONFIG[r.hazardCategory]?.label || r.hazardCategory}</TableCell>
                                <TableCell className="text-center font-mono font-bold">P:{r.probability} × S:{r.severity} = {r.riskScore}</TableCell>
                                <TableCell><Badge variant="outline">{r.riskLevel}</Badge></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {selectedSection.id === 'sec-15' && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground">Ações 5W2H Programadas ({pgrContext.actionPlans.length}):</p>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50 text-[11px]">
                              <TableHead>O que (Ação)</TableHead>
                              <TableHead>Responsável</TableHead>
                              <TableHead>Prazo</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pgrContext.actionPlans.map((a) => (
                              <TableRow key={a.id} className="text-xs">
                                <TableCell className="font-semibold">{a.what}</TableCell>
                                <TableCell>{a.who}</TableCell>
                                <TableCell className="font-mono">{a.whenDate}</TableCell>
                                <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* CASO 2: SEÇÃO DE TEXTO TÉCNICO EDITÁVEL */
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-emerald-600" />
                      Texto Técnico da Seção (100% editável)
                    </span>
                    <span>
                      {currentText.length} caracteres | {currentText.split(/\s+/).filter(Boolean).length} palavras
                    </span>
                  </div>

                  <Textarea
                    value={currentText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="min-h-[360px] font-sans text-xs leading-relaxed p-4 border border-input focus:ring-1 focus:ring-ring resize-y rounded-xl"
                    placeholder="Digite ou personalize o texto técnico desta seção..."
                  />

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>
                      {isCustomized ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Modificações personalizadas ativas nesta seção.</span>
                      ) : (
                        <span>Utilizando o texto padrão oficial da ES Engenharia / EMEPE.</span>
                      )}
                    </span>
                    <Button
                      size="sm"
                      onClick={handleSaveAll}
                      className="text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>{isSaved ? 'Salvo com Sucesso!' : 'Salvar Alterações'}</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};
