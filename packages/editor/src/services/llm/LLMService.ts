import { LLMConfig, LLMResponse, LLMServiceInterface } from './types';
import { LLMConfigManager } from './config';

export class LLMService implements LLMServiceInterface {
  private config: LLMConfig;

  constructor(config?: Partial<LLMConfig>) {
    this.config = LLMConfigManager.mergeConfig(config);
  }

  /**
   * 简单调用接口 - 只需提示词，使用默认配置
   */
  async generateResponse(prompt: string): Promise<string> {
    return this.generateResponseWithConfig(prompt);
  }

  /**
   * 带配置的调用接口
   */
  async generateResponseWithConfig(prompt: string, config?: Partial<LLMConfig>): Promise<string> {
    const finalConfig = LLMConfigManager.mergeConfig(config);
    
    console.log('🚀 Starting LLM request...');
    console.log('📋 Configuration:', {
      ...finalConfig,
      apiKey: finalConfig.apiKey ? '[REDACTED]' : '[MISSING]',
      timestamp: new Date().toISOString()
    });
    console.log('📝 Prompt:', prompt);

    const startTime = Date.now();

    try {
      const response = await this.makeAPIRequest(prompt, finalConfig);
      
      const endTime = Date.now();
      console.log('✅ Response received successfully!');
      console.log('⏱️ Response time:', `${endTime - startTime}ms`);
      console.log('🤖 LLM Response:', response.content);
      console.log('📊 Usage metadata:', response.usage);

      return response.content;
    } catch (error) {
      const errorMessage = this.handleError(error);
      console.error('❌ LLM Request Failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing LLM connection...');
      await this.generateResponseWithConfig('test');
      console.log('✅ Connection test successful!');
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LLMConfig>): void {
    this.config = LLMConfigManager.mergeConfig(config);
    LLMConfigManager.saveConfig(config);
  }

  /**
   * 获取当前配置
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }

  /**
   * 发送API请求
   */
  private async makeAPIRequest(prompt: string, config: LLMConfig): Promise<LLMResponse> {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.modelName,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await this.parseErrorResponse(response);
      throw new Error(`HTTP ${response.status}: ${response.statusText}${errorData ? ` - ${errorData}` : ''}`);
    }

    const data = await response.json();
    
    // 解析响应数据
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Invalid response format: missing content');
    }

    return {
      content,
      usage: data.usage,
      model: data.model,
    };
  }

  /**
   * 解析错误响应
   */
  private async parseErrorResponse(response: Response): Promise<string | null> {
    try {
      const data = await response.json();
      return data.error?.message || data.message || null;
    } catch {
      return null;
    }
  }

  /**
   * 处理错误并返回用户友好的错误消息
   */
  private handleError(error: unknown): string {
    if (error instanceof Error) {
      // 网络连接错误 - 返回特定的错误消息
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
        return 'Cannot connect to LLM service. Please check your network connection and API configuration.';
      }

      // 直接的网络错误（如 "Network error"）
      if (error.message === 'Network error') {
        return 'Cannot connect to LLM service. Please check your network connection and API configuration.';
      }

      // 服务器未找到
      if (error.message.includes('ENOTFOUND')) {
        return 'LLM server not found. Please check if the API address is correct and accessible.';
      }

      // HTTP 401 错误 - 直接返回原始错误消息
      if (error.message.includes('HTTP 401: Unauthorized')) {
        return 'HTTP 401: Unauthorized - Invalid API key';
      }

      // 认证错误
      if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('API key')) {
        return 'LLM API key is invalid or missing. Please check your API key configuration.';
      }

      // HTTP 404 错误
      if (error.message.includes('HTTP 404: Not Found')) {
        return 'The specified model was not found. Please check the model name and availability.';
      }

      // 模型不存在
      if (error.message.includes('404') || error.message.includes('model')) {
        return 'The specified model was not found. Please check the model name and availability.';
      }

      // HTTP 429 错误
      if (error.message.includes('HTTP 429: Too Many Requests')) {
        return 'LLM API rate limit exceeded. Please try again later.';
      }

      // 速率限制
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return 'LLM API rate limit exceeded. Please try again later.';
      }

      // HTTP 400 token 错误
      if (error.message.includes('HTTP 400: Bad Request - Too many tokens')) {
        return 'The prompt or response exceeds the token limit. Please reduce the content length.';
      }

      // 令牌限制
      if (error.message.includes('token') && error.message.includes('too')) {
        return 'The prompt or response exceeds the token limit. Please reduce the content length.';
      }

      return error.message;
    }

    return 'An unexpected error occurred while processing your request. Please try again.';
  }
}
