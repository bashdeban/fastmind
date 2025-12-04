# FastMind - AI-Powered Mind Mapping Editor - Product Context

## Why This Project Exists

FastMind addresses the fundamental need for intelligent, AI-assisted visual thinking tools that seamlessly integrate into developer workflows. While traditional mind mapping tools require manual content creation, FastMind leverages advanced LLM integration to automate and enhance the brainstorming process, making it accessible and efficient for developers, students, and professionals worldwide.

**Strategic Evolution (November 2025)**: FastMind has successfully branched from WiseMapping Frontend to become a dedicated **AI-powered mind mapping editor** that revolutionizes how users create and organize visual content. The complete AI Topic Generation System and multi-LLM support represent a paradigm shift from manual mind mapping to intelligent, context-aware content creation.

**Production Achievement (December 2025)**: FastMind has reached **100% production-ready status** with all core features implemented, tested, and validated. The system now includes comprehensive Unicode emoji support, advanced keyboard shortcuts, and enhanced user experience features that set it apart from traditional mind mapping tools.

### Core Problems Solved

1. **AI-Enhanced Content Creation**: Traditional mind mapping requires manual topic creation. FastMind solves this with intelligent AI topic generation that understands context and provides relevant suggestions automatically.

2. **Developer Workflow Integration**: Most mind mapping tools exist outside the development environment. FastMind integrates directly into VS Code, keeping visual thinking alongside code development.

3. **Multi-LLM Flexibility**: Users are often locked into single AI providers. FastMind supports OpenAI, Claude, Azure, and local models, giving users complete control over their AI experience.

4. **International Accessibility**: Many tools lack proper multi-language support. FastMind provides full internationalization with 10 languages, making it accessible to global users.

5. **Git-Friendly Documentation**: Traditional mind mapping formats are not version control friendly. FastMind uses XML format that's diffable, mergeable, and perfectly suited for git workflows.

6. **Modern Technology Integration**: Legacy tools struggle with modern development workflows. FastMind provides seamless VS Code integration, auto-save, and offline capabilities.

## How It Should Work

### User Experience Flow

1. **Entry Point**: Users create a new `.fastmind` file in VS Code (e.g., `architecture.fastmind`) which automatically opens in the FastMind editor
2. **Immediate AI Integration**: AI features are available from the start - select any topic and click "AI Generate Topics" to instantly create intelligent subtopics
3. **Multi-LLM Configuration**: Users configure their preferred LLM provider once in VS Code settings (OpenAI, Claude, Azure, or local models)
4. **Editor Interface**: 
   - **Canvas**: Central infinite canvas for mind map creation with AI-powered assistance
   - **AI Toolbar**: One-click AI topic generation, AI explainer, and context-aware suggestions
   - **Properties Panel**: Context-sensitive editing with AI-enhanced options
   - **Git Integration**: Automatic saving with git-friendly XML format
5. **International Support**: Full interface localization in 10 languages
6. **Developer Integration**: Seamless workflow alongside code files, with offline support and local model compatibility

### Key User Interactions

- **Topic Creation**: Click to add main topic, right-click or use toolbar to add child topics
- **AI-Assisted Topic Generation**: Select a topic, click AI button to automatically generate 5-8 related subtopics using LLM
- **Drag & Drop**: Rearrange topics by dragging
- **Connection Drawing**: Create relationships between topics with visual connectors
- **Styling**: Change colors, fonts, shapes, and icons for topics
- **Navigation**: Pan and zoom the canvas for large mind maps
- **Collaboration**: See other users' changes in real-time with visual indicators

## User Experience Goals

### Primary Goals

1. **Intuitive Learning Curve**: Users should be able to create their first mind map within 2 minutes without tutorials
2. **Performance**: Smooth interactions even with 100+ topics, no perceptible lag during editing
3. **Reliability**: Auto-save functionality ensures no work is lost
4. **Visual Appeal**: Modern, clean interface that makes mind mapping enjoyable
5. **Collaboration**: Seamless real-time editing that feels natural and unobtrusive

### Accessibility Goals

- **Keyboard Navigation**: Full keyboard accessibility for users with motor impairments
- **Screen Reader Support**: Proper ARIA labels and semantic HTML for visually impaired users
- **Color Accessibility**: High contrast modes and color-blind friendly palettes
- **Motor Accessibility**: Support for various input methods beyond mouse/keyboard

### Performance Goals

- **Initial Load**: < 3 seconds to interactive on 3G connections
- **Interaction Response**: < 100ms for all user interactions
- **Bundle Size**: < 500KB initial bundle (critical for Material-UI tree-shaking)
- **Rendering**: 60fps smooth animations and transitions

### Professional Features

- **Undo/Redo**: Comprehensive history with keyboard shortcuts
- **Templates**: Pre-built mind map templates for common use cases
- **Advanced Styling**: Professional styling options for business presentations
- **Integration**: API support for integration with other tools
- **Offline Support**: Progressive Web App capabilities for offline editing

## Target Users

1. **Individual Users**: Students, writers, researchers organizing personal thoughts
2. **Educators**: Teachers creating lesson plans and collaborative classroom activities
3. **Business Teams**: Project managers, strategists, brainstorming teams
4. **Creative Professionals**: Designers, marketers, content creators visualizing ideas
5. **Developers**: Teams using mind maps for architecture planning and documentation

## Competitive Differentiation

- **AI-Powered Intelligence**: Unlike traditional mind mapping tools, FastMind provides intelligent topic generation with context-aware AI assistance
- **Multi-LLM Flexibility**: Supports OpenAI, Claude, Azure, and local models - no vendor lock-in
- **Developer-Centric Integration**: Native VS Code extension with git-friendly XML format and seamless workflow integration
- **Truly Open Source**: Unlike freemium models, FastMind is completely open source with no proprietary AI restrictions
- **Modern Architecture**: Built with React 19, TypeScript, and modern build tools optimized for performance
- **International Accessibility**: Full support for 10 languages, making it truly global
- **Offline Capabilities**: Works completely offline with local model support
- **Performance Focus**: Sub-100ms response times with optimized rendering and bundle sizes

## Future Vision

The project aims to evolve into the premier open-source alternative to commercial mind mapping tools, with a focus on:
- Advanced AI-assisted mind mapping
- Enhanced collaboration features
- Mobile app companion
- Plugin ecosystem for extensibility
- Enterprise-grade features while maintaining open-source accessibility
