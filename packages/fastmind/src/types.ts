/**
 * Types for VS Code Extension integration
 */

export interface FastmindEditorProvider {
  resolveCustomTextEditor(
    document: any,
    webviewPanel: any,
    token: any
  ): void | Promise<void>;
}

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
