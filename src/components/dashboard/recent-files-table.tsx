'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBytes, formatRelativeDate } from '@/lib/utils';
import type { FileEntry } from '@/types';

interface RecentFilesTableProps {
  files: FileEntry[];
}

export function RecentFilesTable({ files }: RecentFilesTableProps) {
  const sorted = [...files].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Added</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.slice(0, 5).map((file) => (
          <TableRow key={file.path} className="cursor-pointer">
            <TableCell className="max-w-[200px] truncate font-medium">{file.name}</TableCell>
            <TableCell>{formatBytes(file.size)}</TableCell>
            <TableCell className="capitalize">{file.category}</TableCell>
            <TableCell>{formatRelativeDate(file.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
