# WiseMapping Frontend - Technical Context

## Technology Stack Overview

### Core Languages & Runtimes
- **TypeScript**: ^5.9.3 (primary language, strict mode enforced)
- **JavaScript**: ES2022 target, ES2020 modules
- **JSX**: React automatic runtime
- **Node.js**: >=18.0.0 (required for development and build)

### VS Code Extension Development
- **Extension API**: VS Code Extension API 1.85.0+
- **Custom Editor**: CustomTextEditorProvider implementation
- **Webview**: VS Code webview panels for editor integration
- **File Association**: `.fastmind` file type registration
- **Commands**: VS Code command palette integration
- **Type Definitions**: @types/vscode ^1.85.0

### Frontend Framework
- **React**: ^19.0.0 (peer dependency for editor packages)
- **Renderer**: React 19 automatic JSX runtime
- **State Management**: React hooks (useState, useReducer, useContext)
- **Side Effects**: Custom hooks for complex logic
- **Component Pattern**: Functional components only (strict enforcement)

### UI Component Library
- **Material-UI (MUI)**: ^7.3.4 (latest stable)
  - `@mui/material`: ^7.3.4 (tree-shakeable imports only)
  - `@mui/icons-material`: ^7.3.4 (individual icon imports)
- **Emotion**: ^11.14.0+ (@emotion/react, @emotion/styled)
- **Theme System**: MUI theme with custom palettes
- **Critical Constraint**: Tree-shaking mandatory (500KB+ bundle impact)

### VS Code Extension Architecture
- **editor-standalone**: Standalone build for VS Code webview integration
- **FastMind Extension**: CustomTextEditorProvider implementation
- **Communication**: Bidirectional postMessage communication
- **Persistence**: VSCodePersistenceManager for document handling
- **Performance**: Optimized for embedded webview environment

## Package Architecture & Dependencies

### Current Package Structure
```
wisemapping-front-end/
├── packages/
│   ├── web2d/               # SVG abstraction layer (foundation)
│   ├── mindplot/             # Core mind mapping engine
│   ├── editor/               # React component wrapper
│   ├── editor-standalone/    # Standalone build for VS Code
│   └── fastmind/            # VS Code Extension (primary focus)
├── memory-bank/              # Project documentation
└── scripts/                  # Build and utility scripts
```

### Dependency Hierarchy (Current Focus)
```
VS Code Extension: fastmind → editor-standalone → editor → mindplot → web2d
```

**Package Status**:
- **@wisemapping/web2d**: ✅ Production-ready, zero dependencies
- **@wisemapping/mindplot**: ✅ Production-ready, depends on web2d
- **@wisemapping/editor**: ✅ Production-ready, depends on mindplot
- **@wisemapping/editor-standalone**: ✅ Production-ready, depends on editor
- **@wisemapping/fastmind**: 🎉 99% Complete, depends on editor-standalone

### Key Dependencies by Package

#### fastmind (VS Code Extension)
- **@types/vscode**: ^1.85.0 (VS Code API types)
- **@wisemapping/editor-standalone**: workspace:*
- **TypeScript**: ^5.9.3 (extension development)
- **Webpack**: ^5.102.1 (extension bundling)

#### editor-standalone (VS Code Integration)
- **@wisemapping/editor**: workspace:*
- **@wisemapping/mindplot**: workspace:*
- **@wisemapping/web2d**: workspace:*
- **React**: ^19.0.0 (peer dependency)
- **Material-UI**: ^7.3.4 (tree-shakeable)

#### editor (React Components)
- **@wisemapping/mindplot**: workspace:*
- **@wisemapping/web2d**: workspace:*
- **React**: ^19.0.0 (peer dependency)
- **Material-UI**: ^7.3.4 (tree-shakeable)
- **Emotion**: ^11.14.0+ (styling)

#### mindplot (Core Engine)
- **@wisemapping/web2d**: workspace:*
- **No external dependencies**: Pure ES6 implementation

#### web2d (SVG Foundation)
- **Zero dependencies**: Pure SVG abstraction

## Development Toolchain

### Package Management
- **Primary**: Yarn with workspaces
- **Monorepo Tool**: Lerna 9.0.0 (independent versioning mode)
- **Dependencies**: `workspace:*` protocol for internal packages
- **Scripts**: Consistent script naming across all packages
- **Prohibited**: npm commands (use yarn exclusively)

### Build System
- **Bundler**: Webpack ^5.102.1
- **Configuration**: 
  - `webpack.common.js` - Shared across all packages
  - `webpack.prod.js` - Production builds with optimization
  - `webpack.dev.js` - Development builds
  - `webpack.extension.js` - VS Code extension specific
