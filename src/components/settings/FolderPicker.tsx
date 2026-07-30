'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface Props {
  selectedPath: string;
  onSelect: () => void;
}

export function FolderPicker({ selectedPath, onSelect }: Props) {
  const [hovering, setHovering] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Default Folder</p>
      <div className="flex items-center gap-2">
        <code
          className="flex-1 truncate rounded-md border bg-muted/50 px-3 py-2 text-xs font-mono"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          title={hovering ? selectedPath : undefined}
        >
          {selectedPath || 'Not set'}
        </code>
        <Button variant="outline" size="sm" onClick={onSelect} className="hover:cursor-pointer">
          Change Folder
        </Button>
      </div>
    </div>
  );
}
