import React from 'react';
import { usePgr } from '@/context/PgrContext';
import { Building2, MapPin, Check, ChevronsUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCNPJ } from '@/lib/utils';

export const CompanySelector: React.FC = () => {
  const { 
    companies, 
    activeCompany, 
    setActiveCompany, 
    establishments, 
    activeEstablishment, 
    setActiveEstablishment 
  } = usePgr();

  const companyEstablishments = establishments.filter(
    e => !activeCompany || e.companyId === activeCompany.id
  );

  return (
    <div className="flex items-center gap-2">
      {/* Seletor de Empresa */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-10 px-3 flex items-center gap-2.5 bg-card/70 border-border/80 hover:bg-accent text-left font-normal max-w-[280px] shadow-sm"
          >
            <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-foreground truncate">
                {activeCompany?.tradeName || activeCompany?.name || 'Selecione a Empresa'}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {activeCompany ? `CNPJ: ${formatCNPJ(activeCompany.cnpj)}` : 'Nenhuma selecionada'}
              </div>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            Empresas Cadastradas
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {companies.map((comp) => {
            const isSelected = activeCompany?.id === comp.id;
            return (
              <DropdownMenuItem
                key={comp.id}
                onClick={() => setActiveCompany(comp)}
                className="flex items-center justify-between p-2 cursor-pointer"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm text-foreground">{comp.tradeName || comp.name}</span>
                  <span className="text-xs text-muted-foreground">CNPJ: {formatCNPJ(comp.cnpj)}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Grau de Risco {comp.riskGrade}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {comp.employeeCount} funcionários
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Seletor de Estabelecimento / Unidade */}
      {companyEstablishments.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="h-10 px-3 flex items-center gap-2 bg-card/70 border-border/80 hover:bg-accent text-left font-normal max-w-[240px] shadow-sm hidden md:flex"
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 truncate">
                <div className="text-xs font-medium text-foreground truncate">
                  {activeEstablishment?.name || 'Selecione Unidade'}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {activeEstablishment?.type} - {activeEstablishment?.address.city}/{activeEstablishment?.address.state}
                </div>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
              Unidades / Estabelecimentos
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {companyEstablishments.map((est) => {
              const isSelected = activeEstablishment?.id === est.id;
              return (
                <DropdownMenuItem
                  key={est.id}
                  onClick={() => setActiveEstablishment(est)}
                  className="flex items-center justify-between p-2 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-xs text-foreground">{est.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {est.code} • {est.address.city}/{est.address.state}
                    </span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-2" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
