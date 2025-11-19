import * as vscode from 'vscode';

export class FastmindEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'fastmind.editor';

  private readonly _extensionUri: vscode.Uri;

  constructor(private readonly _context: vscode.ExtensionContext) {
    this._extensionUri = _context.extensionUri;
  }

  /**
   * Called when our custom editor is opened.
   */
  public resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): void | Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview, document);

    // 监听来自 webview 的消息
    webviewPanel.webview.onDidReceiveMessage(
      async (message) => {
        console.log('📨 [FastMind VS Code] Received message from webview:', {
          type: message.type,
          hasText: !!message.text,
          textLength: message.text?.length || 0,
          timestamp: new Date().toISOString()
        });

        if (message.type === 'edit' && message.text) {
          // 更新文档内容
          console.log('📝 [FastMind VS Code] Updating document:', {
            uri: document.uri.toString(),
            currentLength: document.getText().length,
            newLength: message.text.length,
            timestamp: new Date().toISOString()
          });

          const edit = new vscode.WorkspaceEdit();
          edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            message.text
          );
          
          const success = await vscode.workspace.applyEdit(edit);
          console.log('✅ [FastMind VS Code] Document update result:', {
            success,
            timestamp: new Date().toISOString()
          });
        }
      },
      undefined,
      this._context.subscriptions
    );

    // 监听文档变更（外部修改时同步到编辑器）
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document === document) {
        webviewPanel.webview.postMessage({
          type: 'contentChanged',
          text: e.document.getText()
        });
      }
    });

    this._context.subscriptions.push(changeDocumentSubscription);
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
    
    // 获取文档内容，转义特殊字符
    const initialContent = document.getText()
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/'/g, "\\'");
      
    const fileName = document.fileName;
    
    // 生成 VS Code 资源 URL 和 mapId
    const mapId = fileName.split('/').pop()?.replace(/\.fastmind$/, '') || 'default';
    const resourceUrl = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'resources', '{id}.xml')
    ).toString();

    console.log('🔧 [FastMind VS Code] Generating Bootstrap parameters:', {
      fileName,
      mapId,
      resourceUrl,
      hasContent: !!initialContent,
      contentLength: initialContent?.length || 0,
      scriptUri: scriptUri.toString(),
      extensionUri: this._extensionUri.toString(),
      timestamp: new Date().toISOString()
    });

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' 'self' ${webview.cspSource} https://fonts.googleapis.com; font-src 'self' ${webview.cspSource} https://fonts.gstatic.com; img-src 'self' data: ${webview.cspSource}; script-src 'nonce-${nonce}' ${webview.cspSource}; connect-src 'self' ${webview.cspSource};">
        <title>FastMind Editor</title>
      </head>
      <body>
        <div id="root"></div>
        <div id="loading">Loading FastMind Editor...</div>
        
        <!-- VS Code Bootstrap 脚本 -->
        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();

          console.log('🔧 [FastMind VS Code] Bootstrap script executing:', {
            fileName: "${fileName}",
            mapId: "${mapId}",
            resourceUrl: "${resourceUrl}",
            contentLength: \`${initialContent}\`.length,
            timestamp: new Date().toISOString()
          });

          window.__FAST_MIND_VSCODE_BOOTSTRAP__ = {
            initialContent: \`${initialContent}\`,
            fileName: "${fileName}",
            resourceUrl: "${resourceUrl}",  // 新增：VS Code 资源 URL
            mapId: "${mapId}",             // 新增：地图 ID
            onChanged: (newXml) => {
              console.log('📤 [FastMind VS Code] onChanged triggered:', {
                xmlLength: newXml?.length || 0,
                timestamp: new Date().toISOString()
              });
              vscode.postMessage({ type: 'edit', text: newXml });
            }
          };

          // 兼容 WiseMapping 可能在很早就读取 persistenceManager 的情况
          Object.defineProperty(window, 'persistenceManagerOverride', {
            get() { return this._override; },
            set(v) { this._override = v; }
          });

          console.log('✅ [FastMind VS Code] Bootstrap setup completed');
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
