import React, { useState } from 'react';
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
import { generatePgrFromMasterTemplate } from '@/lib/docx-template-engine';
import { buildPgrFullDocument, OFFICIAL_PGR_TEXTS } from '@/lib/pgr-official-template';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
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
  FileCode
} from 'lucide-react';

export const PgrViewerPage: React.FC = () => {
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

  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);

  const pgr = pgrDocuments.find((p) => p.id === id) || pgrDocuments[0];
  const establishment = establishments.find((e) => e.id === pgr?.establishmentId) || establishments[0];

  if (!pgr || !activeCompany) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Documento PGR não encontrado</h2>
        <p className="text-muted-foreground text-sm">Selecione uma empresa com um PGR cadastrado.</p>
        <Button onClick={() => navigate('/documentos-pgr')}>Voltar para Documentos</Button>
      </div>
    );
  }

  const pgrContext = {
    company: activeCompany,
    establishment,
    sectors,
    positions,
    ghes,
    professionals,
    pgr,
    riskInventory: riskInventory.filter(r => r.pgrId === pgr.id || r.companyId === activeCompany.id),
    actionPlans: actionPlans.filter(a => a.pgrId === pgr.id || a.companyId === activeCompany.id),
  };

  const docData = buildPgrFullDocument(pgrContext);

  const handleDownloadPdf = () => {
    generatePgrPdf(pgrContext);
  };

  const handleDownloadDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      await generatePgrFromMasterTemplate(pgrContext);
    } catch (err) {
      console.warn('Fallback para gerador alternativo docx:', err);
      await generatePgrDocx(pgrContext);
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs sticky top-20 z-20 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/documentos-pgr')}
            className="text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Voltar</span>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">{pgr.code} — Versão {pgr.version}</h1>
              <Badge variant="success" className="text-[10px]">Modelo Oficial EMEPE</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{pgr.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Imprimir</span>
          </Button>

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
            size="sm"
            onClick={handleDownloadPdf}
            className="text-xs gap-1.5 font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Baixar PDF Oficial</span>
          </Button>
        </div>
      </div>

      {/* DOCUMENT SHEET VIEW */}
      <div className="bg-card border border-border shadow-md rounded-2xl p-6 sm:p-12 space-y-10 text-foreground">
        
        {/* CAPA FORMAL */}
        <div className="text-center space-y-6 border-b border-border pb-12">
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">
              {OFFICIAL_PGR_TEXTS.consultingCompany}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
              {OFFICIAL_PGR_TEXTS.consultingCrea}
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

          <div className="space-y-1.5 py-4 bg-muted/40 rounded-xl border border-border/60 max-w-xl mx-auto">
            <p className="text-lg font-bold text-foreground">{docData.header.companyName.toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">CNPJ: {docData.header.cnpj} | {docData.header.establishmentName}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left max-w-xl mx-auto p-4 bg-background border border-border rounded-xl font-medium">
            <div><strong>Código:</strong> {docData.header.code} (v{docData.header.version})</div>
            <div><strong>Ano de Vigência:</strong> {docData.header.year}</div>
            <div><strong>Período:</strong> {docData.header.validityPeriod}</div>
            <div><strong>Elaboração:</strong> {docData.header.elaborationDate}</div>
            <div className="sm:col-span-2">
              <strong>Responsável Técnico:</strong> {docData.header.techRespName} ({docData.header.techRespCouncil})
            </div>
          </div>
        </div>

        {/* 1. CONTROLE DE REVISÕES */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-emerald-600 font-mono">1.</span> CONTROLE DE REVISÕES DO DOCUMENTO
          </h2>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-24 text-center">Revisão</TableHead>
                  <TableHead className="w-32 text-center">Data</TableHead>
                  <TableHead>Descrição / Motivo da Revisão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-center font-bold font-mono">{docData.header.version}</TableCell>
                  <TableCell className="text-center text-xs font-mono">{docData.header.elaborationDate}</TableCell>
                  <TableCell className="text-xs">{pgr.revisionReason || 'Emissão Oficial do PGR e Inventário de Riscos Ocupacionais'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        {/* 2. DADOS CADASTRAIS */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-emerald-600 font-mono">2.</span> INFORMAÇÕES CADASTRAIS DO EMPREGADOR E ESTABELECIMENTO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
              <span className="text-muted-foreground font-semibold block">Razão Social:</span>
              <span className="font-bold text-foreground">{activeCompany.name}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
              <span className="text-muted-foreground font-semibold block">Nome Fantasia:</span>
              <span className="font-bold text-foreground">{activeCompany.tradeName || activeCompany.name}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
              <span className="text-muted-foreground font-semibold block">CNPJ:</span>
              <span className="font-bold font-mono text-foreground">{docData.header.cnpj}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg">
              <span className="text-muted-foreground font-semibold block">Grau de Risco (NR-04):</span>
              <span className="font-bold text-foreground">Grau {activeCompany.riskGrade}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg md:col-span-2">
              <span className="text-muted-foreground font-semibold block">Atividade Principal (CNAE):</span>
              <span className="font-bold text-foreground">{activeCompany.cnae} — {activeCompany.cnaeDescription}</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border rounded-lg md:col-span-2">
              <span className="text-muted-foreground font-semibold block">Endereço da Matriz:</span>
              <span className="text-foreground">{activeCompany.address.street}, {activeCompany.address.number} - {activeCompany.address.city}/{activeCompany.address.state}</span>
            </div>
          </div>
        </section>

        {/* 3. RESPONSABILIDADE TÉCNICA */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-emerald-600 font-mono">3.</span> RESPONSABILIDADE TÉCNICA E LEGAL
          </h2>
          <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2 text-xs">
            <div>
              <strong>Responsável Técnico pela Elaboração:</strong> {docData.header.techRespName} ({docData.header.techRespCouncil})
            </div>
            <div>
              <strong>ART / RRT:</strong> {docData.header.techRespArt} | <strong>Consultoria SST:</strong> {OFFICIAL_PGR_TEXTS.consultingCompany}
            </div>
          </div>
        </section>

        {/* 4. INTRODUÇÃO E OBJETIVOS */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-emerald-600 font-mono">4.</span> INTRODUÇÃO E OBJETIVOS DO PROGRAMA
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {OFFICIAL_PGR_TEXTS.introducao}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line mt-2">
            {OFFICIAL_PGR_TEXTS.objetivo}
          </p>
        </section>

        {/* 5. FUNDAMENTAÇÃO LEGAL */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-emerald-600 font-mono">5.</span> FUNDAMENTAÇÃO LEGAL E NORMAS APLICÁVEIS
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {OFFICIAL_PGR_TEXTS.fundamentacaoLegal}
          </p>
        </section>

        {/* 6. GERENCIAMENTO DE RISCOS (GRO) & MATRIZ 5X5 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-emerald-600 font-mono">6.</span> ESTRUTURA DO GRO E METODOLOGIA DA MATRIZ 5X5
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {OFFICIAL_PGR_TEXTS.metodologiaGro}
          </p>
        </section>

        {/* 7. INVENTÁRIO DE RISCOS */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-emerald-600 font-mono">7.</span> INVENTÁRIO CONSOLIDADO DE RISCOS OCUPACIONAIS (NR-01.5.7)
          </h2>
          <div className="border border-border rounded-xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-xs">
                  <TableHead>Setor & Função</TableHead>
                  <TableHead>Perigo / Agente</TableHead>
                  <TableHead>Fontes & Danos</TableHead>
                  <TableHead className="text-center">Matriz 5x5</TableHead>
                  <TableHead>Controles (EPC / EPI)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pgrContext.riskInventory.map((item) => {
                  const sec = sectors.find(s => s.id === item.sectorId);
                  const pos = positions.find(p => p.id === item.positionId);
                  const catConfig = HAZARD_CATEGORY_CONFIG[item.hazardCategory];

                  return (
                    <TableRow key={item.id} className="text-xs">
                      <TableCell className="font-semibold">
                        <div>{sec?.name || '-'}</div>
                        <div className="text-[11px] text-muted-foreground font-normal">{pos?.title || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] mb-1" style={{ color: catConfig?.color }}>
                          {catConfig?.label || item.hazardCategory}
                        </Badge>
                        <div className="font-bold text-foreground">{item.hazardName}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px] text-muted-foreground">
                        <div><strong>Fonte:</strong> {item.sourceDescription}</div>
                        <div><strong>Danos:</strong> {item.healthDamage}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-mono font-bold text-[11px] mb-1">
                          P:{item.probability} × S:{item.severity} = {item.riskScore}
                        </div>
                        <RiskLevelBadge level={item.riskLevel} />
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[220px]">
                        {item.epcExisting && item.epcExisting.length > 0 && (
                          <div><strong>EPC:</strong> {item.epcExisting.join(', ')}</div>
                        )}
                        {item.epiExisting && item.epiExisting.length > 0 && (
                          <div className="mt-0.5">
                            <strong>EPI:</strong> {item.epiExisting.map(e => `${e.name} (CA:${e.ca || 'S/N'})`).join('; ')}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* 8. PLANO DE AÇÃO */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-emerald-600 font-mono">8.</span> PLANO DE AÇÃO E CRONOGRAMA (NR-01.5.5 - 5W2H)
          </h2>
          <div className="border border-border rounded-xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-xs">
                  <TableHead>O que (Ação)</TableHead>
                  <TableHead>Por que (Motivo)</TableHead>
                  <TableHead>Quem (Responsável)</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pgrContext.actionPlans.map((act) => (
                  <TableRow key={act.id} className="text-xs">
                    <TableCell className="font-semibold text-foreground">{act.what}</TableCell>
                    <TableCell className="text-muted-foreground">{act.why}</TableCell>
                    <TableCell className="text-muted-foreground">{act.who}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{act.whenDate}</TableCell>
                    <TableCell className="font-mono font-bold text-foreground">
                      R$ {Number(act.howMuch || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        {act.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* 9. TERMO DE ENCERRAMENTO E ASSINATURAS */}
        <section className="space-y-6 pt-6 border-t border-border">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-1">
            <span className="text-emerald-600 font-mono">9.</span> TERMO DE ENCERRAMENTO E RESPONSABILIDADE
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {OFFICIAL_PGR_TEXTS.termoEncerramento}
          </p>

          <p className="text-xs text-right text-muted-foreground">
            {activeCompany.address.city}/{activeCompany.address.state}, {docData.header.elaborationDate}.
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
              <p className="text-xs font-bold text-foreground">{activeCompany.legalRepresentative}</p>
              <p className="text-[11px] text-muted-foreground">{activeCompany.representativeRole}</p>
              <p className="text-[11px] text-muted-foreground">{activeCompany.name}</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
