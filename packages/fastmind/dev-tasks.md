# FastMind VS Code Extension - Development Tasks

## 项目概述

重构 VS Code Extension 的数据交换方式，从当前的零侵入全局注入方案改为基于 VSCodePersistenceManager 的直接通信方案，解决保存功能失败问题。

## 核心目标

### 主要问题
- **保存失败**: 从 editor 保存一直失败，无法获取保存事件
- **数据交换不稳定**: 当前的 LocalStorageManager + 全局覆盖方案不可靠
- **事件捕获问题**: onContentChanged 回调未被正确触发

### 解决方案
创建专用的 `VSCodePersistenceManager` 类，直接处理 VS Code Extension 的 postMessage 通信，实现可靠的双向数据同步。

---

## 优先级 1: 核心架构重构 (P0 - 立即执行)

### 1.1 创建 VSCodePersistenceManager
- [ ] 实现 `packages/editor-standalone/src/VSCodePersistenceManager.ts`
- [ ] 继承 `PersistenceManager` 抽象类
- [ ] 实现专用的 postMessage 通信
- [ ] 添加自动保存机制（防抖）
- [ ] 错误处理和重试逻辑

**技术要点**:
```typescript
class VSCodePersistenceManager extends PersistenceManager {
  constructor(
    private mapId: string,
    private onDocumentChange: (xml: string) => void
  ) {
    super();
  }
  
  saveMapXml(mapId: string, mapDoc: Document, pref?, saveHistory?, events?): void {
    const xmlContent = new XMLSerializer().serializeToString(mapDoc);
    this.onDocumentChange(xmlContent);
    events?.onSuccess?.();
  }
}
```

### 1.2 重构 editor-standalone 主入口
- [ ] 修改 `packages/editor-standalone/src/index.ts`
- [ ] 移除现有的全局覆盖逻辑
- [ ] 集成 VSCodePersistenceManager
- [ ] 保持 Bootstrap 接口兼容性
- [ ] 正确处理 mapId（从文件名生成）

**关键变更**:
```typescript
// 替换 LocalStorageManager
const bootstrap = window.__FAST_MIND_VSCODE_BOOTSTRAP__;
if (bootstrap) {
  const persistence = new VSCodePersistenceManager(bootstrap.mapId, bootstrap.onChanged);
  // 其余逻辑保持不变
}
```

### 1.3 更新 FastmindEditorProvider
- [ ] 保持现有的 webview 配置和 CSP 设置不变
- [ ] 保持 Bootstrap 注入方式不变
- [ ] 优化消息处理逻辑
- [ ] 添加保存状态反馈机制

**保持不变的部分**:
- ✅ Webview CSP 配置
- ✅ HTML 模板结构  
- ✅ Bootstrap 全局变量注入
- ✅ 基础消息处理

---

## 优先级 2: 自动保存和用户体验 (P1 - 紧急)

### 2.1 实现自动保存机制
- [ ] 基于用户操作的保存触发器
- [ ] 防抖机制（1秒延迟，避免频繁保存）
- [ ] 保存状态指示器 UI
- [ ] 保存队列和优先级处理

**技术实现**:
```typescript
class AutoSaveManager {
  private saveTimer: NodeJS.Timeout | null = null;
  private pendingChanges = false;
  private readonly DEBOUNCE_MS = 1000;
  
  triggerSave() {
    this.pendingChanges = true;
    this.scheduleSave();
  }
  
  private scheduleSave() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.executeSave(), this.DEBOUNCE_MS);
  }
}
```

### 2.2 保存状态反馈
- [ ] 实现保存状态指示器
- [ ] 成功/失败状态显示
- [ ] 保存进度反馈
- [ ] 错误重试提示

---

## 优先级 3: 测试和验证 (P1 - 紧急)

### 3.1 端到端测试
- [ ] 测试编辑器加载功能
- [ ] 测试节点编辑和保存
- [ ] 测试自动保存机制
- [ ] 测试错误恢复场景
- [ ] 验证文件同步正确性

