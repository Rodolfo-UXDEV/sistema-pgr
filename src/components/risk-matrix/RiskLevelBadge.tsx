import React from 'react';
import { RiskLevel } from '@/types/pgr';
import { RISK_LEVEL_CONFIG } from '@/lib/risk-matrix';
import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface RiskLevelBadgeProps {
  level: RiskLevel;
  showScore?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({ 
  level, 
  showScore, 
  className,
  size = 'md' 
}) => {
  const config = RISK_LEVEL_CONFIG[level] || RISK_LEVEL_CONFIG.MODERADO;

  const getIcon = () => {
    switch (level) {
      case 'TRIVIAL':
        return <ShieldCheck className="h-3 w-3 shrink-0" />;
      case 'TOLERAVEL':
        return <Shield className="h-3 w-3 shrink-0" />;
      case 'MODERADO':
        return <AlertTriangle className="h-3 w-3 shrink-0" />;
      case 'SUBSTANCIAL':
        return <ShieldAlert className="h-3.5 w-3.5 shrink-0" />;
      case 'INTOLERAVEL':
        return <Zap className="h-3.5 w-3.5 shrink-0 animate-bounce" />;
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.2 gap-1 font-medium',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-semibold',
    lg: 'text-sm px-3 py-1 gap-2 font-bold',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border transition-colors shadow-2xs",
        config.badgeColor,
        sizeClasses[size],
        className
      )}
    >
      {getIcon()}
      <span>{config.label}</span>
      {showScore !== undefined && (
        <span className="opacity-75 font-mono ml-0.5 text-[10px]">
          ({showScore})
        </span>
      )}
    </span>
  );
};
