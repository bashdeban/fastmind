/**
 * Types for VS Code Extension integration
 */

// Note: FastmindEditorProvider class is defined in FastmindEditorProvider.ts
// This interface was removed to avoid naming conflicts

export interface WebviewMessage {
  type: string;
  content?: string;
  data?: any;
}

export interface EditorState {
  xml: string;
  dirty: boolean;
}

export interface ExtensionConfig {
  viewType: string;
  displayName: string;
  selector: string[];
  priority: string;
}
