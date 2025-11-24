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
import { AIExplainerOptions } from './ai-explainer';

// Import the class for testing
import { aiExplainerService as serviceInstance } from './ai-explainer';

// Create a test class that extends the service for testing
class TestAIExplainerService {
  private service: typeof serviceInstance;

  constructor() {
    this.service = serviceInstance;
  }

  public testCollectParentTopicTexts(topic: Topic, maxDepth: number = 10): string[] {
    return (this.service as unknown as { collectParentTopicTexts: (topic: Topic, maxDepth: number) => string[] }).collectParentTopicTexts(topic, maxDepth);
  }

  public testBuildAnalysisPrompt(topicPath: string[], options: AIExplainerOptions): string {
    return (this.service as unknown as { buildAnalysisPrompt: (topicPath: string[], options: AIExplainerOptions) => string }).buildAnalysisPrompt(topicPath, options);
  }

  public testProcessAnalysisResponse(response: string, maxLength?: number): string {
    return (this.service as unknown as { processAnalysisResponse: (response: string, maxLength?: number) => string }).processAnalysisResponse(response, maxLength);
  }

  public get llmServiceMock() {
    return (this.service as unknown as { llmService: { generateResponse: jest.Mock } }).llmService;
  }

  public generateAndStoreAnalysis(topic: Topic, designer: Designer): Promise<void> {
    return this.service.generateAndStoreAnalysis(topic, designer);
  }
}
import { Topic } from '@wisemapping/mindplot';
import Designer from '@wisemapping/mindplot/src/components/Designer';

// Mock dependencies
jest.mock('../components/llm-progress-notification/manager', () => ({
  llmProgressManager: {
    createTask: jest.fn().mockReturnValue('test-task-id'),
    updateTaskProgress: jest.fn(),
    completeTask: jest.fn(),
  },
}));

// Mock LLM Service
jest.mock('./llm/LLMService', () => ({
  LLMService: jest.fn().mockImplementation(() => ({
    generateResponse: jest.fn().mockResolvedValue('Test analysis response'),
  })),
}));

// Mock Topic class
const createMockTopic = (text: string, parent: Topic | null = null): Topic => {
  const topic = {
    getText: jest.fn().mockReturnValue(text),
    getParent: jest.fn().mockReturnValue(parent),
    setNoteValue: jest.fn(),
  } as unknown as Topic;
  return topic;
};

// Mock Designer class
const createMockDesigner = (): Designer => {
  return {
    getDesigner: jest.fn(),
  } as unknown as Designer;
};

