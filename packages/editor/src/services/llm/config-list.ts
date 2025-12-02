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
import { LLMConfigManager } from './config';

const CONFIG_LIST_STORAGE_KEY = 'llm-config-list';

export class LLMConfigListManager {
  /**
   * Get a list of all saved configurations
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
   * Save the configuration to a list (using modelName as the key, automatically removing duplicates)
   */
  static saveToList(config: LLMConfig): void {
    try {
      const currentList = this.getConfigList();

      const existingIndex = currentList.findIndex(
        (item) => item.modelName === config.modelName
      );

      let updatedList: LLMConfig[];

      if (existingIndex !== -1) {
        // Replace the existing configuration if it exists
        updatedList = [...currentList];
        updatedList[existingIndex] = config;
      } else {
        // If it does not exist, add it to the end of the list
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
   * Remove configuration from list
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
   * Clear configuration list
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
   * Check if the configuration already exists in the list
   */
  static hasConfig(modelName: string): boolean {
    const currentList = this.getConfigList();
    return currentList.some((item) => item.modelName === modelName);
  }

  /**
   * Retrieve specific configuration based on modelName
   */
  static getConfigByModelName(modelName: string): LLMConfig | undefined {
    const currentList = this.getConfigList();
    return currentList.find((item) => item.modelName === modelName);
  }

  /**
   * Smart config saving: Automatically set as current if it’s the only configuration
   * @param config Configuration to be saved
   * @returns
   */
  static saveWithAutoActivation(config: LLMConfig): boolean {
    try {
      // 1. Save to list
      this.saveToList(config);

      // 2. Check if there is a valid configuration
      const currentConfig = LLMConfigManager.getConfig();
      const hasValidConfig = LLMConfigManager.isConfigValid(currentConfig);

      if (!hasValidConfig) {
        // No valid config found — this one will be auto-activated
        LLMConfigManager.saveConfig(config);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to save configuration with auto activation:', error);
      throw error;
    }
  }
}
