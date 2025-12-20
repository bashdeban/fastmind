/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { PersistenceManager } from '@wisemapping/mindplot';

export interface VSCodeBootstrapConfig {
  fileName: string;
  mapId: string;
  locale?: string;
  onChanged: (_xml: string) => void;
  onSaveStatus?: (_status: SaveStatus) => void;
}

export interface SaveStatus {
  isSaving: boolean;
  lastSaved?: Date;
  error?: string;
  success?: boolean;
}

export interface VSCodePersistenceOptions {
  autoSave?: boolean;
  debounceMs?: number;
  retryAttempts?: number;
}

/**
 * VSCode-specific persistence manager for WiseMapping editor.
 * Handles communication with VS Code extension via postMessage API.
 */
export class VSCodePersistenceManager extends PersistenceManager {
  private mapId: string;
  private onDocumentChange: (_xml: string) => void;
  private onSaveStatus?: (_status: SaveStatus) => void;
  private options: Required<VSCodePersistenceOptions>;

  // Auto-save related properties
  private saveTimer: NodeJS.Timeout | null = null;
  private pendingChanges = false;
  private isSaving = false;
  private saveQueue: Array<() => void> = [];
  private retryCount = 0;
  private lastSavedContent: string | null = null;

  constructor(
    mapId: string,
    onDocumentChange: (_xml: string) => void,
    options: VSCodePersistenceOptions = {},
    onSaveStatus?: (_status: SaveStatus) => void
  ) {
    super();
    
    this.mapId = mapId;
    this.onDocumentChange = onDocumentChange;
    this.onSaveStatus = onSaveStatus;
    
    // Set default options
    this.options = {
      autoSave: options.autoSave ?? true,
      debounceMs: options.debounceMs ?? 1000,
      retryAttempts: options.retryAttempts ?? 3,
    };

    // Setup VS Code message listeners
    this.setupVSCodeMessageListeners();
  }

  /**
   * Save map XML content to VS Code extension
   */
  saveMapXml(
    _mapId: string, 
    mapXml: Document, 
    _pref?: string, 
    _saveHistory?: boolean, 
    events?: unknown
  ): void {
    // Convert XML Document to string
    const xmlContent = new XMLSerializer().serializeToString(mapXml);
    
    if (this.options.autoSave) {
      this.triggerAutoSave(xmlContent);
    } else {
      this.executeSave(xmlContent, events as {
        onSuccess?: () => void;
        onError?: (_error: unknown) => void;
      });
    }
  }

  /**
   * Load map DOM from initial content or default template
   */
  async loadMapDom(_mapId: string): Promise<Document> {
    // Get initial content from global variable or use default
    const initialContent = this.getInitialDocumentContent();
    
    const parser = new DOMParser();
    const document = parser.parseFromString(initialContent, 'text/xml');
    
    return document;
  }

  /**
   * Discard changes - VS Code extension handles this
   */
  discardChanges(_mapId: string): void {
    // VS Code environment typically handles this at the extension level
    // Clear any pending saves
    this.clearAutoSave();
  }

  /**
   * Unlock map - VS Code extension handles this
   */
  unlockMap(_mapId: string): void {
    // VS Code environment typically handles this at the extension level
  }

  /**
   * Trigger auto-save with debouncing
   */
  private triggerAutoSave(xmlContent: string): void {
    if (this.isSaving) {
      // If currently saving, add to queue
      this.saveQueue.push(() => this.executeSave(xmlContent));
      return;
    }

    this.pendingChanges = true;
    this.scheduleAutoSave(xmlContent);
  }

