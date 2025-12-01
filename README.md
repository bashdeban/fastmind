# FastMind - AI-Powered Mind Mapping Editor

**An AI-driven mind mapping editor built for developers, providing intelligent topic generation and seamless VS Code integration.**

## Project Overview

FastMind is an AI-powered mind mapping extension that branched from WiseMapping Frontend in November 2025. While maintaining the robust foundation of WiseMapping's mind mapping engine, FastMind focuses on AI-driven features and deep VS Code integration for developers.

### Project Heritage

- **Origin**: Branch from WiseMapping Frontend (est. 2010)
- **Evolution**: Enhanced with AI capabilities and VS Code integration
- **Focus**: Developer-centric workflow with intelligent topic generation
- **Status**: Production-ready with complete AI integration and internationalization

### Core Modules

- **@wisemapping/web2d**: A lightweight SVG abstraction layer for elegant and efficient chart rendering
- **@wisemapping/mindplot**: Pure vanilla ES6 canvas engine for rendering mind maps and editing functionalities
- **@wisemapping/editor**: React component wrapper with AI integration providing modern UI components and state management
- **@wisemapping/editor-standalone**: Standalone build optimized for VS Code webview integration
- **@wisemapping/fastmind**: VS Code extension with AI-powered topic generation and intelligent mind mapping

For backend implementation details, visit: [WiseMapping Backend](https://github.com/wisemapping/wisemapping-open-source)

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >=18.0.0 (check package.json engines)
- **Yarn**: Modern version (`npm i -g yarn`)
- **Git**: For version control

### Setup

```bash
# Use correct Node.js version
nvm use

# Install all dependencies
yarn install

# Required environment variable
export NODE_OPTIONS=--openssl-legacy-provider
```

## 📦 Package Structure

This is a **Lerna monorepo** with five main packages. Each package can be developed and tested independently:

```
wisemapping/
├── packages/
│   ├── web2d/               # SVG rendering abstraction layer (foundation)
│   ├── mindplot/            # Core mind map canvas engine with AI integration
│   ├── editor/              # React component wrapper with AI features
│   ├── editor-standalone/   # Standalone build for VS Code integration
│   └── fastmind/            # VS Code Extension (primary focus)
├── memory-bank/             # Project documentation
├── scripts/                 # Build and utility scripts
└── .clinerules/             # Development guidelines
```

## 🛠️ Available Scripts

### Available from root directory (runs across all packages):

| Script | Description |
|--------|-------------|
| `yarn build` | Production builds for all packages |
| `yarn test` | Run all unit and integration tests |
| `yarn test:unit` | Run unit tests only |
| `yarn test:integration` | Run Cypress integration tests |
| `yarn lint` | Run ESLint checks |
| `yarn lint:fix` | Auto-fix ESLint issues |
| `yarn clean` | Remove all build artifacts and caches |
| `yarn build:fastmind` | Build FastMind extension dependencies |
| `yarn package:fastmind` | Package FastMind as VSIX file |
| `yarn build-and-package:fastmind` | Build and package FastMind extension |

### Package-specific scripts:

```bash
# Development servers (run from individual package directories)
yarn playground              # Start development server with examples
yarn storybook              # Start Storybook for component development

# Testing (run from individual package directories)
yarn test:unit              # Unit tests for specific package
yarn cy:open               # Open Cypress test runner
yarn cy:run                # Run Cypress tests headlessly

# Quality checks (run from individual package directories)
yarn lint                   # Lint specific package
yarn lint:fix              # Auto-fix linting issues in package
```

## 🧪 Testing & Quality Assurance

### Test Infrastructure

The project maintains **high quality standards** with comprehensive testing:

- **Unit Tests**: Jest with TypeScript support (`yarn test:unit`)
- **Integration Tests**: Cypress with visual regression testing
- **Visual Testing**: Automated screenshot comparisons to prevent UI regressions
- **Bundle Analysis**: Monitor bundle sizes with `ANALYZE=true`

### Running Tests

```bash
# Run all tests
yarn test

# Unit tests only
yarn test:unit

# Integration tests (will automatically handle port conflicts)
yarn test:integration
```

**Note**: Integration tests use **dynamic port allocation** to prevent conflicts. The test infrastructure automatically:
- Detects and resolves port conflicts
- Finds available ports if needed
- Configures dev servers and Cypress accordingly

### Visual Regression Testing

We use [cypress-image-snapshot](https://www.npmjs.com/package/cypress-image-snapshot) for snapshot testing. This is a cost-effective way to identify behavior changes based on page screenshots.

**Key workflows:**

1. **Run snapshot tests locally:**
```bash
# Standard test run
yarn test:integration

# Update snapshots if changes are intentional
yarn cy:run --env updateSnapshots=true
```

2. **Run snapshot tests in Docker** (for consistent rendering):
```bash
# Run tests
yarn test:integration

# If snapshots need updating and changes are intentional:
docker-compose -f docker-compose.snapshots.update.yml up
```

**Important**: If you need to update snapshots, review the changes in the `__diff_output__` folders first to ensure changes are intentional, then commit the updated snapshots.

## 🎨 Development Guidelines

### Code Quality Standards

This project enforces **strict code quality standards**:

1. **TypeScript**: Strict mode with zero `any` types allowed
2. **Material-UI**: Tree-shakeable imports only (500KB+ impact if violated)
3. **ESLint**: Zero tolerance for linting errors
4. **Testing**: Comprehensive tests required for new features
5. **File Organization**: Component directory pattern enforced

See **`.clinerules/.project-consistency-keeper2.md`** for comprehensive development guidelines and technical documentation.

### Quick Reference

**✅ Correct Material-UI imports:**
```typescript
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
```

**❌ Incorrect Material-UI imports:**
```typescript
import { Button, Box } from '@mui/material';  // Pre-push hook will reject
import { Search } from '@mui/icons-material'; // Pre-push hook will reject
```

## 📚 Documentation

### Project Documentation

Comprehensive documentation is maintained in the `memory-bank/` directory:

- **[projectbrief.md](./memory-bank/projectbrief.md)** - Project overview and requirements
- **[systemPatterns.md](./memory-bank/systemPatterns.md)** - Architectural patterns and design decisions
- **[techContext.md](./memory-bank/techContext.md)** - Technology stack and development setup
- **[progress.md](./memory-bank/progress.md)** - Implementation status and roadmap
- **[activeContext.md](./memory-bank/activeContext.md)** - Current development focus

### Package-Specific Documentation

Each package contains detailed documentation:

```bash
cd packages/web2d && cat README.md
cd packages/mindplot && cat README.md
cd packages/editor && cat README.md
```

## 🌍 Internationalization (i18n)

### Supported Languages

FastMind supports 10 languages with full UI translation:

- **English** (en)
- **简体中文** (zh-CN) 
- **繁體中文** (zh-Hant)
- **日本語** (ja)
- **Français** (fr)
- **Deutsch** (de)
- **Español** (es)
- **Italiano** (it)
- **Português** (pt)
- **Русский** (ru)

### Building with Internationalization

```bash
# Compile translation files
yarn workspace @wisemapping/editor compile:i18n

# Extract new translatable strings
yarn workspace @wisemapping/editor extract:i18n

# Complete build with all languages
yarn build

# FastMind extension with language support
yarn build:fastmind
```

### Language Configuration

FastMind automatically detects VS Code's language settings. You can also manually configure:

```json
{
  "fastmind.language.locale": "zh-CN"
}
```

### Contributing Translations

Translation files are located in `packages/editor/lang/`:

- `en.json` - English (reference)
- `zh-CN.json` - Simplified Chinese
- `zh-Hant.json` - Traditional Chinese
- `ja.json` - Japanese
- `fr.json` - French
- `de.json` - German
- `es.json` - Spanish
- `it.json` - Italian
- `pt.json` - Portuguese
- `ru.json` - Russian

## 🔧 FastMind VS Code Extension Development

### Debug Mode Development

For development and debugging of the FastMind extension:

```bash
# Navigate to extension directory
cd packages/fastmind

# Start development watch mode
yarn dev

# Or build and watch
yarn build:watch
```

#### Debugging in VS Code

1. **Open the project in VS Code**
2. **Press F5** or go to **Run → Start Debugging**
3. **Extension Development Host** will open with FastMind loaded
4. **Set breakpoints** in `src/extension.ts` and other TypeScript files
5. **Open a .fastmind file** to trigger the custom editor

#### Debug Configuration

Create `.vscode/launch.json` for advanced debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}/packages/fastmind"
      ]
    }
  ]
}
```

### VSIX Package Building

#### Standard Build and Package

```bash
# Build extension dependencies and package
yarn build-and-package:fastmind

