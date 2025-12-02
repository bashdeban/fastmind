/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically Apache License, Version 2.0 (the "License") plus the
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
import { LLMConfigManager } from './llm/config';
import { SettingsManager } from './settings/config';
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
  /**
   * Generate topics based on a parent topic using LLM
   * @deprecated Use generateTopicsWithContext for better context-aware generation
   */
  async generateTopics(
    parentTopic: string,
    options: AITopicGeneratorOptions,
  ): Promise<GeneratedTopic[]> {
    // Delegate to enhanced context-aware method with single topic path
    return this.generateTopicsWithContext([parentTopic], options);
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

      // Predict position and order for new topic
      const prediction = layoutManager.predict(parentTopicId, null, null);
      nodeModel.setOrder(prediction.order);
      nodeModel.setPosition(prediction.position.x, prediction.position.y);

      topicModels.push(nodeModel);
    }

    return topicModels;
  }

  /**
   * Collect all parent topic texts from selected topic to root
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
   * Collect all child topic texts from selected topic
   * @param topic The selected topic
   * @returns Array of child topic texts
   */
  private collectChildTopicTexts(topic: Topic): string[] {
    const childTopics: string[] = [];

    try {
      const children = topic.getChildren();
      if (children && children.length > 0) {
        children.forEach(child => {
          const text = child.getText();
          if (text && text.trim().length > 0) {
            childTopics.push(text.trim());
          }
        });
      }
    } catch (error) {
      console.warn('Failed to collect child topics:', error);
    }

    return childTopics;
  }

  /**
   * Generate topics based on topic path with enhanced context
   */
  async generateTopicsWithContext(
    topicPath: string[],
    options: AITopicGeneratorOptions,
    parentTopic?: Topic,
  ): Promise<GeneratedTopic[]> {
    const currentTopic = topicPath[topicPath.length - 1];

    const taskId = llmProgressManager.createTask({
      titleKey: 'llm.task.generate-topics.title',
      descriptionKey: 'llm.task.generate-topics.description',
      descriptionValues: { currentTopic },
    });

    try {
      // Start progress
      llmProgressManager.updateTaskProgress(taskId, 10);

      // Build enhanced prompt with context
      const prompt = this.buildEnhancedPrompt(topicPath, options, parentTopic);
      llmProgressManager.updateTaskProgress(taskId, 30);

      // Generate response from LLM using current configuration
      const llmService = new LLMService(LLMConfigManager.getConfig());
      const response = await llmService.generateResponse(prompt);
      llmProgressManager.updateTaskProgress(taskId, 70);

      // Parse response
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
  private buildEnhancedPrompt(topicPath: string[], options: AITopicGeneratorOptions, parentTopic?: Topic): string {
    const currentTopic = topicPath[topicPath.length - 1];
    const parentPath = topicPath.slice(0, -1);

    // Build context hierarchy
    const contextPath = parentPath.length > 0
      ? `Context hierarchy: ${parentPath.join(' → ')}\n`
      : '';

    // Add existing child topics for deduplication if parentTopic is provided
    let existingTopicsText = '';
    if (parentTopic) {
      const existingChildTopics = this.collectChildTopicTexts(parentTopic);
      if (existingChildTopics.length > 0) {
        existingTopicsText = `- Avoid duplicating any existing subtopics mentioned \nExisting subtopics to avoid duplication: ${existingChildTopics.join(', ')}`;
      }
    }

    const enhancedPrompt = `${contextPath}Based on the topic "${currentTopic}" and its context above, generate 3 to ${options.count} related subtopics as a JSON array.

Considerations:
- Subtopics must be concise and brief; use words whenever possible instead of short sentences.
- Write in the same language as topics
- The number of subtopics is determined flexibly based on relevance and value
${existingTopicsText}

Return format: [{"text": "Subtopic 1"}, {"text": "Subtopic 2"}, ...]`;

    if (options.customPrompt && options.customPrompt.trim()) {
      return `${enhancedPrompt}\n\nAdditional considerations: ${options.customPrompt.trim()}`;
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
    // Get custom prompt and deduplication setting from localStorage
    const customPrompt = SettingsManager.getTopicGeneratorPrompt();
    const deduplicationEnabled = SettingsManager.getDeduplicationEnabled();

    const defaultOptions: AITopicGeneratorOptions = {
      count: 8,
      customPrompt: customPrompt || options.customPrompt
    };

    try {
      // Collect parent topic texts for enhanced context
      const topicPath = this.collectParentTopicTexts(parentTopic);

      // Generate topics with enhanced context (automatically shows progress notification)
      const generatedTopics = await this.generateTopicsWithContext(
        topicPath,
        defaultOptions,
        deduplicationEnabled ? parentTopic : undefined
      );

      // Create NodeModel instances
      const topicModels = this.createTopicModels(
        generatedTopics,
        designer,
        parentTopic.getId()
      );

      // Add each topic to mindmap using correct method
      topicModels.forEach(model => {
        designer.getActionDispatcher().addTopics([model], [parentTopic.getId()]);
      });

    } catch (error) {
      console.error('AI generation failed:', error);
      throw error;
    }
  }


  /**
   * Parse LLM response into topic array
   */
  private parseResponse(response: string): GeneratedTopic[] {
    try {
      //Remove all thinking tags
      response = response.replace(/<[^\/> ]+>[\s\S]*?<\/[^> ]+>/gi, '').trim();
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
