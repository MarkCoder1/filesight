# Testing

## Overview

Test suite: **Vitest** (v4), **252 tests** across **19 test files**.

## Running Tests

```bash
npm test          # Run all tests
npx vitest        # Watch mode
npx vitest --ui   # UI mode
npx vitest run    # Single run
```

## Test Structure

```
tests/
├── analyzer/           # Analyzer engine (25 tests)
│   ├── analyzeFiles.test.ts
│   ├── categoryAnalyzer.test.ts
│   ├── largeFilesAnalyzer.test.ts
│   ├── oldFilesAnalyzer.test.ts
│   ├── storageAnalyzer.test.ts
│   └── suggestionEngine.test.ts
├── cleanup/            # Cleanup/trash operations (9 tests)
│   └── trash.test.ts
├── database/           # JSON persistence layer (15 tests)
│   └── history.test.ts
├── duplicates/         # Duplicate detection (15 tests)
│   └── scanner.test.ts
├── explorer/           # File filter/search/sort (26 tests)
│   ├── fileFiltering.test.ts
│   ├── fileSearch.test.ts
│   └── fileSorting.test.ts
├── lib/                # Shared utilities (116 tests)
│   ├── fileCategories.test.ts
│   └── utils.test.ts
├── scanner/            # File scanning (39 tests)
│   ├── fileCollector.test.ts
│   ├── fileMetadata.test.ts
│   ├── scanUtils.test.ts
│   └── scanner.test.ts
└── settings/           # Settings persistence (6 tests)
    └── settings.test.ts
```

## Coverage

Coverage is configured in `vitest.config.ts` — run with:

```bash
npx vitest run --coverage
```

## Adding Tests

- Place tests in `tests/<module>/<name>.test.ts`
- Use `describe`/`it` blocks with Vitest globals (no imports needed)
- Source file imports use `@/` alias (e.g., `import { formatBytes } from '@/lib/utils'`)
- For Electron-side tests: mock `electron` module and use `node` environment
- For React components: add `@testing-library/react` and set `environment: 'jsdom'`
