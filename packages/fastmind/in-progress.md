# FastMind VS Code Extension 开发计划

## 项目概述

本包实现 VS Code Extension 的 CustomTextEditorProvider，用于编辑 `.fastmind` 文件格式。

## 架构设计

### 包职责
- **packages/fastmind/**: VS Code Extension 集成层
  - 实现 CustomTextEditorProvider
  - 处理文件系统适配
  - 提供双向数据同步
- **packages/editor-standalone/**: 独立可运行版本
  - 浏览器直接访问验证
  - 独立于 Extension 的功能测试

### 依赖关系
```
@wisemapping/editor (核心组件)
├── packages/fastmind (Extension 集成)
├── packages/editor-standalone (独立版本)
└── playground (测试环境)
```

## 开发任务分解

### Phase 1: 基础设施搭建

#### 1.1 创建 fastmind 包结构
- [ ] 创建 `packages/fastmind/package.json`
  - 配置依赖：`@wisemapping/editor`、`@vscode/extension-api`
  - 配置构建脚本：`build:extension`、`dev:extension`
  - 配置激活事件：`onCustomEditor:fastmind.editor`

- [ ] 创建 `packages/fastmind/tsconfig.json`
  - 继承项目根配置
  - 配置编译输出到 `dist/`

- [ ] 创建 `packages/fastmind/webpack.extension.js`
  - 构建配置：将 fastmind 打包到 `dist/`
  - 集成 editor-standalone 构建产物
  - 支持开发和生产模式

#### 1.2 创建 editor-standalone 包结构
- [ ] 创建 `packages/editor-standalone/package.json`
  - 配置依赖：`@wisemapping/editor`
  - 配置构建脚本：`build:standalone`、`serve:standalone`
  - 配置输出：`dist-standalone/`

- [ ] 创建 `packages/editor-standalone/tsconfig.json`
  - 继承项目根配置

- [ ] 创建 `packages/editor-standalone/webpack.standalone.js`
  - 独立构建配置
  - 输出：`dist-standalone/index.html`、`editor-standalone.js`、`editor-standalone.css`
  - 包含所有依赖的 UMD bundle

### Phase 2: 核心 Extension 实现

#### 2.1 CustomTextEditorProvider 实现
- [ ] 创建 `packages/fastmind/src/FastmindEditorProvider.ts`
  - 实现 `CustomTextEditorProvider` 接口
  - `resolveCustomTextEditor`: 渲染 webview
  - `getHtmlForWebview`: 生成 HTML 内容

- [ ] 创建 `packages/fastmind/src/FastmindExtension.ts`
  - Extension 主入口
  - 注册 `CustomTextEditorProvider`
  - 配置 activation 事件

- [ ] 创建 `packages/fastmind/src/types.ts`
  - Extension 相关类型定义
  - Webview 消息类型
  - 编辑器配置接口

#### 2.2 Webview 集成
- [ ] 实现 Webview HTML 模板
  - 加载 fastmind.js 和 fastmind.css
  - 初始化编辑器实例
  - 传入文档内容

- [ ] 实现 Webview 消息处理
  - 接收编辑器更新消息
  - 发送文档变更通知
  - 错误处理和日志

### Phase 3: 数据同步实现

#### 3.1 双向数据同步
- [ ] 实现 Webview → VS Code 同步
  - 监听编辑器内容变更
  - 发送 `updateContent` 消息到 Extension
  - 触发 `WorkspaceEdit` 更新 TextDocument

- [ ] 实现 VS Code → Webview 同步
  - 监听 `onDidChangeTextDocument` 事件
  - 过滤 `.fastmind` 文件变更
  - 发送 `contentChanged` 消息到 Webview

- [ ] 处理同步冲突
  - 防止循环更新
  - 实现防抖机制
  - 错误恢复策略

#### 3.2 默认内容处理
- [ ] 实现空文件检测
  - 在 `resolveCustomTextEditor` 中检查文档内容
  - 调用 `ensureDefaultContent` 方法

- [ ] 实现默认内容生成
  - 从 `welcome.wxml` 读取模板
  - 适配为新文件格式
  - 应用初始编辑器配置

### Phase 4: 构建集成

#### 4.1 构建流程
- [ ] 实现 fastmind 构建脚本
  - 构建 Extension 代码到 `dist/`
  - 复制 editor-standalone 产物到 `dist/`
  - 生成完整的 Extension 资源

- [ ] 实现 editor-standalone 构建脚本
  - 构建 React 应用到 UMD bundle
  - 处理静态资源复制
  - 生成可独立运行的 HTML

#### 4.2 资源管理
- [ ] 复制静态资源
  - 从 playground 复制 `images/` 到 `editor-standalone/src/assets/`
  - 复制 `samples/` 目录
  - 更新资源引用路径

- [ ] 处理样式和主题
  - 集成 Material-UI 样式
  - 支持 VS Code 主题适配
  - 响应式设计

### Phase 5: 测试和验证

#### 5.1 功能测试
- [ ] 单元测试
  - FastmindEditorProvider 测试
  - 数据同步逻辑测试
  - 默认内容处理测试

- [ ] 集成测试
  - Extension 激活测试
  - `.fastmind` 文件编辑测试
  - 双向同步验证

- [ ] 独立版本测试
  - 浏览器兼容性测试
  - 功能完整性验证
  - 性能测试

#### 5.2 开发工作流验证
- [ ] 统一构建流程
  - `yarn build:all` 构建所有变体
  - 验证同步更新机制
  - 测试热重载功能

- [ ] 开发服务器测试
  - Extension 开发模式
  - Standalone 开发服务器
  - 并行开发支持

## 技术要点

### CustomTextEditorProvider 规范
- 使用官方推荐的 `CustomTextEditorProvider` API
- 支持标准文本编辑操作（撤销/重做/保存）
- 正确的激活事件配置

### 文件格式兼容
- XML 格式与现有 `welcome.wxml` 完全一致
- 支持所有 WiseMapping 编辑器功能
- 向后兼容性保证

### 构建策略
- 统一的依赖管理
- 自动化的构建流程
- 清晰的资源组织

## 里程碑

### 里程碑 1: 基础架构（预计 2-3 天）
- 包结构创建完成
- 基础构建配置就绪
- 基本 Extension 框架可运行

### 里程碑 2: 核心功能（预计 3-4 天）
- CustomTextEditorProvider 完整实现
- 双向数据同步工作
- 默认内容处理完成

### 里程碑 3: 完整集成（预计 2-3 天）
- 构建流程完整
- 所有测试通过
- 开发工作流验证

### 里程碑 4: 优化和发布（预计 1-2 天）
- 性能优化
- 文档完善
- 发布准备

## 风险和缓解

### 技术风险
- **Webview 性能**: 使用虚拟化和优化策略
- **同步复杂性**: 实现防抖和错误处理
- **兼容性问题**: 充分的测试覆盖

### 项目风险
- **依赖变更**: 锁定关键依赖版本
- **API 变更**: 关注 VS Code API 更新
- **性能回归**: 建立性能基准测试

## 验收标准

### 功能验收
- [ ] `.fastmind` 文件正确激活 Extension
- [ ] 新建文件自动填充默认内容
- [ ] 编辑操作实时同步到文件
- [ ] 文件外部变更实时反映到编辑器
- [ ] 所有 WiseMapping 编辑器功能可用

### 技术验收
- [ ] 构建流程无错误
- [ ] 所有测试通过
- [ ] 性能指标达标
- [ ] 代码质量符合项目标准

### 集成验收
- [ ] 与 playground 功能一致
- [ ] 独立版本可正常运行
- [ ] Extension 开发流程顺畅
- [ ] 文档完整准确

---

**更新时间**: 2025-01-18  
**负责人**: Cline AI Assistant  
**状态**: 规划完成，待实施确认
