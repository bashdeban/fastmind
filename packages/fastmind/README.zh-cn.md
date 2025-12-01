# FastMind - AI 驱动的 VS Code 思维导图

**FastMind** 是专为开发者打造的 VS Code 原生思维导图扩展。无需离开编辑器，即可进行头脑风暴、设计架构、学习笔记和项目规划。

## 一键创建思维导图
- 创建 `.fastmind` 扩展名的新文件（如 `architecture.fastmind`）
- 自动在沉浸式可视化编辑器中打开
- 流畅直观的操作体验

## 强大的 AI 功能

1. **AI 主题生成器**  
   选择主题 → "AI 生成主题"  
   秒级生成最多 8 个（可自定义）智能、上下文感知的子主题。  
   AI 能理解选定主题、其父级、兄弟节点以及整个导图结构。

2. **AI 解释器**  
   选择任意主题 → "AI 解释主题"  
   获取深度解释、实际应用案例、示例甚至代码片段。  
   长度和重点完全可自定义。

## 支持几乎所有主流 LLM
- OpenAI (gpt-4, gpt-3.5-turbo 等)
- Anthropic Claude (所有模型)
- Azure OpenAI
- 本地模型 (Ollama, LM Studio, llama.cpp - 任何 OpenAI 兼容的端点)
- 任何自定义 OpenAI 兼容的 API

快速配置示例（在 VS Code 设置中设置一次）：
```json
"fastmind.llm": {
  "apiUrl": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  "modelName": "gemini-2.5-flash",
  "apiKey": "AI..."
}
```

## 完美适配开发者工作流
- 纯 XML 格式 → git 友好，可对比，可合并
- 自动保存
- 与代码和 Markdown 文件并存
- 使用本地模型时 100% 离线工作
- 支持 10 种语言

---

[由 WiseMapping 提供支持](http://www.wisemapping.com)
