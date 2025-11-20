# Editor-Standalone - Development Tasks

## 项目概述

重构 `packages/editor-standalone` 的持久化架构，从当前的 LocalStorageManager + 全局覆盖方案改为专门的 VSCodePersistenceManager，实现与 VS Code Extension 的可靠数据交换。

## 核心目标

### 主要问题
- **保存事件丢失**: 当前的持久化机制无法正确捕获和传递保存事件
- **数据交换不稳定**: LocalStorageManager 与 VS Code 环境不兼容
- **全局覆盖复杂**: 现有的全局变量覆盖方案难以维护和调试

### 解决方案
创建专用的 `VSCodePersistenceManager` 类，直接处理 VS Code Extension 的 postMessage 通信，实现可靠的双向数据同步。

---

## 优先级 1: 核心架构重构 (P0 - 立即执行)

### 1.1 创建 VSCodePersistenceManager 类
- [ ] 实现 `src/VSCodePersistenceManager.ts`
- [ ] 继承 `@wisemapping/mindplot` 的 `PersistenceManager` 抽象类
- [ ] 实现所有必需的抽象方法:
  - `saveMapXml(mapId, mapXml, pref, saveHistory, events)`
  - `loadMapDom(mapId): Promise<Document>`
  - `discardChanges(mapId): void`
  - `unlockMap(mapId): void`

**核心实现要点**:
```typescript
import { PersistenceManager } from '@wisemapping/mindplot';

export class VSCodePersistenceManager extends PersistenceManager {
  constructor(
    private mapId: string,
    private onDocumentChange: (xml: string) => void
  ) {
    super();
  }

  saveMapXml(mapId: string, mapDoc: Document, _pref?: string, _saveHistory?: boolean, events?: any): void {
    // 将 XML 转换为字符串并发送给 VS Code
    const xmlContent = new XMLSerializer().serializeToString(mapDoc);
    console.log('💾 [VSCodePersistenceManager] Saving:', { mapId, xmlLength: xmlContent.length });
    
    // 通过回调直接调用 VS Code 的 postMessage
    this.onDocumentChange(xmlContent);
    
    // 通知保存成功
    events?.onSuccess?.();
  }

  loadMapDom(mapId: string): Promise<Document> {
    // 从初始内容加载或使用默认模板
    const initialContent = window.__INITIAL_DOCUMENT_CONTENT__ || this.getDefaultMapXml();
    console.log('📂 [VSCodePersistenceManager] Loading:', { mapId, hasContent: !!initialContent });
    
    const parser = new DOMParser();
    const document = parser.parseFromString(initialContent, 'text/xml');
    
    return Promise.resolve(document);
  }

  discardChanges(mapId: string): void {
    console.log('🗑️ [VSCodePersistenceManager] Discard changes:', { mapId });
    // VS Code 环境中通常不需要处理，由 Extension 管理
  }

  unlockMap(mapId: string): void {
    console.log('🔓 [VSCodePersistenceManager] Unlock map:', { mapId });
    // VS Code 环境中通常不需要处理，由 Extension 管理
  }

  private getDefaultMapXml(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<map version="tango">
  <topic central="true" text="Central Topic" id="1"/>
</map>`;
  }
}
```

### 1.2 重构主入口文件 (index.ts)
- [ ] 修改 `src/index.ts`
- [ ] 移除现有的全局覆盖逻辑
- [ ] 集成 VSCodePersistenceManager
- [ ] 保持 Bootstrap 接口兼容性
- [ ] 正确处理 mapId 和初始化

**关键重构要点**:
```typescript
declare global {
  interface Window {
    __FAST_MIND_VSCODE_BOOTSTRAP__?: {
      fileName: string;
      mapId: string;
      onChanged: (xml: string) => void;
    };
    __INITIAL_DOCUMENT_CONTENT__?: string;
  }
}

// 检测 VS Code 环境
const isVSCodeEnvironment = !!window.__FAST_MIND_VSCODE_BOOTSTRAP__;