# Output: packages/fastmind/fastmind.vsix
```

#### Step-by-Step Build

```bash
# Step 1: Build dependencies
yarn build:fastmind

# Step 2: Package extension
cd packages/fastmind
yarn package

# Step 3: Install for testing
code --install-extension fastmind.vsix
```

#### Package Options

```bash
# Package with preview label
yarn package:preview

# Package with specific output name
vsce package --out fastmind-0.1.3.vsix

# Package for marketplace (requires auth)
yarn publish
```

#### Package Contents

The generated VSIX includes:
- **Extension manifest** (package.json)
- **Compiled extension code** (dist/extension.js)
- **Standalone editor build** (editor-standalone)
- **All language files** (10 languages)
- **Icons and assets** (fastmind.png, etc.)

#### Installation

```bash
# Install from VSIX file
code --install-extension fastmind.vsix

# Or use VS Code UI: Extensions → Install from VSIX...
```

### Extension Testing

```bash
# Run extension tests
cd packages/fastmind
yarn test

# Type checking
yarn type-check

# Linting
yarn lint
```

## 👥 Contributing

We welcome contributions! Please see **[CONTRIBUTING.md](./CONTRIBUTING.md)** for detailed guidelines.

## 📄 License

This project is **open source** under the **WiseMapping Public License, Version 1.0** (Apache 2.0 based).

[View Full License](https://github.com/wisemapping/wisemapping-open-source/blob/develop/LICENSE.md)

## �‍💻 Team

### Founder
- **Paulo Veiga** <pveiga@wisemapping.com>

### Contributors
- **Ezequiel Bergamaschi** <ezequielbergamaschi@gmail.com>

## 🙏 Acknowledgments

This project began in 2010 and has been continuously improved by the open-source community. Special thanks to all contributors who have helped maintain and enhance WiseMapping over the years.

---

**Project Status**: 🚀 Production Ready | **Version**: 0.1.3 | **Last Updated**: November 2025
