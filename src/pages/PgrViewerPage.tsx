import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePgr } from '@/context/PgrContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiskLevelBadge } from '@/components/risk-matrix/RiskLevelBadge';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
import { generatePgrPdf } from '@/lib/pdf-generator';
import { formatDate, formatCNPJ, formatCurrency } from '@/lib/utils';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  ShieldCheck, 
  Building2, 
  Award, 
  Layers, 
  CheckSquare, 
  FileText 
} from 'lucide-react';

export const PgrViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    pgrDocuments, 
    companies, 
    establishments, 
    sectors, 
    positions, 
    ghes, 
    professionals, 
    riskInventory, 
    actionPlans 
  } = usePgr();

  const pgr = pgrDocuments.find(d => d.id === id) || pgrDocuments[0];
  const company = companies.find(c => c.id === pgr?.companyId) || companies[0];
  const establishment = establishments.find(e => e.id === pgr?.establishmentId) || establishments[0];

  if (!pgr || !company || !establishment) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-muted-foreground text-sm">Documento do PGR não encontrado.</p>
        <Button onClick={() => navigate('/documentos-pgr')}>Voltar para Documentos</Button>
      </div>
    );
  }

  const techResp = professionals.find(p => p.id === pgr.technicalResponsibleId);
  const medResp = professionals.find(p => p.id === pgr.medicalResponsibleId);
  const companyRisks = riskInventory.filter(r => r.companyId === company.id);
  const companyActions = actionPlans.filter(a => a.companyId === company.id);
  const unitSectors = sectors.filter(s => s.establishmentId === establishment.id);
  const unitPositions = positions.filter(p => p.establishmentId === establishment.id);

  const handleDownloadPdf = () => {
    const pdf = generatePgrPdf({
      company,
      establishment,
      pgr,
      sectors,
      positions,
      ghes,
      professionals,
      risks: riskInventory,
      actions: actionPlans,
    });
    pdf.save(`${pgr.code}_PGR_${company.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top action toolbar (hidden on print) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs print:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/documentos-pgr')}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Lista
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-xs">
            {pgr.status === 'APPROVED' ? 'Vigente Oficial' : 'Rascunho Técnico'}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs"
          >
            <Printer className="h-3.5 w-3.5" /> Imprimir
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadPdf}
            className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Baixar PDF Oficial
          </Button>
        </div>
      </div>

      {/* Document Sheet Container */}
      <div className="bg-card border border-border shadow-md rounded-2xl p-6 sm:p-10 space-y-8 text-foreground">
        {/* Capa / Cabeçalho Documental */}
        <div className="border-b-4 border-emerald-600 pb-6 text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 mb-2">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
            Programa de Gerenciamento de Riscos (PGR)
          </h1>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Norma Regulamentadora nº 01 (NR-01) • MTE
          </p>
          <div className="inline-block bg-muted px-4 py-1.5 rounded-full text-xs font-mono font-bold mt-2">
            {pgr.code} • Versão {pgr.version} • Ano {pgr.year}
          </div>
        </div>

        {/* 1. Identificação da Empresa */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600" />
            1. Identificação do Empregador e Estabelecimento
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-muted/30 p-4 rounded-xl border border-border">
            <div>
              <span className="text-muted-foreground block text-[11px]">Razão Social:</span>
              <strong className="text-foreground text-sm">{company.name}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Nome Fantasia:</span>
              <strong className="text-foreground text-sm">{company.tradeName || '-'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">CNPJ:</span>
              <span className="font-mono font-bold">{formatCNPJ(company.cnpj)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">CNAE & Grau de Risco (NR-04):</span>
              <span className="font-semibold">{company.cnae} - Grau de Risco {company.riskGrade}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Endereço da Unidade:</span>
              <span>{establishment.address.street}, {establishment.address.number} - {establishment.address.city}/{establishment.address.state}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Vigência do Programa:</span>
              <span className="font-semibold text-emerald-600">{formatDate(pgr.validityStart)} até {formatDate(pgr.validityEnd)}</span>
            </div>
          </div>
        </section>

        {/* 2. Responsabilidade Técnica */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-600" />
            2. Responsabilidade Técnica (RT)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl border border-border bg-card space-y-1">
              <span className="text-muted-foreground block text-[11px]">Elaboração Técnica SST:</span>
              <strong className="text-foreground">{techResp?.name || 'Profissional Legalmente Habilitado'}</strong>
              <p className="text-[11px] text-muted-foreground">
                {techResp ? `${techResp.registrationCouncil}: ${techResp.registrationNumber}/${techResp.registrationState} (ART: ${techResp.artRrt || 'Emitida'})` : 'Registro MTE / CREA'}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card space-y-1">
              <span className="text-muted-foreground block text-[11px]">Médico Coordenador do PCMSO:</span>
              <strong className="text-foreground">{medResp?.name || 'Médico do Trabalho'}</strong>
              <p className="text-[11px] text-muted-foreground">
                {medResp ? `${medResp.registrationCouncil}: ${medResp.registrationNumber}/${medResp.registrationState}` : 'CRM / RQE'}
              </p>
            </div>
          </div>
        </section>

        {/* 3. Metodologia e Diretrizes */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            3. Objetivos & Metodologia da Matriz de Risco (NR-01)
          </h2>
          <div className="text-xs text-muted-foreground space-y-2 leading-relaxed bg-muted/20 p-4 rounded-xl border border-border">
            <p><strong>Objetivos Gerais: </strong>{pgr.generalObjectives}</p>
            <p><strong>Metodologia Aplicada: </strong>{pgr.methodologyDescription}</p>
          </div>
        </section>

        {/* 4. Inventário de Riscos Ocupacionais (NR-01.5.7) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              4. Inventário de Riscos Ocupacionais
            </h2>
            <Badge variant="outline" className="text-xs">
              {companyRisks.length} Perigos Avaliados
            </Badge>
          </div>

          <div className="border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/80 border-b border-border text-muted-foreground">
                  <th className="p-3 font-bold">Setor / Posto</th>
                  <th className="p-3 font-bold">Perigo / Grupo</th>
                  <th className="p-3 font-bold">Fonte Geradora & Danos</th>
                  <th className="p-3 font-bold text-center">P × S</th>
                  <th className="p-3 font-bold text-center">Nível de Risco</th>
                  <th className="p-3 font-bold">Medidas de Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companyRisks.map((risk) => {
                  const s = sectors.find(sec => sec.id === risk.sectorId);
                  const catConfig = HAZARD_CATEGORY_CONFIG[risk.hazardCategory];

                  return (
                    <tr key={risk.id} className="hover:bg-muted/30">
                      <td className="p-3 font-semibold text-foreground align-top">
                        {s?.name || 'Geral'}
                      </td>
                      <td className="p-3 align-top">
                        <div className="font-bold text-foreground">{risk.hazardName}</div>
                        <span className="text-[10px] font-semibold" style={{ color: catConfig.color }}>
                          [{catConfig.label}]
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-muted-foreground align-top space-y-1">
                        <div><strong>Fonte:</strong> {risk.sourceDescription}</div>
                        <div><strong>Danos:</strong> {risk.healthDamage}</div>
                      </td>
                      <td className="p-3 text-center align-top font-mono font-bold">
                        P{risk.probability} × S{risk.severity}
                        <span className="block text-[10px] text-muted-foreground font-normal">Score: {risk.riskScore}</span>
                      </td>
                      <td className="p-3 text-center align-top">
                        <RiskLevelBadge level={risk.riskLevel} size="sm" />
                      </td>
                      <td className="p-3 text-[11px] text-muted-foreground align-top space-y-0.5">
                        {risk.epcExisting.length > 0 && <div><strong>EPC:</strong> {risk.epcExisting.join(', ')}</div>}
                        {risk.epiExisting.length > 0 && (
                          <div>
                            <strong>EPI:</strong> {risk.epiExisting.map(e => `${e.name} (CA ${e.ca})`).join(', ')}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Plano de Ação 5W2H */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-emerald-600" />
              5. Plano de Ação & Cronograma de Melhorias (5W2H)
            </h2>
            <Badge variant="outline" className="text-xs">
              {companyActions.length} Ações Planejadas
            </Badge>
          </div>

          <div className="border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/80 border-b border-border text-muted-foreground">
                  <th className="p-3 font-bold">O Que Fazer? (What)</th>
                  <th className="p-3 font-bold">Por Que? (Why)</th>
                  <th className="p-3 font-bold">Onde & Quem</th>
                  <th className="p-3 font-bold text-center">Prazo (When)</th>
                  <th className="p-3 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companyActions.map((action) => (
                  <tr key={action.id} className="hover:bg-muted/30">
                    <td className="p-3 font-semibold text-foreground align-top">
                      {action.what}
                    </td>
                    <td className="p-3 text-[11px] text-muted-foreground align-top">
                      {action.why}
                    </td>
                    <td className="p-3 text-[11px] align-top">
                      <div><strong>Local:</strong> {action.whereLoc}</div>
                      <div><strong>Resp:</strong> {action.who}</div>
                    </td>
                    <td className="p-3 text-center align-top font-mono">
                      {formatDate(action.whenDate)}
                    </td>
                    <td className="p-3 text-center align-top">
                      <Badge variant={action.status === 'CONCLUIDA' ? 'success' : 'info'} className="text-[10px]">
                        {action.status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Encerramento e Assinaturas */}
        <section className="pt-8 border-t-2 border-border space-y-10">
          <div className="text-center text-xs text-muted-foreground max-w-xl mx-auto">
            Este Programa de Gerenciamento de Riscos (PGR) foi elaborado em estrita conformidade com a Norma Regulamentadora nº 01 (Portaria MTP nº 6.730/2020 e atualizações).
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            <div className="text-center space-y-1">
              <div className="border-t border-foreground/40 w-4/5 mx-auto pt-2" />
              <p className="font-bold text-xs text-foreground">{company.legalRepresentative}</p>
              <p className="text-[11px] text-muted-foreground">{company.representativeRole} • {company.name}</p>
            </div>

            <div className="text-center space-y-1">
              <div className="border-t border-foreground/40 w-4/5 mx-auto pt-2" />
              <p className="font-bold text-xs text-foreground">{techResp?.name || 'Responsável Técnico em SST'}</p>
              <p className="text-[11px] text-muted-foreground">
                {techResp ? `${techResp.registrationCouncil}: ${techResp.registrationNumber}/${techResp.registrationState}` : 'Engenheiro / Técnico de Segurança'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
