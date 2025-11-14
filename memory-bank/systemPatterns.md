# WiseMapping Frontend - System Patterns

## Architecture Overview

### Monorepo Structure

The project uses a Yarn/Lerna monorepo with four interconnected packages:

```
wisemapping-front-end/
├── packages/
│   ├── editor/          # React component library wrapper
│   ├── mindplot/        # Core mind mapping canvas engine  
│   ├── web2d/           # 2D rendering foundation (SVG abstraction)
│   └── webapp/          # Complete web application
├── memory-bank/         # Project documentation
└── scripts/             # Build and utility scripts
```

### Dependency Hierarchy

The packages follow a strict dependency hierarchy:

```
webapp → editor → mindplot → web2d
```

**Dependency Flow**:
- **@wisemapping/web2d**: Foundation 2D rendering (zero external dependencies)
- **@wisemapping/mindplot**: Canvas engine consuming web2d APIs
- **@wisemapping/editor**: React components wrapping mindplot functionality
- **@wisemapping/webapp**: Full application consuming editor components

## Core Design Patterns

### 1. **Layered Architecture**

The system implements clear separation of concerns across layers:

**Presentation Layer** (webapp, editor)
- React components with hooks
- Material-UI for UI components
- Form handling and validation
- Internationalization support

**Business Logic Layer** (mindplot)
- Pure ES6 classes for mind map logic
- Canvas rendering and manipulation
- Event handling and user interactions
- Data transformation and validation

**Infrastructure Layer** (web2d)
- SVG abstraction and rendering
- Low-level DOM manipulation
- Performance optimization primitives
- Browser API wrappers

### 2. **Component Architecture (Strict Index Pattern)**

**Mandatory Structure**:
```
ComponentName/
├── index.tsx              # Main export (REQUIRED)
├── SubComponent.tsx       # Named sub-components
├── helpers.ts             # Pure utility functions
├── types.ts               # Component-specific types
└── styles.css             # Scoped styles (optional)
```

**Import Convention**:
```typescript
// ✅ CORRECT - Clean import paths
import ThemeToggle from '../common/theme-toggle';
import MapsPage from '../admin-console/maps-page';

// ❌ WRONG - Redundant paths
import ThemeToggle from '../common/theme-toggle/ThemeToggle';
```

### 3. **Functional React with Hooks**

**Principles**:
- No class components (strict enforcement)
- Custom hooks for reusable logic
- Memoization with `React.memo`, `useMemo`, `useCallback`
- Strict TypeScript typing for all hooks

**Example Pattern**:
```typescript
// Custom hook for mind map state
export const useMindMap = (mapId: string) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const designer = useRef<Designer | null>(null);
  
  // ... hook implementation
  
  return { topics, designer, addTopic, removeTopic };
};
```

### 4. **Material-UI Tree-Shaking Pattern**

**Critical for Bundle Size** (500KB+ impact):

**✅ CORRECT**:
```typescript
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
```

**❌ WRONG**:
```typescript
import { Button, Box } from '@mui/material';
import { Search } from '@mui/icons-material';
import { PaletteMode } from '@mui/material';
```

**Validation**: Run `./scripts/check-mui-imports.sh` or `yarn build:analyze`

### 5. **Type-Safe Canvas Engine (mindplot)**

**Pure ES6 Class Pattern**:
```typescript
class Designer {
  private canvas: HTMLCanvasElement;
  private topics: Map<string, Topic>;  
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.topics = new Map();
  }
  
  addTopic(config: TopicConfig): Topic {
    // ... implementation
  }
}
```

**No External Dependencies**: Mindplot deliberately minimizes dependencies for maximum portability.

### 6. **SVG Abstraction Layer (web2d)**

**Facade Pattern**: web2d provides a simplified API over complex SVG operations:

```typescript
// web2d abstracts SVG complexity
const circle = new Circle({
  x: 100,
  y: 100,
  radius: 50,
  fill: '#ff0000'
});

// Renders as efficient SVG
```

**Performance Optimization**:
- Direct DOM manipulation where critical
- Batch updates to minimize reflows
- Efficient event delegation

### 7. **Event-Driven Communication**

**Publisher/Subscriber Pattern**:
```typescript
// Event bus for cross-component communication
interface MindMapEvent {
  type: 'topic:added' | 'topic:removed' | 'connection:created';
  payload: any;
}

class EventBus {
  private listeners = new Map<string, Function[]>();
  
  emit(event: MindMapEvent) {
    // ... emit to subscribers
  }
  
  on(type: string, callback: Function) {
    // ... subscribe to events
  }
}
```

### 8. **Repository Pattern for Data**

**Mind Map Data Access**:
```typescript
interface MindMapRepository {
  findById(id: string): Promise<MindMap | null>;
  save(map: MindMap): Promise<void>;
  delete(id: string): Promise<void>;
  findByUser(userId: string): Promise<MindMap[]>;
}

// Implementation handles API calls, caching, etc.
class ApiMindMapRepository implements MindMapRepository {
  // ... implementation
}
```

