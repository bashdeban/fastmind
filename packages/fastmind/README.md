# FastMind - AI-Powered Mind Mapping for VS Code

**FastMind** is a native VS Code mind mapping extension built for developers. Brainstorm, design architectures, take study notes, and plan projects without ever leaving your editor.

## Create a Mind Map in One Click
- Create a new file with the `.fastmind` extension (e.g., `architecture.fastmind`)
- It automatically opens in the immersive visual editor
- Double-click to add topics  
  Drag & drop to reorganize  
  Scroll to zoom  
  Delete key to remove  
  Smooth and intuitive

## Powerful AI Features (right-click any topic)

1. **AI Topic Generator**  
   Select a topic → “AI Generate Topics”  
   Instantly generates up to 8 (customizable) smart, context-aware subtopics in seconds.  
   The AI understands the selected topic, its parent, siblings, and your entire map structure.

2. **AI Explainer**  
   Select any topic → “AI Explain Topic”  
   Get in-depth explanations, real-world applications, examples, and even code snippets.  
   Fully customizable length and focus.

## Supports Almost Every Major LLM (one-line config to switch)
- OpenAI (gpt-4, gpt-3.5-turbo, etc.)
- Anthropic Claude (all models)
- Azure OpenAI
- Local models (Ollama, LM Studio, llama.cpp - any OpenAI-compatible endpoint)
- Any custom OpenAI-compatible API

Quick config example (set once in VS Code settings):
```json
"fastmind.llm": {
  "apiUrl": "https://api.openai.com/v1/chat/completions",
  "modelName": "gpt-4",
  "apiKey": "sk-..."
}
```

## Perfectly Fits Developer Workflows
- Pure XML format → git-friendly, diffable, mergeable
- Auto-save
- Lives alongside your code and Markdown files
- Works 100% offline with local models