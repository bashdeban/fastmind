# FastMind VS Code Extension - 构建和打包指南

## 概述

FastMind 是一个 VS Code 扩展，提供 AI 驱动的思维导图功能。本文档说明如何构建和打包该扩展。

## 前置要求

- Node.js >= 18.0.0
- Yarn (推荐) 或 npm
- VS Code (用于测试)

## 构建流程

### 1. 完整构建和打包

在项目根目录执行：

```bash
# 一键构建和打包
yarn build-and-package:fastmind
```

这个命令会：
1. 构建 `@wisemapping/editor-standalone` 依赖
2. 构建 `fastmind` 扩展
3. 打包生成 `.vsix` 文件

### 2. 分步构建

如果需要分步执行：

```bash
# 步骤 1: 构建依赖
yarn workspace @wisemapping/editor-standalone build

# 步骤 2: 构建扩展
yarn workspace fastmind build

# 步骤 3: 打包扩展
yarn workspace fastmind package
```

### 3. 开发模式

```bash
# 监听模式构建（开发用）
yarn workspace fastmind dev
```

## 输出文件

- **构建产物**: `packages/fastmind/dist/`
- **扩展包**: `packages/fastmind/fastmind-0.1.0.vsix`
- **包大小**: ~820KB (包含所有必要的依赖)

## 发布到 VS Code 市场

### 1. 安装发布工具

```bash
yarn workspace fastmind add -D @vscode/vsce
```

### 2. 登录 VS Code 市场

```bash
yarn workspace fastmind vsce login
```

### 3. 发布扩展

```bash
yarn workspace fastmind vsce publish
```

## 本地测试

### 1. 安装扩展

```bash
code --install-extension packages/fastmind/fastmind-0.1.0.vsix
```

### 2. 测试功能

1. 打开 VS Code
2. 创建或打开 `.fastmind` 文件
3. 测试思维导图编辑功能

## 故障排除

### 常见问题

1. **包过大**: 检查 `.vscodeignore` 文件是否正确配置
2. **构建失败**: 确保依赖项已正确安装 (`yarn install`)
3. **扩展无法加载**: 检查 `package.json` 中的 `main` 和 `contributes` 配置

### 清理构建

```bash
# 清理所有构建产物
yarn workspace fastmind clean

# 或清理整个工作空间
yarn clean
```

## 项目结构

```
packages/fastmind/
├── src/                    # 源代码
│   ├── extension.ts        # 扩展入口
│   ├── FastmindEditorProvider.ts
│   └── types.ts
├── dist/                   # 构建产物
├── webpack.extension.js    # Webpack 配置
├── package.json           # 扩展配置
├── .vscodeignore          # 打包排除规则
├── LICENSE                # 许可证
└── sample.fastmind        # 示例文件
```

## 依赖关系

- `@wisemapping/editor-standalone`: 提供核心编辑器功能
- `@wisemapping/mindplot`: 思维导图引擎
- `@wisemapping/web2d`: 2D 图形渲染

## 注意事项

1. 构建 fastmind 前必须先构建 `editor-standalone`
2. 使用 `yarn workspace` 命令确保正确的依赖解析
3. `.vscodeignore` 文件对控制包大小至关重要
4. 发布前确保 `package.json` 中的版本号已更新
