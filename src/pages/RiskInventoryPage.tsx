import React from 'react';
import { RiskInventoryTable } from '@/components/inventory/RiskInventoryTable';
import { usePgr } from '@/context/PgrContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Info, FileSpreadsheet, Download } from 'lucide-react';
import { generatePgrExcel } from '@/lib/excel-generator';
import { generatePgrPdf } from '@/lib/pdf-generator';

export const RiskInventoryPage: React.FC = () => {
  const { 
    activeCompany, 
    activeEstablishment, 
    establishments,
    activePgr, 
    pgrDocuments,
    sectors,
    positions,
    ghes,
    professionals,
    riskInventory,
    actionPlans,
    stats 
  } = usePgr();

  const handleExportExcel = async () => {
    if (!activeCompany) return;
    const est = activeEstablishment || establishments[0];
    const pgr = activePgr || pgrDocuments[0] || {
      id: 'pgr-default',
      companyId: activeCompany.id,
      establishmentId: est?.id || '',
      code: 'PGR-2026',
      title: `Inventário de Riscos - ${activeCompany.name}`,
      version: '1.0',
      year: 2026,
      validityStart: '2026-01-01',
      validityEnd: '2027-12-31',
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await generatePgrExcel({
      company: activeCompany,
      establishment: est,
      pgr,
      sectors,
      positions,
      ghes,
      professionals,
      riskInventory,
      actionPlans,
    });
  };

  const handleExportPdf = () => {
    if (!activeCompany) return;
    const est = activeEstablishment || establishments[0];
    const pgr = activePgr || pgrDocuments[0] || {
      id: 'pgr-default',
      companyId: activeCompany.id,
      establishmentId: est?.id || '',
      code: 'PGR-2026',
      title: `Inventário de Riscos - ${activeCompany.name}`,
      version: '1.0',
      year: 2026,
      validityStart: '2026-01-01',
      validityEnd: '2027-12-31',
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    generatePgrPdf({
      company: activeCompany,
      establishment: est,
      pgr,
      sectors,
      positions,
      ghes,
      professionals,
      riskInventory,
      actionPlans,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              Inventário de Riscos Ocupacionais
            </h1>
            <Badge variant="outline" className="text-xs">
              NR-01.5.7
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Reconhecimento, avaliação e classificação de riscos ocupacionais da empresa{' '}
            <strong className="text-foreground">{activeCompany?.name}</strong> • Unidade:{' '}
            <strong className="text-foreground">{activeEstablishment?.name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs bg-muted/60 px-3 py-1.5 rounded-lg border border-border">
            <span className="text-muted-foreground">Total:</span>
            <strong className="text-foreground font-bold">{stats.totalRisks} perigos</strong>
            <span className="text-muted-foreground">|</span>
            <span className="text-rose-600 font-bold">{stats.criticalRisksCount} críticos</span>
          </div>

          {/* Opção Excel temporariamente ocultada (recurso preservado no código para ativação futura) */}
          {/*
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="text-xs gap-1.5 border-emerald-200 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100 font-semibold"
            title="Exportar tabela de riscos no formato APR-HO para Excel (.xlsx)"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </Button>
          */}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="text-xs gap-1.5 border-slate-200 text-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900 font-semibold"
            title="Exportar documento oficial em PDF"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>Exportar PDF</span>
          </Button>
        </div>
      </div>

      {/* Info Alert Box */}
      <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Conforme a <strong>NR-01.5.7</strong>, o inventário de riscos deve conter a caracterização dos processos e ambientes, a identificação dos perigos e possíveis lesões, a indicação dos grupos de trabalhadores expostos, a avaliação e gradação dos riscos com base na severidade e probabilidade, e as medidas de prevenção existentes.
        </p>
      </div>

      {/* Main Table */}
      <RiskInventoryTable />
    </div>
  );
};
