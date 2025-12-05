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

import { type PromptType } from './prompt-manager';

// 默认prompt数据结构：{ name: string, content: string }
// 您可以在这里手动添加更多的默认prompt
export const DEFAULT_TOPIC_GENERATOR_PROMPTS = [
  {
    name: 'Add emojis',
    content: '- Each generated new topic is preceded by a matching emoji'
  },
  {
    name: 'Add english pronunciation',
    content: '- Generate new topics in English \n- Follow each topic with its English pronunciation,Use / to indicate pronunciation, separated by a newline(\n)'
  }
];

export const DEFAULT_EXPLAINER_PROMPTS = [
  {
    name: 'Technical explanation',
    content: 'Provides a comprehensive technical explanation of current core topic. Includes detailed mechanisms, fundamental principles, technical specifications, and advanced concepts. Target audience: Technical professionals or subject matter experts.'
  }
];

export const getDefaultPrompts = (type: PromptType): { name: string; content: string }[] => {
  if (type === 'topic-generator') {
    return DEFAULT_TOPIC_GENERATOR_PROMPTS;
  } else if (type === 'explainer') {
    return DEFAULT_EXPLAINER_PROMPTS;
  }
  return [];
};
