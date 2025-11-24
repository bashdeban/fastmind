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
import { aiTopicGeneratorService } from './ai-topic-generator';

// Mock Topic class for testing
class MockTopic {
  private text: string;
  private parent: MockTopic | null;

  constructor(text: string, parent: MockTopic | null = null) {
    this.text = text;
    this.parent = parent;
  }

  getText(): string {
    return this.text;
  }

  getParent(): MockTopic | null {
    return this.parent;
  }

  getId(): number {
    return Math.floor(Math.random() * 1000);
  }
}

describe('AITopicGeneratorService', () => {
  const service = aiTopicGeneratorService;

  describe('collectParentTopicTexts', () => {
    it('should collect topic path correctly', () => {
      // Create a topic hierarchy: Root → Parent → Child
      const rootTopic = new MockTopic('Root');
      const parentTopic = new MockTopic('Parent', rootTopic);
      const childTopic = new MockTopic('Child', parentTopic);

      // Access private method for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const collectMethod = (service as any).collectParentTopicTexts;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const path = collectMethod.call(service, childTopic as any);

      expect(path).toEqual(['Root', 'Parent', 'Child']);
    });

    it('should handle single topic', () => {
      const singleTopic = new MockTopic('Single Topic');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const collectMethod = (service as any).collectParentTopicTexts;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const path = collectMethod.call(service, singleTopic as any);

      expect(path).toEqual(['Single Topic']);
    });

    it('should filter out empty texts', () => {
      const emptyTopic = new MockTopic('');
      const childTopic = new MockTopic('Child', emptyTopic);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const collectMethod = (service as any).collectParentTopicTexts;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const path = collectMethod.call(service, childTopic as any);

      // Empty topic is filtered out, but the chain is broken at the empty topic
      // So only Child is included since we can't traverse past the empty topic
      expect(path).toEqual(['Child']);
    });
  });

  describe('buildEnhancedPrompt', () => {
    it('should build prompt with hierarchy context', () => {
      const topicPath = ['Root', 'Parent', 'Child'];
      const options = { count: 5 };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buildMethod = (service as any).buildEnhancedPrompt;
      const prompt = buildMethod.call(service, topicPath, options);

      expect(prompt).toContain('Context hierarchy: Root → Parent');
      expect(prompt).toContain('Based on the topic "Child"');
      expect(prompt).toContain('generate 3 to 5 related subtopics');
    });

    it('should handle single topic without hierarchy', () => {
      const topicPath = ['Single Topic'];
      const options = { count: 3 };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buildMethod = (service as any).buildEnhancedPrompt;
      const prompt = buildMethod.call(service, topicPath, options);

      expect(prompt).not.toContain('Context hierarchy:');
      expect(prompt).toContain('Based on the topic "Single Topic"');
      expect(prompt).toContain('generate 3 to 3 related subtopics');
    });

    it('should include custom prompt when provided', () => {
      const topicPath = ['Topic'];
      const options = { count: 2, customPrompt: 'Focus on technology' };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buildMethod = (service as any).buildEnhancedPrompt;
      const prompt = buildMethod.call(service, topicPath, options);

      expect(prompt).toContain('Additional context: Focus on technology');
    });
  });

  describe('parseResponse', () => {
    it('should parse valid JSON response', () => {
      const jsonResponse = '[{"text": "Topic 1"}, {"text": "Topic 2"}, {"text": "Topic 3"}]';
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parseMethod = (service as any).parseResponse;
      const result = parseMethod.call(service, jsonResponse);

      expect(result).toEqual([
        { text: 'Topic 1' },
        { text: 'Topic 2' },
        { text: 'Topic 3' }
      ]);
    });

    it('should extract JSON from mixed response', () => {
      const mixedResponse = 'Here are some topics:\n[{"text": "Topic 1"}, {"text": "Topic 2"}]\nThat\'s all!';
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parseMethod = (service as any).parseResponse;
      const result = parseMethod.call(service, mixedResponse);

      expect(result).toEqual([
        { text: 'Topic 1' },
        { text: 'Topic 2' }
      ]);
    });

    it('should handle numbered list fallback', () => {
      const listResponse = '1. First topic\n2. Second topic\n3. Third topic';
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parseMethod = (service as any).parseResponse;
      const result = parseMethod.call(service, listResponse);

      expect(result).toEqual([
        { text: 'First topic' },
        { text: 'Second topic' },
        { text: 'Third topic' }
      ]);
    });

    it('should handle bullet point fallback', () => {
      const bulletResponse = '- Topic A\n- Topic B\n- Topic C';
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parseMethod = (service as any).parseResponse;
      const result = parseMethod.call(service, bulletResponse);

      expect(result).toEqual([
        { text: 'Topic A' },
        { text: 'Topic B' },
        { text: 'Topic C' }
      ]);
    });
  });
});
