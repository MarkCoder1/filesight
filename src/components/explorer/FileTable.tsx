'use client';

import { ChevronDown } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { FileEntry } from '@/types';

import { EmptyResults } from './EmptyResults';
import { FileRow } from './FileRow';

const PAGE_SIZE = 50;

interface FileTableProps {
  files: FileEntry[];
  selectedIds: Set<string>;
  onToggleSelect: (fileId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onPreview?: (file: FileEntry) => void;
}

export function FileTable({
  files,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onPreview,
}: FileTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(files.length / PAGE_SIZE);
  const visible = useMemo(() => files.slice(0, page * PAGE_SIZE), [files, page]);

  const allVisibleSelected = useMemo(
    () => visible.length > 0 && visible.every((f) => selectedIds.has(f.id)),
    [visible, selectedIds],
  );

  const handleHeaderCheck = useCallback(() => {
    if (allVisibleSelected) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  }, [allVisibleSelected, onClearSelection, onSelectAll]);

  if (files.length === 0) {
    return <EmptyResults type="no-results" />;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[380px]">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={handleHeaderCheck}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>Name</span>
              </div>
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="w-24 text-right">Size</TableHead>
            <TableHead className="w-28">Created</TableHead>
            <TableHead className="w-28">Modified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              selected={selectedIds.has(file.id)}
              onToggleSelect={() => onToggleSelect(file.id)}
              onPreview={onPreview ? () => onPreview(file) : undefined}
            />
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && page < totalPages && (
        <div className="flex flex-col items-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            Show more ({Math.min(PAGE_SIZE, files.length - page * PAGE_SIZE)} remaining)
          </Button>
          <p className="text-xs text-muted-foreground">
            Showing {visible.length} of {files.length} files
          </p>
        </div>
      )}

      {page === totalPages && files.length > PAGE_SIZE && (
        <p className="py-2 text-center text-xs text-muted-foreground">
          Showing all {files.length} files
        </p>
      )}
    </div>
  );
}
