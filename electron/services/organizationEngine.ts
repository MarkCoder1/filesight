import path from 'path';
import { randomUUID } from 'crypto';

import { classifyFile, getCategoryFolderName, type OrgCategory } from './fileClassifier';

interface ScanFile {
  path: string;
  name: string;
  size: number;
  extension: string;
}

export interface OrgCategoryInfo {
  category: OrgCategory;
  label: string;
  files: Array<{ path: string; name: string; size: number }>;
  fileCount: number;
  totalSize: number;
  suggestedPath: string;
}

export interface OrgPlan {
  id: string;
  sourceFolder: string;
  categories: OrgCategoryInfo[];
  totalFiles: number;
  totalSize: number;
  createdAt: string;
}

export function generatePlan(scanFiles: ScanFile[], sourceFolder: string): OrgPlan {
  const groups = new Map<OrgCategory, Array<{ path: string; name: string; size: number }>>();

  for (const file of scanFiles) {
    if (file.extension === '' || !file.extension) continue;
    const category = classifyFile(file.extension);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category)!.push({ path: file.path, name: file.name, size: file.size });
  }

  const categories: OrgCategoryInfo[] = [];

  for (const [category, files] of groups) {
    const folderName = getCategoryFolderName(category);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    categories.push({
      category,
      label: category === 'unknown' ? 'Other Files' : folderName,
      files: files.sort((a, b) => b.size - a.size),
      fileCount: files.length,
      totalSize,
      suggestedPath: path.join(sourceFolder, folderName),
    });
  }

  categories.sort((a, b) => b.fileCount - a.fileCount);

  const totalFiles = categories.reduce((sum, c) => sum + c.fileCount, 0);
  const totalSize = categories.reduce((sum, c) => sum + c.totalSize, 0);

  return {
    id: randomUUID(),
    sourceFolder,
    categories,
    totalFiles,
    totalSize,
    createdAt: new Date().toISOString(),
  };
}
