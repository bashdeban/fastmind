# WiseMapping Frontend - Technical Context

## Technologies Used

### Core Languages & Runtimes
- **TypeScript**: 5.9.3 (primary language, strict mode enforced)
- **JavaScript**: ES2020+ for compatibility and tooling
- **Node.js**: >=18.0.0 (required engine version)

### Frontend Framework & Libraries
- **React**: 19.2.0 with React DOM
  - Functional components with hooks only (no class components)
  - Strict TypeScript typing required for all components
- **Material UI (MUI)**: 7.3.4
  - **@mui/material**: Core components with tree-shakeable imports
  - **@mui/icons-material**: Icon library
  - **@mui/lab**: Lab components (used in webapp)
- **Emotion**: 11.14.x (@emotion/react, @emotion/styled)
- **styled-components**: 6.1.19 (alternative styling solution)

### Package-Specific Dependencies

#### @wisemapping/editor
- **emoji-picker-react**: ^4.14.2 - Emoji selection component
- **react-color**: ^2.19.3 - Color picker components
- **react-intl**: ^7.1.14 - Internationalization support
- **react-loader-spinner**: ^7.0.3 - Loading indicators

#### @wisemapping/webapp
- **axios**: ^1.12.2 - HTTP client for API requests
- **dayjs**: ^1.11.18 - Date utility library
- **react-ga4**: ^2.1.0 - Google Analytics 4 integration
- **react-google-recaptcha**: ^3.1.0 - CAPTCHA integration
- **react-helmet-async**: ^2.0.5 - Document head management
- **react-query**: ^3.39.3 - Data fetching and state management
- **react-router-dom**: ^7.9.4 - Client-side routing
- **universal-cookie**: ^8.0.1 - Cookie management

#### @wisemapping/mindplot (Canvas Library)
- **@wisemapping/web2d**: workspace:* - Internal 2D rendering dependency
- **fflate**: file:vendor/fflate - File compression utilities
- **html2canvas**: ^1.4.1 - DOM to canvas conversion
- **jspdf**: ^3.0.3 - PDF generation from mind maps
- **lodash**: ^4.17.21 - Utility functions
- **xml-formatter**: ^3.6.7 - XML formatting for import/export

#### @wisemapping/web2d (2D Rendering)
- Base rendering library for mindplot
- Minimal external dependencies
- SVG abstraction layer

## Development Setup

### Prerequisites
- Node.js >=18.0.0
- Yarn package manager
- Git for version control

### Initial Setup
```bash
nvm use  # Use correct Node.js version
yarn install  # Install dependencies
export NODE_OPTIONS=--openssl-legacy-provider  # Required environment variable
```

### Monorepo Management
- **Lerna**: 9.0.0 with independent versioning
- **Yarn**: Modern workspaces enabled
- **Workspace Structure**: `packages/*` (editor, mindplot, web2d, webapp)

### Build Tools
- **Webpack**: 5.102.1 (primary bundler)
  - Common config: `webpack.common.js` (shared across packages)
  - Dev config: `webpack.dev.js` (development builds)
  - Prod config: `webpack.prod.js` (production builds with optimization)
  - Bundle analyzer: `ANALYZE=true` for bundle size analysis
- **TypeScriptLoader**: ts-loader ^9.5.4 for TypeScript compilation
- **Babel**: @babel/core ^7.28.5 with TypeScript and preset-env presets

### Development Servers
- **webpack-dev-server**: ^5.2.2 (primary dev server)
- **Vite**: ^7.1.12 (used in some packages for faster builds)
- **Storybook Dev Server**: Port-based (6006-6008 depending on package)

### Code Quality & Formatting
- **ESLint**: ^9.38.0 with Flat Config (eslint.config.mjs)
  - TypeScript ESLint plugin for type checking
  - React hooks plugin for hook rules
  - AirBnB base config for style consistency
  - Prettier integration for automatic formatting
