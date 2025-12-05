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

import { SettingsManager, type PromptTemplate } from './settings/config';

export type PromptType = 'topic-generator' | 'explainer';

export { type PromptTemplate };

export class PromptManager {
  /**
   * 获取指定类型的所有模板
   */
  static getTemplates(type: PromptType): PromptTemplate[] {
    const config = SettingsManager.getConfig();
    const key = type === 'topic-generator' ? 'topicGeneratorTemplates' : 'explainerTemplates';
    const templates = config[key] || [];
    
    // 确保日期字段是Date对象
    return templates.map(template => ({
      ...template,
      createdAt: new Date(template.createdAt),
      updatedAt: new Date(template.updatedAt)
    }));
  }

  /**
   * 获取所有激活的模板
   */
  static getActiveTemplates(type: PromptType): PromptTemplate[] {
    const templates = this.getTemplates(type);
    return templates.filter(t => t.selected);
  }

  /**
   * 获取组合后的激活内容
   */
  static getCombinedActiveContent(type: PromptType): string {
    const activeTemplates = this.getActiveTemplates(type);
    return activeTemplates
      .map(template => template.content.trim())
      .filter(content => content.length > 0)
      .join('\n\n');
  }

  /**
   * 切换模板选中状态
   */
  static toggleTemplate(type: PromptType, templateId: string): void {
    const templates = this.getTemplates(type);
    const updatedTemplates = templates.map(t => ({
      ...t,
      selected: t.id === templateId ? !t.selected : t.selected
    }));

    const configKey = type === 'topic-generator' ? 'topicGeneratorTemplates' : 'explainerTemplates';
    
    SettingsManager.saveConfig({
      [configKey]: updatedTemplates
    });
  }

  /**
   * 设置模板选中状态
   */
  static setTemplateSelected(type: PromptType, templateId: string, selected: boolean): void {
    const templates = this.getTemplates(type);
    const updatedTemplates = templates.map(t => ({
      ...t,
      selected: t.id === templateId ? selected : t.selected
    }));

    const configKey = type === 'topic-generator' ? 'topicGeneratorTemplates' : 'explainerTemplates';
    
    SettingsManager.saveConfig({
      [configKey]: updatedTemplates
    });
  }

  /**
   * 保存新模板
   */
  static saveTemplate(type: PromptType, template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): PromptTemplate {
    const templates = this.getTemplates(type);
    const now = new Date();
    const newTemplate: PromptTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    };

    const updatedTemplates = [...templates, newTemplate];
    const configKey = type === 'topic-generator' ? 'topicGeneratorTemplates' : 'explainerTemplates';
    
    SettingsManager.saveConfig({
      [configKey]: updatedTemplates
    });

    return newTemplate;
  }

  /**
   * 更新现有模板
   */
  static updateTemplate(type: PromptType, templateId: string, updates: Partial<PromptTemplate>): PromptTemplate | null {
    const templates = this.getTemplates(type);
    const templateIndex = templates.findIndex(t => t.id === templateId);
    
    if (templateIndex === -1) return null;

    const updatedTemplates = [...templates];
    updatedTemplates[templateIndex] = {
      ...updatedTemplates[templateIndex],
      ...updates,
      updatedAt: new Date()
    };

    const configKey = type === 'topic-generator' ? 'topicGeneratorTemplates' : 'explainerTemplates';
    
    SettingsManager.saveConfig({
      [configKey]: updatedTemplates
    });

    return updatedTemplates[templateIndex];
  }

  /**
   * 删除模板
   */
  static deleteTemplate(type: PromptType, templateId: string): boolean {
    const templates = this.getTemplates(type);
    const templateIndex = templates.findIndex(t => t.id === templateId);
    
    if (templateIndex === -1) return false;

    const updatedTemplates = templates.filter(t => t.id !== templateId);
    const configKey = type === 'topic-generator' ? 'topicGeneratorTemplates' : 'explainerTemplates';
    
    SettingsManager.saveConfig({
      [configKey]: updatedTemplates
    });
    
    return true;
  }

  /**
   * 获取激活模板的内容（向后兼容）
   */
  static getActivePrompt(type: PromptType): string {
    return this.getCombinedActiveContent(type);
  }

  /**
   * 生成唯一ID
   */
  private static generateId(): string {
    return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 迁移现有的prompt到模板系统（向后兼容）
   */
  static migrateExistingPrompts(): void {
    const config = SettingsManager.getConfig();
    
    // 迁移topic generator prompt
    if (config.topicGeneratorPrompt && !config.topicGeneratorTemplates?.length) {
      const defaultTemplate: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Default',
        content: config.topicGeneratorPrompt,
        selected: true
      };
      
      this.saveTemplate('topic-generator', defaultTemplate);
    }
    
    // 迁移explainer prompt
    if (config.explainerPrompt && !config.explainerTemplates?.length) {
      const defaultTemplate: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Default',
        content: config.explainerPrompt,
        selected: true
      };
      
      this.saveTemplate('explainer', defaultTemplate);
    }
  }
}
