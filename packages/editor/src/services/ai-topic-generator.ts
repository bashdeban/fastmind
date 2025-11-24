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
import { llmProgressManager } from '../components/llm-progress-notification/manager';
import { LLMService } from './llm/LLMService';
import NodeModel from '@wisemapping/mindplot/src/components/model/NodeModel';
import Designer from '@wisemapping/mindplot/src/components/Designer';
import { Topic } from '@wisemapping/mindplot';

export interface GeneratedTopic {
  text: string;
}

export interface AITopicGeneratorOptions {
  count: number;
  customPrompt?: string;
}

class AITopicGeneratorService {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  /**
   * Generate topics based on a parent topic using LLM
   */
  async generateTopics(
    parentTopic: string,
    options: AITopicGeneratorOptions,
  ): Promise<GeneratedTopic[]> {
    const taskId = llmProgressManager.createTask({
      title: 'AI 生成主题',
      description: `正在基于"${parentTopic}"生成相关主题...`,
    });

    try {
      // Start progress
      llmProgressManager.updateTaskProgress(taskId, 10);

      // Build the prompt
      const prompt = this.buildPrompt(parentTopic, options);
      llmProgressManager.updateTaskProgress(taskId, 30);

      // Generate response from LLM
      const response = await this.llmService.generateResponse(prompt);
      llmProgressManager.updateTaskProgress(taskId, 70);

      // Parse the response
      const topics = this.parseResponse(response);
      llmProgressManager.updateTaskProgress(taskId, 90);

      // Validate and limit topics
      const validTopics = topics
        .filter(topic => topic.text && topic.text.trim().length > 0)
        .slice(0, options.count);

      llmProgressManager.completeTask(taskId, true);
      return validTopics;

    } catch (error) {
      console.error('AI topic generation failed:', error);
      llmProgressManager.completeTask(taskId, false);
      throw error;
    }
  }

  /**
   * Create NodeModel instances from generated topics
   */
  createTopicModels(
    generatedTopics: GeneratedTopic[],
    designer: Designer,
    parentTopicId: number,
  ): NodeModel[] {
    const topicModels: NodeModel[] = [];
    const mindmap = designer.getMindmap();

    // Get layout manager to predict positions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layoutManager = (designer as any)._eventBussDispatcher.getLayoutManager();

    for (let i = 0; i < generatedTopics.length; i++) {
      const topic = generatedTopics[i];
      const nodeModel = mindmap.createNode();
      nodeModel.setText(topic.text.trim());

      // Predict position and order for the new topic
      const prediction = layoutManager.predict(parentTopicId, null, null);
      nodeModel.setOrder(prediction.order);
      nodeModel.setPosition(prediction.position.x, prediction.position.y);

      topicModels.push(nodeModel);
    }

    return topicModels;
  }

  /**
   * Collect all parent topic texts from the selected topic to the root
   * @param topic The selected topic
   * @param maxDepth Maximum traversal depth to prevent infinite loops
   * @returns Array of topic texts from root to selected topic
   */
  private collectParentTopicTexts(topic: Topic, maxDepth: number = 10): string[] {
    const path: string[] = [];
    let current: Topic | null = topic;
    let depth = 0;

    while (current && depth < maxDepth) {
      const text = current.getText();
      if (text && text.trim().length > 0) {
        path.unshift(text.trim()); // Add to beginning to maintain root-to-leaf order
      }
      current = current.getParent();
      depth++;
    }

    return path.filter(text => text && text.trim().length > 0);
  }

  /**
   * Generate topics based on topic path with enhanced context
   */
  async generateTopicsWithContext(
    topicPath: string[],
    options: AITopicGeneratorOptions,
  ): Promise<GeneratedTopic[]> {
    const currentTopic = topicPath[topicPath.length - 1];

    const taskId = llmProgressManager.createTask({
      title: 'AI 生成主题',
      description: `正在基于"${currentTopic}"和上下文路径生成相关主题...`,
    });

    try {
      // Start progress
      llmProgressManager.updateTaskProgress(taskId, 10);

      // Build enhanced prompt with context
      const prompt = this.buildEnhancedPrompt(topicPath, options);
      llmProgressManager.updateTaskProgress(taskId, 30);

      // Generate response from LLM
      const response = await this.llmService.generateResponse(prompt);
      llmProgressManager.updateTaskProgress(taskId, 70);

      // Parse the response
      const topics = this.parseResponse(response);
      llmProgressManager.updateTaskProgress(taskId, 90);

      // Validate and limit topics
      const validTopics = topics
        .filter(topic => topic.text && topic.text.trim().length > 0)
        .slice(0, options.count);

      llmProgressManager.completeTask(taskId, true);
      return validTopics;

    } catch (error) {
      console.error('AI topic generation with context failed:', error);
      llmProgressManager.completeTask(taskId, false);
      throw error;
    }
  }