- **Prettier**: ^3.6.2 (configuration in prettierrc.json)
- **Husky**: ^9.1.7 (Git hooks)
  - Pre-commit: lint-staged for automatic linting and formatting
  - Pre-push: Full lint suite and test execution
- **lint-staged**: ^16.2.6 - Linting for staged files only

### Testing Framework
- **Jest**: ^30.2.0 (unit testing)
  - ts-jest for TypeScript support
  - jsdom environment for React component testing
  - Detect open handles enabled for leak detection
- **Cypress**: ^15.5.0 (integration/E2E testing)
  - cypress-image-snapshot for visual regression testing
  - Electron browser for consistent test environment
  - start-server-and-test for CI integration

### Component Development & Documentation
- **Storybook**: 9.1.13 for isolated component development
  - Builder: Webpack5 (most packages)
  - Builder: Vite (webapp package for faster builds)
  - Testing integration with Cypress for snapshot testing
- **MDX**: @mdx-js/react ^3.1.1 for documentation with React components

### Internationalization
- **formatjs**: @formatjs/cli ^6.7.4 for i18n
  - Extract: `formatjs extract` to extract messages
  - Compile: `formatjs compile --ast` to compile translation files
  - Supported languages: es, en, fr, de, zh, zh-CN, ru, uk, ja, pt, it, hi

## Technical Constraints

### Critical Codewide Rules

#### 1. Copyright Headers (MANDATORY)
All `.ts`, `.tsx`, `.js`, `.jsx` files MUST start with:
```typescript
/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
```

#### 2. Material-UI Imports (CRITICAL - 500KB+ Bundle Impact)
Violations will cause pre-push hook rejection.

**CORRECT (Tree-shakeable):**
```typescript
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme, styled } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
```

**WRONG (Bloats bundle):**
```typescript
import { Button, Box } from '@mui/material';
import { Search, Edit } from '@mui/icons-material';
import { PaletteMode } from '@mui/material';
```

#### 3. TypeScript Type Safety (CRITICAL)
- **NEVER use `any` type** - Always use specific types
- **NEVER use `@ts-ignore` or `@ts-expect-error`** without discussion
- **NEVER leave implicit `any`** from function parameters or variables
- Handle nullable types correctly: `Topic | null` or `Topic | undefined`
- Use `unknown` for truly unknown types with proper type guards

#### 4. Component File Organization (MANDATORY)
Every component MUST use the index.tsx pattern:
```
ComponentName/
├── index.tsx              # Main component export
├── SubComponent.tsx       # Named sub-components
├── helpers.ts             # Component utilities
├── types.ts               # TypeScript types
└── styles.css             # CSS styles (if needed)
```

#### 5. Linting Workflow (MANDATORY)
After every file creation/modification:
1. Write/modify TypeScript file
2. **IMMEDIATELY** run `read_lints(["file/path"])`
3. Fix ALL errors found
4. Re-run `read_lints` to verify
5. Only then move to next file

## Package Dependencies Structure

The packages follow a strict dependency hierarchy:

```
webapp → editor → mindplot → web2d
```

**
- **@wisemapping/web2d**: Foundation 2D rendering library (minimal dependencies)
- **@wisemapping/mindplot**: Core mind mapping canvas engine (depends on web2d)
- **@wisemapping/editor**: React wrapper components (depends on mindplot)
- **@wisemapping/webapp**: Full web application (depends on editor)

## Git Workflow
- **Branch Naming**: `feature/name`, `fix/name`
- **Main Branch**: `develop` (default)
- **No Force Push**: Enforced to main branch
- **Pull Request Process**: `yarn build`, `yarn lint`, `yarn test` must pass

## Testing Requirements
- **Unit Tests**: `*.test.ts`, `*.test.tsx` with Jest
- **Integration Tests**: Cypress with visual regression testing
- **Coverage Goal**: High coverage on critical paths
- **Snapshot Testing**: Image-based regression detection for UI changes