## State Management Patterns

### 1. **Local State (useState/useReducer)**

For component-specific state:
```typescript
const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
const [isEditing, setIsEditing] = useState(false);
```

### 2. **Context API for Theme/Config**

For global but stable data:
```typescript
const ThemeContext = createContext<ThemeConfig>(defaultTheme);

// Usage in component
const theme = useContext(ThemeContext);
```

### 3. **React Query for Server State**

For server data, caching, and synchronization:
```typescript
const { data: mindMaps, isLoading } = useQuery(
  ['mindmaps', userId],
  () => fetchMindMaps(userId)
);
```

### 4. **Custom Hooks for Complex Logic**

Encapsulating mind map logic:
```typescript
function useCanvasDesigner(canvasRef: RefObject<HTMLCanvasElement>) {
  const [designer, setDesigner] = useState<Designer | null>(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      setDesigner(new Designer(canvasRef.current));
    }
  }, [canvasRef]);
  
  return designer;
}
```

## Component Communication

### 1. **Props Drilling (for direct parent-child)**
```typescript
// Parent component
<EditorCanvas selectedTool={selectedTool} onTopicSelect={handleTopicSelect} />
```

### 2. **Callback Props (for child-parent communication)**
```typescript
// Child component calls parent's callback
<Toolbar onToolSelect={handleToolSelect} />
```

### 3. **Context for Deep Component Trees**
```typescript
// For deeply nested components that need shared state
const MindMapContext = createContext<MindMapContextType>(...);
```

### 4. **Event Bus for Cross-Component**
```typescript
// When components aren't in same tree
eventBus.emit('topic:selected', { topicId });
```

## Performance Patterns

### 1. **Memoization Strategy**
```typescript
// Wrap components
const TopicComponent = React.memo(Topic, (prev, next) => {
  return prev.topic.id === next.topic.id && 
         prev.isSelected === next.isSelected;
});

// Memoize expensive calculations
const topicPath = useMemo(() => calculatePath(topic), [topic]);
```

### 2. **Virtualization for Large Mind Maps**
```typescript
// Only render visible topics
const visibleTopics = useMemo(() => {
  return allTopics.filter(topic => isInViewport(topic, viewport));
}, [allTopics, viewport]);
```

### 3. **Bundle Code Splitting**
```typescript
// Dynamic imports for heavy features
const PDFExport = lazy(() => import('./pdf-export'));

// Usage
<Suspense fallback={<LoadingSpinner />}>
  <PDFExport mindMap={mindMap} />
</Suspense>
```

### 4. **Canvas Optimizations**
```typescript
// RequestAnimationFrame for smooth animations
useEffect(() => {
  let rafId: number;
  
  const animate = () => {
    // Animation logic
    rafId = requestAnimationFrame(animate);
  };
  
  rafId = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(rafId);
}, []);
```

## Error Handling Patterns

### 1. **Error Boundaries** (React)
```typescript
class MindMapErrorBoundary extends Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorScreen message="Failed to load mind map" />;
    }
    return this.props.children;
  }
}
```

### 2. **Try-Catch with Graceful Degradation**
```typescript
try {
  const saved = await saveMindMap(map);
  showSuccessToast('Mind map saved');
} catch (error) {
  console.error('Save failed:', error);
  showErrorToast('Failed to save, trying again...');
  // Retry logic or offline queue
}
```

### 3. **Runtime Type Checking**
```typescript
// Validate external data
function validateMindMap(data: unknown): data is MindMap {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof data.id === 'string' &&
    // ... additional validation
  );
}
```

## Security Patterns

### 1. **XSS Prevention**
```typescript
// Never use dangerouslySetInnerHTML with user content
// Sanitize all user inputs
const sanitizedContent = DOMPurify.sanitize(userInput);
```

### 2. **CSP Compliance**
```typescript
// Content Security Policy headers restrict script sources
// All scripts must be from trusted sources
```

## Testing Patterns

### 1. **Unit Testing (Jest)**
```typescript
describe('Topic', () => {
  it('should create topic with default config', () => {
    const topic = new Topic({ x: 0, y: 0, text: 'Test' });
    expect(topic.text).toBe('Test');
  });
});
```

### 2. **Component Testing (React Testing Library)**
```typescript
test('renders canvas and handles click', () => {
  render(<MindMapCanvas onTopicAdd={jest.fn()} />);
  const canvas = screen.getByRole('canvas');
  fireEvent.click(canvas);
  expect(onTopicAdd).toHaveBeenCalled();
});
```

### 3. **Visual Regression (Cypress)**
```typescript
it('should match mind map snapshot', () => {
  cy.visit('/mindmap/123');
  cy.get('.mindmap-canvas').matchImageSnapshot('mindmap-view');
});
```

### 4. **E2E Testing (Cypress)**
```typescript
describe('Mind Map Collaboration', () => {
  it('should sync changes between users', () => {
    // Test real-time collaboration
  });
});
