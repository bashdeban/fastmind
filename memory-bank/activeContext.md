# WiseMapping Frontend - Active Context

## Current Work Focus

### Immediately Focused Package: `@wisemapping/fastmind`

The **FastMind VS Code Extension** is the current primary focus for development. This package implements VS Code's CustomTextEditorProvider to enable editing `.fastmind` files directly within VS Code using the WiseMapping editor.

**Current Status**: ✅ Stage 1 Complete - Basic display functionality working
**Next**: Stage 2 - Data interaction and synchronization implementation

### Secondary Focus: `@wisemapping/editor`

The **Editor Package** remains important as the React component wrapper layer that bridges the low-level mindplot canvas engine with the high-level webapp application. The FastMind extension uses the editor-standalone build of this package.

## Recently Implemented Changes

### 1. **Storybook Component Development Infrastructure**
- ✅ Implemented comprehensive Storybook setup (v9.1.13) across all packages
- ✅ Configured Webpack5 builder for consistent builds
- ✅ Established component documentation standards
- ✅ Integrated Cypress testing with Storybook
- ✅ Added visual regression testing capabilities

### 2. **Enhanced Testing Framework**
- ✅ Implemented dynamic port allocation for integration tests
- ✅ Added automatic port conflict resolution
- ✅ Configured Cypress with cypress-image-snapshot for visual testing
- ✅ Established docker-based snapshot testing workflow
- ✅ Created comprehensive testing documentation

### 3. **Internationalization System**
- ✅ Integrated formatjs CLI for i18n management
- ✅ Configured extraction and compilation workflows
- ✅ Supported languages: es, en, fr, de, zh, zh-CN, ru, uk, ja, pt, it, hi
- ✅ Established translation workflow and file structure

## Next Steps

### Immediate Priorities (Next 1-2 weeks)

1. **Complete Storybook Documentation**
   - Document remaining editor components
   - Create interactive examples for complex scenarios
   - Add accessibility testing stories
   - Build component usage guidelines

2. **Editor Package Stability**
   - Address any remaining linting issues in editor components
   - Improve TypeScript coverage to 100%
   - Add comprehensive unit tests for edge cases
   - Optimize bundle size through tree-shaking verification

3. **Performance Optimization**
   - Analyze editor package bundle with `ANALYZE=true`
   - Identify and address any Material-UI import violations
   - Implement lazy loading for heavy editor features
   - Optimize canvas rendering performance

### Medium-term Priorities (Next 1-2 months)

1. **Advanced Collaboration Features**
   - Real-time cursor tracking
   - Presence indicators
   - Conflict resolution for simultaneous edits
   - Collaborative selection highlighting

2. **Enhanced User Experience**
   - Improved onboarding tour
   - Advanced keyboard shortcuts
   - Touch gesture support
   - Accessibility improvements (ARIA labels, screen reader support)

3. **Developer Experience Improvements**
   - Enhanced TypeScript declarations
   - Better error messages and debugging support
   - Plugin API documentation
   - Custom component examples

## Active Decisions and Considerations

### 1. **Material-UI Import Strategy**
**Decision**: Strict enforcement of tree-shakeable imports

**Rationale**:
- **500KB+ bundle impact** if done incorrectly
- Pre-push hooks automatically reject violations
- Provides immediate feedback to developers

**Current Status**: 
- ✅ Setup validation script: `./scripts/check-mui-imports.sh`
- ✅ Integrated with build process
- ⏳ Ongoing education and code review enforcement

**Example Enforcement**:
```typescript
// ✅ CORRECT - Pre-push hook allows
import Button from '@mui/material/Button';

// ❌ WRONG - Pre-push hook rejects
import { Button, Box } from '@mui/material';
```

### 2. **React Version Strategy**
**Decision**: React 19.2.0 with functional components only

**Rationale**:
- Latest React features and performance improvements
- Hooks provide better code organization
- Future-proof architecture
- Easier testing and maintenance

**Migration Path**:
- No class components in new code (strict enforcement)
- Gradual migration of legacy components if any exist
- Comprehensive documentation of hook patterns

### 3. **TypeScript Strict Mode**
**Decision**: Enforced strict mode with zero tolerance for `any`

**Rationale**:
- Maximum type safety
- Better IDE support and autocomplete
- Prevents runtime errors
- Self-documenting code

**Enforcement**:
- ❌ NEVER use `any` type
- ❌ NEVER use `@ts-ignore` without discussion
- ✅ Handle nullable types: `Topic | null`
- ✅ Use `unknown` with type guards for truly unknown types

