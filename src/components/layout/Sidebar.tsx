import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  FileText,
  Building2,
  MapPin,
  Layers,
  Briefcase,
  Users,
  Award,
  AlertTriangle,
  Database,
  ShieldCheck,
  ChevronRight,
  Flame,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { usePgr } from '@/context/PgrContext';
import { isFirebaseConfigured } from '@/lib/firebase';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'default' | 'destructive' | 'warning' | 'success';
}

export const Sidebar: React.FC<{ isOpen: boolean; onCloseMobile?: () => void }> = ({ isOpen, onCloseMobile }) => {
  const { stats } = usePgr();

  const mainNav: NavItem[] = [
    { label: 'Visão Geral (Dashboard)', path: '/', icon: LayoutDashboard },
    { 
      label: 'Inventário de Riscos', 
      path: '/inventario', 
      icon: ClipboardList,
      badge: stats.totalRisks,
      badgeVariant: stats.criticalRisksCount > 0 ? 'warning' : 'default'
    },
    { 
      label: 'Plano de Ação (5W2H)', 
      path: '/plano-de-acao', 
      icon: CheckSquare,
      badge: stats.pendingActions + stats.inProgressActions,
      badgeVariant: stats.delayedActions > 0 ? 'destructive' : 'default'
    },
    { label: 'Documentos do PGR', path: '/documentos-pgr', icon: FileText },
  ];

  const organizationNav: NavItem[] = [
    { label: 'Empresas / Clientes', path: '/empresas', icon: Building2 },
    { label: 'Unidades & Obras', path: '/estabelecimentos', icon: MapPin },
    { label: 'Setores & Ambientes', path: '/setores', icon: Layers },
    { label: 'Cargos & Funções', path: '/cargos', icon: Briefcase },
    { label: 'Profissionais Técnicos (RT)', path: '/profissionais', icon: Award },
  ];

  const supportNav: NavItem[] = [
    { label: 'Empresa Emissora & Logo', path: '/empresa-emissora', icon: Building2 },
    { label: 'Modelo Base do PGR', path: '/modelo-base-pgr', icon: BookOpen },
    { label: 'Catálogo de Perigos', path: '/catalogo-perigos', icon: AlertTriangle },
    { 
      label: 'Banco de Dados & Firebase', 
      path: '/config-banco', 
      icon: Database,
      badge: isFirebaseConfigured ? 'Firebase' : 'Local',
      badgeVariant: isFirebaseConfigured ? 'success' : 'warning'
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border bg-card/50">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
            SISTEMA <span className="text-emerald-600 font-extrabold">PGR</span>
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
            NR-01 • Gestão de Riscos
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Core PGR */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Programa NR-01
          </div>
          <nav className="space-y-1">
            {mainNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 truncate">
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[11px] font-semibold rounded-full",
                          isActive
                            ? "bg-white/20 text-white"
                            : item.badgeVariant === 'destructive'
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : item.badgeVariant === 'warning'
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Structure */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Estrutura Organizacional
          </div>
          <nav className="space-y-1">
            {organizationNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  )
                }
              >
                <div className="flex items-center gap-3 truncate">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Support / Config */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Apoio & Configurações
          </div>
          <nav className="space-y-1">
            {supportNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  )
                }
              >
                <div className="flex items-center gap-3 truncate">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge 
                    variant={item.badgeVariant === 'success' ? 'success' : 'warning'} 
                    className="text-[10px] py-0 px-1.5"
                  >
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Critical Status Alert Box in Footer */}
      {stats.criticalRisksCount > 0 && (
        <div className="p-3 m-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-4 w-4 text-rose-600 animate-pulse" />
            <span className="text-xs font-bold">Atenção Crítica</span>
          </div>
          <p className="text-[11px] leading-tight">
            Existem <strong>{stats.criticalRisksCount} riscos críticos/altos</strong> que exigem medidas de prevenção imediatas.
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 border-t border-border bg-muted/20 text-center">
        <p className="text-[11px] text-muted-foreground">
          Sistema PGR v1.0.0 • NR-01 Standard
        </p>
      </div>
    </aside>
  );
};
