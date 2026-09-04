import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePgr } from '@/context/PgrContext';
import { DEFAULT_PGR_SECTIONS } from '@/lib/pgr-default-sections';
import { PgrSectionDefinition, PgrCustomSectionData } from '@/types/pgr-builder';
import { parseContentWithTables } from '@/lib/table-parser';
import { MarkdownSectionRenderer } from '@/lib/markdown-renderer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Table as TableIcon,
  Bold,
  Italic,
  List,
  Heading,
  FileCode,
  Sparkles,
  Edit3
} from 'lucide-react';
import { 
  fetchGlobalTemplateFromFirestore, 
  fetchDocumentSectionsFromFirestore, 
  saveDocumentSectionsToFirestore 
} from '@/lib/firebase-service';

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
  const [globalSections, setGlobalSections] = useState<Record<string, PgrCustomSectionData>>({});
  const [customSections, setCustomSections] = useState<Record<string, PgrCustomSectionData>>({});
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState<boolean>(false);

  // Carrega o Modelo Base Global e customizações salvas do documento (LocalStorage + Firestore)
  useEffect(() => {
    const loadAllTemplates = async () => {
      // 1. Carrega Modelo Base Global do cache local
      const globalSaved = localStorage.getItem('pgr_global_master_template_v1');
      if (globalSaved) {
        try {
          setGlobalSections(JSON.parse(globalSaved));
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Busca Modelo Base Global do Firestore
      try {
        const cloudGlobal = await fetchGlobalTemplateFromFirestore();
        if (cloudGlobal && Object.keys(cloudGlobal).length > 0) {
          setGlobalSections(cloudGlobal as Record<string, PgrCustomSectionData>);
          localStorage.setItem('pgr_global_master_template_v1', JSON.stringify(cloudGlobal));
        }
      } catch (e) {
        console.error(e);
      }

      // 3. Carrega ajustes específicos deste PGR (Cache Local + Firestore)
      if (pgr) {
        const storageKey = `pgr_custom_sections_v2_${pgr.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            setCustomSections(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }

        try {
          const cloudDocSections = await fetchDocumentSectionsFromFirestore(pgr.id);
          if (cloudDocSections && Object.keys(cloudDocSections).length > 0) {
            setCustomSections(cloudDocSections as Record<string, PgrCustomSectionData>);
            localStorage.setItem(storageKey, JSON.stringify(cloudDocSections));
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadAllTemplates();
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
  
  // Base global (ou default de fábrica)
  const baseTitle = globalSections[selectedSection.id]?.title || selectedSection.title;
  const baseSubtitle = globalSections[selectedSection.id]?.subtitle !== undefined ? globalSections[selectedSection.id].subtitle! : (selectedSection.subtitle || '');
  const baseContent = globalSections[selectedSection.id]?.content || selectedSection.defaultContent;

  // Valor atual (específico do documento ou herdado do global)
  const currentTitle = customSections[selectedSection.id]?.title !== undefined
    ? customSections[selectedSection.id].title!
    : baseTitle;

  const currentSubtitle = customSections[selectedSection.id]?.subtitle !== undefined
    ? customSections[selectedSection.id].subtitle!
    : baseSubtitle;

  const rawCurrentContent = customSections[selectedSection.id]?.content !== undefined
    ? customSections[selectedSection.id].content
    : baseContent;

  const currentContent = (selectedSection.id === 'sec-10' && (!rawCurrentContent.includes('Riscos Psicossociais') || !rawCurrentContent.includes('Tabela 6') || !rawCurrentContent.includes('Tabela 1 – Critérios de avaliação')))
    ? selectedSection.defaultContent
    : rawCurrentContent;

  const isCustomizedLocally = !!customSections[selectedSection.id]?.isModified;

  const updateCurrentSection = (fields: Partial<PgrCustomSectionData>) => {
    setCustomSections((prev) => {
      const existing = prev[selectedSection.id] || {
        title: baseTitle,
        subtitle: baseSubtitle,
        content: baseContent,
        isModified: false,
      };

      const updatedSection = {
        ...existing,
        ...fields,
        isModified: true,
        lastModifiedAt: new Date().toISOString(),
      };

      const next = {
        ...prev,
        [selectedSection.id]: updatedSection,
      };

      // Salva no LocalStorage e no Cloud Firestore
      const storageKey = `pgr_custom_sections_v2_${pgr.id}`;
      localStorage.setItem(storageKey, JSON.stringify(next));
      saveDocumentSectionsToFirestore(pgr.id, next);
      window.dispatchEvent(new Event('pgr_template_updated'));

      return next;
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetSection = () => {
    if (window.confirm(`Restaurar a Seção ${selectedSection.number} para o texto do Modelo Base Global?`)) {
      setCustomSections((prev) => {
        const next = { ...prev };
        delete next[selectedSection.id];
        const storageKey = `pgr_custom_sections_v2_${pgr.id}`;
        localStorage.setItem(storageKey, JSON.stringify(next));
        saveDocumentSectionsToFirestore(pgr.id, next);
        window.dispatchEvent(new Event('pgr_template_updated'));
        return next;
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleSaveAll = () => {
    const storageKey = `pgr_custom_sections_v2_${pgr.id}`;
    localStorage.setItem(storageKey, JSON.stringify(customSections));
    saveDocumentSectionsToFirestore(pgr.id, customSections);
    window.dispatchEvent(new Event('pgr_template_updated'));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Inserção inteligente de formatação inline (negrito e itálico)
  const applyInlineFormatting = (prefix: string, suffix: string, defaultText: string) => {
    const textarea = document.getElementById('section-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      updateCurrentSection({ content: currentContent + '\n' + prefix + defaultText + suffix });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentContent.substring(start, end);
    const before = currentContent.substring(0, start);
    const after = currentContent.substring(end);

    let newText = '';
    let cursorStart = start;
    let cursorEnd = end;

    if (selectedText.length > 0) {
      if (selectedText.startsWith(prefix) && selectedText.endsWith(suffix) && selectedText.length >= prefix.length + suffix.length) {
        const unwrapped = selectedText.substring(prefix.length, selectedText.length - suffix.length);
        newText = before + unwrapped + after;
        cursorStart = start;
        cursorEnd = start + unwrapped.length;
      } else {
        const wrapped = prefix + selectedText + suffix;
        newText = before + wrapped + after;
        cursorStart = start;
        cursorEnd = start + wrapped.length;
      }
    } else {
      const insert = prefix + defaultText + suffix;
      newText = before + insert + after;
      cursorStart = start + prefix.length;
      cursorEnd = cursorStart + defaultText.length;
    }

    updateCurrentSection({ content: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorStart, cursorEnd);
    }, 40);
  };

  // Inserção de templates de tabelas e formatações no texto
  const insertFormatting = (template: string) => {
    const textarea = document.getElementById('section-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      updateCurrentSection({ content: currentContent + '\n\n' + template });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = currentContent.substring(0, start);
    const after = currentContent.substring(end);
    const newContent = before + template + after;

    updateCurrentSection({ content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + template.length, start + template.length);
    }, 50);
  };

  const insertTable = (cols: number, rows: number) => {
    let tableMd = '\n\n';
    // Header
    const headers = Array.from({ length: cols }, (_, i) => `Coluna ${i + 1}`);
    tableMd += `| ${headers.join(' | ')} |\n`;
    tableMd += `| ${headers.map(() => ':---').join(' | ')} |\n`;
    // Rows
    for (let r = 1; r <= rows; r++) {
      const cells = Array.from({ length: cols }, (_, c) => `Item ${r}.${c + 1}`);
      tableMd += `| ${cells.join(' | ')} |\n`;
    }
    tableMd += '\n';
    insertFormatting(tableMd);
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

  // Renderiza blocos de texto e tabelas no modo preview
  const parsedBlocks = parseContentWithTables(currentContent);

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
            <span>Voltar</span>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-emerald-600" />
                Construtor de Seções & Editor de Tabelas do PGR
              </h1>
              <Badge variant="outline" className="text-[10px] font-mono font-bold">
                {pgr.code} (v{pgr.version})
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Altere nomes das seções, edite textos e insira tabelas personalizadas para a empresa <strong className="text-foreground">{activeCompany.name}</strong>
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
            <span>Ver Documento</span>
          </Button>

          {/* Opção Word temporariamente ocultada (recurso preservado no código para ativação futura) */}
          {/*
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
          */}

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

      {/* Grid Principal: 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: LISTA DE 18 CAPÍTULOS */}
        <div className="lg:col-span-4 bg-card border border-border rounded-xl p-3 shadow-xs space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto sticky top-40">
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Capítulos do Documento (18)
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {Object.keys(customSections).filter(k => customSections[k]?.isModified).length} editadas
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
                      const custom = customSections[sec.id];
                      const titleToShow = custom?.title || sec.title;
                      const hasCustom = !!custom?.isModified;

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
                              <div className="line-clamp-1">{titleToShow}</div>
                              <div className="text-[10px] text-muted-foreground line-clamp-1 font-normal">
                                {custom?.subtitle || sec.subtitle}
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

        {/* COLUNA DIREITA: PAINEL DE EDIÇÃO & INSERÇÃO DE TABELAS */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4 bg-muted/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono font-bold text-xs bg-background">
                    Capítulo {selectedSection.number}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Configuração e Edição da Seção</span>
                </div>

                <div className="flex items-center gap-2">
                  {!selectedSection.isSystemData && isCustomizedLocally && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetSection}
                      className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
                      title="Desfazer customização pontual e voltar ao Modelo Base Global"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Voltar ao Modelo Base</span>
                    </Button>
                  )}

                  {!selectedSection.isSystemData && (
                    <div className="flex items-center border border-border rounded-lg p-0.5 bg-background text-xs">
                      <button
                        onClick={() => setViewMode('edit')}
                        className={`px-3 py-1 rounded-md font-medium transition-all ${
                          viewMode === 'edit'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Edit3 className="h-3.5 w-3.5 inline mr-1" />
                        Editor
                      </button>
                      <button
                        onClick={() => setViewMode('preview')}
                        className={`px-3 py-1 rounded-md font-medium transition-all ${
                          viewMode === 'preview'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5 inline mr-1" />
                        Preview da Tabela / Texto
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CAMPOS PARA TROCAR O NOME E SUBTÍTULO DA SEÇÃO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <Label className="text-xs font-semibold">Nome / Título da Seção</Label>
                  <Input
                    value={currentTitle}
                    onChange={(e) => updateCurrentSection({ title: e.target.value })}
                    placeholder="Ex: 5. OBJETIVOS DO PROGRAMA"
                    className="h-9 mt-1 text-xs font-bold bg-background"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Subtítulo / Descrição Curta</Label>
                  <Input
                    value={currentSubtitle}
                    onChange={(e) => updateCurrentSection({ subtitle: e.target.value })}
                    placeholder="Ex: Diretrizes e metas de prevenção..."
                    className="h-9 mt-1 text-xs bg-background"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
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

                  {selectedSection.id === 'sec-12' && (
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

                  {selectedSection.id === 'sec-13' && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground">Ações do Plano de Ação 5W2H ({pgrContext.actionPlans.length}):</p>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50 text-[11px]">
                              <TableHead>O que fazer (What)</TableHead>
                              <TableHead>Responsável (Who)</TableHead>
                              <TableHead>Prazo (When)</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pgrContext.actionPlans.map((a) => (
                              <TableRow key={a.id} className="text-xs">
                                <TableCell className="font-semibold">{a.what}</TableCell>
                                <TableCell>{a.who || 'SESMT'}</TableCell>
                                <TableCell>{a.whenDate ? formatDate(a.whenDate) : 'Contínuo'}</TableCell>
                                <TableCell className="text-center"><Badge variant="outline">{a.status}</Badge></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* CASO 2: SEÇÃO DE TEXTO EDITÁVEL COM INSERÇÃO DE TABELAS */
                <div className="space-y-4">
                  {/* BARRA DE FERRAMENTAS PARA INSERIR TABELAS E FORMATAÇÃO */}
                  {viewMode === 'edit' && (
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-muted/40 border border-border rounded-xl">
                      <span className="text-[11px] font-bold text-muted-foreground px-2 flex items-center gap-1">
                        <TableIcon className="h-3.5 w-3.5 text-emerald-600" />
                        Inserir Tabelas:
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertTable(3, 3)}
                        className="h-7 text-[11px] gap-1 bg-background hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
                        title="Inserir tabela com 3 colunas e 3 linhas"
                      >
                        + Tabela 3x3
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertTable(2, 4)}
                        className="h-7 text-[11px] gap-1 bg-background hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
                        title="Inserir tabela com 2 colunas e 4 linhas"
                      >
                        + Tabela 2x4
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertTable(4, 3)}
                        className="h-7 text-[11px] gap-1 bg-background hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
                        title="Inserir tabela com 4 colunas e 3 linhas"
                      >
                        + Tabela 4x3
                      </Button>

                      <Separator orientation="vertical" className="h-4 mx-1" />

                      <span className="text-[11px] font-bold text-muted-foreground px-1">Formatação:</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => applyInlineFormatting('**', '**', 'texto em negrito')}
                        className="h-7 px-2.5 text-xs font-bold hover:bg-muted"
                        title="Negrito (**texto**)"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => applyInlineFormatting('*', '*', 'texto em itálico')}
                        className="h-7 px-2.5 text-xs italic hover:bg-muted"
                        title="Itálico (*texto*)"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('\n• Item da lista\n• Segundo item\n')}
                        className="h-7 px-2.5 text-xs hover:bg-muted"
                        title="Lista com Marcadores"
                      >
                        <List className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  {/* VISUALIZAÇÃO OU EDITOR */}
                  {viewMode === 'edit' ? (
                    <div className="space-y-2">
                      <Textarea
                        id="section-textarea"
                        value={currentContent}
                        onChange={(e) => updateCurrentSection({ content: e.target.value })}
                        className="min-h-[400px] font-mono text-xs leading-relaxed p-4 border border-input focus:ring-1 focus:ring-ring resize-y rounded-xl bg-background"
                        placeholder="Digite ou personalize o texto técnico desta seção. Você pode inserir tabelas usando o formato Markdown..."
                      />
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>
                          {isCustomizedLocally ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Ajuste específico ativo para este documento.</span>
                          ) : (
                            <span className="text-muted-foreground">✓ Herdando do Modelo Base Global.</span>
                          )}
                          <span className="ml-2 font-mono text-[10px]">({currentContent.length} caracteres | {currentContent.split(/\s+/).filter(Boolean).length} palavras)</span>
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
                  ) : (
                    /* MODO PREVIEW COM TABELAS RENDERIZADAS VISUALMENTE */
                    <div className="p-6 bg-muted/20 border border-border rounded-xl space-y-6 text-xs text-foreground leading-relaxed">
                      <div className="border-b border-border pb-3">
                        <h2 className="text-base font-bold text-foreground">{currentTitle}</h2>
                        {currentSubtitle && <p className="text-xs text-muted-foreground">{currentSubtitle}</p>}
                      </div>

                      <MarkdownSectionRenderer content={currentContent} />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};
