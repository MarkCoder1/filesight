'use client';

import { FolderOpen, Monitor, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';

interface Props {
  onComplete: () => void;
}

const steps = [
  {
    icon: ShieldCheck,
    title: 'Your files stay on your device',
    description: 'Everything runs locally. No data ever leaves your computer. No account needed.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: FolderOpen,
    title: 'Find what matters',
    description: 'Spot large files, old downloads, duplicates, and storage hogs at a glance.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Monitor,
    title: 'Clean with confidence',
    description: 'Review before you act. Files go to Trash where you can restore them.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
];

export function OnboardingWizard({ onComplete }: Props) {
  const { selectFolder } = useSettings();

  const handleStart = useCallback(async () => {
    await selectFolder();
    onComplete();
  }, [selectFolder, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to FileSight</h1>
          <p className="mt-2 text-muted-foreground">
            Your Downloads folder collects files over time. Let&apos;s take a look.
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <Card key={step.title} className="border-muted">
              <CardContent className="flex items-start gap-4 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.bg}`}>
                  <step.icon className={`h-5 w-5 ${step.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-3 text-center">
          <Button size="xl" className="w-full gap-2 shadow-lg shadow-primary/20" onClick={handleStart}>
            <FolderOpen className="h-5 w-5" />
            Choose Folder &amp; Start
          </Button>
          <p className="text-xs text-muted-foreground">
            You can change the default folder later in Settings.
          </p>
        </div>
      </div>
    </div>
  );
}
