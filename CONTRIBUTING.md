# Contributing to FileSight

Thank you for your interest in contributing.

## How to Contribute

1. **Fork** the repository.
2. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Make your changes** following the project's coding conventions.
4. **Run tests** to verify nothing is broken:
   ```bash
   npm test
   ```
5. **Build** the project to check for compilation errors:
   ```bash
   npm run build
   ```
6. **Submit a pull request** against the `main` branch.

## Development Setup

See [docs/INSTALLATION.md](docs/INSTALLATION.md#development-setup) for detailed development setup instructions.

## Code Style

- TypeScript with strict mode
- React components use functional style with hooks
- Tailwind CSS for styling (utility classes, no CSS modules)
- Imports: libraries first, then `@/` aliases, then relative imports
- Prettier for formatting: `npm run format`

## Testing

- Tests are written with Vitest
- Run the full suite: `npm test`
- Tests live in `tests/<module>/` following the source structure
- Test files use `.test.ts` extension

## Pull Request Guidelines

- Keep PRs focused on a single concern
- Include tests for new functionality
- Update documentation if needed (README, docs/)
- Ensure the build passes before submitting

## Questions

Open an issue for bugs, feature requests, or questions.
