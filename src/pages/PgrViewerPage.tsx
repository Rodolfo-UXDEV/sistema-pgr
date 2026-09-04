import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePgr } from '@/context/PgrContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { RiskLevelBadge } from '@/components/risk-matrix/RiskLevelBadge';
import { generatePgrPdf } from '@/lib/pdf-generator';
import { generatePgrDocx } from '@/lib/docx-generator';
import { generatePgrExcel } from '@/lib/excel-generator';
import { buildPgrFullDocument, filterContextForCompany, PgrDocumentContext, OFFICIAL_PGR_TEXTS } from '@/lib/pgr-official-template';
import { DEFAULT_PGR_SECTIONS } from '@/lib/pgr-default-sections';
import { getResolvedPgrSections } from '@/lib/pgr-template-resolver';
import { parseContentWithTables } from '@/lib/table-parser';
import { MarkdownSectionRenderer } from '@/lib/markdown-renderer';
import { HAZARD_CATEGORY_CONFIG, getNormativeRiskMatrix } from '@/lib/risk-matrix';
import { groupInventoryByGhe, isNoExposureRisk } from '@/lib/pgr-groups';
import { PgrCustomSectionData } from '@/types/pgr-builder';
import { ActionPlanItem } from '@/types/pgr';
import { getIssuerCompanyConfig, ISSUER_UPDATED_EVENT } from '@/lib/issuer-company-service';
import { formatDate } from '@/lib/utils';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Award,
  FileCode,
  FileSpreadsheet,
  Sliders
} from 'lucide-react';

