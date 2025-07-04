import React from 'react';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToolCard = ({
  icon,
  title,
  subtitle,
  color = 'hsl(var(--primary))',
  checked,
  onChange,
}: ToolCardProps) => {
  const id = React.useId();

  // Define styles using CSS variables for dynamic coloring
  const styles = {
    '--tool-color': color,
    '--tool-color-shadow': color.replace(')', ', 0.1)'),
  } as React.CSSProperties;

  return (
    <label htmlFor={id} style={styles} className="text-muted-foreground">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer h-[1px] w-[1px] absolute overflow-hidden opacity-0 whitespace-nowrap"
      />
      <span
        className={cn(
          "flex flex-col items-center justify-center w-full min-h-[7rem] p-2 rounded-lg transition-all duration-200 cursor-pointer relative",
          "border-[3px] border-border dark:border-gray-700",
          "before:absolute before:block before:w-5 before:h-5 before:border-[3px] before:rounded-full before:top-1 before:left-1 before:opacity-0 before:transition-transform before:scale-0 before:text-background dark:before:text-foreground before:text-xs before:flex before:items-center before:justify-center",
          "hover:border-[var(--tool-color)]",
          "peer-checked:border-[var(--tool-color)] peer-checked:shadow-lg peer-checked:shadow-[var(--tool-color-shadow)] peer-checked:text-[var(--tool-color)]",
          "peer-checked:before:border-[var(--tool-color)] peer-checked:before:bg-[var(--tool-color)] peer-checked:before:opacity-100 peer-checked:before:scale-100 peer-checked:before:content-['✓']"
        )}
      >
        <span className="transition-all duration-100 [&_svg]:w-10 [&_svg]:h-10">
          {icon}
        </span>
        <span className="font-semibold transition-all duration-300 text-center mt-2 text-sm">
          {title}
        </span>
        <span className="text-xs opacity-60 mt-0.5 text-center">
          {subtitle}
        </span>
      </span>
    </label>
  );
};
