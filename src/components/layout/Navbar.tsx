import React from 'react';
import { Menu, Plus, Trash2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanySelector } from '@/components/layout/CompanySelector';
import { usePgr } from '@/context/PgrContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { activePgr, clearAllData } = usePgr();
  const navigate = useNavigate();

  const handleClearData = () => {
    if (window.confirm('Deseja zerar todos os dados e começar o teste do zero?')) {
      clearAllData();
      navigate('/empresas');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-card/90 backdrop-blur border-b border-border">
      {/* Left: Mobile trigger & Company Selector */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onToggleSidebar}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <CompanySelector />
      </div>

      {/* Right: Quick actions & utilities */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearData}
          title="Zerar todos os dados para começar um teste limpo do zero"
          className="hidden sm:flex items-center gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Zerar Dados</span>
        </Button>

        {activePgr && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/documentos-pgr/${activePgr.id}`)}
            className="hidden md:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Ver PGR Atual</span>
          </Button>
        )}

        <Button
          size="sm"
          onClick={() => navigate('/inventario')}
          className="flex items-center gap-1.5 text-xs font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Risco</span>
        </Button>
      </div>
    </header>
  );
};
