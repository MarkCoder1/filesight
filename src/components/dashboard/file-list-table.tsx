'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileIcon, getFileIconColor } from '@/lib/file-icons';
import { formatBytes, formatRelativeDate } from '@/lib/utils';
import type { FileEntry } from '@/types';

const PAGE_SIZE = 25;

interface FileListTableProps {
  files: FileEntry[];
}

export function FileListTable({ files }: FileListTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(files.length / PAGE_SIZE);
  const visible = files.slice(0, page * PAGE_SIZE);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">No files match your filters.</p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Size</TableHead>
            <TableHead>Modified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((file) => (
            <TableRow key={file.path} className="cursor-pointer">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${getFileIconColor(file.category)}20` }}
                  >
                    <FileIcon
                      category={file.category}
                      className="h-4 w-4"
                      style={{ color: getFileIconColor(file.category) }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{file.path}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="capitalize">{file.category}</TableCell>
              <TableCell className="text-right tabular-nums">
                {file.isDirectory ? '—' : formatBytes(file.size)}
              </TableCell>
              <TableCell className="text-nowrap text-muted-foreground">
                {formatRelativeDate(file.modifiedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && page < totalPages && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            Show more ({Math.min(PAGE_SIZE, files.length - page * PAGE_SIZE)} remaining)
          </Button>
        </div>
      )}

      {page > 1 && page < totalPages && (
        <p className="pb-2 text-center text-xs text-muted-foreground">
          Showing {visible.length} of {files.length} files
        </p>
      )}
    </div>
  );
}
