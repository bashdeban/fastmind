# FastMind - AI-Powered Mind Mapping Editor - System Patterns

## Architecture Overview

### Monorepo Structure

FastMind uses a Yarn/Lerna monorepo with interconnected packages optimized for AI-powered mind mapping:

```
fastmind/
├── packages/
│   ├── editor/              # React component library wrapper with AI integration
│   ├── mindplot/            # Core mind mapping canvas engine  
│   ├── web2d/               # 2D rendering foundation (SVG abstraction)
│   ├── fastmind/            # VS Code Extension for .fastmind files
│   └── editor-standalone/   # Standalone build for VS Code integration
├── memory-bank/             # Project documentation
└── scripts/                 # Build and utility scripts
```

**Package Status Evolution**:
- **webapp**: Deprecated and removed (Q4 2025)
- **fastmind**: Added as primary focus (Q4 2025) - 🎉 100% COMPLETE - PRODUCTION READY
- **editor-standalone**: Added for VS Code integration (Q4 2025) - ✅ Production Ready

### Dependency Hierarchy

The packages follow a complex dependency hierarchy supporting multiple targets:

```
Web Application (deprecated): webapp → editor → mindplot → web2d
VS Code Extension: fastmind → editor-standalone → editor → mindplot → web2d
Standalone Integration: editor-standalone → editor → mindplot → web2d
```

**Dependency Flow**:
- **@wisemapping/web2d**: Foundation 2D rendering (zero external dependencies)
- **@wisemapping/mindplot**: Canvas engine consuming web2d APIs
- **@wisemapping/editor**: React components wrapping mindplot functionality
- **@wisemapping/editor-standalone**: Standalone build of editor for VS Code webview
- **@wisemapping/fastmind**: VS Code Extension consuming editor-standalone

## Core Design Patterns

### 1. **AI-Enhanced Layered Architecture**

The system implements clear separation of concerns across layers with AI integration throughout:

**Presentation Layer** (editor, fastmind)
- React components with hooks and AI-powered features
- Material-UI for UI components with internationalization (10 languages)
- AI progress notifications and real-time feedback
- Form handling and validation with AI-enhanced workflows
- VS Code Extension UI integration

**AI Service Layer** (editor/services)
- Multi-LLM integration (OpenAI, Claude, Azure, local models)
- Context-aware topic generation with deduplication
- Event-driven progress notification system
- Comprehensive error handling with retry mechanisms
- Custom prompt support and AI service management

**Business Logic Layer** (mindplot)
- Pure ES6 classes for mind map logic
- Canvas rendering and manipulation
- Event handling and user interactions
- Data transformation and validation
- AI-generated topic integration

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

### 9. **AI Service Pattern with Event-Driven Progress (Production Ready)**

**Production-Ready AI Service Architecture**:
```typescript
// AI Topic Generator Service - Production Implementation
class AITopicGeneratorService {
  private static instance: AITopicGeneratorService;
  private llmService: LLMService;
  private llmProgressManager: LLMProgressManager;

  static getInstance(): AITopicGeneratorService {
    if (!this.instance) {
      this.instance = new AITopicGeneratorService();
    }
    return this.instance;
  }

  // Backward compatibility wrapper
  async generateTopics(parentTopic: string, options: AITopicGeneratorOptions): Promise<TopicModel[]> {
    return this.generateTopicsWithContext([parentTopic], options);
  }

  // Unified core implementation with context-aware generation
  async generateTopicsWithContext(topicPath: string[], options: AITopicGeneratorOptions): Promise<TopicModel[]> {
    const taskId = this.llmProgressManager.createTask({
      title: 'AI 生成主题',
      description: `正在基于主题路径"${topicPath.join(' → ')}"生成相关主题...`
    });

    try {
      // Enhanced context-aware prompt
      const prompt = this.buildEnhancedPrompt(topicPath, options);
      const topics = await this.llmService.generateResponse(prompt);
      
      // Deduplication and validation
      const validatedTopics = this.validateAndDeduplicateTopics(topics, topicPath);
      
      this.llmProgressManager.completeTask(taskId, true);
      return validatedTopics;
    } catch (error) {
      this.llmProgressManager.completeTask(taskId, false);
      throw error;
    }
  }

  // Enhanced prompt building with context
  private buildEnhancedPrompt(topicPath: string[], options: AITopicGeneratorOptions): string {
    const contextPath = topicPath.join(' → ');
    const customPrompt = options.customPrompt || '';
    
    return `基于以下主题路径生成5-8个相关子主题：
路径：${contextPath}
要求：${customPrompt || '生成相关的子主题，覆盖不同的角度和层面'}
返回格式：JSON数组，每个主题包含text字段`;
  }

  // Child topics deduplication
  private validateAndDeduplicateTopics(topics: any[], topicPath: string[]): TopicModel[] {
    // Implementation prevents redundant content generation
    return topics
      .filter(topic => topic && typeof topic.text === 'string')
      .filter((topic, index, arr) => arr.findIndex(t => t.text === topic.text) === index)
      .map(topic => this.createTopicModel(topic.text));
  }

  // Direct integration method for one-click workflow
  async generateAndAddTopicsDirectly(parentTopic: Topic, designer: Designer): Promise<void> {
    const topicPath = this.buildTopicPath(parentTopic);
    const topicModels = await this.generateTopicsWithContext(topicPath, {});
    
    // Smart positioning using layout manager
    const positionedTopics = this.positionTopics(topicModels, parentTopic, designer);
    
    positionedTopics.forEach(model => {
      designer.getActionDispatcher().addTopics([model], [parentTopic.getId()]);
    });
  }

  // Production-ready error handling with fallback
  private async handleAIFailure(error: Error, taskId: string): Promise<TopicModel[]> {
    this.llmProgressManager.completeTask(taskId, false);
    
    // Fallback to default topics or retry logic
    if (this.isRetryableError(error)) {
      return this.retryWithBackoff(taskId);
    }
    
    // Return user-friendly fallback topics
    return this.generateFallbackTopics();
  }
}
```