if (isVSCodeEnvironment) {
  console.log('🚀 [Editor-Standalone] VS Code Environment detected');
  
  const bootstrap = window.__FAST_MIND_VSCODE_BOOTSTRAP__;
  if (bootstrap) {
    // 使用 VS Code 专用持久化管理器
    const persistence = new VSCodePersistenceManager(bootstrap.mapId, bootstrap.onChanged);
    
    // 设置全局持久化管理器实例
    PersistenceManager.setInstance(persistence);
    
    // 创建地图信息
    const mapInfo = new MapInfoImpl(
      bootstrap.mapId,
      bootstrap.fileName.split('/').pop()?.replace(/\.fastmind$/, '') || 'Mind Map',
      'User',
      false
    );
    
    // 初始化编辑器
    DesignerOptionsBuilder.initOptions({
      persistence: persistence,
      mapInfo: mapInfo,
      readOnly: false,
      zoom: 0.8,
      mode: EditorRenderMode.DESKTOP
    });
    
    console.log('✅ [Editor-Standalone] VS Code persistence initialized');
  }
} else {
  console.log('🌐 [Editor-Standalone] Standard Web Environment detected');
  // 保持原有的标准 Web 环境逻辑
  const localStoragePersistence = new LocalStorageManager(true);
  const mapInfo = new MapInfoImpl('welcome', 'Welcome', 'wise', false);
  
  DesignerOptionsBuilder.initOptions({
    persistence: localStoragePersistence,
    mapInfo: mapInfo,
    readOnly: false,
    zoom: 0.8,
    mode: EditorRenderMode.DESKTOP
  });
}
```

### 1.3 移除遗留的全局覆盖逻辑
- [ ] 删除现有的 `window.__GLOBAL_PERSISTENCE_MANAGER__` 覆盖代码
- [ ] 清理不必要的全局变量操作
- [ ] 移除 LocalStorageManager 的 VS Code 特定逻辑
- [ ] 简化初始化流程

---

## 优先级 2: 自动保存和状态管理 (P1 - 紧急)

### 2.1 实现自动保存机制
- [ ] 在 VSCodePersistenceManager 中集成防抖保存
- [ ] 监听编辑器变化事件
- [ ] 实现保存队列管理
- [ ] 添加保存优先级处理

**自动保存实现**:
```typescript
export class VSCodePersistenceManager extends PersistenceManager {
  private saveTimer: NodeJS.Timeout | null = null;
  private pendingChanges = false;
  private readonly DEBOUNCE_MS = 1000;
  private isSaving = false;
  private saveQueue: Array<() => void> = [];

  constructor(mapId: string, onDocumentChange: (xml: string) => void) {
    super();
    this.mapId = mapId;
    this.onDocumentChange = onDocumentChange;
  }

  private triggerAutoSave(xmlContent: string): void {
    if (this.isSaving) {
      // 如果正在保存，加入队列
      this.saveQueue.push(() => this.executeSave(xmlContent));
      return;
    }

    this.pendingChanges = true;
    this.scheduleAutoSave(xmlContent);
  }

  private scheduleAutoSave(xmlContent: string): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.executeSave(xmlContent);
    }, this.DEBOUNCE_MS);
  }

  private async executeSave(xmlContent: string): Promise<void> {
    if (!this.pendingChanges || this.isSaving) return;

    this.isSaving = true;
    this.pendingChanges = false;

    try {
      console.log('💾 [AutoSave] Executing save:', { xmlLength: xmlContent.length });
      this.onDocumentChange(xmlContent);
      
      // 处理队列中的保存请求
      if (this.saveQueue.length > 0) {
        const nextSave = this.saveQueue.pop();
        if (nextSave) {
          setTimeout(() => nextSave(), 100); // 小延迟避免过于频繁
        }
      }
    } catch (error) {
      console.error('❌ [AutoSave] Save failed:', error);
      // 重试逻辑
      setTimeout(() => this.triggerAutoSave(xmlContent), 2000);
    } finally {
      this.isSaving = false;
    }
  }
}
```

### 2.2 保存状态反馈
- [ ] 实现保存状态跟踪
- [ ] 添加保存成功/失败回调
- [ ] 实现保存进度指示器
- [ ] 错误重试和用户提示

---

## 优先级 3: 类型安全和错误处理 (P1 - 紧急)

### 3.1 完善 TypeScript 类型定义
- [ ] 定义 VS Code Bootstrap 接口
- [ ] 添加持久化管理器类型
- [ ] 实现错误类型定义
- [ ] 改进函数返回类型

**类型定义**:
```typescript
// src/types/vscode.ts
export interface VSCodeBootstrapConfig {
  fileName: string;
  mapId: string;
  onChanged: (xml: string) => void;
  onSaveStatus?: (status: SaveStatus) => void;
}

export interface SaveStatus {
  isSaving: boolean;
  lastSaved?: Date;
  error?: string;
  success?: boolean;
}