  /**
   * Build enhanced prompt with topic hierarchy context
   */
  private buildEnhancedPrompt(topicPath: string[], options: AITopicGeneratorOptions): string {
    const currentTopic = topicPath[topicPath.length - 1];
    const parentPath = topicPath.slice(0, -1);

    // Build context hierarchy
    const contextPath = parentPath.length > 0
      ? `Context hierarchy: ${parentPath.join(' → ')}\n`
      : '';

    const enhancedPrompt = `${contextPath}Based on the topic "${currentTopic}" and its context above, generate 3 to ${options.count} related subtopics as a JSON array.

Considerations:
- Subtopics must be concise and brief; use words whenever possible instead of short sentences.
- Write in the same language as the topics
- The number of subtopics is determined flexibly based on relevance and value

Return format: [{"text": "Subtopic 1"}, {"text": "Subtopic 2"}, ...]`;

    if (options.customPrompt && options.customPrompt.trim()) {
      return `${enhancedPrompt}\n\nAdditional context: ${options.customPrompt.trim()}`;
    }

    return enhancedPrompt;
  }

  /**
   * Simplified method: Generate and add topics directly to mindmap
   */
  async generateAndAddTopicsDirectly(
    parentTopic: Topic,
    designer: Designer,
    options: Partial<AITopicGeneratorOptions> = {}
  ): Promise<void> {
    const defaultOptions: AITopicGeneratorOptions = {
      count: 8,
      customPrompt: options.customPrompt
    };

    try {
      // Collect parent topic texts for enhanced context
      const topicPath = this.collectParentTopicTexts(parentTopic);

      // Generate topics with enhanced context (automatically shows progress notification)
      const generatedTopics = await this.generateTopicsWithContext(
        topicPath,
        defaultOptions
      );

      // Create NodeModel instances
      const topicModels = this.createTopicModels(
        generatedTopics,
        designer,
        parentTopic.getId()
      );

      // Add each topic to the mindmap using the correct method
      topicModels.forEach(model => {
        designer.getActionDispatcher().addTopics([model], [parentTopic.getId()]);
      });

    } catch (error) {
      console.error('AI主题生成失败:', error);
      throw error;
    }
  }

  /**
   * Build the prompt for LLM topic generation
   */
  private buildPrompt(parentTopic: string, options: AITopicGeneratorOptions): string {
    const basePrompt = `Based on the topic "${parentTopic}", generate ${options.count} related subtopics as a JSON array.
Each subtopic should be:
- Concise and clear
- Directly relevant to the main topic
- A meaningful expansion or different aspect
- Written in the same language as the main topic

Return format: [{"text": "Subtopic 1"}, {"text": "Subtopic 2"}, ...]`;

    if (options.customPrompt && options.customPrompt.trim()) {
      return `${basePrompt}\n\nAdditional context: ${options.customPrompt.trim()}`;
    }

    return basePrompt;
  }

  /**
   * Parse LLM response into topic array
   */
  private parseResponse(response: string): GeneratedTopic[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Validate structure
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      return parsed
        .filter(item => item && typeof item === 'object' && typeof item.text === 'string')
        .map(item => ({ text: item.text }));

    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      console.error('Response content:', response);

      // Fallback: try to extract bullet points or numbered items
      return this.extractTopicsFromText(response);
    }
  }

  /**
   * Fallback method to extract topics from plain text
   */
  private extractTopicsFromText(text: string): GeneratedTopic[] {
    const topics: GeneratedTopic[] = [];

    // Try different patterns
    const patterns = [
      /^\d+\.\s*(.+)$/gm,  // 1. Topic
      /^-\s*(.+)$/gm,      // - Topic  
      /^\*\s*(.+)$/gm,     // * Topic
      /^•\s*(.+)$/gm,      // • Topic
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        matches.forEach(match => {
          const topicText = match.replace(/^[\d.\-*•]+\s*/, '').trim();
          if (topicText.length > 0) {
            topics.push({ text: topicText });
          }
        });
        break; // Use first successful pattern
      }
    }

    // If no patterns matched, split by newlines and clean up
    if (topics.length === 0) {
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('```') && !line.startsWith('JSON'));

      lines.slice(0, 8).forEach(line => {
        // eslint-disable-next-line no-useless-escape
        const cleanLine = line.replace(/^[\d.\-*•\[\]{},"'']+\s*/, '').trim();
        if (cleanLine.length > 0 && cleanLine.length < 100) {
          topics.push({ text: cleanLine });
        }
      });
    }

    return topics.slice(0, 8); // Limit to 8 topics
  }
}

// Singleton instance
export const aiTopicGeneratorService = new AITopicGeneratorService();
