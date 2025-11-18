import * as vscode from 'vscode';
import { FastmindEditorProvider } from './FastmindEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('FastMind extension is now active!');

  // Register the custom editor provider
  const provider = new FastmindEditorProvider(context);
  const registration = vscode.window.registerCustomEditorProvider(
    'fastmind.editor',
    provider
  );

  // Add to subscriptions
  context.subscriptions.push(registration);
}

export function deactivate() {
  console.log('FastMind extension is now deactivated');
}
