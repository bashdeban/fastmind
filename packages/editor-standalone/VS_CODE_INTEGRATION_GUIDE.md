# VS Code Integration Guide for WiseMapping Editor

## Overview

The `packages/editor-standalone` has been refactored to support VS Code extension integration through a dedicated `VSCodePersistenceManager`. This replaces the previous LocalStorageManager-based approach with a proper postMessage communication system.

## Architecture

### VSCodePersistenceManager

The new `VSCodePersistenceManager` class extends the base `PersistenceManager` and provides:

- **Auto-save with debouncing**: Prevents excessive save operations during rapid editing
- **Save status feedback**: Real-time status updates for the VS Code extension
- **Error handling**: Robust error handling with retry logic
- **Type-safe communication**: Full TypeScript support for VS Code integration

### Key Features

1. **Zero-Intrusion Design**: The VS Code extension provides callbacks, the editor calls them
2. **Auto-Save**: Automatic saving with 1-second debounce (configurable)
3. **Status Updates**: Real-time feedback on save operations
4. **Error Recovery**: Automatic retry with exponential backoff
5. **Type Safety**: Full TypeScript definitions for all interfaces

## Integration API

### Bootstrap Configuration

The VS Code extension must provide a global bootstrap object:

```typescript
interface VSCodeBootstrapConfig {
  fileName: string;           // Current filename (e.g., "my-map.fastmind")
  mapId: string;             // Unique map identifier
  onChanged: (xml: string) => void;  // Callback for document changes
  onSaveStatus?: (status: SaveStatus) => void;  // Optional status callback
  initialContent?: string;     // Initial document content
}

interface SaveStatus {
  isSaving: boolean;          // Currently saving
  lastSaved?: Date;          // Last successful save timestamp
  error?: string;            // Error message if save failed
  success?: boolean;          // Success flag
}
```

### Implementation Example

```javascript
// In your VS Code extension's webview setup
window.__FAST_MIND_VSCODE_BOOTSTRAP__ = {
  fileName: 'my-mind-map.fastmind',
  mapId: 'map-12345',
  onChanged: (xmlContent) => {
    // Handle document changes
    vscode.postMessage({
      type: 'saveDocument',
      content: xmlContent,
      fileName: this.fileName
    });
  },
  onSaveStatus: (status) => {
    // Update VS Code UI based on save status
    if (status.isSaving) {
      vscode.postMessage({
        type: 'updateStatus',
        status: 'saving'
      });
    } else if (status.success) {
      vscode.postMessage({
        type: 'updateStatus', 
        status: 'saved',
        timestamp: status.lastSaved
      });
    } else if (status.error) {
      vscode.postMessage({
        type: 'updateStatus',
        status: 'error',
        error: status.error
      });
    }
  },
  initialContent: `<?xml version="1.0" encoding="UTF-8"?>
<map version="tango">
  <topic central="true" text="My Mind Map" id="1"/>
</map>`
};
```

## Configuration Options

The `VSCodePersistenceManager` accepts configuration options:

```typescript
interface VSCodePersistenceOptions {
  autoSave?: boolean;        // Enable auto-save (default: true)
  debounceMs?: number;       // Debounce delay in ms (default: 1000)
  retryAttempts?: number;    // Max retry attempts (default: 3)
}
```

Custom configuration example:

```typescript
// In the editor initialization (advanced usage)
const persistence = new VSCodePersistenceManager(
  mapId,
  onDocumentChange,
  {
    autoSave: true,
    debounceMs: 2000,  // 2-second debounce
    retryAttempts: 5
  },
  onSaveStatus
);
```

## VS Code Extension Message Handling

### Message Types

The editor expects the following message types from the extension:

1. **Document Updates**: New content to load
2. **Save Responses**: Confirmation of successful saves
3. **Error Notifications**: Save failure notifications

### Extension Implementation

