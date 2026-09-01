import React, { useState, useEffect } from 'react';
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
import { 
  Save, 
  RotateCcw, 
  Eye, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Table as TableIcon,
  Bold,
  Italic,
  List,
  Heading,
  Sparkles,
  Edit3,
  BookOpen,
  Info
} from 'lucide-react';
import { 
  fetchGlobalTemplateFromFirestore, 
  saveGlobalTemplateToFirestore 
} from '@/lib/firebase-service';

const GLOBAL_STORAGE_KEY = 'pgr_global_master_template_v1';

export const GlobalPgrTemplatePage: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-4'); // Default: Introdução
  const [globalSections, setGlobalSections] = useState<Record<string, PgrCustomSectionData>>({});
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Carrega o template global do Firestore (com fallback para localStorage) na inicialização
  useEffect(() => {
    const loadTemplate = async () => {
      // 1. Tenta carregar do cache local primeiro para resposta instantânea
      const saved = localStorage.getItem(GLOBAL_STORAGE_KEY);
      if (saved) {
        try {
          setGlobalSections(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Busca a versão mais atualizada na nuvem do Firestore
      try {
        const cloudData = await fetchGlobalTemplateFromFirestore();
        if (cloudData && Object.keys(cloudData).length > 0) {
          setGlobalSections(cloudData as Record<string, PgrCustomSectionData>);
          localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(cloudData));
        }
      } catch (err) {
        console.error('Erro ao sincronizar template do Firestore:', err);
      }
    };

    loadTemplate();
  }, []);

  const selectedSection = DEFAULT_PGR_SECTIONS.find((s) => s.id === selectedSectionId) || DEFAULT_PGR_SECTIONS[0];

  const currentTitle = globalSections[selectedSection.id]?.title !== undefined
    ? globalSections[selectedSection.id].title!
    : selectedSection.title;

  const currentSubtitle = globalSections[selectedSection.id]?.subtitle !== undefined
    ? globalSections[selectedSection.id].subtitle!
    : (selectedSection.subtitle || '');

  const rawContent = globalSections[selectedSection.id]?.content !== undefined
    ? globalSections[selectedSection.id].content
    : selectedSection.defaultContent;

  const currentContent = (selectedSection.id === 'sec-10' && (!rawContent.includes('Riscos Psicossociais') || !rawContent.includes('Tabela 6') || !rawContent.includes('Tabela 1 – Critérios de avaliação')))
    ? selectedSection.defaultContent
    : rawContent;

  const isCustomized = !!globalSections[selectedSection.id]?.isModified;

  const updateCurrentSection = (fields: Partial<PgrCustomSectionData>) => {
    setGlobalSections((prev) => {
      const existing = prev[selectedSection.id] || {
        title: selectedSection.title,
        subtitle: selectedSection.subtitle || '',
        content: selectedSection.defaultContent,
        isModified: false,
      };

      const updated = {
        ...existing,
        ...fields,
        isModified: true,
        lastModifiedAt: new Date().toISOString(),
      };

      const next = {
        ...prev,
        [selectedSection.id]: updated,
      };

      // Salva no LocalStorage e no Cloud Firestore
      localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(next));
      saveGlobalTemplateToFirestore(next);
      window.dispatchEvent(new Event('pgr_template_updated'));

      return next;
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetSection = () => {
    if (window.confirm(`Restaurar o título e texto padrão de fábrica da Seção ${selectedSection.number}?`)) {
      setGlobalSections((prev) => {
        const next = { ...prev };
        delete next[selectedSection.id];
        localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event('pgr_template_updated'));
        return next;
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleResetAllToFactory = () => {
    if (window.confirm('Atenção: Deseja restaurar TODAS as seções do Modelo Base para os textos originais de fábrica da ES Engenharia?')) {
      localStorage.removeItem(GLOBAL_STORAGE_KEY);
      setGlobalSections({});
      window.dispatchEvent(new Event('pgr_template_updated'));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleSaveGlobal = () => {
    localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(globalSections));
    window.dispatchEvent(new Event('pgr_template_updated'));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Inserção inteligente de formatação inline (negrito e itálico)
  const applyInlineFormatting = (prefix: string, suffix: string, defaultText: string) => {
    const textarea = document.getElementById('global-section-textarea') as HTMLTextAreaElement;
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

  // Inserção de tabelas e formatação
  const insertFormatting = (template: string) => {
    const textarea = document.getElementById('global-section-textarea') as HTMLTextAreaElement;
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
    const headers = Array.from({ length: cols }, (_, i) => `Coluna ${i + 1}`);
    tableMd += `| ${headers.join(' | ')} |\n`;
    tableMd += `| ${headers.map(() => ':---').join(' | ')} |\n`;
    for (let r = 1; r <= rows; r++) {
      const cells = Array.from({ length: cols }, (_, c) => `Dado ${r}.${c + 1}`);
      tableMd += `| ${cells.join(' | ')} |\n`;
    }
    tableMd += '\n';
    insertFormatting(tableMd);
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

  const parsedBlocks = parseContentWithTables(currentContent);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Barra de Topo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs sticky top-20 z-20 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Modelo Base & Textos Padrão do PGR
            </h1>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
              Template Mestre Global
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure os textos técnicos e títulos padrão que servirão de molde para <strong>todos os novos PGRs</strong> gerados no sistema.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAllToFactory}
            className="text-xs text-muted-foreground hover:text-destructive gap-1.5 h-9"
            title="Restaurar todo o template para o padrão original de fábrica"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar Padrão de Fábrica</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSaveGlobal}
            className="text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-9 shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaved ? '✓ Modelo Base Salvo!' : 'Salvar Modelo Base'}</span>
          </Button>
        </div>
      </div>

      {/* Alerta Explicativo */}
      <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs flex items-start gap-2.5">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-950 dark:text-blue-200">Como funciona o Modelo Base Global:</strong>
          <p className="text-blue-700 dark:text-blue-300 leading-relaxed mt-0.5">
            Os textos e tabelas configurados nesta tela serão utilizados automaticamente como ponto de partida em todos os novos PGRs. Quando você abrir o documento de uma empresa específica, ele já virá com esse conteúdo preenchido, permitindo que você faça apenas ajustes pontuais se necessário.
          </p>
        </div>
      </div>

      {/* Grid Principal: 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: LISTA DE SEÇÕES DO TEMPLATE MESTRE */}
        <div className="lg:col-span-4 bg-card border border-border rounded-xl p-3 shadow-xs space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto sticky top-40">
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Seções do Modelo Base (18)
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {Object.keys(globalSections).filter(k => globalSections[k]?.isModified).length} personalizadas
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
                      const custom = globalSections[sec.id];
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

        {/* COLUNA DIREITA: EDITOR DO MODELO BASE */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4 bg-muted/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono font-bold text-xs bg-background">
                    Capítulo {selectedSection.number}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Texto Mestre do Modelo Base</span>
                </div>

                <div className="flex items-center gap-2">
                  {!selectedSection.isSystemData && isCustomized && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetSection}
                      className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
                      title="Restaurar o texto padrão de fábrica da ES Engenharia"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restaurar Esta Seção</span>
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
                        Preview Formatado
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CAMPOS DE TÍTULO E SUBTÍTULO PADRÃO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <Label className="text-xs font-semibold">Título Padrão da Seção</Label>
                  <Input
                    value={currentTitle}
                    onChange={(e) => updateCurrentSection({ title: e.target.value })}
                    placeholder="Ex: 5. OBJETIVOS DO PROGRAMA"
                    className="h-9 mt-1 text-xs font-bold bg-background"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Subtítulo Padrão</Label>
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
              {/* CASO 1: SEÇÃO DE DADOS DINÂMICOS DO SISTEMA */}
              {selectedSection.isSystemData ? (
                <div className="space-y-3 p-4 bg-muted/20 border border-border rounded-xl text-xs">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span>Seção Dinâmica de Sistema</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Esta seção ({selectedSection.title}) é alimentada automaticamente com os dados cadastrais da empresa ativa (CNPJ, CNAE, Setores, Cargos CBO, Matriz de Riscos 5x5 ou Ações 5W2H). Não requer edição de texto fixo no modelo base.
                  </p>
                </div>
              ) : (
                /* CASO 2: SEÇÃO DE TEXTO PADRÃO COM INSERÇÃO DE TABELAS */
                <div className="space-y-4">
                  {/* BARRA DE FERRAMENTAS */}
                  {viewMode === 'edit' && (
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-muted/40 border border-border rounded-xl">
                      <span className="text-[11px] font-bold text-muted-foreground px-2 flex items-center gap-1">
                        <TableIcon className="h-3.5 w-3.5 text-emerald-600" />
                        Tabelas Padrão:
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertTable(3, 3)}
                        className="h-7 text-[11px] gap-1 bg-background hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
                      >
                        + Tabela 3x3
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertTable(2, 4)}
                        className="h-7 text-[11px] gap-1 bg-background hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
                      >
                        + Tabela 2x4
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertTable(4, 3)}
                        className="h-7 text-[11px] gap-1 bg-background hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
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

                  {viewMode === 'edit' ? (
                    <div className="space-y-2">
                      <Textarea
                        id="global-section-textarea"
                        value={currentContent}
                        onChange={(e) => updateCurrentSection({ content: e.target.value })}
                        className="min-h-[420px] font-mono text-xs leading-relaxed p-4 border border-input focus:ring-1 focus:ring-ring resize-y rounded-xl bg-background"
                        placeholder="Digite o texto base oficial que será utilizado por padrão em todos os novos PGRs..."
                      />
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>
                          {currentContent.length} caracteres | {currentContent.split(/\s+/).filter(Boolean).length} palavras
                        </span>
                        <Button
                          size="sm"
                          onClick={handleSaveGlobal}
                          className="text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>{isSaved ? 'Modelo Salvo!' : 'Salvar Modelo Base'}</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* PREVIEW FORMATADO */
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