export const PgrViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    activeCompany, 
    companies,
    establishments, 
    sectors, 
    positions, 
    ghes, 
    professionals, 
    pgrDocuments, 
    riskInventory, 
    actionPlans 
  } = usePgr();

  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [customSections, setCustomSections] = useState<Record<string, PgrCustomSectionData>>({});
  const [issuerConfig, setIssuerConfig] = useState(getIssuerCompanyConfig());

  const pgr = pgrDocuments.find((p) => p.id === id) || pgrDocuments[0];
  const currentCompany = (pgr?.companyId ? companies.find(c => c.id === pgr.companyId) : null) || activeCompany;
  const establishment = establishments.find((e) => e.id === pgr?.establishmentId) || (currentCompany ? establishments.find((e) => e.companyId === currentCompany.id) : null) || establishments[0] || (currentCompany ? {
    id: 'default-matriz',
    companyId: currentCompany.id,
    name: 'Unidade Matriz',
    code: '001',
    type: 'MATRIZ' as const,
    address: currentCompany.address,
    activity: currentCompany.cnaeDescription || 'Atividades Gerais',
    cnae: currentCompany.cnae || '',
    riskGrade: currentCompany.riskGrade || 1,
    totalWorkers: currentCompany.employeeCount || 1,
    responsibleName: currentCompany.legalRepresentative || '',
    responsiblePhone: currentCompany.phone || '',
    responsibleEmail: currentCompany.email || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } : undefined);

  const [resolvedList, setResolvedList] = useState(() => getResolvedPgrSections(pgr?.id));

  useEffect(() => {
    const refresh = () => {
      if (pgr) {
        setResolvedList(getResolvedPgrSections(pgr.id));
        setIssuerConfig(getIssuerCompanyConfig());
      }
    };
    window.addEventListener('pgr_template_updated', refresh);
    window.addEventListener(ISSUER_UPDATED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('pgr_template_updated', refresh);
      window.removeEventListener(ISSUER_UPDATED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [pgr]);

  if (!pgr || !currentCompany) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Documento PGR não encontrado</h2>
        <p className="text-muted-foreground text-sm">Selecione uma empresa com um PGR cadastrado.</p>
        <Button onClick={() => navigate('/documentos-pgr')}>Voltar para Documentos</Button>
      </div>
    );
  }

  const pgrContext: PgrDocumentContext = filterContextForCompany({
    company: currentCompany,
    establishment,
    pgr,
    professionals,
    sectors,
    positions,
    ghes,
    riskInventory,
    actionPlans,
  });

  const docData = buildPgrFullDocument(pgrContext);

  const getSectionTitle = (secId: string, defaultTitle: string) => {
    const found = resolvedList.find(s => s.id === secId);
    const raw = found?.title || defaultTitle;
    return raw.replace(/^\d+\.\s*/, '');
  };

  const getSectionContent = (secId: string, defaultContent: string) => {
    const found = resolvedList.find(s => s.id === secId);
    return found?.content || defaultContent;
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePgrPdf(pgrContext);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar PDF oficial.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      await generatePgrDocx(pgrContext);
    } catch (err) {
      console.error('Erro ao gerar DOCX:', err);
      alert('Erro ao gerar arquivo Word.');
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await generatePgrExcel(pgrContext);
    } catch (err) {
      console.error('Erro ao gerar Excel:', err);
      alert('Erro ao gerar planilha Excel.');
    }
  };

  // Renderizador de blocos de texto e tabelas customizadas com suporte a negrito e itálico
  const renderFormattedSection = (text: string) => {
    return <MarkdownSectionRenderer content={text} />;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs sticky top-0 z-10 backdrop-blur-md bg-card/90">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/documentos-pgr')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">{docData.header.code}</h1>
              <Badge variant="outline" className="font-mono text-[10px]">v{docData.header.version}</Badge>
              <Badge variant="success" className="text-[10px]">Modelo Oficial EMEPE</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{pgr.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/documentos-pgr/${pgr.id}/montagem`)}
            className="text-xs gap-1.5 border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 font-semibold"
            title="Abrir o Construtor e Editor de Seções do PGR"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Montar / Editar Seções</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Imprimir</span>
          </Button>

          {/* Opções Word e Excel temporariamente ocultadas (recurso preservado no código para ativação futura) */}
          {/*
          <Button
            variant="outline"
            size="sm"
            disabled={isGeneratingDocx}
            onClick={handleDownloadDocx}
            className="text-xs gap-1.5 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300 font-semibold"
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>{isGeneratingDocx ? 'Gerando Word...' : 'Baixar Word (.docx)'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadExcel}
            className="text-xs gap-1.5 border-emerald-200 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 font-semibold"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Baixar Excel (.xlsx)</span>
          </Button>
          */}

          <Button
            size="sm"
            disabled={isGeneratingPdf}
            onClick={handleDownloadPdf}
            className="text-xs gap-1.5 font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF Oficial'}</span>
          </Button>
        </div>
      </div>

      {/* DOCUMENT SHEET VIEW */}
      <div className="bg-card border border-border shadow-md rounded-2xl p-6 sm:p-12 space-y-10 text-foreground">
        
        {/* CAPA FORMAL */}
        <div className="text-center space-y-6 border-b border-border pb-12">
          {issuerConfig.logoUrl && (
            <div className="flex justify-center mb-1">
              <img 
                src={issuerConfig.logoUrl} 
                alt={`Logo ${issuerConfig.name}`} 
                className="h-16 md:h-20 max-w-xs object-contain"
              />
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">
              {issuerConfig.name || OFFICIAL_PGR_TEXTS.consultingCompany}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
              {issuerConfig.registrationCouncil || OFFICIAL_PGR_TEXTS.consultingCrea}
            </p>
          </div>

          <div className="py-6 space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              PROGRAMA DE GERENCIAMENTO DE RISCOS
            </h1>
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              PGR / GRO — NORMA REGULAMENTADORA Nº 01
            </p>
          </div>

          <div className="space-y-3 py-5 px-6 bg-muted/40 rounded-xl border border-border/60 max-w-xl mx-auto flex flex-col items-center">
            {docData.header.companyLogo && (
              <div className="p-2 bg-white rounded-lg border border-border shadow-2xs max-w-xs flex items-center justify-center">
                <img 
                  src={docData.header.companyLogo} 
                  alt={`Logo ${docData.header.companyName}`} 
                  className="h-14 max-w-full object-contain"
                />
              </div>
            )}
            <div className="space-y-0.5 text-center">
              <p className="text-lg font-bold text-foreground">{docData.header.companyName.toUpperCase()}</p>
              <p className="text-xs text-muted-foreground">CNPJ: {docData.header.cnpj} | {docData.header.establishmentName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left max-w-xl mx-auto p-4 bg-background border border-border rounded-xl font-medium">
            <div><strong>Código:</strong> {docData.header.code} (v{docData.header.version})</div>
            <div><strong>Data de Elaboração:</strong> {docData.header.elaborationDate}</div>
            <div className="sm:col-span-2">
              <strong>Responsável Técnico:</strong> {docData.header.techRespName} ({docData.header.techRespCouncil})
            </div>
          </div>
        </div>

        {/* 1. INDICE */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">1.</span> {getSectionTitle('sec-1', 'INDICE')}
          </h2>
          {renderFormattedSection(
            getSectionContent(
              'sec-1',
              docData.sections.find(s => s.id === 'sec-1')?.content || DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-1')?.defaultContent || ''
            )
          )}
        </section>

        {/* 2. CONTROLE DE REVISÕES */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">2.</span> {getSectionTitle('sec-2', 'CONTROLE DE REVISÕES DO DOCUMENTO')}
          </h2>
          {renderFormattedSection(
            getSectionContent(
              'sec-2',
              `O Programa de Gerenciamento de Riscos (PGR) deve ser um processo contínuo a ser revisto a cada 2 (dois) anos ou quando ocorrerem modificações nas tecnologias, processos, postos de trabalho ou após a identificação de inadequações no controle de riscos.\n\n| Revisão | Data | Descrição / Motivo da Revisão |\n| :--- | :--- | :--- |\n| ${docData.header.version} | ${docData.header.elaborationDate} | ${pgr.revisionReason || 'Emissão Oficial do PGR e Inventário de Riscos Ocupacionais'} |`
            )
          )}
        </section>

        {/* 3. DADOS CADASTRAIS */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">3.</span> {getSectionTitle('sec-3', 'INFORMAÇÕES CADASTRAIS DO EMPREGADOR E ESTABELECIMENTO')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
              <span className="text-muted-foreground font-semibold block">Razão Social:</span>
              <span className="font-bold text-foreground">{currentCompany.name}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
              <span className="text-muted-foreground font-semibold block">Nome Fantasia:</span>
              <span className="font-bold text-foreground">{currentCompany.tradeName || currentCompany.name}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
              <span className="text-muted-foreground font-semibold block">CNPJ:</span>
              <span className="font-bold font-mono text-foreground">{docData.header.cnpj}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
              <span className="text-muted-foreground font-semibold block">Grau de Risco (NR-04):</span>
              <span className="font-bold text-foreground">Grau {currentCompany.riskGrade}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg md:col-span-2">
              <span className="text-muted-foreground font-semibold block">Atividade Principal (CNAE):</span>
              <span className="font-bold text-foreground">{currentCompany.cnae} — {currentCompany.cnaeDescription}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg md:col-span-2">
              <span className="text-muted-foreground font-semibold block">Endereço da Matriz:</span>
              <span className="text-foreground">{currentCompany.address.street}, {currentCompany.address.number} - {currentCompany.address.city}/{currentCompany.address.state}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg md:col-span-2">
              <span className="text-muted-foreground font-semibold block">Estabelecimento Avaliado:</span>
              <span className="text-foreground">{establishment ? `${establishment.name} (${establishment.code}) - ${establishment.address.street}, ${establishment.address.number}, ${establishment.address.city}/${establishment.address.state}` : 'Unidade Matriz'}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
              <span className="text-muted-foreground font-semibold block">Responsável pelo PGR no Estabelecimento:</span>
              <span className="font-bold text-foreground">{currentCompany.legalRepresentative} ({currentCompany.representativeRole})</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
              <span className="text-muted-foreground font-semibold block">Total de Trabalhadores:</span>
              <span className="font-bold text-foreground">{currentCompany.employeeCount} colaboradores</span>
            </div>
          </div>
        </section>

        {/* 4. RESPONSABILIDADE TÉCNICA */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">4.</span> {getSectionTitle('sec-4', 'RESPONSÁVEL TÉCNICO PELA ELABORAÇÃO DO PGR')}
          </h2>
          {(() => {
            const sec4 = docData.sections.find(s => s.id === 'sec-4') as any;
            const el = sec4?.elaborador;
            const qualifText = el?.qualificacoes && el.qualificacoes.length > 0
              ? el.qualificacoes.join(' | ')
              : (el?.cargo || '-');
            const cpfText = el?.cpf || issuerConfig.technicalManager?.cpf;
            const med = sec4?.medicoPcmso;

            return (
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-foreground text-sm">
                    Responsável Técnico pela Elaboração e ART:
                  </div>
                  <div>• <strong>Nome:</strong> {el?.nome || docData.header.techRespName}</div>
                  <div>• <strong>Qualificações / Cargos Habilitados:</strong> {qualifText}</div>
                  <div>• <strong>Registro Profissional:</strong> {el?.conselho || docData.header.techRespCouncil}</div>
                  {cpfText && <div>• <strong>CPF do Responsável Técnico:</strong> {cpfText}</div>}
                  {docData.header.techRespArt && docData.header.techRespArt !== 'ART Emitida' && docData.header.techRespArt !== '-' && (
                    <div>• <strong>Número da ART / RRT:</strong> {docData.header.techRespArt}</div>
                  )}
                  <div>• <strong>Consultoria Especializada:</strong> {el?.empresaConsultoria || `${issuerConfig.name || OFFICIAL_PGR_TEXTS.consultingCompany} (${issuerConfig.registrationCouncil || OFFICIAL_PGR_TEXTS.consultingCrea})`}</div>
                </div>

                {med && (
                  <div className="space-y-1 pt-2 border-t border-border/50">
                    <div className="font-semibold text-foreground text-sm">
                      Médico Coordenador do PCMSO (NR-07):
                    </div>
                    <div>• <strong>Nome:</strong> {med.nome}</div>
                    <div>• <strong>Conselho:</strong> {med.conselho}</div>
                  </div>
                )}
              </div>
            );
          })()}
        </section>

        {/* 5. INTRODUÇÃO */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">5.</span> {getSectionTitle('sec-5', 'INTRODUÇÃO')}
          </h2>
          {renderFormattedSection(getSectionContent('sec-5', OFFICIAL_PGR_TEXTS.introducao))}
        </section>

        {/* 6. OBJETIVO */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">6.</span> {getSectionTitle('sec-6', 'OBJETIVO')}
          </h2>
          {renderFormattedSection(getSectionContent('sec-6', OFFICIAL_PGR_TEXTS.objetivo))}
        </section>

        {/* 7. FUNDAMENTAÇÃO LEGAL */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">7.</span> {getSectionTitle('sec-7', 'FUNDAMENTAÇÃO LEGAL')}
          </h2>
          {renderFormattedSection(getSectionContent('sec-7', OFFICIAL_PGR_TEXTS.fundamentacaoLegal))}
        </section>

        {/* 8. RESPONSABILIDADE */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">8.</span> {getSectionTitle('sec-8', 'RESPONSABILIDADE')}
          </h2>
          {renderFormattedSection(getSectionContent('sec-8', OFFICIAL_PGR_TEXTS.responsabilidades))}
        </section>

        {/* 9. ESTRUTURA DO PGR */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">9.</span> {getSectionTitle('sec-9', 'ESTRUTURA DO PGR')}
          </h2>
          {renderFormattedSection(getSectionContent('sec-9', DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-9')?.defaultContent || ''))}
        </section>

        {/* 10. DESENVOLVIMENTO DO PGR */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">10.</span> {getSectionTitle('sec-10', 'DESENVOLVIMENTO DO PGR')}
          </h2>
          {renderFormattedSection(getSectionContent('sec-10', DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-10')?.defaultContent || ''))}
        </section>

        {/* 11. METODOLOGIA DE ANÁLISE */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">11.</span> {getSectionTitle('sec-11', 'METODOLOGIA DE ANÁLISE')}
          </h2>
          {renderFormattedSection(getSectionContent('sec-11', DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-11')?.defaultContent || ''))}
        </section>

        {/* 12. INTRUMENTOS UTILIZADOS NAS AVALIAÇÕES */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">12.</span> {getSectionTitle('sec-12', 'INTRUMENTOS UTILIZADOS NAS AVALIAÇÕES')}
          </h2>
          {renderFormattedSection(getSectionContent('sec-12', DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-12')?.defaultContent || ''))}
        </section>

        {/* 13. AVALIAÇÃO, RESULTADOS E INTERPRETAÇÃO */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">13.</span> {getSectionTitle('sec-13', 'AVALIAÇÃO, RESULTADOS E INTERPRETAÇÃO')}
          </h2>
          {renderFormattedSection(getSectionContent('sec-13', DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-13')?.defaultContent || ''))}
        </section>

        {/* 14. INVENTÁRIO DE RISCOS OCUPACIONAIS (MODELO APR-HO) COM CARGOS E ATIVIDADES */}
        <section className="space-y-6">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">14.</span> {getSectionTitle('sec-14', 'INVENTÁRIO DE RISCOS OCUPACIONAIS (MODELO APR-HO)')}
          </h2>

          {(() => {
            const gheGroups = groupInventoryByGhe(pgrContext.sectors, pgrContext.positions, pgrContext.ghes, pgrContext.riskInventory);

            if (gheGroups.length === 0) {
              return (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                  Nenhum setor ou risco cadastrado no inventário.
                </div>
              );
            }

            return (
              <div className="space-y-10">
                {gheGroups.map((group) => {
                  const emrInfo = group.emr ? ` | EMR: ${group.emr}` : '';
                  const gheSectorHeader = `${group.gheCode} | Setor: ${group.sectorName} | Efetivo Exposto: ${group.workerCount} trabalhador(es)${emrInfo}`;

                  return (
                    <div key={group.id} className="space-y-4 pt-1 pb-6 border-b border-border/70 last:border-b-0">
                      {/* Bloco de Cabeçalho do GHE / Setor e Lista de Cargos */}
                      <div className="space-y-2">
                        {/* 1. Título do GHE / Setor em Negrito */}
                        <div className="font-bold text-sm text-foreground bg-muted/40 p-2.5 rounded-lg border border-border">
                          {gheSectorHeader}
                        </div>

                        {/* 2. Lista de Cargos e Descrições de Atividades deste GHE/Setor */}
                        <div className="space-y-2 pl-1 pt-1">
                          {group.positions.map((pos) => (
                            <div key={pos.id} className="space-y-1 text-xs text-foreground bg-card/60 p-2.5 rounded-md border border-border/50">
                              <div className="text-foreground text-xs font-semibold">
                                Cargo / Função: {pos.title}{pos.cbo ? ` (CBO: ${pos.cbo})` : ''}
                              </div>
                              <div className="text-foreground/90 text-xs font-normal leading-relaxed text-justify">
                                Descrição da Atividade: {pos.activityDescription}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. Tabelas APR-HO deste GHE/Setor */}
                      {group.risks.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground bg-muted/10 border border-dashed rounded-lg">
                          Nenhum risco ocupacional identificado para este setor/GHE.
                        </div>
                      ) : (
                        <div className="space-y-4 pt-2">
                          {group.risks.map((item) => {
                            const catConfig = HAZARD_CATEGORY_CONFIG[item.hazardCategory];
                            const catLabel = (catConfig?.label || item.hazardCategory || 'FÍSICO').toUpperCase();

                            if (isNoExposureRisk(item)) {
                              const headerTitle = `${group.gheCode} APR-HO - ${docData.header.elaborationDate || '02/2026'}`;
                              return (
                                <div key={item.id} className="border border-slate-600 rounded-xs overflow-hidden text-xs bg-white text-slate-900 shadow-xs print:break-inside-avoid">
                                  {/* Header Dark Gray */}
                                  <div className="bg-[#52525b] text-white text-center font-bold py-1.5 px-3 uppercase tracking-wider text-xs">
                                    {headerTitle}
                                  </div>

                                  {/* Row 2: Risco Categoria & Agente */}
                                  <div className="grid grid-cols-12 border-t border-slate-400">
                                    <div 
                                      className="col-span-3 text-white font-bold py-1.5 px-3 flex items-center justify-center text-center text-xs tracking-wide uppercase"
                                      style={{ backgroundColor: catConfig?.color || '#16a34a' }}
                                    >
                                      RISCO {catLabel}
                                    </div>
                                    <div className="col-span-9 py-1.5 px-3 flex items-center font-semibold bg-white border-l border-slate-400">
                                      <span className="font-bold text-slate-900 mr-1.5">Agente:</span>
                                      <span className="text-slate-800 font-normal">{item.hazardName || 'Não há exposição / Não se Aplica'}</span>
                                    </div>
                                  </div>

                                  {/* Row 3: Tipo de Exposição */}
                                  <div className="grid grid-cols-12 border-t border-slate-300">
                                    <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                      Tipo de Exposição
                                    </div>
                                    <div className="col-span-4 py-1 px-3 text-slate-800 border-r border-slate-300 flex items-center">
                                      NAP
                                    </div>
                                    <div className="col-span-5 py-1 px-3 text-slate-800 flex items-center">
                                      NAP
                                    </div>
                                  </div>

                                  {/* Row 4: Fontes ou circunstância */}
                                  <div className="grid grid-cols-12 border-t border-slate-300">
                                    <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                      Fontes ou circunstância
                                    </div>
                                    <div className="col-span-9 py-1 px-3 text-slate-800 flex items-center">
                                      {item.sourceDescription || 'Não há exposição / Não se Aplica (NAP)'}
                                    </div>
                                  </div>

                                  {/* Row 5: Trajetória */}
                                  <div className="grid grid-cols-12 border-t border-slate-300">
                                    <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                      Trajetória
                                    </div>
                                    <div className="col-span-9 py-1 px-3 text-slate-800 flex items-center">
                                      {item.trajectory || 'NAP'}
                                    </div>
                                  </div>

                                  {/* Row 6: Via de penetração */}
                                  <div className="grid grid-cols-12 border-t border-slate-300">
                                    <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                      Via de penetração
                                    </div>
                                    <div className="col-span-9 py-1 px-3 text-slate-800 flex items-center">
                                      {item.penetrationRoute || 'NAP'}
                                    </div>
                                  </div>

                                  {/* Row 7: Efeitos a saúde */}
                                  <div className="grid grid-cols-12 border-t border-slate-300">
                                    <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                      Efeitos a saúde
                                    </div>
                                    <div className="col-span-9 py-1 px-3 text-slate-800 flex items-center">
                                      {item.healthDamage || 'NAP'}
                                    </div>
                                  </div>

                                  {/* Row 8: EPC/EPI */}
                                  <div className="grid grid-cols-12 border-t border-slate-300">
                                    <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                      EPC/EPI
                                    </div>
                                    <div className="col-span-9 py-1 px-3 text-slate-800 flex items-center">
                                      NAP
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            const headerTitle = `${group.gheCode} APR-HO - ${docData.header.elaborationDate || '02/2026'}`;

                            // Separação do Tipo de Exposição
                            let expPart1 = 'Habitual';
                            let expPart2 = 'Permanente';
                            if (item.exposureType === 'HABITUAL_INTERMITENTE') {
                              expPart1 = 'Habitual';
                              expPart2 = 'Intermitente';
                            } else if (item.exposureType === 'EVENTUAL_INTERMITENTE') {
                              expPart1 = 'Eventual';
                              expPart2 = 'Intermitente';
                            } else if (item.exposureType === 'EVENTUAL') {
                              expPart1 = 'Eventual';
                              expPart2 = 'NAP';
                            } else if (item.exposureType === 'HABITUAL') {
                              expPart1 = 'Habitual';
                              expPart2 = 'NAP';
                            } else if (item.exposureType === 'PERMANENTE') {
                              expPart1 = 'NAP';
                              expPart2 = 'Permanente';
                            } else if (item.exposureType === 'INTERMITENTE') {
                              expPart1 = 'NAP';
                              expPart2 = 'Intermitente';
                            }

                            // EPC / EPI formatado
                            const epcStr = item.epcExisting && item.epcExisting.length > 0 ? item.epcExisting.join(', ') : '';
                            const epiStr = item.epiExisting && item.epiExisting.length > 0
                              ? item.epiExisting.map(e => `${e.name} (CA: ${e.ca || 'S/N'})`).join('; ')
                              : '';
                            const epcEpiFinal = [epcStr ? `EPC: ${epcStr}` : '', epiStr ? `EPI: ${epiStr}` : ''].filter(Boolean).join(' | ') || 'NAP';

                            // Medições
                            const meas = item.measurements && item.measurements.length > 0 ? item.measurements[0] : null;
                            const criterio = meas?.criteria || (meas ? 'Quantitativo (Pontual)' : 'Qualitativo / NAP');
                            const tecnica = meas?.technique || (meas ? 'NR-15 / NHO' : 'NAP');
                            const dataMedicao = meas?.measurementDate 
                              ? (meas.measurementDate.includes('-') ? meas.measurementDate.split('-').reverse().join('/') : meas.measurementDate)
                              : (meas ? '25/02/2026' : 'NAP');
                            const resultado = meas?.resultText || (meas?.measuredValue ? `${meas.measuredValue} ${meas.unit || ''}` : 'NAP');
                            const lt = meas?.toleranceLimitText || (meas?.toleranceLimit ? `${meas.toleranceLimit} ${meas.unit || ''}` : 'NAP');

                            // Cálculo de nível de risco conforme Tabela 5 e 7 da NR-01 / PGR (Matriz 5x5)
                            const score = item.riskScore || (Number(item.severity || 1) * Number(item.probability || 1));
                            const norm = getNormativeRiskMatrix(score);
                            const displayRiskLevel = norm.displayLevel;
                            const prioridadeFinal = item.actionPriority || norm.priority;

                            let statusColor = '#16a34a';
                            if (norm.level === 'Médio') statusColor = '#d97706';
                            else if (norm.level === 'Alto') statusColor = '#ea580c';
                            else if (norm.level === 'Extremo') statusColor = '#dc2626';

                            return (
                              <div key={item.id} className="border border-slate-600 rounded-xs overflow-hidden text-xs bg-white text-slate-900 shadow-xs print:break-inside-avoid">
                                {/* Header Dark Gray */}
                                <div className="bg-[#52525b] text-white text-center font-bold py-1.5 px-3 uppercase tracking-wider text-xs">
                                  {headerTitle}
                                </div>

                                {/* Row 2: Risco Categoria & Agente */}
                                <div className="grid grid-cols-12 border-t border-slate-400">
                                  <div 
                                    className="col-span-3 text-white font-bold py-1.5 px-3 flex items-center justify-center text-center text-xs tracking-wide uppercase"
                                    style={{ backgroundColor: catConfig?.color || '#16a34a' }}
                                  >
                                    RISCO {catLabel}
                                  </div>
                                  <div className="col-span-9 py-1.5 px-3 flex items-center font-semibold bg-white border-l border-slate-400">
                                    <span className="font-bold text-slate-900 mr-1.5">Agente:</span>
                                    <span className="text-slate-800 font-normal">{item.hazardName}</span>
                                  </div>
                                </div>

                                {/* Row 3: Tipo de Exposição */}
                                <div className="grid grid-cols-12 border-t border-slate-300">
                                  <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                    Tipo de Exposição
                                  </div>
                                  <div className="col-span-4 py-1 px-3 text-slate-800 border-r border-slate-300 flex items-center">
                                    {expPart1}
                                  </div>
                                  <div className="col-span-5 py-1 px-3 text-slate-800 flex items-center">
                                    {expPart2}
                                  </div>
                                </div>

                                {/* Row 4: Fontes ou circunstância */}
                                <div className="grid grid-cols-12 border-t border-slate-300">
                                  <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                    Fontes ou circunstância
                                  </div>
                                  <div className="col-span-9 py-1 px-3 text-slate-800 flex items-center">
                                    {item.sourceDescription || 'Setor de Produção'}
                                  </div>
                                </div>

                                {/* Row 5: Trajetória */}
                                <div className="grid grid-cols-12 border-t border-slate-300">
                                  <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                    Trajetória
                                  </div>
                                  <div className="col-span-9 py-1 px-3 text-slate-800 flex items-center">
                                    {item.trajectory || 'Ar'}
                                  </div>
                                </div>

                                {/* Row 6: Via de penetração */}
                                <div className="grid grid-cols-12 border-t border-slate-300">
                                  <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                    Via de penetração
                                  </div>
                                  <div className="col-span-9 py-1 px-3 text-slate-800 flex items-center">
                                    {item.penetrationRoute || 'Auditiva (Ouvido / Som)'}
                                  </div>
                                </div>

                                {/* Row 7: Efeitos a saúde */}
                                <div className="grid grid-cols-12 border-t border-slate-300">
                                  <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                    Efeitos a saúde
                                  </div>
                                  <div className="col-span-9 py-1 px-3 text-slate-800 flex items-center">
                                    {item.healthDamage || 'Perda Auditiva Induzida por Ruído (PAIR)'}
                                  </div>
                                </div>

                                {/* Row 8: EPC/EPI */}
                                <div className="grid grid-cols-12 border-t border-slate-300">
                                  <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                    EPC/EPI
                                  </div>
                                  <div className="col-span-9 py-1 px-3 text-slate-800 flex items-center">
                                    {epcEpiFinal}
                                  </div>
                                </div>

                                {/* Section Header: Medição */}
                                <div className="bg-[#e2e8f0] text-slate-900 text-center font-bold py-1 px-3 border-t border-slate-400">
                                  Medição
                                </div>

                                {/* Row 10: Critério & Técnica */}
                                <div className="grid grid-cols-12 border-t border-slate-300">
                                  <div className="col-span-6 py-1 px-3 font-semibold border-r border-slate-300 text-slate-900">
                                    Critério: <span className="font-normal text-slate-800">{criterio}</span>
                                  </div>
                                  <div className="col-span-6 py-1 px-3 font-semibold text-slate-900">
                                    Técnica utilizada: <span className="font-normal text-slate-800">{tecnica}</span>
                                  </div>
                                </div>

                                {/* Row 11: Data da Avaliação | Resultado | LT Headers */}
                                <div className="grid grid-cols-12 border-t border-slate-300 text-center font-bold bg-slate-50/60">
                                  <div className="col-span-4 py-1 px-2 border-r border-slate-300">Data da Avaliação</div>
                                  <div className="col-span-4 py-1 px-2 border-r border-slate-300">Resultado</div>
                                  <div className="col-span-4 py-1 px-2">LT</div>
                                </div>

                                {/* Row 12: Data da Avaliação | Resultado | LT Values */}
                                <div className="grid grid-cols-12 border-t border-slate-300 text-center">
                                  <div className="col-span-4 py-1 px-2 border-r border-slate-300 text-slate-800">{dataMedicao}</div>
                                  <div className="col-span-4 py-1 px-2 border-r border-slate-300 font-bold text-slate-900">{resultado}</div>
                                  <div className="col-span-4 py-1 px-2 text-slate-800">{lt}</div>
                                </div>

                                {/* Section Header: Categorização do risco/perigo */}
                                <div className="bg-[#e2e8f0] text-slate-900 text-center font-bold py-1 px-3 border-t border-slate-400">
                                  Categorização do risco/perigo
                                </div>

                                {/* Row 14: Headers Severidade, Probabilidade, Nível de Risco, Prioridade */}
                                <div className="grid grid-cols-12 border-t border-slate-300 text-center font-bold bg-slate-50/60">
                                  <div className="col-span-3 py-1 px-2 border-r border-slate-300">Severidade</div>
                                  <div className="col-span-3 py-1 px-2 border-r border-slate-300">Probabilidade</div>
                                  <div className="col-span-3 py-1 px-2 border-r border-slate-300">Nível de Risco</div>
                                  <div className="col-span-3 py-1 px-2">Prioridade de ação</div>
                                </div>

                                {/* Row 15: Values */}
                                <div className="grid grid-cols-12 border-t border-slate-300 text-center">
                                  <div className="col-span-3 py-1 px-2 border-r border-slate-300 font-bold text-slate-900">
                                    {item.severity || '1'}
                                  </div>
                                  <div className="col-span-3 py-1 px-2 border-r border-slate-300 font-bold text-slate-900">
                                    {item.probability || '1'}
                                  </div>
                                  <div 
                                    className="col-span-3 py-1 px-2 border-r border-slate-300 font-bold text-xs"
                                    style={{ color: statusColor }}
                                  >
                                    {displayRiskLevel}
                                  </div>
                                  <div className="col-span-3 py-1 px-2 font-semibold text-slate-800">
                                    {prioridadeFinal}
                                  </div>
                                </div>

                                {/* Section Header: Recomendações */}
                                <div className="bg-[#e2e8f0] text-slate-900 text-center font-bold py-1 px-3 border-t border-slate-400">
                                  Recomendações
                                </div>

                                {/* Recomendações Values */}
                                <div className="grid grid-cols-12 border-t border-slate-300">
                                  <div className="col-span-3 font-bold py-1 px-3 bg-slate-50/60 border-r border-slate-300 flex items-center">
                                    Recomendações
                                  </div>
                                  <div className="col-span-9 py-1 px-3 text-slate-800 flex items-center">
                                    {item.recommendations || 'NAP'}
                                  </div>
                                </div>

                                {/* Optional Avaliações e Resultados (Imagens) */}
                                {item.evaluationImages && item.evaluationImages.length > 0 && (
                                  <div className="border-t border-slate-400 p-2.5 bg-slate-50">
                                    <div className="font-bold text-[10px] uppercase tracking-wider text-slate-600 mb-2">
                                      Avaliações e Resultados (Gráficos e Planilhas):
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {item.evaluationImages.map((img, imgIdx) => (
                                        <img
                                          key={imgIdx}
                                          src={img}
                                          alt={`Avaliação ${imgIdx + 1}`}
                                          className="h-28 w-auto rounded border border-slate-300 object-contain bg-white"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>

        {/* 15. PLANO DE AÇÃO */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">15.</span> {getSectionTitle('sec-15', 'PLANO DE AÇÃO E CRONOGRAMA DE PREVENÇÃO (5W2H)')}
          </h2>
          <div className="border border-border rounded-xl overflow-hidden shadow-xs bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 text-xs">
                  <TableHead className="font-bold text-foreground py-2.5 w-[42%]">Metas</TableHead>
                  <TableHead className="text-center font-bold text-foreground py-2.5 w-[12%]">Grau de Prioridade</TableHead>
                  <TableHead className="text-center font-bold text-foreground py-2.5 w-[12%]">Prazo Inicial</TableHead>
                  <TableHead className="text-center font-bold text-foreground py-2.5 w-[12%]">Prazo Final</TableHead>
                  <TableHead className="text-center font-bold text-foreground py-2.5 w-[12%]">Responsável</TableHead>
                  <TableHead className="text-center font-bold text-foreground py-2.5 w-[10%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Cabeçalho do GES */}
                <TableRow className="bg-muted/30 font-bold text-xs text-center border-y border-border">
                  <TableCell colSpan={6} className="py-1.5 font-bold text-foreground uppercase tracking-wide">
                    {ghes.length > 0 ? `GES ${ghes[0].code || '1.0'}` : 'GES 1.0'}
                  </TableCell>
                </TableRow>

                {pgrContext.actionPlans.length === 0 ? (
                  <>
                    <TableRow className="text-xs hover:bg-muted/30">
                      <TableCell className="text-foreground leading-relaxed">
                        Manter o fornecimento e a obrigatoriedade do uso dos EPIs especificados, com substituição conforme condições de uso, desgaste e orientação do fabricante.
                      </TableCell>
                      <TableCell className="text-center font-mono">2</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">SESMT / RH</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                          EM ANDAMENTO
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="text-xs hover:bg-muted/30">
                      <TableCell className="text-foreground leading-relaxed">
                        Realizar inspeções periódicas das condições de segurança dos ambientes, equipamentos e instalações.
                      </TableCell>
                      <TableCell className="text-center font-mono">2</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">SESMT / Manutenção</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                          EM ANDAMENTO
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="text-xs hover:bg-muted/30">
                      <TableCell className="text-foreground leading-relaxed">
                        Manter os treinamentos e orientações de segurança conforme os riscos e as atividades desenvolvidas.
                      </TableCell>
                      <TableCell className="text-center font-mono">2</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">RH / Treinamento</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-semibold text-blue-700 bg-blue-50 border-blue-200">
                          PROGRAMADO
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="text-xs hover:bg-muted/30">
                      <TableCell className="text-foreground leading-relaxed">
                        Manter as medidas de controle existentes para os agentes ocupacionais identificados e acompanhar sua eficácia.
                      </TableCell>
                      <TableCell className="text-center font-mono">2</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">SESMT / Diretoria</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                          EM ANDAMENTO
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="text-xs hover:bg-muted/30">
                      <TableCell className="text-foreground leading-relaxed">
                        Realizar avaliações quantitativas dos agentes físicos e químicos, quando aplicável, conforme os critérios técnicos e legais pertinentes.
                      </TableCell>
                      <TableCell className="text-center font-mono">2</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">Consultoria SST</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-semibold text-amber-700 bg-amber-50 border-amber-200">
                          A INICIAR
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="text-xs hover:bg-muted/30">
                      <TableCell className="text-foreground leading-relaxed">
                        Elaborar e implementar o PPR – Programa de Proteção Respiratória, quando aplicável.
                      </TableCell>
                      <TableCell className="text-center font-mono">2</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">SESMT</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-semibold text-amber-700 bg-amber-50 border-amber-200">
                          A INICIAR
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="text-xs hover:bg-muted/30">
                      <TableCell className="text-foreground leading-relaxed">
                        Avaliar e acompanhar os fatores de riscos psicossociais relacionados ao trabalho, implementando medidas de prevenção quando necessárias.
                      </TableCell>
                      <TableCell className="text-center font-mono">2</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">RH / Gestão</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-semibold text-amber-700 bg-amber-50 border-amber-200">
                          A INICIAR
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="text-xs hover:bg-muted/30">
                      <TableCell className="text-foreground leading-relaxed">
                        Reavaliar as condições de trabalho sempre que houver alterações nos processos, ambientes, atividades ou identificação de novos riscos.
                      </TableCell>
                      <TableCell className="text-center font-mono">2</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">Contínuo</TableCell>
                      <TableCell className="text-center text-muted-foreground">SESMT / Diretoria</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                          EM ANDAMENTO
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  pgrContext.actionPlans.map((act: ActionPlanItem) => {
                    const matchedRisk = pgrContext.riskInventory?.find((r: any) => r.id === act.riskInventoryId);
                    const priorityText = act.priority || matchedRisk?.actionPriority || 'Média';
                    const responsibleText = act.who || establishment?.managerName || currentCompany?.legalRepresentative || 'SESMT';
                    
                    const upperStatus = (act.status || '').toUpperCase();
                    let statusLabel = 'NÃO INICIADA';
                    let statusClass = 'text-amber-700 bg-amber-50 border-amber-200';
                    if (upperStatus === 'IN_PROGRESS' || upperStatus === 'EM_ANDAMENTO') {
                      statusLabel = 'EM ANDAMENTO';
                      statusClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                    } else if (upperStatus === 'COMPLETED' || upperStatus === 'CONCLUIDA' || upperStatus === 'CONCLUÍDA') {
                      statusLabel = 'CONCLUÍDA';
                      statusClass = 'text-blue-700 bg-blue-50 border-blue-200';
                    } else if (upperStatus === 'CANCELLED' || upperStatus === 'CANCELADA') {
                      statusLabel = 'CANCELADA';
                      statusClass = 'text-slate-700 bg-slate-100 border-slate-300';
                    } else if (upperStatus && upperStatus !== 'NOT_STARTED' && upperStatus !== 'NAO_INICIADA') {
                      statusLabel = act.status.replace(/_/g, ' ').toUpperCase();
                    }

                    return (
                      <TableRow key={act.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-medium text-foreground leading-relaxed">{act.what}</TableCell>
                        <TableCell className="text-center font-mono font-bold">{priorityText}</TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {act.startDate ? formatDate(act.startDate) : 'Contínuo'}
                        </TableCell>
                        <TableCell className="text-center font-mono text-muted-foreground">
                          {act.whenDate ? formatDate(act.whenDate) : 'Contínuo'}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{responsibleText}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`text-[10px] uppercase font-semibold ${statusClass}`}>
                            {statusLabel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* 16. TERMO DE ENCERRAMENTO E ASSINATURAS */}
        <section className="space-y-6 pt-6 border-t border-border">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">16.</span> {getSectionTitle('sec-16', 'TERMO DE ENCERRAMENTO E RESPONSABILIDADE')}
          </h2>
          {renderFormattedSection(getSectionContent('sec-16', OFFICIAL_PGR_TEXTS.termoEncerramento))}

          <p className="text-xs text-right text-muted-foreground">
            {currentCompany.address.city}/{currentCompany.address.state}, {docData.header.elaborationDate}.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
            <div className="text-center space-y-1">
              <div className="border-t border-foreground/30 pt-2 w-3/4 mx-auto" />
              <p className="text-xs font-bold text-foreground">{docData.header.techRespName}</p>
              <p className="text-[11px] text-muted-foreground">{docData.header.techRespCouncil} | {docData.header.techRespArt}</p>
              <p className="text-[11px] text-muted-foreground">Responsável Técnico SST</p>
            </div>

            <div className="text-center space-y-1">
              <div className="border-t border-foreground/30 pt-2 w-3/4 mx-auto" />
              <p className="text-xs font-bold text-foreground">{currentCompany.legalRepresentative}</p>
              <p className="text-[11px] text-muted-foreground">{currentCompany.representativeRole}</p>
              <p className="text-[11px] text-muted-foreground">{currentCompany.name}</p>
            </div>
          </div>
        </section>

        {/* 17. RECIBO DE EPI */}
        <section className="space-y-3 pt-6 border-t border-border">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-[#334155] dark:text-slate-300 font-mono">17.</span> {getSectionTitle('sec-17', 'MODELO - RECIBO DE ENTREGA DE EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL (EPI)')}
          </h2>
          {renderFormattedSection(getSectionContent('sec-17', DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-17')?.defaultContent || ''))}
        </section>

      </div>
    </div>
  );
};
