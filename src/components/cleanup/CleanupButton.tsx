'use client';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CleanupButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  label?: string;
}

export function CleanupButton({
  onClick,
  disabled,
  variant = 'ghost',
  size = 'sm',
  label,
}: CleanupButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className="gap-1.5 text-destructive hover:text-destructive hover:cursor-pointer"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {label ?? 'Move to Trash'}
    </Button>
  );
}
