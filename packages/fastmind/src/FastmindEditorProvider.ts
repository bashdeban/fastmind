import * as vscode from 'vscode';
import { Utils } from 'vscode-uri'; // Use this or path module for URI operations

interface SaveStatus {
  isSaving: boolean;
  success?: boolean;
  error?: string;
  lastSaved?: Date;
}

interface WebviewMessage {
  type: 'edit' | 'saveStatus' | 'error' | 'ready' | 'contentChanged' | 'forceSave' | 'configUpdate' | 'imageExport' | 'markdownExport';
  text?: string;
  status?: SaveStatus;
  error?: string;
  config?: {
    autoSaveDelay: number;
    autoSaveOnFocusChange: boolean;
    autoSaveOnWindowChange: boolean;
  };
  timestamp?: number;
  // For image export
  imageData?: string;
  fileName?: string;
  // For markdown export
  markdownData?: string;
}

export class FastmindEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'fastmind.viewer';

  private readonly _extensionUri: vscode.Uri;
  private saveStatus = new Map<string, SaveStatus>();
  private lastKnownContent = new Map<string, string>();
  private isSelfInducedChange = new Map<string, boolean>();

  constructor(private readonly _context: vscode.ExtensionContext) {
    this._extensionUri = _context.extensionUri;
  }

  /**
   * Called when our custom editor is opened.
   */
  public resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: vscode.CancellationToken
  ): void | Promise<void> {
    // Record current active editor (singleton)
    const singleton = (global as unknown as { fastmindSingleton?: import('./types').FastMindSingleton }).fastmindSingleton;
    if (singleton) {
      singleton.setActiveEditor(webviewPanel);
    }

    // Clean up singleton when panel is closed
    webviewPanel.onDidDispose(() => {
      if (singleton && singleton.getActiveEditor() === webviewPanel) {
        singleton.setActiveEditor(undefined);
      }
    }, null, this._context.subscriptions);

    // 1. Get the directory where the document is located
    const documentDir = Utils.dirname(document.uri);

    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri, // Allow access to extension resources (js/css)
        documentDir         // Allow access to directory of currently opened file
      ],
    };

    webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview, document);

    // Save initial content
    this.lastKnownContent.set(document.uri.toString(), document.getText());

    // Listen for messages from webview
    webviewPanel.webview.onDidReceiveMessage(
      async (message: WebviewMessage) => {
        try {
          switch (message.type) {
            case 'edit':
              if (message.text) {
                await this.handleDocumentEdit(document, webviewPanel, message.text);
              }
              break;
            case 'ready': {
              // Editor is ready, send initial content
              const initialContent = document.getText();
              webviewPanel.webview.postMessage({
                type: 'contentChanged',
                text: initialContent,
                timestamp: Date.now()
              });
              break;
            }
            case 'error':
              await this.handleError(webviewPanel, message.error || 'Unknown error');
              break;
            case 'imageExport':
              if (message.imageData && message.fileName) {
                await this.handleImageExport(document, message.imageData, message.fileName);
              }
              break;
            case 'markdownExport':
              if (message.markdownData && message.fileName) {
                await this.handleMarkdownExport(document, message.markdownData, message.fileName);
              }
              break;
          }
        } catch (error) {
          console.error('❌ [FastMind VS Code] Message handling failed:', error);
          this.notifySaveStatus(webviewPanel, {
            isSaving: false,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      },
      undefined,
      this._context.subscriptions
    );

    // Listen for document changes (sync to editor when modified externally)
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document === document) {
        const newContent = e.document.getText();
        const docKey = document.uri.toString();

        // Check if this is a self-induced change
        if (this.isSelfInducedChange.get(docKey)) {
          this.isSelfInducedChange.set(docKey, false);
          return;
        }

        // Avoid circular updates
        if (newContent !== this.lastKnownContent.get(docKey)) {
          webviewPanel.webview.postMessage({
            type: 'contentChanged',
            text: newContent,
            timestamp: Date.now()
          });

          this.lastKnownContent.set(docKey, newContent);
        }
      }
    });

    this._context.subscriptions.push(changeDocumentSubscription);

    // Add webview close handler
    this.addWebviewCloseHandler(document, webviewPanel);
  }

  /**
   * Handle document edit from editor
   */
  private async handleDocumentEdit(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    newContent: string
  ): Promise<void> {
    const maxRetries = 3;
    let attempt = 0;

    this.notifySaveStatus(webviewPanel, {
      isSaving: true
    });
    while (attempt < maxRetries) {
      try {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
          document.uri,
          new vscode.Range(0, 0, document.lineCount, 0),
          newContent
        );

        const success = await vscode.workspace.applyEdit(edit);
        if (success) {
          // Mark as self-induced change
          this.isSelfInducedChange.set(document.uri.toString(), true);
          // Save document
          await document.save();
          // Update known content
          this.lastKnownContent.set(document.uri.toString(), newContent);

          this.notifySaveStatus(webviewPanel, {
            isSaving: false,
            success: true,
            lastSaved: new Date()
          });

          return;
        } else {
          throw new Error('Failed to apply workspace edit');
        }
      } catch (error) {
        attempt++;
        console.error(`❌ [FastMind VS Code] Save attempt ${attempt} failed:`, error);

        if (attempt >= maxRetries) {
          this.notifySaveStatus(webviewPanel, {
            isSaving: false,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown save error'
          });
          throw error;
        }

        // Retry delay
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Handle error from editor
   */
  private async handleError(webviewPanel: vscode.WebviewPanel, errorMessage: string): Promise<void> {
    console.error('❌ [FastMind VS Code] Error from editor:', errorMessage);
    vscode.window.showErrorMessage(`FastMind Error: ${errorMessage}`);
  }

  /**
   * Handle image export from editor
   */
  private async handleImageExport(
    document: vscode.TextDocument,
    imageData: string,
    fileName: string
  ): Promise<void> {
    try {
      // Add _fastmind_export suffix to filename before extension
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
      const extension = fileName.includes('.png') ? '.png' : '.jpg';
      const modifiedFileName = `${nameWithoutExt}_fastmind_export${extension}`;
      
      // Get the directory of the .fastmind file
      const documentDir = Utils.dirname(document.uri);
      const imageUri = vscode.Uri.joinPath(documentDir, modifiedFileName);
      
      // Extract base64 data from data URL
      const base64Data = imageData.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid image data format');
      }
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Write the image file
      await vscode.workspace.fs.writeFile(imageUri, buffer);
      
      // Show success message with user options
      const revealAction = await vscode.window.showInformationMessage(
        'Image exported. Would you like to see it in the explorer?',
        'Show in Explorer',
        'Open Image'
      );
      
      if (revealAction === 'Show in Explorer') {
        await vscode.commands.executeCommand('revealInExplorer', imageUri);
      } else if (revealAction === 'Open Image') {
        await vscode.commands.executeCommand('vscode.open', imageUri);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [FastMind VS Code] Image export failed:', error);
      vscode.window.showErrorMessage(`Failed to export image: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Handle markdown export from editor
   */
  private async handleMarkdownExport(
    document: vscode.TextDocument,
    markdownData: string,
    fileName: string
  ): Promise<void> {
    try {
      // Add _fastmind_export suffix to filename before extension
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
      const modifiedFileName = `${nameWithoutExt}_fastmind_export.md`;
      
      // Get the directory of the .fastmind file
      const documentDir = Utils.dirname(document.uri);
      const markdownUri = vscode.Uri.joinPath(documentDir, modifiedFileName);
      
      // Write the markdown file
      const buffer = Buffer.from(markdownData, 'utf8');
      await vscode.workspace.fs.writeFile(markdownUri, buffer);
      
      // Show success message with user options
      const revealAction = await vscode.window.showInformationMessage(
        'Markdown exported. Would you like to see it in the explorer?',
        'Show in Explorer',
        'Open Markdown'
      );
      
      if (revealAction === 'Show in Explorer') {
        await vscode.commands.executeCommand('revealInExplorer', markdownUri);
      } else if (revealAction === 'Open Markdown') {
        await vscode.commands.executeCommand('vscode.open', markdownUri);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [FastMind VS Code] Markdown export failed:', error);
      vscode.window.showErrorMessage(`Failed to export markdown: ${errorMessage}`);
      throw error;
    }
  }


  /**
   * Add webview close handler for save confirmation
   */
  private addWebviewCloseHandler(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ): void {
    webviewPanel.onDidDispose(async () => {
      const docKey = document.uri.toString();
      const currentContent = document.getText();
      const knownContent = this.lastKnownContent.get(docKey);

      if (currentContent !== knownContent) {
        // There are unsaved changes
        const result = await vscode.window.showWarningMessage(
          'FastMind file contains unsaved changes. Do you want to save them?',
          { modal: true },
          'Save', 'Do not save', 'Cancel'
        );

        if (result === 'Save') {
          // Force save before closing
          try {
            await this.handleDocumentEdit(document, webviewPanel, currentContent);
          } catch (error) {
            console.error('❌ [FastMind] Failed to save before closing:', error);
            vscode.window.showErrorMessage(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else if (result === 'Cancel') {
          // Prevent close by reopening (this is a bit of a hack)
          vscode.commands.executeCommand('vscode.openWith', document.uri, 'fastmind.viewer');
        }
      }
    });

    // Also handle visibility change (when user switches tabs)
    webviewPanel.onDidChangeViewState(async () => {
      if (!webviewPanel.visible) {
        // Panel became invisible (user switched tabs)

        const docKey = document.uri.toString();
        const currentContent = document.getText();
        const knownContent = this.lastKnownContent.get(docKey);

        if (currentContent !== knownContent) {
          // Auto-save when switching away
          try {
            await this.handleDocumentEdit(document, webviewPanel, currentContent);
          } catch (error) {
            console.error('❌ [FastMind] Failed to auto-save on tab switch:', error);
          }
        }
      }
    });
  }

  /**
   * Notify save status to editor
   */
  private notifySaveStatus(webviewPanel: vscode.WebviewPanel, status: SaveStatus): void {
    const key = webviewPanel.viewType;
    this.saveStatus.set(key, status);

    // Send status to webview
    webviewPanel.webview.postMessage({
      type: 'saveStatus',
      status
    });

    // Update VS Code status bar
    if (status.error) {
      vscode.window.showErrorMessage(`❌ FastMind saved failed: ${status.error}`);
    } else if (status.success) {
      vscode.window.setStatusBarMessage(`💾 FastMind saved`, 2000);
    } else if (status.isSaving) {
      vscode.window.setStatusBarMessage(`💾 FastMind saving...`, 2000);
    }
  }

  /**
   * Get the static html used for the editor webview.
   */
  private _getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
    // Get the local path to the main script
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'editor-standalone.js')
    );

    // Use a nonce to whitelist which scripts are run
    const nonce = getNonce();

    const fileName = document.fileName;
    const mapId = fileName.split('/').pop()?.replace(/\.fastmind$/, '') || 'default';

    // Get current document content as initial content and URL encode to prevent JavaScript execution
    const initialContent = document.getText();
    
    // Security validation: ensure content is valid XML
    let validatedContent = initialContent;
    try {
      // Simple XML validation - check basic XML structure
      if (!initialContent.trim().startsWith('<?xml') && !initialContent.trim().startsWith('<map')) {
        console.warn('⚠️ [FastMind] Invalid XML format detected, using default template');
        validatedContent = `<?xml version="1.0" encoding="UTF-8"?>
<map version="tango">
  <topic central="true" text="Central Topic" id="1"/>
</map>`;
      } else {
        // Check for potential malicious script tags
        const scriptPattern = /<script[\s\S]*?<\/script>/gi;
        if (scriptPattern.test(initialContent)) {
          console.warn('⚠️ [FastMind] Potential script tags detected, content will be encoded for security');
          // Continue using URL encoding to handle this content
        }
      }
    } catch (error) {
      console.warn('⚠️ [FastMind] XML validation failed, using default template:', error);
      validatedContent = `<?xml version="1.0" encoding="UTF-8"?>
<map version="tango">
  <topic central="true" text="Central Topic" id="1"/>
</map>`;
    }
    
    // URL encode to prevent potential JavaScript code execution
    const encodedContent = encodeURIComponent(validatedContent);

    const config = vscode.workspace.getConfiguration('fastmind');
    const configuredLocale = config.get<string>('language.locale');
    const locale = configuredLocale || vscode.env.language || 'en';

    const resourceUrl = webview.asWebviewUri(document.uri).toString();
    return `<!DOCTYPE html>
      <html lang="${locale}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' 'self' ${webview.cspSource} https://fonts.googleapis.com; font-src 'self' ${webview.cspSource} https://fonts.gstatic.com; img-src 'self' data: blob: ${webview.cspSource}; script-src 'nonce-${nonce}' ${webview.cspSource}; connect-src 'self' ${webview.cspSource} https: http://localhost:* http://127.0.0.1:*;">
        <title>FastMind Editor</title>
        <style>
          html, body {
            height: 100vh;
            width: 100vw;
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }
          #root {
            height: 100vh;
            width: 100vw;
            overflow: hidden;
          }
          .wise-editor {
            height: 100vh !important;
            width: 100vw !important;
          }
          mindplot-component {
            height: 100vh !important;
            width: 100vw !important;
            display: block;
          }
          #mindplot-canvas {
            height: 100vh !important;
            width: 100vw !important;
          }
          #loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            z-index: 9999;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <div id="loading">Loading FastMind Editor...</div>
        
        <!-- VS Code Bootstrap -->
        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          
          // Expose VS Code API globally for export service
          window.vscode = vscode;
          
          // Store URL encoded content, will be decoded in editor-standalone
          window.__INITIAL_DOCUMENT_CONTENT_ENCODED__ = \`${encodedContent.replace(/`/g, '\\`')}\`;
          // Maintain backward compatibility, but mark as encoded
          window.__INITIAL_DOCUMENT_CONTENT__ = '';
          window.__CONTENT_IS_ENCODED__ = true;
          window.__FAST_MIND_VSCODE_BOOTSTRAP__ = {
            fileName: "${fileName}",
            resourceUrl: "${resourceUrl}",
            mapId: "${mapId}",
            locale: "${locale}",
            onChanged: (newXml) => {
              vscode.postMessage({ 
                type: 'edit', 
                text: newXml,
                timestamp: Date.now()
              });
            },
            onSaveStatus: (status) => {
            }
          };

          window.addEventListener('message', (event) => {
            const message = event.data;
            switch (message.type) {
              case 'contentChanged':
                if (window.onExternalContentChanged) {
                  window.onExternalContentChanged(message.text);
                }
                break;
              case 'saveStatus':
                if (window.onSaveStatusChanged) {
                  window.onSaveStatusChanged(message.status);
                }
                break;
            }
          });

          setTimeout(() => {
            vscode.postMessage({ 
              type: 'ready',
              timestamp: Date.now()
            });
          }, 100);
        </script>
        
        <!-- WiseMapping Editor script -->
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }

}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