describe('AIExplainerService', () => {
  let mockTopic: Topic;
  let mockDesigner: Designer;
  let aiService: TestAIExplainerService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTopic = createMockTopic('人工智能');
    mockDesigner = createMockDesigner();
    aiService = new TestAIExplainerService();
  });

  describe('collectParentTopicTexts', () => {
    it('should collect topic path from root to leaf', () => {
      // Create a hierarchy: 祖先 → 父主题 → 人工智能
      const grandParent = createMockTopic('祖先');
      const parent = createMockTopic('父主题', grandParent);
      const child = createMockTopic('人工智能', parent);

      // Use the test service method
      const path = aiService.testCollectParentTopicTexts(child);

      expect(path).toEqual(['祖先', '父主题', '人工智能']);
    });

    it('should handle single topic without parent', () => {
      const singleTopic = createMockTopic('机器学习');

      const path = aiService.testCollectParentTopicTexts(singleTopic);

      expect(path).toEqual(['机器学习']);
    });

    it('should filter out empty or whitespace topics', () => {
      const parent = createMockTopic('   ');
      const child = createMockTopic('深度学习', parent);

      const path = aiService.testCollectParentTopicTexts(child);

      expect(path).toEqual(['深度学习']);
    });

    it('should limit depth to prevent infinite loops', () => {
      // Create a circular reference (shouldn't happen in real code but test safety)
      const grandParent = createMockTopic('根节点');
      const parent = createMockTopic('父节点', grandParent);
      const child = createMockTopic('子节点', parent);
      
      // Simulate circular reference
      (grandParent.getParent as jest.Mock).mockReturnValue(child);

      const path = aiService.testCollectParentTopicTexts(child);

      expect(path.length).toBeLessThanOrEqual(10);
    });
  });

  describe('buildAnalysisPrompt', () => {
    it('should build Chinese prompt for Chinese topic', () => {
      const topicPath = ['科技', '人工智能'];
      const options: AIExplainerOptions = { maxLength: 1500 };

      const prompt = aiService.testBuildAnalysisPrompt(topicPath, options);

      expect(prompt).toContain('主题路径：科技 → 人工智能');
      expect(prompt).toContain('请对主题"人工智能"进行详细分析');
      expect(prompt).toContain('1500字以内');
      expect(prompt).toContain('主题定义和核心概念');
      expect(prompt).toContain('使用与主题相同的语言');
    });

    it('should build English prompt for English topic', () => {
      const topicPath = ['Technology', 'Artificial Intelligence'];
      const options: AIExplainerOptions = { maxLength: 2000 };

      const prompt = aiService.testBuildAnalysisPrompt(topicPath, options);

      expect(prompt).toContain('主题路径：Technology');
      expect(prompt).toContain('请对主题"Artificial Intelligence"进行详细分析');
      expect(prompt).toContain('2000字以内');
      expect(prompt).toContain('Topic definition and core concepts');
      expect(prompt).toContain('使用与主题相同的语言');
    });

    it('should include custom prompt when provided', () => {
      const topicPath = ['科学'];
      const options: AIExplainerOptions = {
        customPrompt: 'Focus on practical applications'
      };

      const prompt = aiService.testBuildAnalysisPrompt(topicPath, options);

      expect(prompt).toContain('额外要求：Focus on practical applications');
    });
  });

  describe('processAnalysisResponse', () => {
    it('should clean and format analysis response', () => {
      const rawResponse = `1. 人工智能是模拟人类智能的技术。

2. 它包括机器学习和深度学习。

3. 应用领域广泛。`;

      const processed = aiService.testProcessAnalysisResponse(rawResponse, 2000);

      expect(processed).toContain('1. 人工智能是模拟人类智能的技术');
      expect(processed).toContain('2. 它包括机器学习和深度学习');
      expect(processed).toContain('3. 应用领域广泛');
    });

    it('should handle response without numbered list', () => {
      const rawResponse = `
        人工智能定义：模拟人类智能的技术。
        
        背景：起源于1950年代。
        
        应用：医疗、金融、交通。
      `;

      const processed = aiService.testProcessAnalysisResponse(rawResponse, 2000);

      expect(processed).toMatch(/1\.\s*人工智能定义：模拟人类智能的技术/);
      expect(processed).toMatch(/2\.\s*背景：起源于1950年代/);
    });

    it('should truncate response if it exceeds max length', () => {
      const longResponse = '1. 第一部分。'.repeat(100); // Create a long response
      const maxLength = 100;

      const processed = aiService.testProcessAnalysisResponse(longResponse, maxLength);

      expect(processed.length).toBeLessThanOrEqual(maxLength);
    });

    it('should truncate at natural sentence break when possible', () => {
      const response = '这是第一句话。这是第二句话。这是第三句话。';
      const maxLength = 8; // Cuts in the middle of first sentence

      const processed = aiService.testProcessAnalysisResponse(response, maxLength);

      expect(processed).toBe('...');
    });

    it('should throw error for invalid response', () => {
      expect(() => aiService.testProcessAnalysisResponse('', 2000)).toThrow('Invalid response from LLM service');
      expect(() => aiService.testProcessAnalysisResponse(null as unknown as string, 2000)).toThrow('Invalid response from LLM service');
    });
  });

  describe('generateAndStoreAnalysis', () => {
    it('should generate and store analysis successfully', async () => {
      const mockAnalysis = '1. 人工智能是模拟人类智能的技术。';
      
      // Mock the LLM service method
      aiService.llmServiceMock.generateResponse.mockResolvedValue(mockAnalysis);

      await aiService.generateAndStoreAnalysis(mockTopic, mockDesigner);

      expect(mockTopic.setNoteValue).toHaveBeenCalledWith(mockAnalysis);
    });

    it('should handle LLM service errors', async () => {
      const error = new Error('LLM service unavailable');
      
      aiService.llmServiceMock.generateResponse.mockRejectedValue(error);

      await expect(
        aiService.generateAndStoreAnalysis(mockTopic, mockDesigner)
      ).rejects.toThrow('LLM service unavailable');

      expect(mockTopic.setNoteValue).not.toHaveBeenCalled();
    });

    it('should handle note storage errors', async () => {
      const mockAnalysis = 'Test analysis';
      
      aiService.llmServiceMock.generateResponse.mockResolvedValue(mockAnalysis);
      
      const storageError = new Error('Storage failed');
      (mockTopic.setNoteValue as jest.Mock).mockImplementation(() => {
        throw storageError;
      });

      await expect(
        aiService.generateAndStoreAnalysis(mockTopic, mockDesigner)
      ).rejects.toThrow('无法将分析结果存储到主题注释中');
    });
  });

  describe('integration test', () => {
    it('should handle complete workflow end-to-end', async () => {
      // Create topic hierarchy
      const root = createMockTopic('技术');
      const parent = createMockTopic('AI技术', root);
      const child = createMockTopic('机器学习', parent);

      // Mock successful LLM response
      const mockAnalysis = `1. 机器学习是人工智能的核心技术。

2. 它通过算法让计算机从数据中学习规律。

3. 主要包括监督学习、无监督学习和强化学习。

4. 广泛应用于图像识别、自然语言处理等领域。`;

      aiService.llmServiceMock.generateResponse.mockResolvedValue(mockAnalysis);

      await aiService.generateAndStoreAnalysis(child, mockDesigner);

      // Verify the analysis was stored
      expect(child.setNoteValue).toHaveBeenCalledWith(mockAnalysis);
      expect(aiService.llmServiceMock.generateResponse).toHaveBeenCalled();

      // Verify progress management was used
      const { llmProgressManager } = jest.requireMock('../components/llm-progress-notification/manager');
      expect(llmProgressManager.createTask).toHaveBeenCalled();
      expect(llmProgressManager.completeTask).toHaveBeenCalledWith('test-task-id', true);
    });
  });
});
