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

// 默认配置（浏览器环境）
let fileUrl = 'samples/{id}.wxml';
let mapId = 'default';

// VS Code 环境下使用注入的参数（方案A：纯 resourceUrl 方式）
if (window.__FAST_MIND_VSCODE_BOOTSTRAP__) {
  const boot = window.__FAST_MIND_VSCODE_BOOTSTRAP__;
  fileUrl = boot.resourceUrl || fileUrl;
  mapId = boot.mapId || mapId;
  
  console.log('📥 [FastMind Editor] Bootstrap parameters (Pure resourceUrl approach):', {
    resourceUrl: boot.resourceUrl,
    originalMapId: boot.mapId,
    fileName: boot.fileName,
    fileUrl: fileUrl,
    finalMapId: mapId
  });
}

console.log('⚙️ [FastMind Editor] Creating LocalStorageManager with parameters:', {
  fileUrl,
  mapId,
  constructor: 'LocalStorageManager(fileUrl, false, undefined, false)'
});

const persistence = new LocalStorageManager(fileUrl, false, undefined, false);

const options: EditorOptions = {
  mode: 'edition-owner',
  locale: 'en',
  enableKeyboardEvents: true,
  enableAppBar: true,
  saveOnLoad: false,
};

console.log('🏷️ [FastMind Editor] Creating MapInfoImpl with parameters:', {
  mapId,
  title: 'New Mind Map',
  creator: 'User',
  isLocked: false
});

const mapInfo = new MapInfoImpl(mapId, 'New Mind Map', 'User', false);
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

// VS Code 零侵入全局注入 - 方案A：纯 resourceUrl 方式
declare global {
  interface Window {
    __FAST_MIND_VSCODE_BOOTSTRAP__?: {
      fileName: string;
      onChanged: (xml: string) => void;
      resourceUrl?: string;  // VS Code 资源 URL
      mapId?: string;       // 地图 ID
    };
    designer?: any;
    mapInfoOverride?: any;
    persistenceManagerOverride?: any;
    onContentChanged?: (xml: string) => void;
  }
}

// VS Code 环境自动接管（方案A：纯 resourceUrl 方式）
if (window.__FAST_MIND_VSCODE_BOOTSTRAP__) {
  const boot = window.__FAST_MIND_VSCODE_BOOTSTRAP__;
  
  console.log('🚀 [FastMind VS Code] Bootstrap detected (Pure resourceUrl approach):', {
    fileName: boot.fileName,
    hasOnChanged: typeof boot.onChanged === 'function'
  });

  // 直接覆盖 WiseMapping 内部会调用的全局回调
  // 这是 WiseMapping 官方支持的方式，源码见：Designer.tsx#L317
  (window as any).onContentChanged = (xmlContent: string) => {
    console.log('📤 [FastMind VS Code] onContentChanged triggered:', {
      xmlLength: xmlContent?.length || 0,
      xmlPreview: xmlContent?.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });
    boot.onChanged(xmlContent);
  };

  // 替换 persistenceManager（简化版 - 不需要 load() 逻辑）
  class VscodePersistence {
    save(_mapId: string, _prefs: any, _saveHistory: boolean, events: any) {
      // WiseMapping 会在保存成功后调用 events.success()
      const xmlContent = (window as any).designer?.getMindmap()?.getXml() || '';
      console.log('💾 [FastMind VS Code] VscodePersistence.save() called:', {
        mapId: _mapId,
        xmlLength: xmlContent?.length || 0,
        xmlPreview: xmlContent?.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
      });
      
      boot.onChanged(xmlContent);
      events.success?.();
    }
    
    // LocalStorageManager 会通过 resourceUrl 自动加载内容，load() 不需要特殊处理
    load() { 
      console.log('📥 [FastMind VS Code] VscodePersistence.load() called (delegated to LocalStorageManager)');
      return undefined; // 让 LocalStorageManager 通过 resourceUrl 处理
    }
    
    discard() {
      console.log('🗑️ [FastMind VS Code] VscodePersistence.discard() called');
    }
    
    savePreferences() {
      console.log('⚙️ [FastMind VS Code] VscodePersistence.savePreferences() called');
    }
    
    loadPreferences() { 
      console.log('📋 [FastMind VS Code] VscodePersistence.loadPreferences() called');
      return {}; 
    }
  }

  // 全局替换 persistenceManager
  (window as any).persistenceManagerOverride = new VscodePersistence();

  // 更新标题和地图信息
  const name = boot.fileName.split('/').pop()?.replace(/\.fastmind$/, '') || 'Untitled';
  console.log('🏷️ [FastMind VS Code] MapInfo override:', {
    originalId: 'default',
    newId: name,
    fileName: boot.fileName
  });
  
  (window as any).mapInfoOverride = new MapInfoImpl('default', name, 'User', false);
  
  console.log('✅ [FastMind VS Code] Bootstrap setup completed (Pure resourceUrl approach)');
}
