import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400',
  trend,
  onClick,
  className,
}) => {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "overflow-hidden border-border/80 shadow-xs transition-all hover:shadow-md hover:border-border",
        onClick && "cursor-pointer hover:scale-[1.01]",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-foreground">
                {value}
              </span>
              {trend && (
                <span className={cn("text-xs font-semibold", trend.isPositive ? "text-emerald-600" : "text-rose-600")}>
                  {trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl flex items-center justify-center shrink-0 shadow-2xs", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
