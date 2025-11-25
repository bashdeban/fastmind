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

import { LLMConfig } from './types';

const CONFIG_LIST_STORAGE_KEY = 'llm-config-list';

export class LLMConfigListManager {
  /**
   * 获取所有保存的配置列表
   */
  static getConfigList(): LLMConfig[] {
    try {
      const stored = localStorage.getItem(CONFIG_LIST_STORAGE_KEY);
      if (stored) {
        const parsedList = JSON.parse(stored);
        if (Array.isArray(parsedList)) {
          return parsedList;
        }
      }
    } catch (error) {
      console.warn('Failed to load LLM config list from localStorage:', error);
    }
    return [];
  }

  /**
   * 保存配置到列表中（以 modelName 为 key，自动去重）
   */
  static saveToList(config: LLMConfig): void {
    try {
      const currentList = this.getConfigList();

      // 查找是否已存在相同 modelName 的配置
      const existingIndex = currentList.findIndex(
        (item) => item.modelName === config.modelName
      );

      let updatedList: LLMConfig[];

      if (existingIndex !== -1) {
        // 如果存在，替换现有配置
        updatedList = [...currentList];
        updatedList[existingIndex] = config;
      } else {
        // 如果不存在，添加到列表末尾
        updatedList = [...currentList, config];
      }

      localStorage.setItem(CONFIG_LIST_STORAGE_KEY, JSON.stringify(updatedList));
      console.log('✅ Config saved to list:', config.modelName);
    } catch (error) {
      console.error('Failed to save config to list:', error);
      throw new Error('Failed to save configuration to storage');
    }
  }

  /**
   * 从列表中删除配置
   */
  static removeFromList(modelName: string): void {
    try {
      const currentList = this.getConfigList();
      const updatedList = currentList.filter((item) => item.modelName !== modelName);

      localStorage.setItem(CONFIG_LIST_STORAGE_KEY, JSON.stringify(updatedList));
      console.log('🗑️ Config removed from list:', modelName);
    } catch (error) {
      console.error('Failed to remove config from list:', error);
      throw new Error('Failed to remove configuration from storage');
    }
  }

  /**
   * 清空配置列表
   */
  static clearList(): void {
    try {
      localStorage.removeItem(CONFIG_LIST_STORAGE_KEY);
      console.log('🗑️ All configs cleared from list');
    } catch (error) {
      console.error('Failed to clear config list:', error);
      throw new Error('Failed to clear configuration list');
    }
  }

  /**
   * 检查配置是否已存在于列表中
   */
  static hasConfig(modelName: string): boolean {
    const currentList = this.getConfigList();
    return currentList.some((item) => item.modelName === modelName);
  }

  /**
   * 根据 modelName 获取特定配置
   */
  static getConfigByModelName(modelName: string): LLMConfig | undefined {
    const currentList = this.getConfigList();
    return currentList.find((item) => item.modelName === modelName);
  }
}
