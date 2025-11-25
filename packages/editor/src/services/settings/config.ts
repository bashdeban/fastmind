/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

export interface SettingsConfig {
  topicGeneratorPrompt?: string;
  explainerPrompt?: string;
}

const STORAGE_KEY = 'wisemapping-settings';

// 默认配置
export const DEFAULT_SETTINGS_CONFIG: SettingsConfig = {
  topicGeneratorPrompt: '',
  explainerPrompt: '',
};

export class SettingsManager {
  /**
   * 获取保存的配置，如果没有则返回默认配置
   */
  static getConfig(): SettingsConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        // 合并默认配置和存储的配置，确保所有字段都存在
        return { ...DEFAULT_SETTINGS_CONFIG, ...parsedConfig };
      }
    } catch (error) {
      console.warn('Failed to load settings config from localStorage:', error);
    }
    return DEFAULT_SETTINGS_CONFIG;
  }

  /**
   * 保存配置到localStorage
   */
  static saveConfig(config: Partial<SettingsConfig>): void {
    try {
      const currentConfig = this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
    } catch (error) {
      console.warn('Failed to save settings config to localStorage:', error);
    }
  }

  /**
   * 获取AI Topic Generator的自定义提示词
   */
  static getTopicGeneratorPrompt(): string {
    const config = this.getConfig();
    return config.topicGeneratorPrompt || '';
  }

  /**
   * 获取AI Explainer的自定义提示词
   */
  static getExplainerPrompt(): string {
    const config = this.getConfig();
    return config.explainerPrompt || '';
  }

  /**
   * 保存自定义提示词
   */
  static savePrompts(
    topicGeneratorPrompt?: string,
    explainerPrompt?: string
  ): void {
    this.saveConfig({
      topicGeneratorPrompt,
      explainerPrompt,
    });
  }

  /**
   * 清除保存的配置
   */
  static clearConfig(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear settings config from localStorage:', error);
    }
  }
}