  /**
   * Schedule auto-save with debouncing
   */
  private scheduleAutoSave(xmlContent: string): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.executeSave(xmlContent);
    }, this.options.debounceMs);
  }

  /**
   * Execute the actual save operation
   */
  private async executeSave(xmlContent: string, events?: {
    onSuccess?: () => void;
    onError?: (_error: unknown) => void;
  }): Promise<void> {
    if (!this.pendingChanges || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.pendingChanges = false;
    this.retryCount = 0;

    // Update save status
    this.updateSaveStatus({
      isSaving: true,
      lastSaved: undefined,
      error: undefined,
      success: undefined
    });

    try {
      // Store the content for loop detection
      this.lastSavedContent = xmlContent;

      // Send to VS Code extension
      this.onDocumentChange(xmlContent);

      // Notify success
      events?.onSuccess?.();

      // Update save status
      this.updateSaveStatus({
        isSaving: false,
        lastSaved: new Date(),
        success: true
      });

      // Process queue
      this.processSaveQueue();

    } catch (_error) {
      console.error('❌ [VSCodePersistenceManager] Save failed:', _error);
      
      // Update save status with error
      this.updateSaveStatus({
        isSaving: false,
        error: _error instanceof Error ? _error.message : 'Unknown save error',
        success: false
      });

      // Notify error
      events?.onError?.(_error);

      // Retry logic
      if (this.retryCount < this.options.retryAttempts) {
        this.retryCount++;
        setTimeout(() => this.executeSave(xmlContent, events), 2000 * this.retryCount);
      } else {
        console.error('❌ [VSCodePersistenceManager] Max retry attempts reached');
      }

    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Process queued save operations
   */
  private processSaveQueue(): void {
    if (this.saveQueue.length > 0) {
      const nextSave = this.saveQueue.pop();
      if (nextSave) {
        setTimeout(() => nextSave(), 100); // Small delay to avoid excessive frequency
      }
    }
  }

  /**
   * Update save status and notify callback
   */
  private updateSaveStatus(_status: SaveStatus): void {
    if (this.onSaveStatus) {
      this.onSaveStatus(_status);
    }
  }

  /**
   * Get initial document content from global variable or default template
   */
  private getInitialDocumentContent(): string {
    // Check for URL encoded content (security enhancement)
    if (window.__CONTENT_IS_ENCODED__ && window.__INITIAL_DOCUMENT_CONTENT_ENCODED__) {
      try {
        return decodeURIComponent(window.__INITIAL_DOCUMENT_CONTENT_ENCODED__);
      } catch (error) {
        console.error('❌ [VSCodePersistenceManager] Failed to decode content:', error);
        // Fallback to default template if decoding fails
        return this.getDefaultMapXml();
      }
    }

    // Check for VS Code provided initial content (legacy)
    if (window.__INITIAL_DOCUMENT_CONTENT__) {
      return window.__INITIAL_DOCUMENT_CONTENT__;
    }

    // Check for VS Code bootstrap
    if (window.__FAST_MIND_VSCODE_BOOTSTRAP__?.initialContent) {
      return window.__FAST_MIND_VSCODE_BOOTSTRAP__.initialContent;
    }

    // Use default template
    return this.getDefaultMapXml();
  }

  /**
   * Get default mind map XML template
   */
  private getDefaultMapXml(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<map version="tango">
  <topic central="true" text="Central Topic" id="1"/>
</map>`;
  }

  /**
   * Clear auto-save timer
   */
  private clearAutoSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.pendingChanges = false;
    this.saveQueue = [];
  }

  /**
   * Force immediate save
   */
  forceSave(xmlContent: string): Promise<void> {
    this.clearAutoSave();
    return new Promise((resolve, reject) => {
      this.executeSave(xmlContent, {
        onSuccess: () => resolve(),
        onError: (_error: unknown) => reject(_error as Error)
      });
    });
  }

  /**
   * Get current save status
   */
  getSaveStatus(): { isSaving: boolean; pendingChanges: boolean; queueLength: number } {
    return {
      isSaving: this.isSaving,
      pendingChanges: this.pendingChanges,
      queueLength: this.saveQueue.length
    };
  }

  /**
   * Setup VS Code message listeners for force save and config updates
   */
  private setupVSCodeMessageListeners(): void {
    // Listen for messages from VS Code extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      
      switch (message.type) {
        case 'forceSave':
          this.handleForceSave();
          break;
        case 'configUpdate':
          this.handleConfigUpdate(message.config);
          break;
        case 'saveStatus':
          this.handleSaveStatus(message.status);
          break;
        case 'contentChanged':
          this.handleContentChanged(message.text);
          break;
      }
    });
  }

  /**
   * Handle force save request from VS Code
   */
  private handleForceSave(): void {
    // Get current content from the editor if possible
    // This is a simplified approach - in a real implementation,
    // you might need to get the current XML from the editor
    const currentContent = this.getCurrentEditorContent();
    
    if (currentContent) {
      this.forceSave(currentContent).catch(error => {
        console.error('❌ [VSCodePersistenceManager] Force save failed:', error);
      });
    }
  }

  /**
   * Handle save status from VS Code extension
   */
  private handleSaveStatus(status: SaveStatus): void {
    // Update local status if needed
    this.updateSaveStatus(status);
  }

  /**
   * Handle content change from VS Code extension
   */
  private handleContentChanged(content?: string): void {
    // Check if this is a self-induced change (same as last saved content)
    if (content && this.lastSavedContent && content === this.lastSavedContent) {
      return;
    }

    // Handle genuine external content change
    if (content) {
      // Clear any pending saves since this is an external change
      this.clearAutoSave();
    }
  }

  /**
   * Handle configuration update from VS Code
   */
  private handleConfigUpdate(config: {
    autoSaveDelay: number;
    autoSaveOnFocusChange: boolean;
    autoSaveOnWindowChange: boolean;
  }): void {
    // Update debounce delay
    if (config.autoSaveDelay !== this.options.debounceMs) {
      this.options.debounceMs = config.autoSaveDelay;
    }

    // Note: autoSaveOnFocusChange and autoSaveOnWindowChange would require
    // additional event listeners to be fully implemented
    // This is a placeholder for future enhancement
  }

  /**
   * Get current editor content (simplified implementation)
   */
  private getCurrentEditorContent(): string | null {
    // This is a simplified approach - in a real implementation,
    // you would get the current XML content from the active editor
    // For now, we'll return null and let the extension handle it
    return null;
  }

  /**
   * Export image to VS Code extension
   */
  async exportImage(imageData: string, fileName: string, format: string): Promise<void> {
    try {
      // Send image export message to VS Code extension
      const vscode = (window as { acquireVsCodeApi?: () => { postMessage: (message: unknown) => void } }).acquireVsCodeApi?.();
      if (!vscode) {
        throw new Error('VS Code API not available');
      }

      vscode.postMessage({
        type: 'imageExport',
        imageData,
        fileName,
        format
      });

    } catch (error) {
      console.error('❌ [VSCodePersistenceManager] Image export failed:', error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearAutoSave();
    this.isSaving = false;
    this.saveQueue = [];
  }
}

// Global type declarations
declare global {
  interface Window {
    __INITIAL_DOCUMENT_CONTENT__?: string;
    __INITIAL_DOCUMENT_CONTENT_ENCODED__?: string;
    __CONTENT_IS_ENCODED__?: boolean;
    __FAST_MIND_VSCODE_BOOTSTRAP__?: VSCodeBootstrapConfig & {
      initialContent?: string;
    };
  }
}

export default VSCodePersistenceManager;
