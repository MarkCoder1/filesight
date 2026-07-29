import type { DuplicateGroup, DuplicateScanResult } from './types';

export function buildScanResult(groups: DuplicateGroup[]): DuplicateScanResult {
  const totalDuplicates = groups.reduce((sum, g) => sum + g.files.length, 0);
  const wastedSpace = groups.reduce((sum, g) => sum + g.wastedSpace, 0);

  return {
    duplicateGroups: groups,
    totalDuplicates,
    wastedSpace,
  };
}
