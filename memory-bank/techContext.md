# WiseMapping Frontend - Technical Context

## Technology Stack

### Core Languages & Runtimes
- **TypeScript**: ^5.9.3 (primary language, strict mode enforced)
- **JavaScript**: ES2022 target, ES2020 modules
- **JSX**: React automatic runtime
- **Node.js**: >=18.0.0 (required)

### Frameworks & Core Libraries
- **React**: ^19.0.0 (peer dependency for packages)
- **Material-UI (MUI)**: ^7.3.4
  - `@mui/material`: ^7.3.4
  - `@mui/icons-material`: ^7.3.4
- **Emotion**: ^11.14.0+ (@emotion/react, @emotion/styled)
- **Styled Components**: ^6.1.19 (alternative styling solution)

### Architecture Packages
- **@wisemapping/web2d**: SVG abstraction layer for chart rendering (packages/web2d)
- **@wisemapping/mindplot**: Vanilla ES6 canvas engine for mind maps (packages/mindplot)
- **@wisemapping/editor**: React component wrapper for mindplot (packages/editor)

### Key Dependencies
- **html2canvas**: ^1.4.1 (for export functionality)
- **jspdf**: ^3.0.3 (PDF generation)
- **lodash**: ^4.17.21 (utility functions)
- **xml-formatter**: ^3.6.7 (XML formatting)
- **fflate**: Custom vendor version (compression)

## Development Toolchain

### Package Management
- **Primary**: Yarn with workspaces
- **Monorepo Tool**: Lerna 9.0.0 (independent versioning mode)
- **Dependencies**: `workspace:*` protocol for internal packages
- **Scripts**: Consistent script naming across all packages

### Build System
- **Bundler**: Webpack ^5.102.1
- **Configuration**: 
  - `webpack.common.js` - Shared across all packages
  - `webpack.prod.js` - Production builds with optimization
  - `webpack.dev.js` - Development builds
- **TypeScript Loader**: ts-loader ^9.5.4 in transpile-only mode
- **Babel**: @babel/preset-typescript ^7.28.5
- **Optimization Features**:
  - Persistent filesystem caching (`.webpack-cache` directory)
  - Thread-loader for parallel builds
  - Deterministic module IDs for long-term caching
  - Dead code elimination (`usedExports: true`)

### Development Servers
- **Webpack Dev Server**: ^5.2.2
- **Port Configuration**: Configurable via `$PORT` environment variable
- **Default Ports**:
  - Editor Storybook: ${PORT:-6008}
  - Mindplot Storybook: ${PORT:-6006}
  - Playground: 8081 (editor package)

### Code Quality & Formatting

#### ESLint Configuration
- **Version**: ^9.38.0 with flat config (`eslint.config.mjs`)
- **Plugins**:
  - `@eslint/js/recommended` - JavaScript recommended rules
  - `eslint-plugin-react` - React specific rules
  - `eslint-plugin-react-hooks` - React hooks rules
  - `eslint-plugin-cypress` - Cypress testing rules
  - `eslint-plugin-storybook` - Storybook specific rules
  - `eslint-config-prettier` - Prettier integration
  - `@typescript-eslint/eslint-plugin` - TypeScript rules
- **Globals**: browser, node, commonjs, jest
- **Target**: ECMAScript 2022

#### Prettier Configuration
- **Version**: ^3.6.2
- **Configuration**: `.prettierrc.json`
- **Settings**:
  - Print width: 100 characters
  - Tab width: 2 spaces
  - Single quotes: true
  - Trailing commas: all
  - Semicolons: true

#### TypeScript Configuration
- **Strict Mode**: Enabled (`strict: true`)
- **Strict Null Checks**: Enabled (`strictNullChecks: true`)
- **Target**: ES2022
- **Module**: ES2020
- **JSX**: React automatic runtime (`jsx: react-jsx`)
- **Allow JS**: true (for mixed codebase migration)
- **Source Maps**: Enabled for debugging
- **Declaration Files**: Generated for packages
- **Module Resolution**: Node.js resolution strategy

### Git Workflow & Hooks
- **Hooks Manager**: Husky ^9.1.7
- **Pre-commit**: lint-staged for automatic code formatting
- **Pre-push**: Full test suite and linting verification
  - Commands: `yarn lint && yarn test`
  - Must pass before push is allowed

### Testing Framework

#### Jest Configuration
- **Version**: ^30.2.0
- **Environment**: jsdom for React component testing
- **Preset**: ts-jest for TypeScript support
- **Transform**:
  - JS/TS files: babel-jest
  - Asset files: jest-transform-stub (for SVG, CSS, etc.)
- **Module Extensions**: `js`, `ts`, `tsx`
- **Verbose**: true for detailed test output
- **Coverage**: Detect open handles enabled

#### Cypress Configuration
- **Version**: ^15.5.0
- **Base URLs**: Configured per package
  - Playground: `http://localhost:8081`
  - Storybook: `http://localhost:6006` or `http://localhost:6008`
- **Features**:
  - Visual regression testing with `cypress-image-snapshot` ^4.0.1
  - Screenshot and video capture on test failure
  - start-server-and-test for CI integration

### Component Development
- **Storybook**: ^9.1.13 for isolated component development
- **Builders**: Webpack5 (most packages), Vite (webapp package)
- **Documentation**: MDX support with @mdx-js/react ^3.1.1
- **Testing**: Integrated with Cypress for visual regression

### Internationalization
- **Library**: react-intl ^7.1.14
- **CLI Tool**: @formatjs/cli ^6.7.4
- **Workflow**:
  - Extract: `yarn i18n:extract` - Extract messages from source
  - Compile: `yarn i18n:compile` - Compile to AST format
