'use client';

import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ThemeMode } from '@/types';

interface Props {
  value: ThemeMode;
  onChange: (value: ThemeMode) => void;
}

const options: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => onChange(opt.value)}
        >
          <opt.icon className="h-4 w-4" />
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
