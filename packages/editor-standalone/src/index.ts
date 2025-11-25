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
import React from 'react';
// @ts-ignore - React 19 types may not be fully available
import { createRoot } from 'react-dom/client';
import { PersistenceManager } from '@wisemapping/mindplot';
import Editor, { EditorOptions, useEditor } from '@wisemapping/editor';
import MapInfoImpl from './support/MapInfoImpl';
import { createMockThemeVariantStorage } from './support/MockThemeVariantStorage';
import VSCodePersistenceManager, { type VSCodeBootstrapConfig } from './VSCodePersistenceManager';

const initialization = (designer: unknown) => {
  (designer as { addEvent: (_event: string, _callback: () => void) => void }).addEvent('loadSuccess', () => {
    const elem = document.getElementById('mindmap-comp');
    if (elem) {
      elem.classList.add('ready');
    }
  });
};

// VS Code Environment - Require bootstrap configuration
const bootstrap = window.__FAST_MIND_VSCODE_BOOTSTRAP__;
if (!bootstrap) {
  throw new Error('VS Code bootstrap configuration not found. This editor requires VS Code environment.');
}

console.log('🚀 [FastMind Editor] Starting VS Code initialization:', {
  fileName: bootstrap.fileName,
  mapId: bootstrap.mapId,
  hasOnChanged: typeof bootstrap.onChanged === 'function',
  hasOnSaveStatus: typeof bootstrap.onSaveStatus === 'function'
});

// Create VS Code-specific persistence manager
const persistence = new VSCodePersistenceManager(
  bootstrap.mapId,
  bootstrap.onChanged,
  {
    autoSave: true,
    debounceMs: 1000,
    retryAttempts: 3
  },
  bootstrap.onSaveStatus
);

// Set as global persistence manager instance
PersistenceManager.init(persistence);

// Create map info from filename
const title = bootstrap.fileName.split('/').pop()?.replace(/\.fastmind$/, '') || 'Untitled Mind Map';
const mapInfo = new MapInfoImpl(bootstrap.mapId, title, 'User', false);

// VS Code specific options
const options: EditorOptions = {
  mode: 'edition-owner',
  locale: 'en',
  enableKeyboardEvents: true,
  enableAppBar: false,
  saveOnLoad: false, // Don't save on load in VS Code
};

console.log('✅ [FastMind Editor] VS Code persistence initialized');

const themeVariantStorage = createMockThemeVariantStorage();

// React component for the editor
const Playground = () => {
  const editor = useEditor({
    mapInfo,
    options,
    persistenceManager: persistence,
  });

  return React.createElement(
    Editor,
    {
      config: editor,
      onAction: (action) => console.log('🎬 [FastMind Editor] Action called:', action),
      onLoad: initialization,
      themeVariantStorage: themeVariantStorage
    }
  );
};

// Initialize the React app when DOM is ready
const initializeApp = () => {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container not found');
  }

  const root = createRoot(container);
  root.render(React.createElement(Playground));

  // Hide loading indicator
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }, 500);

  console.log('✅ [FastMind Editor] Application initialized successfully');
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for potential external usage
export {
  Playground,
  initialization,
  persistence,
  options,
  mapInfo,
  themeVariantStorage
};

// Global type declarations
declare global {
  interface Window {
    __FAST_MIND_VSCODE_BOOTSTRAP__?: VSCodeBootstrapConfig & {
      initialContent?: string;
    };
    __INITIAL_DOCUMENT_CONTENT__?: string;
  }
}
