import { LLMConfig } from './types';

const STORAGE_KEY = 'wisemapping-llm-config';

// 默认配置 - 从现有LLM测试组件提取
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  apiUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  modelName: 'gemini-2.5-flash',
  apiKey: 'AIzaSyAvUCRHMOQJIuQoTyda9UTki4Rv4adeu7w.HTJcOFe52F7EYU3S',
  temperature: 0.7,
  maxTokens: 3000,
};

export class LLMConfigManager {
  /**
   * 获取保存的配置，如果没有则返回默认配置
   */
  static getConfig(): LLMConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        // 合并默认配置和存储的配置，确保所有字段都存在
        return { ...DEFAULT_LLM_CONFIG, ...parsedConfig };
      }
    } catch (error) {
      console.warn('Failed to load LLM config from localStorage:', error);
    }
    return DEFAULT_LLM_CONFIG;
  }

  /**
   * 保存配置到localStorage
   */
  static saveConfig(config: Partial<LLMConfig>): void {
    try {
      const currentConfig = this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
    } catch (error) {
      console.warn('Failed to save LLM config to localStorage:', error);
    }
  }

  /**
   * 清除保存的配置
   */
  static clearConfig(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear LLM config from localStorage:', error);
    }
  }

  /**
   * 合并配置：传入配置 > 存储配置 > 默认配置
   */
  static mergeConfig(config?: Partial<LLMConfig>): LLMConfig {
    const baseConfig = this.getConfig();
    return config ? { ...baseConfig, ...config } : baseConfig;
  }
}
