
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: LucideIcon;
  label: string;
  showLabel?: boolean;
  iconClass?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  showLabel = false,
  iconClass,
  className,
  ...props
}) => {
  return (
    <Button
      className={cn(
        "flex items-center gap-2",
        !showLabel && "px-2 w-10 h-10", 
        className
      )}
      {...props}
      aria-label={label}
    >
      <Icon className={cn("h-5 w-5", iconClass)} />
      {showLabel && <span>{label}</span>}
    </Button>
  );
};

export { IconButton };
