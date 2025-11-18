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

    webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview);
  }

  /**
   * Get the static html used for the editor webview.
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get the local path to the main script
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'editor-standalone.js')
    );

    // Use a nonce to whitelist which scripts are run
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}' ${webview.cspSource};">
        <title>FastMind Editor</title>
      </head>
      <body>
        <div id="root"></div>
        <div id="loading">Loading FastMind Editor...</div>
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
