# 自定义AI提示词功能

## 功能概述

此功能允许用户在Settings对话框中自定义AI Topic Generator和AI Explainer的提示词，并将这些自定义提示词保存到localStorage中。

## 实现的文件

### 1. Settings服务 (`src/services/settings/config.ts`)
- 提供统一的配置管理
- 支持保存和读取自定义提示词到localStorage
- 提供默认值和错误处理

### 2. Settings对话框更新 (`src/components/action-widget/pane/settings-dialog/index.tsx`)
- 添加了两个新的输入字段用于自定义提示词
- 集成SettingsManager进行配置管理
- 保持与现有设置的兼容性

### 3. AI服务调用更新
- AI Topic Generator对话框 (`src/components/action-widget/pane/ai-topic-generator/index.tsx`)
- Editor工具栏配置 (`src/components/editor-toolbar/configBuilder.tsx`)
- 都已更新为使用SettingsManager中的自定义提示词

## 使用方法

### 1. 设置自定义提示词
1. 打开Settings对话框
2. 在"AI Topic Generator Prompt"字段中输入自定义提示词
3. 在"AI Explainer Prompt"字段中输入自定义提示词
4. 点击"保存"按钮

### 2. 使用自定义提示词
- 点击AI Topic Generator按钮时，将使用保存的自定义提示词
- 点击AI Explainer按钮时，将使用保存的自定义提示词
- 如果没有设置自定义提示词，将使用默认行为

## API文档

### SettingsManager类

#### `savePrompts(topicPrompt: string, explainerPrompt: string): void`
保存两个提示词到localStorage

#### `getConfig(): AISettings`
读取当前配置，如果不存在则返回默认值

#### `getTopicGeneratorPrompt(): string`
获取Topic Generator的自定义提示词

#### `getExplainerPrompt(): string`
获取Explainer的自定义提示词

### AISettings接口
```typescript
interface AISettings {
  topicGeneratorPrompt: string;
  explainerPrompt: string;
}
```

## localStorage存储格式

配置以JSON格式存储在localStorage中，键名为`wisemapping-settings`：

```json
{
  "topicGeneratorPrompt": "自定义主题生成提示词",
  "explainerPrompt": "自定义解释器提示词"
}
```

## 测试

运行以下命令测试SettingsManager功能：
```bash
npx jest src/services/settings/__tests__/config.test.ts
```

## 兼容性

- 与现有的AI功能完全兼容
- 不影响现有的LLM配置
- 向后兼容，不会破坏现有功能