- **TypeScript Loader**: ts-loader ^9.5.4 in transpile-only mode
- **Optimization Features**:
  - Persistent filesystem caching (`.webpack-cache` directory)
  - Thread-loader for parallel builds
  - Deterministic module IDs for long-term caching
  - Dead code elimination (`usedExports: true`)
  - Tree-shaking enforcement for Material-UI

### VS Code Extension Development
- **Extension Build**: `yarn build:extension` for production
- **Development Watch**: `yarn watch:extension` for development
- **Type Checking**: `yarn type-check` for extension validation
- **Package.json**: VS Code extension manifest configuration
- **Activation Events**: `onLanguage:fastmind`, `onCustomEditor:fastmind.viewer`
- **Custom Editor**: `fastmind.viewer` viewType for .fastmind files

### Code Quality & Formatting

#### ESLint Configuration
- **Version**: ^9.38.0 with flat config (`eslint.config.mjs`)
- **Plugins**:
  - `@eslint/js/recommended` - JavaScript recommended rules
  - `eslint-plugin-react` - React specific rules
  - `eslint-plugin-react-hooks` - React hooks rules
  - `@typescript-eslint/eslint-plugin` - TypeScript rules
  - `eslint-config-prettier` - Prettier integration
- **Critical Rule**: `@typescript-eslint/no-explicit-any` - ZERO tolerance for `any` types
- **Target**: ECMAScript 2022
- **Pre-push Hook**: Automatic rejection for violations

#### Prettier Configuration
- **Version**: ^3.6.2
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
- **Zero Tolerance**: No `any` types allowed

### Testing Framework

#### Jest Configuration (Unit Tests)
- **Version**: ^30.2.0
- **Environment**: jsdom for React component testing
- **Preset**: ts-jest for TypeScript support
- **Transform**:
  - JS/TS files: babel-jest
  - Asset files: jest-transform-stub
- **Module Extensions**: `js`, `ts`, `tsx`
- **Verbose**: true for detailed test output
- **Coverage**: Detect open handles enabled

#### Cypress Configuration (Integration & E2E)
- **Version**: ^15.5.0
- **VS Code Extension Testing**: Extension Development Host integration
- **Base URLs**: Configured per package
- **Features**:
  - Visual regression testing with `cypress-image-snapshot`
  - Screenshot and video capture on test failure
  - Extension-specific test scenarios
- **Dynamic Port Allocation**: Automatic conflict resolution

### Git Workflow & Hooks
- **Hooks Manager**: Husky ^9.1.7
- **Pre-commit**: lint-staged for automatic code formatting
- **Pre-push**: Full test suite and linting verification
  - Commands: `yarn lint && yarn test`
  - Must pass before push is allowed
- **Material-UI Validation**: Pre-push hook for import violations

## VS Code Extension Specific Technologies

### Extension Architecture
- **CustomTextEditorProvider**: Core extension class
- **WebviewPanel**: VS Code webview for editor integration
- **Document Management**: WorkspaceEdit for document changes
- **Communication**: postMessage API for bidirectional communication
- **Status Bar**: Real-time status notifications to users
- **Command Palette**: Extension commands integration

### Performance Optimizations
- **Debouncing**: Intelligent debouncing for save operations
- **Memory Management**: Efficient document state handling
- **Bundle Optimization**: Tree-shaking for minimal extension size
- **Caching**: Persistent caching for faster builds
- **Lazy Loading**: Dynamic imports for heavy features

### Error Handling & Reliability
- **Retry Mechanism**: 3-retry with exponential backoff
- **Graceful Degradation**: Comprehensive error recovery
- **User Feedback**: Clear error messages and status updates
- **Logging**: Comprehensive error logging for debugging
- **State Recovery**: Automatic state restoration after failures

## Development Constraints & Standards

### Package Management Commands
- **Install**: `yarn install` (npm commands prohibited)
- **Clean**: `yarn clean` - Remove all build artifacts
- **Build**: `yarn build` - Production builds across all packages
- **Extension Build**: `yarn build:extension` - VS Code extension specific
- **Test**: `yarn test` - Unit + integration tests
- **Lint**: `yarn lint` - ESLint checks only
- **Lint Fix**: `yarn lint:fix` - Auto-fix where possible

### Prohibited Patterns
- **DO NOT** use npm commands (use yarn exclusively)
- **DO NOT** commit build artifacts (`dist/`, `build/`, `coverage/`)
- **DO NOT** use Material-UI barrel imports (pre-push hook will reject)
- **DO NOT** disable TypeScript strict mode
- **DO NOT** skip pre-push hooks
- **DO NOT** use `any` type (zero tolerance)
- **DO NOT** use `@ts-ignore` without discussion

### Required Patterns
- **ALWAYS** run `yarn lint && yarn test` before pushing
- **ALWAYS** use `workspace:*` for internal dependencies
- **ALWAYS** enable source maps in development
- **ALWAYS** write tests for new features (unit + integration)
- **ALWAYS** use Prettier for code formatting
- **ALWAYS** maintain TypeScript strict mode compliance
- **ALWAYS** use tree-shakeable Material-UI imports
- **ALWAYS** handle nullable types with `| null` or `| undefined`

