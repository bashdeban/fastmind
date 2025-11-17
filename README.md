# WiseMapping Frontend

**An open-source, web-based mind mapping tool providing real-time collaborative visualization for individuals and teams.**

## Project Overview

WiseMapping Frontend is a comprehensive mind mapping platform that began in 2010 and underwent significant architectural revitalization in 2021. This repository contains all user interface-related elements for the WiseMapping ecosystem.

### Core Modules

- **@wisemapping/web2d**: A lightweight SVG abstraction layer for elegant and efficient chart rendering
- **@wisemapping/mindplot**: Pure vanilla ES6 canvas engine for rendering mind maps and editing functionalities
- **@wisemapping/editor**: React component wrapper providing modern UI components and state management
- **@wisemapping/webapp**: Complete React application serving as the cornerstone of the mind map editing experience

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

This is a **Lerna monorepo** with three main packages. Each package can be developed and tested independently:

```
wisemapping/
├── packages/
│   ├── web2d/           # SVG rendering abstraction layer
│   ├── mindplot/        # Core mind map canvas engine
│   └── editor/          # React component wrapper
├── memory-bank/         # Project documentation
└── .clinerules/         # Development guidelines
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

## 👥 Contributing

We welcome contributions! Please see **[CONTRIBUTING.md](./CONTRIBUTING.md)** for detailed guidelines.

## 📄 License

This project is **open source** under the **WiseMapping Public License, Version 1.0** (Apache 2.0 based).

[View Full License](https://github.com/wisemapping/wisemapping-open-source/blob/develop/LICENSE.md)

## 👨‍💻 Team

### Founder
- **Paulo Veiga** <pveiga@wisemapping.com>

### Contributors
- **Ezequiel Bergamaschi** <ezequielbergamaschi@gmail.com>

## 🙏 Acknowledgments

This project began in 2010 and has been continuously improved by the open-source community. Special thanks to all contributors who have helped maintain and enhance WiseMapping over the years.

---

**Project Status**: 🟢 Active Development | **Version**: 6.0.1 | **Last Updated**: January 2025
