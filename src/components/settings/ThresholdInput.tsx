'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  label: string;
  description: string;
  value: number | null;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  allowNull?: boolean;
  nullLabel?: string;
  onChange: (value: number | null) => void;
}

export function ThresholdInput({
  label,
  description,
  value,
  unit,
  min = 0,
  max,
  step = 1,
  allowNull = false,
  nullLabel = 'Unlimited',
  onChange,
}: Props) {
  const [localValue, setLocalValue] = useState(value !== null ? String(value) : '');

  const displayValue = value !== null ? value : null;

  const handleInputChange = (raw: string) => {
    setLocalValue(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= min) {
      onChange(parsed);
    }
  };

  const increment = () => {
    if (value === null) {
      onChange(min);
      setLocalValue(String(min));
    } else {
      const next = max !== undefined ? Math.min(value + step, max) : value + step;
      onChange(next);
      setLocalValue(String(next));
    }
  };

  const decrement = () => {
    if (value === null) {
      onChange(min);
      setLocalValue(String(min));
    } else {
      const next = value - step;
      if (next < min) {
        if (allowNull) {
          onChange(null);
          setLocalValue('');
          return;
        }
        onChange(min);
        setLocalValue(String(min));
        return;
      }
      onChange(next);
      setLocalValue(String(next));
    }
  };

  const toggleNull = () => {
    if (value === null) {
      onChange(min);
      setLocalValue(String(min));
    } else {
      onChange(null);
      setLocalValue('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium leading-none">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={decrement}
            disabled={!allowNull && value !== null && value <= min}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="flex items-center gap-1">
            <Input
              className="h-8 w-20 text-center text-xs tabular-nums"
              value={displayValue !== null ? localValue : ''}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={nullLabel}
              type="number"
              min={min}
              max={max}
              step={step}
            />
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={increment}
            disabled={max !== undefined && value !== null && value >= max}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {allowNull && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={toggleNull}>
            {value === null ? 'Set limit' : nullLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