**Global Progress Notification System**:
```typescript
// Progress Manager for AI Operations
class LLMProgressManager {
  private tasks = new Map<string, ProgressTask>();
  private listeners: ProgressListener[] = [];

  createTask(config: ProgressTaskConfig): string {
    const taskId = generateId();
    const task: ProgressTask = {
      id: taskId,
      status: 'in-progress',
      ...config,
      startTime: Date.now()
    };
    
    this.tasks.set(taskId, task);
    this.notifyProgress('start', task);
    return taskId;
  }

  completeTask(taskId: string, success: boolean): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = success ? 'completed' : 'failed';
      task.endTime = Date.now();
      this.notifyProgress('complete', task);
      this.tasks.delete(taskId);
    }
  }

  private notifyProgress(type: 'start' | 'complete', task: ProgressTask): void {
    const event = new CustomEvent('llm-progress', {
      detail: { type, task }
    });
    window.dispatchEvent(event);
  }
}
```

**Progress Notification Component Pattern**:
```typescript
// React Component for AI Progress Notifications
const LLMProgressNotification: React.FC = () => {
  const [tasks, setTasks] = useState<ProgressTask[]>([]);

  useEffect(() => {
    const handleProgress = (event: CustomEvent) => {
      const { type, task } = event.detail;
      
      setTasks(prev => {
        if (type === 'start') {
          return [...prev, task];
        } else if (type === 'complete') {
          return prev.filter(t => t.id !== task.id);
        }
        return prev;
      });
    };

    window.addEventListener('llm-progress', handleProgress as EventListener);
    return () => window.removeEventListener('llm-progress', handleProgress as EventListener);
  }, []);

  return (
    <Box className="llm-progress-container">
      {tasks.map(task => (
        <Alert key={task.id} severity="info" icon={<CircularProgress size={16} />}>
          <Typography variant="body2">{task.title}</Typography>
          <Typography variant="caption">{task.description}</Typography>
        </Alert>
      ))}
    </Box>
  );
};
```

### 9. **VS Code Extension Architecture**

**CustomTextEditorProvider Pattern**:
```typescript
// FastMind Extension - Custom Editor Provider
export class FastmindEditorProvider implements vscode.CustomTextEditorProvider {
  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): Promise<void> {
    // Setup webview communication
    this.setupWebviewCommunication(webviewPanel, document);
    
    // Load initial content
    const initialContent = document.getText();
    webviewPanel.webview.postMessage({
      type: 'contentChanged',
      text: initialContent
    });
  }
}
```

**Bidirectional Communication Pattern**:
```typescript
// Extension → Editor (webview.postMessage)
webviewPanel.webview.postMessage({
  type: 'saveStatus',
  isSaving: false,
  success: true,
  lastSaved: new Date()
});

// Editor → Extension (acquireVsCodeApi().postMessage)
vscode.postMessage({
  type: 'edit',
  text: newXmlContent
});

// Extension handles messages
webviewPanel.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
  switch (message.type) {
    case 'edit': 
      await this.handleDocumentEdit(document, webviewPanel, message.text);
      break;
    case 'ready':
      // Handle editor ready state
      break;
  }
});
```

**VS Code Persistence Manager Pattern**:
```typescript
// Standalone editor persistence for VS Code integration
export class VSCodePersistenceManager extends PersistenceManager {
  constructor(private readonly onDocumentChange: (xmlContent: string) => void) {
    super();
  }

  saveMapXml(mapId: string, mapDoc: Document): void {
    const xmlContent = new XMLSerializer().serializeToString(mapDoc);
    // Trigger save in extension via callback
    this.onDocumentChange(xmlContent);
  }

  loadMapDom(mapId: string): Promise<Document> {
    // Load from extension-injected content or default
    const initialContent = window.__INITIAL_DOCUMENT_CONTENT__ || this.getDefaultMapXml();
    const parser = new DOMParser();
    return Promise.resolve(parser.parseFromString(initialContent, 'text/xml'));
  }
}
```

**Error Handling and Retry Pattern**:
```typescript
private async handleDocumentEdit(
  document: vscode.TextDocument, 
  webviewPanel: vscode.WebviewPanel, 
  newContent: string
): Promise<void> {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), newContent);
      const success = await vscode.workspace.applyEdit(edit);
      
      if (success) {
        await document.save();
        this.notifySaveStatus(webviewPanel, {isSaving: false, success: true});
        return;
      }
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        this.notifySaveStatus(webviewPanel, {isSaving: false, success: false, error: error.message});
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
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
