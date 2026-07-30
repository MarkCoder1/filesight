'use client';

import { FolderTree, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganization } from '@/hooks/use-organization';
import { formatBytes } from '@/lib/utils';
import type { FileEntry } from '@/types';

import { CategoryCard } from './CategoryCard';
import { FileMovePreview } from './FileMovePreview';
import { OrganizationSummary } from './OrganizationSummary';

interface OrganizationAssistantProps {
  files: FileEntry[];
  folderPath: string;
}

export function OrganizationAssistant({ files, folderPath }: OrganizationAssistantProps) {
  const {
    plan,
    isGenerating,
    isExecuting,
    result,
    error,
    generatePlan,
    executeMoves,
    reset,
  } = useOrganization();

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const hasGenerated = plan !== null;

  const handleGenerate = useCallback(async () => {
    const mapped = files.map((f) => ({
      path: f.path,
      name: f.name,
      size: f.size,
      extension: f.extension,
    }));
    const orgPlan = await generatePlan(mapped, folderPath);
    if (orgPlan) {
      setSelectedCategories(new Set(orgPlan.categories.map((c) => c.category)));
    }
  }, [files, folderPath, generatePlan]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const handleExecute = useCallback(async () => {
    if (!plan) return;

    const selected = plan.categories.filter((c) => selectedCategories.has(c.category));
    const operations = selected.flatMap((cat) =>
      cat.files.map((f) => ({
        id: `${cat.category}:${f.path}`,
        originalPath: f.path,
        newPath: `${cat.suggestedPath}/${f.name}`,
        fileName: f.name,
        size: f.size,
        category: cat.category,
      })),
    );

    await executeMoves(operations);
  }, [plan, selectedCategories, executeMoves]);

  const handleDone = useCallback(() => {
    reset();
    setSelectedCategories(new Set());
    setExpandedCategory(null);
  }, [reset]);

  if (result) {
    return (
      <Card>
        <CardContent className="p-6">
          <OrganizationSummary result={result} onDone={handleDone} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            Organize Files
          </CardTitle>
          {!hasGenerated && (
            <Button size="sm" className="h-7 text-xs" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Analyzing
                </>
              ) : (
                'Analyze files'
              )}
            </Button>
          )}
        </CardHeader>
        {!hasGenerated && !isGenerating && (
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground">
              Analyze files to see how they can be organized into folders by type.
            </p>
          </CardContent>
        )}
        {isGenerating && (
          <CardContent className="flex items-center gap-2 pb-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Analyzing files...</p>
          </CardContent>
        )}
        {error && (
          <CardContent className="pb-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        )}
      </Card>

      {hasGenerated && plan && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plan.categories.map((info) => (
              <CategoryCard
                key={info.category}
                info={info}
                isSelected={selectedCategories.has(info.category)}
                onToggle={() => toggleCategory(info.category)}
              />
            ))}
          </div>

          {expandedCategory && plan.categories.find((c) => c.category === expandedCategory) && (
            <Card>
              <CardContent className="p-4">
                <FileMovePreview
                  category={plan.categories.find((c) => c.category === expandedCategory)!}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
            <div className="text-sm">
              <span className="font-medium">
                {Array.from(selectedCategories).reduce(
                  (sum, cat) => sum + (plan.categories.find((c) => c.category === cat)?.fileCount ?? 0),
                  0,
                )}
              </span>{' '}
              files selected &middot;{' '}
              <span className="font-medium">
                {formatBytes(
                  Array.from(selectedCategories).reduce(
                    (sum, cat) => sum + (plan.categories.find((c) => c.category === cat)?.totalSize ?? 0),
                    0,
                  ),
                )}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleDone}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={handleExecute}
                disabled={selectedCategories.size === 0 || isExecuting}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Moving
                  </>
                ) : (
                  'Move files'
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
