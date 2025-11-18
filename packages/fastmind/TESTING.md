# FastMind VS Code Extension 测试指南

## 🚀 快速测试

### 1. 构建 Extension
```bash
cd packages/fastmind
yarn build:extension
```

### 2. 在 VS Code 中测试
1. 打开 VS Code
2. 按 `F5` 或运行 `Debug: Start Debugging` 
3. 选择 `Run Extension Development Host`
4. 在新的 VS Code 窗口中：
   - 打开 `packages/fastmind/sample.fastmind` 文件
   - 应该看到 WiseMapping 编辑器界面

### 3. 创建新文件测试
1. 在 Extension Development Host 中创建新的 `.fastmind` 文件
2. 应该自动打开 WiseMapping 编辑器
3. 验证编辑器功能正常

## 📁 目录结构

```
packages/fastmind/
├── dist/                          # 完整的 Extension 输出
│   ├── extension.js              # Extension 主代码
│   ├── editor-standalone.js      # WiseMapping 编辑器
│   ├── assets/                   # 静态资源
│   ├── index.html                # HTML 模板
│   └── package.json              # Extension 配置
├── src/                          # 源代码
├── webpack.extension.js          # 构建配置
├── sample.fastmind              # 测试文件
└── TESTING.md                   # 本文档
```

## 🔍 验证要点

### 基础功能
- [ ] `.fastmind` 文件自动关联到 Extension
- [ ] 编辑器界面正常显示
- [ ] 示例文件内容正确加载
- [ ] 新建文件显示默认内容

### 编辑器功能
- [ ] 节点可以正常编辑
- [ ] 添加/删除节点功能
- [ ] 拖拽移动节点
- [ ] 缩放功能

### 阶段二功能（待实现）
- [ ] 文件保存功能
- [ ] 双向数据同步
- [ ] 撤销/重做功能

## 🐛 常见问题

### Extension 无法加载
1. 确保已运行 `yarn build:extension`
2. 检查 `dist/package.json` 是否存在
3. 验证 VS Code 版本 >= 1.85.0
4. 检查 `engines.vscode` 格式是否正确（应为具体版本号，如 "1.85.0"）

### 编辑器显示异常
1. 检查 `dist/assets/` 目录是否存在
2. 验证 `editor-standalone.js` 是否正确生成
3. 检查浏览器控制台错误信息

### 文件关联问题
1. 确认文件扩展名为 `.fastmind`
2. 检查 `dist/package.json` 中的 `customEditors` 配置

## 📝 测试步骤

1. **环境准备**
   ```bash
   yarn build:extension
   ```

2. **启动调试**
   - 在 VS Code 中打开 `packages/fastmind/` 目录
   - 按 `F5` 启动 Extension Development Host

3. **功能测试**
   - 打开 `sample.fastmind`
   - 创建新的 `.fastmind` 文件
   - 测试编辑器基础功能

4. **问题记录**
   - 记录任何异常行为
   - 检查 VS Code 开发者控制台
   - 查看浏览器控制台错误

## 🎯 下一步计划

当前完成阶段一（基础显示），接下来：

1. **阶段二**: 实现数据交互和同步
2. **阶段三**: 优化和完善功能

---

**更新时间**: 2025-01-18  
**状态**: ✅ VS Code Extension 配置已修复，可以正常调试

## 🔧 最新修复

### 问题解决
- ✅ 修复了 `engines.vscode` 格式问题
- ✅ 修复了 VS Code 版本兼容性问题（更新为 `^1.106.0`）
- ✅ 在 `packages/fastmind/package.json` 中添加了完整的 VS Code Extension 配置
- ✅ 确保了 `dist/package.json` 正确生成和版本一致
- ✅ Extension 现在可以在 VS Code 1.106.0 中正常加载和调试

### 配置文件
- **开发配置**: `packages/fastmind/package.json` - 包含完整的 Extension 元数据
- **运行时配置**: `packages/fastmind/dist/package.json` - Extension 运行时需要
- **调试配置**: `.vscode/launch.json` - 已正确配置指向 `packages/fastmind`
