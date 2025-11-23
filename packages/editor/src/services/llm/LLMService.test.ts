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

import { LLMService } from './LLMService';
import { LLMConfig } from './types';
import { DEFAULT_LLM_CONFIG } from './config';

// Mock fetch for testing
global.fetch = jest.fn();

describe('LLMService', () => {
  let llmService: LLMService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    // Clear localStorage before each test
    localStorage.clear();
    llmService = new LLMService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Clear localStorage after each test
    localStorage.clear();
  });

  describe('constructor', () => {
    it('should create service with default config', () => {
      const service = new LLMService();
      const config = service.getConfig();
      
      expect(config.apiUrl).toBe(DEFAULT_LLM_CONFIG.apiUrl);
      expect(config.modelName).toBe(DEFAULT_LLM_CONFIG.modelName);
      expect(config.temperature).toBe(DEFAULT_LLM_CONFIG.temperature);
      expect(config.maxTokens).toBe(DEFAULT_LLM_CONFIG.maxTokens);
    });

    it('should create service with custom config', () => {
      const customConfig: Partial<LLMConfig> = {
        modelName: 'gpt-4',
        temperature: 0.5,
        maxTokens: 2000,
      };
      
      const service = new LLMService(customConfig);
      const config = service.getConfig();
      
      expect(config.modelName).toBe('gpt-4');
      expect(config.temperature).toBe(0.5);
      expect(config.maxTokens).toBe(2000);
      // Should still have default values for unspecified properties
      expect(config.apiUrl).toBe(DEFAULT_LLM_CONFIG.apiUrl);
    });
  });

  describe('updateConfig', () => {
    it('should update service configuration', () => {
      const newConfig: Partial<LLMConfig> = {
        modelName: 'gpt-4', // Use different model to avoid conflicts
        temperature: 0.5,
      };
      
      llmService.updateConfig(newConfig);
      const config = llmService.getConfig();
      
      expect(config.modelName).toBe('gpt-4');
      expect(config.temperature).toBe(0.5);
      // Other properties should remain unchanged
      expect(config.apiUrl).toBe(DEFAULT_LLM_CONFIG.apiUrl);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the config', () => {
      const config1 = llmService.getConfig();
      const config2 = llmService.getConfig();
      
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Should be different objects
    });
  });

  describe('generateResponse', () => {
    it('should generate response using default config', async () => {
      // Clear all mocks before creating fresh service
      jest.clearAllMocks();
      
      // Create a fresh service instance to ensure default config
      const freshService = new LLMService();
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Test response',
              },
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        }),
      } as unknown as Response;
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await freshService.generateResponse('Test prompt');
      
      expect(result).toBe('Test response');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        DEFAULT_LLM_CONFIG.apiUrl,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEFAULT_LLM_CONFIG.apiKey}`,
          }),
          body: expect.stringContaining('"model":"gemini-2.5-flash"'),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({
          error: {
            message: 'Invalid API key',
          },
        }),
      } as unknown as Response;
      
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(llmService.generateResponse('Test prompt')).rejects.toThrow(
        'HTTP 401: Unauthorized - Invalid API key'
      );
    });
  });

  describe('generateResponseWithConfig', () => {
    it('should generate response using custom config', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Custom response',
              },
            },
          ],
        }),
      } as unknown as Response;
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const customConfig: Partial<LLMConfig> = {
        modelName: 'gpt-4',
        temperature: 0.5,
      };
      
      const result = await llmService.generateResponseWithConfig('Test prompt', customConfig);
      
      expect(result).toBe('Custom response');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"model":"gpt-4"'),
        })
      );
    });
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Connection test successful',
              },
            },
          ],
        }),
      } as unknown as Response;
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await llmService.testConnection();
      
      expect(result).toBe(true);
    });

    it('should return false for failed connection', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response;
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await llmService.testConnection();
      
      expect(result).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      await expect(llmService.generateResponse('Test prompt')).rejects.toThrow(
        'Cannot connect to LLM service. Please check your network connection and API configuration.'
      );
    });

    it('should handle 404 errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response;
      
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(llmService.generateResponse('Test prompt')).rejects.toThrow(
        'The specified model was not found. Please check the model name and availability.'
      );
    });

    it('should handle rate limit errors', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response;
      
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(llmService.generateResponse('Test prompt')).rejects.toThrow(
        'LLM API rate limit exceeded. Please try again later.'
      );
    });

    it('should handle token limit errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({
          error: {
            message: 'Too many tokens',
          },
        }),
      } as unknown as Response;
      
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(llmService.generateResponse('Test prompt')).rejects.toThrow(
        'The prompt or response exceeds the token limit. Please reduce the content length.'
      );
    });
  });
});
