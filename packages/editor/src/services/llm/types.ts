export interface LLMConfig {
  apiUrl: string;
  modelName: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  model?: string;
}

export interface LLMServiceInterface {
  generateResponse(prompt: string): Promise<string>;
  generateResponseWithConfig(prompt: string, config?: Partial<LLMConfig>): Promise<string>;
  testConnection(): Promise<boolean>;
}

export interface LLMError {
  message: string;
  status?: number;
  code?: string;
}