export interface VSCodePersistenceOptions {
  autoSave?: boolean;
  debounceMs?: number;
  retryAttempts?: number;
}
```

### 3.2 错误处理和恢复
- [ ] 实现保存失败重试机制
- [ ] 添加网络错误处理
- [ ] 实现优雅降级
- [ ] 添加错误日志和调试信息

---

## 优先级 4: 测试和验证 (P1 - 紧急)

### 4.1 单元测试
- [ ] VSCodePersistenceManager 单元测试
- [ ] 自动保存机制测试
- [ ] 错误处理测试
- [ ] 边界条件测试

### 4.2 集成测试
- [ ] 与 VS Code Extension 集成测试
- [ ] 端到端保存流程测试
- [ ] 大文件处理测试
- [ ] 并发操作测试

---

## 优先级 5: 性能优化 (P2 - 重要)

### 5.1 保存性能优化
- [ ] 实现增量保存
- [ ] 优化 XML 序列化性能
- [ ] 减少不必要的保存触发
- [ ] 实现保存缓存机制

### 5.2 内存管理
- [ ] 监控内存使用
- [ ] 清理未使用的事件监听器
- [ ] 优化 DOM 操作
- [ ] 实现垃圾回收友好代码

---

## 优先级 6: 清理和文档 (P2 - 重要)

### 6.1 代码清理
- [ ] 移除调试日志和临时代码
- [ ] 统一代码风格
- [ ] 优化导入和依赖
- [ ] 清理注释和文档

### 6.2 文档更新
- [ ] 更新 API 文档
- [ ] 添加使用示例
- [ ] 更新 README
- [ ] 创建迁移指南

---

## 优先级 7: 增强功能 (P3 - 未来)

### 7.1 高级持久化功能
- [ ] 保存历史记录
- [ ] 版本控制集成
- [ ] 冲突解决机制
- [ ] 离线支持

### 7.2 开发者体验
- [ ] 调试工具集成
- [ ] 性能监控
- [ ] 热重载支持
- [ ] 开发者 API

---

## 实施计划

### 第一阶段：核心重构 (1-2天)
1. **创建 VSCodePersistenceManager** (0.5天)
   - 实现基础类结构
   - 实现核心持久化方法
   - 基础测试验证

2. **重构主入口** (0.5天)
   - 修改 index.ts
   - 集成新的持久化管理器
   - 保持向后兼容性

3. **移除遗留代码** (0.5天)
   - 清理全局覆盖逻辑
   - 简化初始化流程
   - 更新类型定义

4. **基础验证** (0.5天)
   - 功能测试
   - 集成测试
   - 问题修复

### 第二阶段：自动保存 (1天)
1. **实现防抖机制** (0.5天)
2. **状态反馈系统** (0.5天)

### 第三阶段：测试和优化 (1天)
1. **完善测试覆盖** (0.5天)
2. **性能优化** (0.5天)

### 第四阶段：清理和文档 (0.5天)
1. **代码清理** (0.25天)
2. **文档更新** (0.25天)

---

## 成功标准

### 功能性要求 ✅
- [ ] 编辑器在 VS Code 环境中正常加载
- [ ] 保存功能可靠工作
- [ ] 自动保存机制有效
- [ ] 错误处理完善

### 性能要求 ✅
- [ ] 保存响应时间 < 100ms
- [ ] 内存使用稳定
- [ ] 大文件 (>1MB) 处理正常
- [ ] 自动频率控制有效

### 质量要求 ✅
- [ ] TypeScript 类型安全
- [ ] 测试覆盖率 > 90%
- [ ] 代码结构清晰
- [ ] 文档完整

---

## 风险评估

### 高风险 🔴
- **数据丢失风险**: 新持久化机制可能导致数据丢失
  - **缓解**: 充分测试，渐进式部署，备份机制

### 中风险 🟡
- **性能回归**: 新机制可能影响编辑性能
  - **缓解**: 性能基准测试，优化关键路径

### 低风险 🟢
- **兼容性问题**: 与现有代码的兼容性
  - **缓解**: 保持接口兼容，渐进式迁移

---

## 相关文件

### 需要创建的文件
```
packages/editor-standalone/src/
├── VSCodePersistenceManager.ts  # 新建
└── types/
    └── vscode.ts               # 类型定义
```

### 需要修改的文件
```
packages/editor-standalone/src/
├── index.ts                    # 主要重构
├── support/
│   └── MapInfoImpl.ts         # 可能需要更新
└── package.json              # 可能需要添加依赖
```

### 需要保持不变的文件
```
packages/editor-standalone/
├── webpack.standalone.js      # 构建配置
├── webpack.dev.standalone.js  # 开发配置
└── template.html             # HTML 模板
```

---

## 调试和验证

### 关键调试点
1. **VSCodePersistenceManager 初始化**
2. **保存事件触发和处理**
3. **自动保存防抖机制**
4. **错误处理和重试**
5. **内存泄漏检查**
6. **性能瓶颈识别**

### 验证步骤
1. 在 VS Code Extension Development Host 中测试
2. 创建和编辑 `.fastmind` 文件
3. 验证保存功能和自动保存
4. 测试错误恢复场景
5. 性能基准测试

---

*最后更新: 2025-01-20*
*负责人: Cline AI Assistant*
*状态: 准备开始实施*
