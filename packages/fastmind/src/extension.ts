import * as vscode from 'vscode';
import { FastmindEditorProvider } from './FastmindEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('FastMind extension is now active!');

  // Register custom editor provider
  const provider = new FastmindEditorProvider(context);
  const registration = vscode.window.registerCustomEditorProvider(
    'fastmind.editor',
    provider
  );

  // Register configuration change listener
  registerConfigurationListener(context);

  // Add to subscriptions
  context.subscriptions.push(registration);
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
