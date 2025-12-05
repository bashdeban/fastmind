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

import { PromptManager } from './prompt-manager';

describe('PromptManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Template Management', () => {
    test('should save and retrieve templates', () => {
      const template = {
        name: 'Test Template',
        content: 'Test content',
        selected: false
      };

      const savedTemplate = PromptManager.saveTemplate('topic-generator', template);
      expect(savedTemplate).toBeDefined();
      expect(savedTemplate.name).toBe(template.name);
      expect(savedTemplate.content).toBe(template.content);

      const templates = PromptManager.getTemplates('topic-generator');
      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe(template.name);
    });

    test('should toggle template selection', () => {
      const template = {
        name: 'Test Template',
        content: 'Test content',
        selected: false
      };

      const savedTemplate = PromptManager.saveTemplate('topic-generator', template);
      
      // Toggle to active
      PromptManager.toggleTemplate('topic-generator', savedTemplate.id);
      let activeTemplates = PromptManager.getActiveTemplates('topic-generator');
      expect(activeTemplates).toHaveLength(1);
      expect(activeTemplates[0].selected).toBe(true);

      // Toggle to inactive
      PromptManager.toggleTemplate('topic-generator', savedTemplate.id);
      activeTemplates = PromptManager.getActiveTemplates('topic-generator');
      expect(activeTemplates).toHaveLength(0);
    });

    test('should combine active templates content', () => {
      const template1 = {
        name: 'Template 1',
        content: 'Content 1',
        selected: true
      };

      const template2 = {
        name: 'Template 2',
        content: 'Content 2',
        selected: true
      };

      PromptManager.saveTemplate('topic-generator', template1);
      PromptManager.saveTemplate('topic-generator', template2);

      const combinedContent = PromptManager.getCombinedActiveContent('topic-generator');
      expect(combinedContent).toBe('Content 1\n\nContent 2');
    });

    test('should handle multiple activation', () => {
      const template1 = {
        name: 'Template 1',
        content: 'Content 1',
        selected: true
      };

      const template2 = {
        name: 'Template 2',
        content: 'Content 2',
        selected: true
      };

      const template3 = {
        name: 'Template 3',
        content: 'Content 3',
        selected: true
      };

      PromptManager.saveTemplate('topic-generator', template1);
      PromptManager.saveTemplate('topic-generator', template2);
      PromptManager.saveTemplate('topic-generator', template3);

      const activeTemplates = PromptManager.getActiveTemplates('topic-generator');
      expect(activeTemplates).toHaveLength(3);
      
      const combinedContent = PromptManager.getCombinedActiveContent('topic-generator');
      expect(combinedContent).toBe('Content 1\n\nContent 2\n\nContent 3');
    });

    test('should delete templates', () => {
      const template = {
        name: 'Test Template',
        content: 'Test content',
        selected: true
      };

      const savedTemplate = PromptManager.saveTemplate('topic-generator', template);
      expect(PromptManager.getTemplates('topic-generator')).toHaveLength(1);

      PromptManager.deleteTemplate('topic-generator', savedTemplate.id);
      expect(PromptManager.getTemplates('topic-generator')).toHaveLength(0);
      expect(PromptManager.getActiveTemplates('topic-generator')).toHaveLength(0);
    });

    test('should update templates', () => {
      const template = {
        name: 'Original Name',
        content: 'Original content',
        selected: true
      };

      const savedTemplate = PromptManager.saveTemplate('topic-generator', template);
      
      const updatedTemplate = PromptManager.updateTemplate('topic-generator', savedTemplate.id, {
        name: 'Updated Name',
        content: 'Updated content'
      });

      expect(updatedTemplate).not.toBeNull();
      expect(updatedTemplate!.name).toBe('Updated Name');
      expect(updatedTemplate!.content).toBe('Updated content');
      expect(updatedTemplate!.selected).toBe(true); // Selection should be preserved
    });
  });

  describe('Data Migration', () => {
    test('should migrate existing prompts', () => {
      // Simulate old format data using the correct structure and key
      const oldData = {
        topicGeneratorPrompt: 'Old custom prompt',
        topicGeneratorTemplates: [],
        explainerPrompt: '',
        explainerTemplates: []
      };
      localStorage.setItem('fastmind-settings', JSON.stringify(oldData));

      // Run migration
      PromptManager.migrateExistingPrompts();

      // Check if migration created a template
      const templates = PromptManager.getTemplates('topic-generator');
      expect(templates.length).toBeGreaterThan(0);
      
      const migratedTemplate = templates.find(t => t.name === 'Default');
      expect(migratedTemplate).toBeDefined();
      expect(migratedTemplate?.content).toBe('Old custom prompt');
    });

    test('should not migrate if no old data exists', () => {
      // Ensure no old data
      localStorage.removeItem('ai_prompt_settings');

      // Run migration
      PromptManager.migrateExistingPrompts();

      // Should not create any templates
      const templates = PromptManager.getTemplates('topic-generator');
      expect(templates.length).toBe(0);
    });
  });

  describe('Type Separation', () => {
    test('should keep different types separate', () => {
      const topicTemplate = {
        name: 'Topic Template',
        content: 'Topic content',
        selected: true
      };

      const explainerTemplate = {
        name: 'Explainer Template',
        content: 'Explainer content',
        selected: true
      };

      PromptManager.saveTemplate('topic-generator', topicTemplate);
      PromptManager.saveTemplate('explainer', explainerTemplate);

      const topicTemplates = PromptManager.getTemplates('topic-generator');
      const explainerTemplates = PromptManager.getTemplates('explainer');

      expect(topicTemplates).toHaveLength(1);
      expect(explainerTemplates).toHaveLength(1);
      expect(topicTemplates[0].name).toBe('Topic Template');
      expect(explainerTemplates[0].name).toBe('Explainer Template');
    });
  });
});
