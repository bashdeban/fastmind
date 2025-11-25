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

import { SettingsManager } from '../config';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SettingsManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('savePrompts', () => {
    it('should save prompts to localStorage', () => {
      const topicPrompt = 'Custom topic prompt';
      const explainerPrompt = 'Custom explainer prompt';

      SettingsManager.savePrompts(topicPrompt, explainerPrompt);

      const savedConfig = JSON.parse(localStorageMock.getItem('wisemapping-settings') || '{}');
      expect(savedConfig.topicGeneratorPrompt).toBe(topicPrompt);
      expect(savedConfig.explainerPrompt).toBe(explainerPrompt);
    });

    it('should save empty prompts', () => {
      SettingsManager.savePrompts('', '');

      const savedConfig = JSON.parse(localStorageMock.getItem('wisemapping-settings') || '{}');
      expect(savedConfig.topicGeneratorPrompt).toBe('');
      expect(savedConfig.explainerPrompt).toBe('');
    });
  });

  describe('getConfig', () => {
    it('should return default config when no saved config exists', () => {
      const config = SettingsManager.getConfig();

      expect(config).toEqual({
        topicGeneratorPrompt: '',
        explainerPrompt: '',
      });
    });

    it('should return saved config', () => {
      const testConfig = {
        topicGeneratorPrompt: 'Test topic prompt',
        explainerPrompt: 'Test explainer prompt',
      };

      localStorageMock.setItem('wisemapping-settings', JSON.stringify(testConfig));

      const config = SettingsManager.getConfig();

      expect(config).toEqual(testConfig);
    });

    it('should return partial config with defaults', () => {
      const partialConfig = {
        topicGeneratorPrompt: 'Only topic prompt',
      };

      localStorageMock.setItem('wisemapping-settings', JSON.stringify(partialConfig));

      const config = SettingsManager.getConfig();

      expect(config.topicGeneratorPrompt).toBe('Only topic prompt');
      expect(config.explainerPrompt).toBe('');
    });
  });

  describe('getTopicGeneratorPrompt', () => {
    it('should return topic generator prompt', () => {
      SettingsManager.savePrompts('Test topic prompt', 'Test explainer prompt');

      const prompt = SettingsManager.getTopicGeneratorPrompt();

      expect(prompt).toBe('Test topic prompt');
    });

    it('should return empty string when no prompt saved', () => {
      const prompt = SettingsManager.getTopicGeneratorPrompt();

      expect(prompt).toBe('');
    });
  });

  describe('getExplainerPrompt', () => {
    it('should return explainer prompt', () => {
      SettingsManager.savePrompts('Test topic prompt', 'Test explainer prompt');

      const prompt = SettingsManager.getExplainerPrompt();

      expect(prompt).toBe('Test explainer prompt');
    });

    it('should return empty string when no prompt saved', () => {
      const prompt = SettingsManager.getExplainerPrompt();

      expect(prompt).toBe('');
    });
  });
});