### 3.2 性能验证
- [ ] 内存泄漏检查
- [ ] 保存操作性能测试
- [ ] 大文件处理验证
- [ ] 并发操作测试

---

## 优先级 4: 清理和优化 (P2 - 重要)

### 4.1 移除遗留代码
- [ ] 清理现有的全局覆盖逻辑
- [ ] 移除 LocalStorageManager 依赖
- [ ] 删除不必要的调试代码
- [ ] 更新注释和文档

### 4.2 代码质量提升
- [ ] 添加 TypeScript 类型定义
- [ ] 改进错误处理
- [ ] 优化日志输出
- [ ] 代码重构和简化

---

## 优先级 5: 增强功能 (P3 - 未来)

### 5.1 高级功能
- [ ] 保存历史记录
- [ ] 冲突解决机制
- [ ] 实时协作支持准备
- [ ] 插件化架构

### 5.2 开发体验
- [ ] 调试工具增强
- [ ] 开发者文档
- [ ] 单元测试覆盖
- [ ] 集成测试自动化

---

## 实施计划

### 阶段一：核心重构 (1-2天)
1. 创建 VSCodePersistenceManager
2. 重构 editor-standalone 入口
3. 基础功能验证

### 阶段二：自动保存 (1天)
1. 实现防抖保存机制
2. 添加状态反馈
3. 用户体验测试

### 阶段三：测试验证 (1天)
1. 端到端测试
2. 性能验证
3. 错误场景测试

### 阶段四：清理优化 (0.5天)
1. 移除遗留代码
2. 代码质量提升
3. 文档更新

---

## 成功标准

### 核心功能 ✅
- [ ] 编辑器正常加载和显示
- [ ] 编辑操作正常响应
- [ ] 保存功能可靠工作
- [ ] 自动保存机制有效

### 用户体验 ✅
- [ ] 保存状态清晰可见
- [ ] 错误恢复友好
- [ ] 性能响应流畅
- [ ] 操作直观简单

### 技术质量 ✅
- [ ] 代码结构清晰
- [ ] 类型安全完整
- [ ] 错误处理完善
- [ ] 测试覆盖充分

---

## 风险评估

### 高风险 🔴
- **数据丢失风险**: 新保存机制可能引入数据丢失
  - **缓解措施**: 充分的测试，渐进式部署

### 中风险 🟡  
- **性能回归**: 新机制可能影响编辑性能
  - **缓解措施**: 性能基准测试，优化关键路径

### 低风险 🟢
- **兼容性问题**: VS Code 版本兼容性
  - **缓解措施**: 版本检查，优雅降级

---

## 相关文件

### 需要修改的文件
```
packages/editor-standalone/src/
├── index.ts                    # 主入口重构
├── VSCodePersistenceManager.ts  # 新建
└── support/
    └── MapInfoImpl.ts         # 可能需要更新

packages/fastmind/src/
├── FastmindEditorProvider.ts   # 消息处理优化
└── extension.ts              # 可能需要更新
```

### 需要保持不变的文件
```
packages/fastmind/src/
├── FastmindEditorProvider.ts   # Webview 配置和 CSP
├── package.json              # 依赖配置
└── webpack.extension.js       # 构建配置
```

---

## 调试和验证

### 调试点
1. **VSCodePersistenceManager 初始化**
2. **保存事件触发**
3. **postMessage 发送**
4. **Extension 端消息接收**
5. **文档更新操作**
6. **自动保存防抖**
7. **错误处理路径**

### 验证步骤
1. 在 VS Code Extension Development Host 中测试
2. 创建新 `.fastmind` 文件并编辑
3. 验证保存功能正常工作
4. 测试自动保存机制
5. 验证错误恢复场景

---

*最后更新: 2025-01-20*
*负责人: Cline AI Assistant*
*状态: 准备开始实施*
