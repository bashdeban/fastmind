# WiseMapping Frontend - Product Context

## Why This Project Exists

WiseMapping Front End addresses the need for a modern, open-source, web-based mind mapping solution that provides professional-grade functionality without the licensing constraints of commercial alternatives. The project exists to democratize mind mapping technology, making it accessible to individuals, educators, and teams worldwide.

### Core Problems Solved

1. **Accessibility of Professional Mind Mapping**: Commercial mind mapping tools often come with steep licensing fees, limiting access for individual users, students, and small teams.

2. **Legacy Technology Modernization**: The original WiseMapping project (started 2010) required significant architectural updates to meet modern web standards, performance expectations, and user experience paradigms.

3. **Real-time Collaboration Gap**: Many open-source alternatives lack robust real-time collaborative features that modern teams require.

4. **Performance and Bundle Optimization**: Existing solutions often suffer from bloated bundles and inefficient rendering, particularly critical for web-based diagramming applications.

5. **Developer Experience**: Creating a modular, well-architected frontend that allows for easy extension, customization, and integration.

## How It Should Work

### User Experience Flow

1. **Entry Point**: Users access the webapp at a configured URL (default: http://localhost:8080/react)
2. **Authentication**: Users can create accounts and authenticate to access their mind maps
3. **Dashboard**: Users see their collection of mind maps with options to create, edit, delete, and share
4. **Editor Interface**: 
   - **Canvas**: Central infinite canvas for mind map creation
   - **Toolbar**: Intuitive tools for adding topics, connections, styling
   - **Properties Panel**: Context-sensitive editing options for selected elements
   - **Collaboration**: Real-time indication of other users' cursors and edits
5. **Export/Import**: Support for various formats (PDF, images, XML)
6. **Sharing**: Options to share mind maps with team members or publicly

### Key User Interactions

- **Topic Creation**: Click to add main topic, right-click or use toolbar to add child topics
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

- **Truly Open Source**: Unlike freemium models, WiseMapping is completely open source
- **Modern Architecture**: Built with React 19, TypeScript, and modern build tools
- **Performance Focus**: Aggressive bundle optimization and efficient rendering
- **Developer Friendly**: Well-documented, modular architecture enabling customization
- **Self-Hostable**: Organizations can host their own instances for data privacy

## Future Vision

The project aims to evolve into the premier open-source alternative to commercial mind mapping tools, with a focus on:
- Advanced AI-assisted mind mapping
- Enhanced collaboration features
- Mobile app companion
- Plugin ecosystem for extensibility
- Enterprise-grade features while maintaining open-source accessibility