### Version Constraints
- **React**: ^19.0.0 (peer dependency)
- **MUI**: ^7.3.4 (both core and icons together)
- **Node.js**: >=18.0.0 (required runtime)
- **TypeScript**: ^5.9.3 (latest stable)
- **VS Code API**: ^1.85.0 (extension compatibility)

### Bundle Optimization Requirements
- **Material-UI**: Tree-shakeable imports only (500KB+ impact if violated)
- **Validation Script**: `./scripts/check-mui-imports.sh`
- **Webpack**: Enable persistent caching for rebuilds
- **Threading**: Use thread-loader for parallel builds
- **Analysis**: Use `ANALYZE=true` or `webpack-bundle-analyzer`

## Component Development Standards

### File Organization Pattern
```
ComponentName/
├── index.tsx              # Main component (REQUIRED)
├── SubComponent.tsx       # Named sub-components
├── helpers.ts             # Component-specific utilities
├── types.ts               # Component-specific types
└── styles.css             # Component-specific styles
```

### Import Conventions
```typescript
// ✅ CORRECT - Tree-shakeable imports
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

// ❌ WRONG - Pre-push hook rejects
import { Button, Box } from '@mui/material';
import { Search, Edit } from '@mui/icons-material';
import { PaletteMode } from '@mui/material';
```

## Performance Metrics & Benchmarks

### VS Code Extension Performance
- **Save Response Time**: <100ms (target achieved) ✅
- **Extension Startup**: <2 seconds (target: <3s) ✅
- **Memory Usage**: Stable under normal load ✅
- **Bundle Size**: Optimized for VS Code marketplace ✅
- **User Experience**: Responsive debouncing implemented ✅

### Development Performance
- **Build Times**: <45 seconds for full monorepo build
- **Hot Reload**: <3 seconds for most changes
- **Test Execution**: <8 minutes for full test suite
- **Lint Speed**: <30 seconds for full codebase
- **Bundle Analysis**: <10 seconds with ANALYZE=true

## Development Environment Setup

### Required Software
- **Node.js**: >=18.0.0
- **Yarn**: Latest stable version
- **VS Code**: Latest stable (for extension development)
- **Git**: Version control

### Development Workflow
```bash
# Initial setup
yarn install                    # Install all dependencies
yarn build                      # Build all packages

# Extension development
yarn watch:extension            # Start extension development
yarn build:extension            # Build extension for production
yarn type-check                 # Validate extension TypeScript

# Testing
yarn test                       # Run all tests
yarn lint                       # Run ESLint
yarn lint:fix                   # Auto-fix linting issues
```

### VS Code Extension Development
```bash
# Extension-specific commands
yarn package                    # Package extension for distribution
yarn test:extension             # Run extension tests
yarn run-in-vscode             # Launch extension in VS Code
```

## Reference Configuration Files

### Root Level
- `package.json` - Root monorepo configuration
- `lerna.json` - Lerna monorepo settings
- `webpack.common.js` - Shared Webpack configuration
- `eslint.config.mjs` - ESLint flat configuration
- `.prettierrc.json` - Prettier formatting configuration
- `.gitignore` - Git ignore patterns
- `.nvmrc` - Node.js version specification

### VS Code Extension
- `packages/fastmind/package.json` - Extension manifest and dependencies
- `packages/fastmind/webpack.extension.js` - Extension build configuration
- `packages/fastmind/tsconfig.json` - Extension TypeScript configuration

### Per Package
- `packages/*/package.json` - Package-specific dependencies
- `packages/*/tsconfig.json` - TypeScript configuration
- `packages/*/jest.config.js` - Jest testing configuration
- `packages/*/cypress.config.*` - Cypress testing configuration

## Common Issues & Solutions

### Material-UI Import Violations
- **Issue**: Pre-push hook rejects barrel imports
- **Solution**: Use individual imports per component
- **Validation**: Run `./scripts/check-mui-imports.sh`

### TypeScript Strict Mode Issues
- **Issue**: Strict mode type errors
- **Solution**: Proper type annotations, null handling
- **Rule**: No `any` types allowed

### Extension Development Issues
- **Issue**: VS Code API compatibility
- **Solution**: Check @types/vscode version compatibility
- **Testing**: Use Extension Development Host

### Performance Issues
- **Issue**: Bundle size too large
- **Solution**: Check Material-UI imports, enable tree-shaking
- **Analysis**: Use `ANALYZE=true yarn build`

---

*This tech context reflects the current VS Code extension-focused development environment as of Q4 2024. Update when making significant toolchain changes or adding new development dependencies.*