```typescript
// In your VS Code extension's webview message handler
webviewPanel.webview.onDidReceiveMessage(
  (message) => {
    switch (message.type) {
      case 'saveDocument':
        // Save the document to file system
        this.saveDocument(message.content, message.fileName)
          .then(() => {
            webviewPanel.webview.postMessage({
              type: 'saveComplete',
              success: true
            });
          })
          .catch((error) => {
            webviewPanel.webview.postMessage({
              type: 'saveComplete', 
              success: false,
              error: error.message
            });
          });
        break;
        
      case 'updateStatus':
        // Update VS Code status bar
        this.updateStatusBar(message.status);
        break;
    }
  }
);
```

## Testing

### Test HTML File

A comprehensive test file is provided at:
`packages/editor-standalone/dist-standalone/test-vscode-integration.html`

This test file includes:

- Mock VS Code environment setup
- Real-time save status monitoring
- Event logging for debugging
- Test buttons for various scenarios

### Running Tests

1. Build the standalone editor:
   ```bash
   cd packages/editor-standalone
   yarn build:standalone
   ```

2. Open the test file in a browser:
   ```bash
   open dist-standalone/test-vscode-integration.html
   ```

3. The test panel shows:
   - Connection status
   - Save status indicators
   - Event log with timestamps
   - Test buttons for simulation

## Migration from LocalStorageManager

### Before (LocalStorageManager)
```typescript
// Old approach - using LocalStorage
persistence = new LocalStorageManager(fileUrl, false, undefined, false);
```

### After (VSCodePersistenceManager)
```typescript
// New approach - VS Code integration
persistence = new VSCodePersistenceManager(
  bootstrap.mapId,
  bootstrap.onChanged,
  { autoSave: true, debounceMs: 1000 },
  bootstrap.onSaveStatus
);
```

## Debugging

### Console Logging

The VSCodePersistenceManager provides extensive console logging:

```javascript
// Enable debug logging in browser console
// Look for messages prefixed with 🚀, 💾, 📂, ✅, ❌, etc.
```

### Common Issues

1. **Save Not Triggered**
   - Check `window.__FAST_MIND_VSCODE_BOOTSTRAP__` is set
   - Verify `onChanged` callback is a function
   - Check browser console for errors

2. **Save Status Not Updated**
   - Verify `onSaveStatus` callback is provided
   - Check for JavaScript errors in callback
   - Monitor console for status updates

3. **Auto-save Too Frequent**
   - Increase `debounceMs` configuration
   - Check for multiple editor instances
   - Verify event listener cleanup

## Build Process

### Development Build
```bash
cd packages/editor-standalone
yarn build:standalone
```

### Output Files
- `dist-standalone/editor-standalone.js` - Main bundle
- `dist-standalone/index.html` - Standard web version
- `dist-standalone/test-vscode-integration.html` - VS Code integration test

### Webpack Configuration

The build process:
1. Bundles React and WiseMapping components
2. Generates TypeScript declarations
3. Creates standalone HTML files
4. Includes all necessary dependencies

## Performance Considerations

### Bundle Size
- Main bundle: ~5.4MB (includes React, MUI, WiseMapping)
- Lazy-loaded chunks: 366KB + 61KB
- Source maps included for debugging

### Memory Usage
- Auto-save debouncing prevents excessive operations
- Cleanup on component unmount
- Efficient queue management for rapid saves

### Network Optimization
- Minimal data transfer (only XML content)
- No unnecessary API calls
- Local caching of document state

## Security Considerations

### Content Security
- XML content validation before processing
- Safe DOM parsing with error handling
- No eval() or dynamic code execution

### Data Isolation
- Each editor instance has isolated persistence
- No global state pollution
- Secure message passing between contexts

## Future Enhancements

### Planned Features
1. **Collaborative Editing**: Real-time synchronization
2. **Version History**: Document versioning in VS Code
3. **Export Integration**: Direct VS Code export commands
4. **Plugin System**: Extensible persistence backends

### Extension Points
- Custom persistence managers
- Additional VS Code commands
- Enhanced error reporting
- Performance monitoring

## Support

For issues related to VS Code integration:

1. Check the browser console for detailed error messages
2. Use the test HTML file to verify basic functionality
3. Review the VS Code extension message handling
4. Verify proper bootstrap configuration

All log messages are prefixed with emojis for easy identification:
- 🚀 Initialization
- 💾 Save operations
- 📂 Load operations
- ✅ Success
- ❌ Errors
- ⏳ Pending operations
