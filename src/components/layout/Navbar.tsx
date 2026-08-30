import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanySelector } from '@/components/layout/CompanySelector';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
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
    </header>
  );
};