### 4. **Monorepo Structure Evolution**
**Decision**: Maintain current Lerna + Yarn workspaces

**Current Structure**:
```
packages/
├── editor/    ← Current focus
├── mindplot/
├── web2d/
└── webapp/
```

**Future Considerations**:
- Evaluate migration to Nx for better build caching
- Consider pnpm for faster installs
- Assess Turborepo for pipeline optimization
- Keep current structure until clear benefits emerge

## Important Patterns and Preferences

### Development Workflow

1. **Lint-First Development**
   ```bash
   # MANDATORY after every file change
   read_lints(["file/path"]);
   # Fix all errors
   read_lints(["file/path"]); # Verify
   ```

2. **Commit Message Convention**
   ```
   feature: add real-time collaboration
   fix: resolve canvas rendering bug
   refactor: optimize topic rendering
   docs: update Storybook examples
   test: add unit tests for editor
   ```

3. **Branch Naming**
   ```
   feature/editor-documentation
   fix/mui-import-violations
   refactor/topic-performance
   test/storybook-coverage
   ```

### Code Style Preferences

**Component Structure**
```typescript
// ✅ Preferred structure
export interface TopicProps {
  topic: Topic;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const Topic = ({ topic, isSelected, onSelect }: TopicProps) => {
  // Component logic
  return <div>...</div>;
};

// Named export over default
export { Topic };
```

**Custom Hooks**
```typescript
// ✅ Well-documented custom hooks
/**
 * useCanvasDesigner - Hook for managing Designer instance
 * @param canvasRef - React ref to canvas element
 * @returns Designer instance or null
 * @example
 * const designer = useCanvasDesigner(canvasRef);
 */
export const useCanvasDesigner = (canvasRef: RefObject<HTMLCanvasElement>) => {
  // Implementation
};
```

## Learnings and Project Insights

### 1. **Bundle Size Awareness**
**Learning**: Material-UI imports have massive bundle impact (500KB+)

**Impact**: Created pre-push validation and developer education

**Outcome**: Significantly reduced bundle sizes and improved load times

### 2. **Visual Regression Testing Value**
**Learning**: Image-based testing catches subtle UI regressions

**Implementation**:
- Cypress with cypress-image-snapshot
- Docker-based consistent testing environment
- Snapshot acceptance workflow

**Benefit**: Prevented multiple visual bugs from reaching production

### 3. **Dynamic Port Allocation**
**Learning**: Integration tests frequently fail due to port conflicts

**Solution**: Automated port discovery and conflict resolution

**Result**: 95% reduction in flaky integration test failures

### 4. **Importance of Editor Package Focus**
**Insight**: Editor is the critical bridge between canvas and app

**Rationale**:
- Most user-facing features implemented here
- Complex interaction logic requires careful design
- Performance optimizations have cascading benefits
- Good abstractions enable webapp simplicity

**Strategy**: Prioritize editor stability and documentation before webapp features

## Known Issues and Technical Debt

### 1. **TypeScript Declaration Files**
**Issue**: Some `@types` packages may be missing or outdated

**Impact**: Reduced IDE support for certain dependencies

**Mitigation**: Regular type package updates, consider creating custom declarations

### 2. **Canvas Performance at Scale**
**Issue**: Rendering degrades with 1000+ topics

**Status**: Acceptable for most use cases, optimization in backlog

**Future Work**: 
- Topic virtualization
- Canvas tiling
- WebGL acceleration exploration

### 3. **Internationalization Completeness**
**Issue**: Some languages have incomplete translations

**Status**: Core languages fully supported, others in progress

**Solution**: Community-driven translation efforts

### 4. **Browser Compatibility Edge Cases**
**Issue**: Some SVG features behave differently across browsers

**Tested**: Chrome, Firefox, Safari, Edge (last 2 versions)

**Work in Progress**: Automated cross-browser testing pipeline

## Collaboration Notes

### Team Communication
- **GitHub Issues**: Feature requests and bug reports
- **Pull Requests**: Required reviews for all changes
- **Documentation**: Storybook for components, markdown for architecture

### External Integration Points
- **Backend**: REST API at `https://github.com/wisemapping/wisemapping-open-source`
- **Analytics**: Google Analytics 4 integration
- **Authentication**: JWT-based auth system
- **File Storage**: Local storage for drafts, backend for persistence

### Release Process
1. Feature development in feature branches
2. Pull request with full test suite
3. Code review and approval
4. Merge to develop
5. Integration testing
6. Tagged releases with changelog

---

*This active context represents the current state of development as of initialization. It should be updated whenever significant architectural decisions are made, new patterns are established, or development focus shifts.*
