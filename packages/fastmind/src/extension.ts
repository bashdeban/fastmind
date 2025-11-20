import * as vscode from 'vscode';
import { FastmindEditorProvider } from './FastmindEditorProvider';

// Singleton interface for global state management
interface FastMindSingleton {
  getActiveEditor: () => vscode.WebviewPanel | undefined;
  setActiveEditor: (editor: vscode.WebviewPanel | undefined) => void;
}

export function activate(context: vscode.ExtensionContext) {
  console.log('FastMind extension is now active!');

  // Register custom editor provider with singleton support
  const provider = new FastmindEditorProvider(context);
  const registration = vscode.window.registerCustomEditorProvider(
    'fastmind.viewer',
    provider,
    {
      webviewOptions: {
        retainContextWhenHidden: true
      },
      supportsMultipleEditorsPerDocument: false   // 禁止同一个文档多开
    }
  );

  // ---------- 全局单例管理 ----------
  let activeEditor: vscode.WebviewPanel | undefined = undefined;

  // 监听自定义编辑器打开事件
  const openDisposable = vscode.window.onDidChangeActiveTextEditor(async editor => {
    if (!editor || editor.document.languageId !== 'fastmind') {
      return;
    }

    // 如果当前已经是 FastMind 的自定义编辑器，直接返回
    if (editor?.viewColumn && activeEditor?.webview && 
        activeEditor.webview.asWebviewUri(editor.document.uri).toString() === 
        editor.document.uri.toString()) {
      return;
    }

    // 关键：先关闭已存在的自定义编辑器
    if (activeEditor) {
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      // 等待一下确保关闭完成（实测 100ms 足够）
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 再打开新的
    await vscode.commands.executeCommand(
      'vscode.openWith',
      editor.document.uri,
      'fastmind.viewer',
      vscode.ViewColumn.Beside   // 或者 Active，根据你喜好
    );
  });

  // 监听 tab 关闭，清理 activeEditor
  const closeDisposable = vscode.window.tabGroups.onDidChangeTabs(event => {
    if (!activeEditor) return;

    const closedTab = event.closed.find(tab => {
      const input = tab.input as { uri?: vscode.Uri } | undefined;
      return input && input.uri && activeEditor && input.uri.toString() === activeEditor.webview.asWebviewUri(
        vscode.Uri.parse('')
      ).toString();
    });

    if (closedTab) {
      activeEditor = undefined;
    }
  });

  // Register configuration change listener
  registerConfigurationListener(context);

  // Add to subscriptions
  context.subscriptions.push(
    registration, 
    openDisposable, 
    closeDisposable
  );

  // 暴露内部状态供 FastmindEditorProvider 使用（单例共享）
  const globalSingleton = global as unknown as { fastmindSingleton?: FastMindSingleton };
  globalSingleton.fastmindSingleton = {
    getActiveEditor: (): vscode.WebviewPanel | undefined => activeEditor,
    setActiveEditor: (editor: vscode.WebviewPanel | undefined) => {
      activeEditor = editor;
    }
  } as FastMindSingleton;
}

/**
 * Register configuration change listener for auto-save sync
 */
function registerConfigurationListener(context: vscode.ExtensionContext) {
  const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('files.autoSave')) {
      const autoSaveConfig = vscode.workspace.getConfiguration('files.autoSave');
      const autoSaveDelay = autoSaveConfig.get<number>('delay') || 1000;
      const autoSaveOnFocusChange = autoSaveConfig.get<boolean>('onFocusChange') || false;
      const autoSaveOnWindowChange = autoSaveConfig.get<boolean>('onWindowChange') || false;

      console.log('🔧 [FastMind] VS Code auto-save config changed:', {
        delay: autoSaveDelay,
        onFocusChange: autoSaveOnFocusChange,
        onWindowChange: autoSaveOnWindowChange
      });

      // Configuration changes will be applied on next editor load
      // Auto-save is now handled purely on the client side with optimized timing
    }
  });

  context.subscriptions.push(configListener);
}

export function deactivate() {
  console.log('FastMind extension is now deactivated');
}
