'use client';

import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { CleanupDialog } from '@/components/cleanup/CleanupDialog';
import { CleanupProgress } from '@/components/cleanup/CleanupProgress';
import { CleanupResult } from '@/components/cleanup/CleanupResult';
import { SelectedFilesBar } from '@/components/cleanup/SelectedFilesBar';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { useCleanup } from '@/hooks/use-cleanup';
import { useScanStore } from '@/hooks/use-scan-store';
import { filterFiles } from '@/lib/fileFiltering';
import { searchFiles } from '@/lib/fileSearch';
import { sortFiles } from '@/lib/fileSorting';
import { useExplorerStore } from '@/stores/explorer-store';
import type { FileEntry } from '@/types';

import { EmptyResults } from './EmptyResults';
import { FileTable } from './FileTable';
import { FilterPanel } from './FilterPanel';
import { SearchBar } from './SearchBar';
import { SortDropdown } from './SortDropdown';

interface FileExplorerProps {
  files: FileEntry[];
  onGoHome?: () => void;
}

export function FileExplorer({ files, onGoHome }: FileExplorerProps) {
  const [previewFile, setPreviewFile] = useState<FileEntry | null>(null);

  const {
    searchQuery,
    activeFilters,
    sortOption,
    selectedFiles,
    storeFiles,
    setFiles,
    setSearchQuery,
    setActiveFilters,
    setSortOption,
    toggleFileSelection,
    selectAll,
    clearSelection,
    removeFiles: removeFilesFromExplorer,
  } = useExplorerStore(
    useShallow((s) => ({
      searchQuery: s.searchQuery,
      activeFilters: s.activeFilters,
      sortOption: s.sortOption,
      selectedFiles: s.selectedFiles,
      storeFiles: s.files,
      setFiles: s.setFiles,
      setSearchQuery: s.setSearchQuery,
      setActiveFilters: s.setActiveFilters,
      setSortOption: s.setSortOption,
      toggleFileSelection: s.toggleFileSelection,
      selectAll: s.selectAll,
      clearSelection: s.clearSelection,
      removeFiles: s.removeFiles,
    })),
  );

  const cleanup = useCleanup();
  const { removeFiles: removeFilesFromScan } = useScanStore();

  useEffect(() => {
    setFiles(files);
  }, [files, setFiles]);

  const filtered = useMemo(() => {
    let result = storeFiles;
    result = searchFiles(result, searchQuery);
    result = filterFiles(result, activeFilters);
    result = sortFiles(result, sortOption);
    return result;
  }, [storeFiles, searchQuery, activeFilters, sortOption]);

  useEffect(() => {
    if (cleanup.isComplete && cleanup.result) {
      const deletedPaths = cleanup.result.results
        .filter((r) => r.success)
        .map((r) => r.path);
      if (deletedPaths.length > 0) {
        removeFilesFromExplorer(deletedPaths);
        removeFilesFromScan(deletedPaths);
        if (previewFile && deletedPaths.includes(previewFile.path)) {
          startTransition(() => setPreviewFile(null));
        }
      }
    }
  }, [cleanup.isComplete, cleanup.result, removeFilesFromExplorer, removeFilesFromScan, previewFile]);

  const handleSearch = useCallback((text: string) => setSearchQuery({ text }), [setSearchQuery]);

  const hasActiveFilters =
    activeFilters.category !== 'all' ||
    activeFilters.size !== 'all' ||
    activeFilters.date !== 'all' ||
    searchQuery.text !== '';

  const resetAll = useCallback(() => {
    setSearchQuery({ text: '' });
    setActiveFilters({ category: 'all', size: 'all', date: 'all' });
    setSortOption('name-asc');
  }, [setSearchQuery, setActiveFilters, setSortOption]);

  const selectedFileEntries = useMemo(() => {
    return storeFiles.filter((f) => selectedFiles.has(f.id));
  }, [storeFiles, selectedFiles]);

  const selectedTotalSize = useMemo(
    () => selectedFileEntries.reduce((s, f) => s + f.size, 0),
    [selectedFileEntries],
  );

  const handleBulkTrash = useCallback(() => {
    const trashFiles = selectedFileEntries.map((f) => ({
      path: f.path,
      name: f.name,
      size: f.size,
    }));
    cleanup.showPreview(trashFiles);
  }, [selectedFileEntries, cleanup]);

  const handleCleanupDone = useCallback(() => {
    cleanup.reset();
    clearSelection();
  }, [cleanup, clearSelection]);

  const handlePreview = useCallback((file: FileEntry) => {
    setPreviewFile(file);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  if (storeFiles.length === 0 && !cleanup.isComplete && !cleanup.isError && !cleanup.isInProgress) {
    return <EmptyResults type="no-data" actionLabel="Scan folder" onAction={onGoHome} />;
  }

  const listContent = (
    <div className="space-y-4">
      {storeFiles.length > 0 && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex-1">
              <SearchBar value={searchQuery.text} onChange={handleSearch} />
            </div>
            <SortDropdown value={sortOption} onChange={setSortOption} />
          </div>

          <FilterPanel
            filters={activeFilters}
            onCategoryChange={(category) => setActiveFilters({ ...activeFilters, category })}
            onSizeChange={(size) => setActiveFilters({ ...activeFilters, size })}
            onDateChange={(date) => setActiveFilters({ ...activeFilters, date })}
            onReset={resetAll}
            hasActiveFilters={hasActiveFilters}
            resultCount={filtered.length}
          />

          <FileTable
            files={filtered}
            selectedIds={selectedFiles}
            onToggleSelect={toggleFileSelection}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onPreview={handlePreview}
          />
        </>
      )}

      {selectedFiles.size > 0 && !cleanup.isPreview && !cleanup.isInProgress && (
        <SelectedFilesBar
          count={selectedFiles.size}
          totalSize={selectedTotalSize}
          onClear={clearSelection}
          onMoveToTrash={handleBulkTrash}
        />
      )}

      <CleanupDialog
        open={cleanup.isPreview}
        onOpenChange={(open) => {
          if (!open && !cleanup.isInProgress) cleanup.reset();
        }}
        files={cleanup.pendingFiles}
        onConfirm={cleanup.execute}
        isProcessing={cleanup.isInProgress}
      />

      {cleanup.isInProgress && cleanup.progress && (
        <div className="rounded-lg border bg-background p-4">
          <CleanupProgress
            current={cleanup.progress.current}
            total={cleanup.progress.total}
            currentFile={cleanup.progress.currentFile}
          />
        </div>
      )}

      {cleanup.isComplete && cleanup.result && (
        <div className="rounded-lg border bg-background p-4">
          <CleanupResult result={cleanup.result} onDone={handleCleanupDone} />
        </div>
      )}

      {cleanup.isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {cleanup.error}
          <button onClick={cleanup.reset} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {storeFiles.length === 0 && !cleanup.isComplete && !cleanup.isError && !cleanup.isInProgress && (
        <EmptyResults type="no-data" actionLabel="Scan folder" onAction={onGoHome} />
      )}
    </div>
  );

  return (
    <div className="flex h-full gap-4">
      <div className={previewFile ? 'flex-1 min-w-0' : 'w-full'}>{listContent}</div>
      {previewFile && (
        <div className="w-[420px] shrink-0 border-l">
          <PreviewPanel file={previewFile} onClose={handleClosePreview} />
        </div>
      )}
    </div>
  );
}
