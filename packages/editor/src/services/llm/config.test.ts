/**
 * @jest-environment jsdom
 */

import { LLMConfigManager, DEFAULT_LLM_CONFIG } from './config';
import { $notify } from '@wisemapping/mindplot';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock $notify
jest.mock('@wisemapping/mindplot', () => ({
  $notify: jest.fn(),
}));

const mockNotify = $notify as jest.MockedFunction<typeof $notify>;

describe('LLMConfigManager', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    mockNotify.mockClear();
  });

  describe('isConfigValid', () => {
    it('should return false for empty config', () => {
      expect(LLMConfigManager.isConfigValid(DEFAULT_LLM_CONFIG)).toBe(false);
    });

    it('should return false when apiUrl is missing', () => {
      const config = { ...DEFAULT_LLM_CONFIG, modelName: 'test', apiKey: 'key' };
      expect(LLMConfigManager.isConfigValid(config)).toBe(false);
    });

    it('should return false when modelName is missing', () => {
      const config = { ...DEFAULT_LLM_CONFIG, apiUrl: 'http://test.com', apiKey: 'key' };
      expect(LLMConfigManager.isConfigValid(config)).toBe(false);
    });

    it('should return false when apiKey is missing', () => {
      const config = { ...DEFAULT_LLM_CONFIG, apiUrl: 'http://test.com', modelName: 'test' };
      expect(LLMConfigManager.isConfigValid(config)).toBe(false);
    });

    it('should return true when all required fields are present', () => {
      const config = { 
        ...DEFAULT_LLM_CONFIG, 
        apiUrl: 'http://test.com', 
        modelName: 'test', 
        apiKey: 'key' 
      };
      expect(LLMConfigManager.isConfigValid(config)).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('should show notification when no stored config exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const config = LLMConfigManager.getConfig();
      
      expect(config).toEqual(DEFAULT_LLM_CONFIG);
      expect(mockNotify).toHaveBeenCalledWith(
        'LLM配置缺失：请配置模型API地址、模型名称和API密钥以使用AI功能'
      );
    });

    it('should show notification when stored config is invalid', () => {
      const invalidConfig = { apiUrl: '', modelName: '', apiKey: '' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidConfig));
      
      const config = LLMConfigManager.getConfig();
      
      expect(config).toEqual({ ...DEFAULT_LLM_CONFIG, ...invalidConfig });
      expect(mockNotify).toHaveBeenCalledWith(
        'LLM配置缺失：请配置模型API地址、模型名称和API密钥以使用AI功能'
      );
    });

    it('should not show notification when stored config is valid', () => {
      const validConfig = { 
        apiUrl: 'http://test.com', 
        modelName: 'gpt-3.5-turbo', 
        apiKey: 'test-key',
        temperature: 0.7,
        maxTokens: 3000
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(validConfig));
      
      const config = LLMConfigManager.getConfig();
      
      expect(config).toEqual(validConfig);
      expect(mockNotify).not.toHaveBeenCalled();
    });

    it('should merge with default config', () => {
      const partialConfig = { apiUrl: 'http://test.com' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(partialConfig));
      
      const config = LLMConfigManager.getConfig();
      
      expect(config).toEqual({ ...DEFAULT_LLM_CONFIG, ...partialConfig });
      expect(mockNotify).toHaveBeenCalled();
    });
  });

  describe('validateAndNotify', () => {
    it('should return false and show notification for invalid config', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = LLMConfigManager.validateAndNotify();
      
      expect(result).toBe(false);
      expect(mockNotify).toHaveBeenCalledWith(
        'LLM配置缺失：请配置模型API地址、模型名称和API密钥以使用AI功能'
      );
    });

    it('should return true for valid config', () => {
      const validConfig = { 
        apiUrl: 'http://test.com', 
        modelName: 'gpt-3.5-turbo', 
        apiKey: 'test-key',
        temperature: 0.7,
        maxTokens: 3000
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(validConfig));
      
      const result = LLMConfigManager.validateAndNotify();
      
      expect(result).toBe(true);
      expect(mockNotify).not.toHaveBeenCalled();
    });
  });
});
