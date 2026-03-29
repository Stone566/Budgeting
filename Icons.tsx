import * as LucideIcons from 'lucide-react';

export const Icon = ({ name, color, size = 24, className }: { name: string, color?: string, size?: number, className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <LucideIcon color={color} size={size} className={className} />;
};
