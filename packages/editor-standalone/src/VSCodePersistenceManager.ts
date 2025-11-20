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

    console.log('🚀 [VSCodePersistenceManager] Initialized:', {
      mapId,
      options: this.options,
      hasSaveStatusCallback: !!onSaveStatus
    });

    // Setup VS Code message listeners
    this.setupVSCodeMessageListeners();
  }

  /**
   * Save map XML content to VS Code extension
   */
  saveMapXml(
    mapId: string,
    mapXml: Document,
    _pref?: string,
    _saveHistory?: boolean,
    events?: unknown
  ): void {
    // Convert XML Document to string
    const xmlContent = new XMLSerializer().serializeToString(mapXml);

    console.log('💾 [VSCodePersistenceManager] saveMapXml called:', {
      mapId,
      xmlLength: xmlContent.length,
      xmlPreview: xmlContent.substring(0, 100) + '...',
      hasPref: !!_pref,
      hasSaveHistory: !!_saveHistory,
      hasEvents: !!events,
      timestamp: new Date().toISOString()
    });

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
  async loadMapDom(mapId: string): Promise<Document> {
    console.log('📂 [VSCodePersistenceManager] loadMapDom called:', { mapId });

    // Get initial content from global variable or use default
    const initialContent = this.getInitialDocumentContent();

    console.log('📄 [VSCodePersistenceManager] Loading content:', {
      mapId,
      hasContent: !!initialContent,
      contentLength: initialContent?.length || 0,
      contentPreview: initialContent?.substring(0, 100) + '...'
    });

    const parser = new DOMParser();
    const document = parser.parseFromString(initialContent, 'text/xml');

    return document;
  }

  /**
   * Discard changes - VS Code extension handles this
   */
  discardChanges(_mapId: string): void {
    console.log('🗑️ [VSCodePersistenceManager] discardChanges called:', { mapId: _mapId });
    // VS Code environment typically handles this at the extension level
    // Clear any pending saves
    this.clearAutoSave();
  }

  /**
   * Unlock map - VS Code extension handles this
   */
  unlockMap(_mapId: string): void {
    console.log('🔓 [VSCodePersistenceManager] unlockMap called:', { mapId: _mapId });
    // VS Code environment typically handles this at the extension level
  }

  /**
   * Trigger auto-save with debouncing
   */
  private triggerAutoSave(xmlContent: string): void {
    if (this.isSaving) {
      // If currently saving, add to queue
      this.saveQueue.push(() => this.executeSave(xmlContent));
      console.log('⏳ [VSCodePersistenceManager] Save queued, currently saving');
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

    console.log('⏰ [VSCodePersistenceManager] Auto-save scheduled:', {
      debounceMs: this.options.debounceMs,
      xmlLength: xmlContent.length
    });
  }

  /**
   * Execute the actual save operation
   */
  private async executeSave(xmlContent: string, events?: {
    onSuccess?: () => void;
    onError?: (_error: unknown) => void;
  }): Promise<void> {
    if (!this.pendingChanges || this.isSaving) {
      console.log('⏭️ [VSCodePersistenceManager] Save skipped:', {
        pendingChanges: this.pendingChanges,
        isSaving: this.isSaving
      });
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
      console.log('💾 [VSCodePersistenceManager] Executing save:', {
        xmlLength: xmlContent.length,
        xmlPreview: xmlContent.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
      });

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

      console.log('✅ [VSCodePersistenceManager] Save completed successfully');

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
        console.log(`🔄 [VSCodePersistenceManager] Retrying save (${this.retryCount}/${this.options.retryAttempts})`);
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
        console.log('📋 [VSCodePersistenceManager] Processing queued save');
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
    // Check for VS Code provided initial content
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
    console.log('🚨 [VSCodePersistenceManager] Force save requested');
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

      console.log('📥 [VSCodePersistenceManager] Received VS Code message:', {
        type: message.type,
        timestamp: new Date().toISOString()
      });

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
        default:
          console.log('⚠️ [VSCodePersistenceManager] Unknown message type:', message.type);
      }
    });
  }

  /**
   * Handle force save request from VS Code
   */
  private handleForceSave(): void {
    console.log('🚨 [VSCodePersistenceManager] Force save request from VS Code');

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
    console.log('📊 [VSCodePersistenceManager] Received save status:', status);
    // Update local status if needed
    this.updateSaveStatus(status);
  }

  /**
   * Handle configuration update from VS Code
   */
  private handleConfigUpdate(config: {
    autoSaveDelay: number;
    autoSaveOnFocusChange: boolean;
    autoSaveOnWindowChange: boolean;
  }): void {
    console.log('⚙️ [VSCodePersistenceManager] Config update from VS Code:', config);

    // Update debounce delay
    if (config.autoSaveDelay !== this.options.debounceMs) {
      this.options.debounceMs = config.autoSaveDelay;
      console.log('📝 [VSCodePersistenceManager] Updated debounce delay to:', config.autoSaveDelay);
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
    console.log('📄 [VSCodePersistenceManager] Getting current editor content');
    return null;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    console.log('🧹 [VSCodePersistenceManager] Cleaning up resources');
    this.clearAutoSave();
    this.isSaving = false;
    this.saveQueue = [];
  }
}

// Global type declarations
declare global {
  interface Window {
    __INITIAL_DOCUMENT_CONTENT__?: string;
    __FAST_MIND_VSCODE_BOOTSTRAP__?: VSCodeBootstrapConfig & {
      initialContent?: string;
    };
  }
}

export default VSCodePersistenceManager;
