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
import Topic from '../Topic';

/**
 * Utility class for exporting topic hierarchy as indented text
 */
class TopicTextExporter {
  /**
   * Export a topic and all its children as indented text
   * @param topic The root topic to export
   * @returns Formatted text string with topic hierarchy
   */
  static exportTopicHierarchy(topic: Topic): string {
    const lines: string[] = [];
    this._buildTopicLines(topic, 0, lines);
    return lines.join('\n');
  }

  /**
   * Recursively build topic lines with proper indentation
   * Uses 4 spaces per level for child topics
   * @param topic Current topic to process
   * @param level Current indentation level
   * @param lines Array to accumulate output lines
   */
  private static _buildTopicLines(topic: Topic, level: number, lines: string[]): void {
    const text = topic.getText().replace(/\n/g, ' ');

    // Always include the topic, even if text is empty
    const indent = '\t'.repeat(level);
    lines.push(`${indent}${text}`);

    // Only process children if the topic's children are not shrunken (folded)
    if (!topic.areChildrenShrunken()) {
      const children = topic.getChildren();
      if (children && children.length > 0) {
        children.forEach((child: Topic) => {
          this._buildTopicLines(child, level + 1, lines);
        });
      }
    }
  }
}

export default TopicTextExporter;
