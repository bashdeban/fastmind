import * as vscode from 'vscode';
import { Utils } from 'vscode-uri'; // 确保使用了这个或使用 path 模块

interface SaveStatus {
  isSaving: boolean;
  success?: boolean;
  error?: string;
  lastSaved?: Date;
}

interface WebviewMessage {
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
    // 记录当前激活的编辑器（单例）
    const singleton = (global as unknown as { fastmindSingleton?: import('./types').FastMindSingleton }).fastmindSingleton;
    if (singleton) {
      singleton.setActiveEditor(webviewPanel);
    }

    // 面板关闭时清理单例
    webviewPanel.onDidDispose(() => {
      if (singleton && singleton.getActiveEditor() === webviewPanel) {
        singleton.setActiveEditor(undefined);
      }
    }, null, this._context.subscriptions);

    // 1. 获取文档所在的目录
    const documentDir = Utils.dirname(document.uri);

    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri, // 允许访问插件资源 (js/css)
        documentDir         // 允许访问当前打开文件所在的目录
      ],
    };

    webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview, document);

    // 保存初始内容
    this.lastKnownContent.set(document.uri.toString(), document.getText());

    // 监听来自 webview 的消息
    webviewPanel.webview.onDidReceiveMessage(
      async (message: WebviewMessage) => {
        /*
        console.log('📨 [FastMind VS Code] Received message from webview:', {
          type: message.type,
          hasText: !!message.text,
          textLength: message.text?.length || 0,
          timestamp: new Date().toISOString()
        });
        */
        try {
          switch (message.type) {
            case 'edit':
              if (message.text) {
                await this.handleDocumentEdit(document, webviewPanel, message.text);
              }
              break;
            case 'ready': {
              // Editor 准备就绪，发送初始内容
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

    // 监听文档变更（外部修改时同步到编辑器）
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document === document) {
        const newContent = e.document.getText();
        const docKey = document.uri.toString();

        // 检查是否是自己触发的变更
        if (this.isSelfInducedChange.get(docKey)) {
          this.isSelfInducedChange.set(docKey, false);
          return;
        }

        // 避免循环更新
        if (newContent !== this.lastKnownContent.get(docKey)) {
          /*
          console.log('📝 [FastMind VS Code] External document change detected:', {
            uri: document.uri.toString(),
            contentLength: newContent.length,
            timestamp: new Date().toISOString()
          });
          */
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

    // 添加webview关闭处理
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
    /*
    console.log('📝 [FastMind VS Code] Updating document:', {
      uri: document.uri.toString(),
      currentLength: document.getText().length,
      newLength: newContent.length,
      timestamp: new Date().toISOString()
    });
    */
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
          // 标记为自身触发的变更
          this.isSelfInducedChange.set(document.uri.toString(), true);

          // 保存文档
          await document.save();

          // 更新已知内容
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

        // 重试延迟
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
            console.log('✅ [FastMind] Saved successfully before closing');
          } catch (error) {
            console.error('❌ [FastMind] Failed to save before closing:', error);
            vscode.window.showErrorMessage(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else if (result === 'Cancel') {
          // Prevent close by reopening (this is a bit of a hack)
          vscode.commands.executeCommand('vscode.openWith', document.uri, 'fastmind.viewer');
        }
      } else {
        console.log('✅ [FastMind] No unsaved changes, closing cleanly');
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
            //console.log('✅ [FastMind] Auto-saved on tab switch');
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

    // 发送状态到 webview
    webviewPanel.webview.postMessage({
      type: 'saveStatus',
      status
    });

    // 更新 VS Code 状态栏
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

    // 生成地图 ID
    const mapId = fileName.split('/').pop()?.replace(/\.fastmind$/, '') || 'default';

    // 获取当前文档内容作为初始内容
    const initialContent = document.getText();

    // 方案A：纯 resourceUrl 方式 - 指向用户实际打开的文件
    const resourceUrl = webview.asWebviewUri(document.uri).toString();
    /*
        console.log('🔧 [FastMind VS Code] Generating parameters with initial content:', {
          fileName,
          mapId,
          resourceUrl,
          hasInitialContent: !!initialContent,
          contentLength: initialContent.length,
          documentUri: document.uri.toString(),
          scriptUri: scriptUri.toString(),
          timestamp: new Date().toISOString()
        });
    */
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' 'self' ${webview.cspSource} https://fonts.googleapis.com; font-src 'self' ${webview.cspSource} https://fonts.gstatic.com; img-src 'self' data: ${webview.cspSource}; script-src 'nonce-${nonce}' ${webview.cspSource}; connect-src 'self' ${webview.cspSource} https: http://localhost:* http://127.0.0.1:*;">
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
        
        <!-- VS Code Bootstrap 脚本 (增强版 - 包含初始内容) -->
        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();

          console.log('🔧 [FastMind VS Code] Bootstrap with initial content:', {
            fileName: "${fileName}",
            mapId: "${mapId}",
            resourceUrl: "${resourceUrl}",
            hasInitialContent: ${!!initialContent},
            contentLength: ${initialContent.length},
            timestamp: new Date().toISOString()
          });

          // 注入初始内容
          window.__INITIAL_DOCUMENT_CONTENT__ = \`${initialContent.replace(/`/g, '\\`')}\`;

          // 增强的 Bootstrap 配置
          window.__FAST_MIND_VSCODE_BOOTSTRAP__ = {
            fileName: "${fileName}",
            resourceUrl: "${resourceUrl}",
            mapId: "${mapId}",
            onChanged: (newXml) => {
              console.log('📤 [FastMind VS Code] Content changed:', {
                xmlLength: newXml?.length || 0,
                timestamp: new Date().toISOString()
              });
              vscode.postMessage({ 
                type: 'edit', 
                text: newXml,
                timestamp: Date.now()
              });
            },
            onSaveStatus: (status) => {
              console.log('📊 [FastMind VS Code] Save status:', status);
              // VS Code 状态栏由 Extension 端处理
            }
          };

          // 监听来自 Extension 的消息
          window.addEventListener('message', (event) => {
            const message = event.data;
            console.log('📥 [FastMind VS Code] Received message from Extension:', {
              type: message.type,
              timestamp: new Date().toISOString()
            });

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

          // 通知 Extension 编辑器已准备就绪
          setTimeout(() => {
            vscode.postMessage({ 
              type: 'ready',
              timestamp: Date.now()
            });
          }, 100);

          console.log('✅ [FastMind VS Code] Bootstrap completed with enhanced communication');
        </script>
        
        <!-- WiseMapping Editor 脚本 -->
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
