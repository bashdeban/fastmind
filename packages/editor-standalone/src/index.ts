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
import { createRoot } from 'react-dom/client';
import { LocalStorageManager, Designer } from '@wisemapping/mindplot';
import Editor, { EditorOptions, useEditor } from '@wisemapping/editor';
import MapInfoImpl from './support/MapInfoImpl';
import { createMockThemeVariantStorage } from './support/MockThemeVariantStorage';

const initialization = (designer: Designer) => {
  designer.addEvent('loadSuccess', () => {
    const elem = document.getElementById('mindmap-comp');
    if (elem) {
      elem.classList.add('ready');
    }
  });
};

const persistence = new LocalStorageManager('samples/{id}.wxml', false, undefined, false);

const options: EditorOptions = {
  mode: 'edition-owner',
  locale: 'en',
  enableKeyboardEvents: true,
  enableAppBar: true,
  saveOnLoad: false,
};

const mapInfo = new MapInfoImpl('default', 'New Mind Map', 'User', false);
const themeVariantStorage = createMockThemeVariantStorage();

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
      onAction: (action) => console.log('action called:', action),
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
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for potential external usage
export { Playground, initialization, persistence, options, mapInfo, themeVariantStorage };

// VS Code 零侵入全局注入 - 只在 VS Code 环境下生效
declare global {
  interface Window {
    __FAST_MIND_VSCODE_BOOTSTRAP__?: {
      initialContent: string;
      fileName: string;
      onChanged: (xml: string) => void;
    };
    designer?: any;
    mapInfoOverride?: any;
    persistenceManagerOverride?: any;
    onContentChanged?: (xml: string) => void;
  }
}

// VS Code 环境自动接管（零侵入全局注入方案）
if (window.__FAST_MIND_VSCODE_BOOTSTRAP__) {
  const boot = window.__FAST_MIND_VSCODE_BOOTSTRAP__;

  // 直接覆盖 WiseMapping 内部会调用的全局回调
  // 这是 WiseMapping 官方支持的方式，源码见：Designer.tsx#L317
  (window as any).onContentChanged = (xmlContent: string) => {
    boot.onChanged(xmlContent);
  };

  // 替换 persistenceManager（双保险机制）
  class VscodePersistence {
    save(_mapId: string, _prefs: any, _saveHistory: boolean, events: any) {
      // WiseMapping 会在保存成功后调用 events.success()
      const xmlContent = (window as any).designer?.getMindmap()?.getXml() || '';
      boot.onChanged(xmlContent);
      events.success?.();
    }
    
    load() { 
      return boot.initialContent; 
    }
    
    discard() {}
    
    savePreferences() {}
    
    loadPreferences() { 
      return {}; 
    }
  }

  // 全局替换 persistenceManager（useEditor 还没执行时替换也完全来得及）
  (window as any).persistenceManagerOverride = new VscodePersistence();

  // 更新标题和地图信息
  const name = boot.fileName.split('/').pop()?.replace(/\.fastmind$/, '') || 'Untitled';
  (window as any).mapInfoOverride = new MapInfoImpl('default', name, 'User', false);
}
