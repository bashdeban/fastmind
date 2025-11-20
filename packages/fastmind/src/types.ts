/**
 * Types for VS Code Extension integration
 */

export interface SaveStatus {
  isSaving: boolean;
  success?: boolean;
  error?: string;
  lastSaved?: Date;
}

export interface WebviewMessage {
  type: 'edit' | 'saveStatus' | 'error' | 'ready' | 'contentChanged' | 'forceSave' | 'configUpdate';
  text?: string;
  status?: SaveStatus;
  error?: string;
  config?: {
    autoSaveDelay: number;
    autoSaveOnFocusChange: boolean;
    autoSaveOnWindowChange: boolean;
  };
  timestamp?: number;
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

export interface VSCodeBootstrapConfig {
  fileName: string;
  resourceUrl: string;
  mapId: string;
  onChanged: (xml: string) => void;
  onSaveStatus?: (status: SaveStatus) => void;
}

// Singleton interface for global state management
export interface FastMindSingleton {
  getActiveEditor: () => import('vscode').WebviewPanel | undefined;
  setActiveEditor: (editor: import('vscode').WebviewPanel | undefined) => void;
}