- **Supported Languages**: es, en, fr, de, zh, zh-CN, ru, uk, ja, pt, it, hi
- **Structure**: JSON files in `lang/` and `src/compiled-lang/` directories

## Development Constraints & Standards

### Package Management Commands
- **Install**: `yarn install` (npm commands prohibited)
- **Clean**: `yarn clean` - Remove all build artifacts
- **Build**: `yarn build` - Production builds across all packages
- **Test**: `yarn test` - Unit + integration tests
- **Lint**: `yarn lint` - ESLint checks only
- **Lint Fix**: `yarn lint:fix` - Auto-fix where possible

### Prohibited Patterns
- **DO NOT** use npm commands (use yarn exclusively)
- **DO NOT** commit build artifacts (`dist/`, `build/`, `coverage/`)
- **DO NOT** use Material-UI barrel imports (pre-push hook will reject)
- **DO NOT** disable TypeScript strict mode
- **DO NOT** skip pre-push hooks

### Required Patterns
- **ALWAYS** run `yarn lint && yarn test` before pushing
- **ALWAYS** use `workspace:*` for internal dependencies
- **ALWAYS** enable source maps in development
- **ALWAYS** write tests for new features (unit + integration)
- **ALWAYS** use Prettier for code formatting
- **ALWAYS** maintain TypeScript strict mode compliance

### Version Constraints
- **React**: ^19.0.0 (peer dependency)
- **MUI**: ^7.3.4 (both core and icons together)
- **Node.js**: >=18.0.0 (required runtime)
- **TypeScript**: ^5.9.3 (latest stable)

### Bundle Optimization Requirements
- **Material-UI**: Tree-shakeable imports only (500KB+ impact if violated)
- **Webpack**: Enable persistent caching for rebuilds
- **Threading**: Use thread-loader for parallel builds
- **Analysis**: Use `ANALYZE=true` or `webpack-bundle-analyzer` for optimization

## Package Architecture

### Package Structure
Each package follows consistent structure:
```
packages/<name>/
├── src/                      # Source code
│   ├── components/           # React components (or vanilla classes)
│   ├── @types/              # TypeScript type definitions
│   ├── hooks/               # React hooks (editor/webapp)
│   ├── utils/               # Utility functions
│   └── index.ts             # Package entry point
├── test/ or __tests__/      # Test files
├── cypress/                 # Cypress integration tests
├── lang/                    # i18n source files
├── jest.config.js           # Jest configuration
├── cypress.config.*         # Cypress configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Package-specific dependencies
└── README.md                # Package documentation
```

### Entry Points
- **All Packages**: `src/index.ts` as main entry point
- **Published Files**: `src` directories published (not `dist`)
- **Module Type**: ES modules with TypeScript declarations

### Dependencies Hierarchy
1. **@wisemapping/web2d**: Foundation - zero external dependencies
2. **@wisemapping/mindplot**: Depends on web2d
3. **@wisemapping/editor**: Depends on mindplot
4. **@wisemapping/webapp**: Not in current scope (complete React app)

## Reference Configuration Files

### Root Level
- `package.json` - Root monorepo configuration and workspace settings
- `lerna.json` - Lerna monorepo configuration (independent versioning)
- `webpack.common.js` - Shared Webpack build configuration
- `eslint.config.mjs` - ESLint flat configuration
- `.prettierrc.json` - Prettier formatting configuration
- `.gitignore` - Git ignore patterns
- `.nvmrc` - Node.js version specification

### Per Package
- `packages/*/package.json` - Package-specific dependencies and scripts
- `packages/*/tsconfig.json` - TypeScript configuration (extends root)
- `packages/*/jest.config.js` - Jest testing configuration
- `packages/*/cypress.config.*` - Cypress testing configuration
- `packages/*/webpack.*.js` - Package-specific Webpack configs (if needed)

## Development Tips

### Performance Optimization
- Monitor bundle size with `ANALYZE=true yarn build`
- Check for Material-UI import violations: `./scripts/check-mui-imports.sh`
- Use dynamic imports for code splitting heavy features
- Enable Webpack caching in development (enabled by default)

### Testing
- Run specific test file: `yarn jest path/to/file.test.ts`
- Debug Cypress tests: `yarn cy:open` in package directory
- Update snapshots: `yarn cy:run --env updateSnapshots=true`
- Docker snapshot testing: See TESTING_PORT_ALLOCATION.md

### Debugging
- Source maps enabled in development builds
- Use React DevTools for component inspection
- Cypress runs in Electron with access to dev tools
- Check `.webpack-cache` if experiencing build issues

### Common Issues
- **Port conflicts**: Integration tests handle automatically
- **Type errors**: Check strict mode compliance (no `any` types)
- **Lint errors**: Run `yarn lint:fix` before committing
- **Build failures**: Clear cache with `yarn clean && yarn install`
- **MUI warnings**: Check imports follow tree-shaking pattern

## Continuous Integration

### GitHub Actions (if applicable)
- Tests run on pull request submission
- Pre-push hooks prevent failing code from being pushed
- Bundle size changes reported in PR comments
- Visual regression test results uploaded as artifacts

### Pre-push Hook Verification
Before code is pushed, the following must pass:
1. All unit tests (Jest)
2. All integration tests (Cypress)
3. Linting checks (ESLint + Prettier)
4. TypeScript compilation (no errors)
5. Bundle analysis (size limits not exceeded)

---

*This tech context reflects the current development environment as of initialization. Update when making significant toolchain changes or adding new development dependencies.*
