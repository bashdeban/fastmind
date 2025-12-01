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
import Designer from '@wisemapping/mindplot/src/components/Designer';
import { Topic } from '@wisemapping/mindplot';

export interface AIExplainerOptions {
  maxLength?: number;
  customPrompt?: string;
}

class AIExplainerService {
  /**
   * Generate comprehensive topic analysis and store it in the topic's note
   */
  async generateAndStoreAnalysis(
    topic: Topic,
    designer: Designer,
    options: Partial<AIExplainerOptions> = {}
  ): Promise<void> {
    // Get custom prompt from localStorage
    const customPrompt = SettingsManager.getExplainerPrompt();

    const defaultOptions: AIExplainerOptions = {
      maxLength: 2000,
      customPrompt: customPrompt || options.customPrompt
    };

    try {
      // Collect parent topic texts for enhanced context
      const topicPath = this.collectParentTopicTexts(topic);

      // Generate analysis with progress notification
      const analysis = await this.generateTopicAnalysis(topicPath, defaultOptions);

      // Store the analysis in the topic's note
      this.storeAnalysisToNote(topic, analysis);

    } catch (error) {
      console.error('AI Explainer analysis failed.:', error);
      throw error;
    }
  }

  /**
   * Generate topic analysis based on topic path with enhanced context
   */
  async generateTopicAnalysis(
    topicPath: string[],
    options: AIExplainerOptions,
  ): Promise<string> {
    const currentTopic = topicPath[topicPath.length - 1];

    const taskId = llmProgressManager.createTask({
      titleKey: 'llm.task.ai-explainer.title',
      descriptionKey: 'llm.task.ai-explainer.description',
      descriptionValues: { currentTopic },
    });

    try {
      // Start progress
      llmProgressManager.updateTaskProgress(taskId, 10);

      // Build enhanced prompt with context
      const prompt = this.buildAnalysisPrompt(topicPath, options);
      llmProgressManager.updateTaskProgress(taskId, 30);

      // Generate response from LLM using current configuration
      const llmService = new LLMService(LLMConfigManager.getConfig());
      const response = await llmService.generateResponse(prompt);
      llmProgressManager.updateTaskProgress(taskId, 70);

      // Process and validate the response
      const analysis = this.processAnalysisResponse(response, options.maxLength);
      llmProgressManager.updateTaskProgress(taskId, 90);

      llmProgressManager.completeTask(taskId, true);
      return analysis;

    } catch (error) {
      console.error('AI analysis generation failed:', error);
      llmProgressManager.completeTask(taskId, false);
      throw error;
    }
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
   * Build enhanced prompt for topic analysis with hierarchy context
   */
  private buildAnalysisPrompt(topicPath: string[], options: AIExplainerOptions): string {
    const currentTopic = topicPath[topicPath.length - 1];
    const parentPath = topicPath.slice(0, -1);

    // Build context hierarchy
    const contextPath = parentPath.length > 0
      ? `Context hierarchy:"${parentPath.join(' → ')}",\n`
      : ``;

    const enhancedPrompt = `${contextPath}Based on the topic "${currentTopic}" and its context above,
    Write a well-structured Markdown explanation that meets the following requirements (within 1000 characters):

- Start with a concise summary paragraph that clearly conveys the topic's definition, scope, and importance within 30 seconds of reading.
- Provide a clear and professional explanation suitable for readers with basic domain knowledge
- List key concepts/components in a systematic manner. 
- Ensure logical flow and clean organization.
- Write in the same language as the topics`;

    if (options.customPrompt && options.customPrompt.trim()) {
      return `${enhancedPrompt}\n\nAdditional considerations:${options.customPrompt.trim()}`;
    }

    return enhancedPrompt;
  }

  /**
   * Process and validate the analysis response
   */
  private processAnalysisResponse(response: string, maxLength?: number): string {
    // Clean up the response
    if (!response || typeof response !== 'string') {
      throw new Error('Invalid response from LLM service');
    }

    let analysis = response.trim();

    // Apply length limit if specified
    if (maxLength && analysis.length > maxLength) {
      // Try to cut at a natural break point
      const truncated = analysis.substring(0, maxLength - 50); // Leave room for ellipsis
      const lastSentenceEnd = Math.max(
        truncated.lastIndexOf('。'),
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('！'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf('？'),
        truncated.lastIndexOf('?')
      );

      if (lastSentenceEnd > maxLength * 0.8) {
        analysis = truncated.substring(0, lastSentenceEnd + 1);
      } else {
        analysis = truncated + '...';
      }
    }

    return analysis.trim();
  }

  /**
   * Store analysis result in the topic's note
   */
  private storeAnalysisToNote(topic: Topic, analysis: string): void {
    try {
      // Set the analysis as the topic's note
      topic.setNoteValue(analysis);
    } catch (error) {
      console.error('Failed to store analysis to topic note:', error);
      throw new Error('Unable to store analysis results in topic annotations.');
    }
  }
}

// Singleton instance
export const aiExplainerService = new AIExplainerService();
