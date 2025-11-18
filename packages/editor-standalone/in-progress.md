# Editor-Standalone 独立版本开发计划

## 项目概述

本包创建 WiseMapping 编辑器的独立可运行版本，支持浏览器直接访问，用于功能验证和测试。

## 架构设计

### 包职责
- **packages/editor-standalone/**: 独立可运行版本
  - 迁移 playground/editor.tsx 核心逻辑
  - 创建可独立部署的 HTML 应用
  - 提供浏览器直接访问验证

### 与其他包的关系
```
@wisemapping/editor (核心组件)
├── packages/editor-standalone (独立版本)
├── packages/fastmind (Extension 集成)
└── playground (开发测试)
```

## 开发任务分解

### Phase 1: 基础设施搭建

#### 1.1 包结构创建
- [ ] 创建 `packages/editor-standalone/package.json`
  - 配置依赖：`@wisemapping/editor`、`@wisemapping/mindplot`、`@wisemapping/web2d`
  - 配置构建脚本：`build:standalone`、`serve:standalone`
  - 配置浏览器兼容性支持

- [ ] 创建 `packages/editor-standalone/tsconfig.json`
  - 继承项目根 TypeScript 配置
  - 配置编译输出到 `dist-standalone/`
  - 启用 JSX 和 React 支持

- [ ] 创建 `packages/editor-standalone/webpack.standalone.js`
  - 生产构建配置：UMD 格式输出
  - 包含所有依赖的单文件打包
  - 支持开发和生产模式

#### 1.2 Webpack 配置细节
- [ ] 配置入口点
  - `src/index.ts`: 主应用入口
  - `src/template.html`: HTML 模板
  - 支持热重载开发

- [ ] 配置输出优化
  - 代码分割和压缩
  - 静态资源处理
  - Source Map 支持

- [ ] 配置开发服务器
  - 热重载支持
  - 错误覆盖页面
  - 开发工具集成

### Phase 2: 核心功能迁移

#### 2.1 迁移 Editor 逻辑
- [ ] 创建 `packages/editor-standalone/src/index.ts`
  - 迁移 `playground/editor.tsx` 的核心逻辑
  - 适配为独立运行环境
  - 保持与 playground 功能一致

- [ ] 创建 `packages/editor-standalone/src/template.html`
  - 独立可运行的 HTML 模板
  - 加载构建后的 JS/CSS 资源
  - 支持浏览器直接访问

- [ ] 实现 React 应用初始化
  - 使用 `createRoot` 渲染
  - 集成 `@wisemapping/editor` 组件
  - 处理应用生命周期

#### 2.2 支持文件适配
- [ ] 创建 `packages/editor-standalone/src/support/MapInfoImpl.ts`
  - 从 playground 复制并适配
  - 支持独立环境的数据管理
  - 模拟文档信息接口

- [ ] 创建 `packages/editor-standalone/src/support/MockThemeVariantStorage.ts`
  - 从 playground 复制主题存储逻辑
  - 适配为本地存储
  - 支持主题切换功能

- [ ] 创建 `packages/editor-standalone/src/support/LocalStorageManager.ts`
  - 独立环境的文件管理
  - 支持本地数据持久化
  - 与 Extension 环境区分

### Phase 3: 资源和样式管理

#### 3.1 静态资源处理
- [ ] 复制图片资源
  - 从 `playground/map-render/images/` 复制到 `src/assets/images/`
  - 更新资源引用路径
  - 支持相对路径访问

- [ ] 复制示例文件
  - 从 `playground/map-render/samples/` 复制到 `src/assets/samples/`
  - 包含 `welcome.wxml` 等示例
  - 支持文件加载功能

- [ ] 处理样式文件
  - 集成 Material-UI 样式
  - 支持 CSS 变量和主题
  - 响应式设计适配

#### 3.2 构建资源集成
- [ ] 配置资源复制
  - Webpack CopyPlugin 配置
  - 生产环境资源优化
  - 开发环境资源热重载

- [ ] 配置样式处理
  - CSS 提取和优化
  - 支持 PostCSS 处理
  - 自动浏览器兼容性

### Phase 4: 构建和部署

#### 4.1 构建流程
- [ ] 实现生产构建
  - UMD 格式输出
  - 代码压缩和优化
  - 生成 `dist-standalone/` 目录

- [ ] 实现开发构建
  - 支持热重载
  - Source Map 生成
  - 错误诊断支持

- [ ] 配置文件输出
  - `index.html`: 可直接访问的主页面
  - `editor-standalone.js`: 打包后的应用逻辑
  - `editor-standalone.css`: 打包后的样式

#### 4.2 部署准备
- [ ] 创建访问脚本
  - 简单的 HTTP 服务器启动
  - 自动打开浏览器功能
  - 多平台兼容性

- [ ] 验证独立性
  - 测试无服务器运行
  - 验证所有资源加载
  - 检查功能完整性

### Phase 5: 测试和优化

#### 5.1 功能测试
- [ ] 单元测试
  - React 组件测试
  - 工具函数测试
  - 集成逻辑测试

- [ ] 集成测试
  - 端到端功能测试
  - 浏览器兼容性测试
  - 性能基准测试

- [ ] 用户场景测试
  - 新建文档测试
  - 编辑功能测试
  - 保存和加载测试

#### 5.2 性能优化
- [ ] 代码分割优化
  - 按需加载模块
  - 减少初始包大小
  - 缓存策略实现

- [ ] 运行时优化
  - React 性能优化
  - 内存使用监控
  - 渲染性能优化

## 技术要点

### 构建策略
- **UMD 格式**: 支持多种模块系统
- **单文件打包**: 简化部署和使用
- **资源内联**: 减少网络请求
- **开发热重载**: 提高开发效率

### 兼容性
- **现代浏览器**: Chrome、Firefox、Safari、Edge 支持
- **移动端**: 基础响应式支持
- **Node.js**: 支持服务器端渲染（可选）

### 性能目标
- **初始加载**: < 3 秒完成页面加载
- **交互响应**: < 100ms 用户操作响应
- **内存使用**: < 100MB 运行时内存
- **包大小**: < 5MB 压缩后大小

## 里程碑

### 里程碑 1: 基础迁移（预计 2 天）
- 包结构创建完成
- playground 逻辑成功迁移
- 基础独立版本可运行

### 里程碑 2: 功能完整（预计 2 天）
- 所有支持文件适配完成
- 资源管理正确
- 构建流程正常

### 里程碑 3: 测试验证（预计 1 天）
- 所有测试通过
- 性能指标达标
- 浏览器兼容性验证

### 里程碑 4: 优化完成（预计 1 天）
- 性能优化完成
- 文档完善
- 发布准备就绪

## 验收标准

### 功能验收
- [ ] 可以直接打开 `dist-standalone/index.html`
- [ ] 所有 WiseMapping 编辑器功能正常
- [ ] 与 playground 功能完全一致
- [ ] 资源加载无错误

### 技术验收
- [ ] 构建过程无错误
- [ ] 代码质量符合项目标准
- [ ] 性能指标达标
- [ ] 浏览器兼容性良好

### 部署验收
- [ ] 支持无服务器运行
- [ ] 资源路径正确
- [ ] 可以集成到其他项目
- [ ] 文档和示例完整

---

**更新时间**: 2025-01-18  
**负责人**: Cline AI Assistant  
**状态**: 规划完成，待实施确认
