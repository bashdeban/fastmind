/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License).
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

/**
 * TextOperationManager - 自定义文本操作管理器
 * 提供统一的复制、粘贴、全选功能，不依赖系统原生行为
 */
class TextOperationManager {
  private static instance: TextOperationManager;
  private internalClipboard: string = '';
  private lastOperation: 'copy' | 'cut' | 'paste' | 'selectall' | null = null;

  private constructor() {}

  static getInstance(): TextOperationManager {
    if (!TextOperationManager.instance) {
      TextOperationManager.instance = new TextOperationManager();
    }
    return TextOperationManager.instance;
  }

  /**
   * 检查当前是否在文本编辑上下文中
   */
  static isInTextEditingContext(): boolean {
    // 检查是否在textContainer中（Topic编辑）
    const textContainer = document.getElementById('textContainer');
    if (textContainer && textContainer.style.display !== 'none') {
      return true;
    }

    // 检查是否有选中的文本
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      return true;
    }

    // 检查是否在任何input或textarea中
    const activeElement = document.activeElement;
    if (activeElement) {
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        return true;
      }

      // 检查contentEditable元素
      if (activeElement.getAttribute('contenteditable') === 'true') {
        return true;
      }

      // 检查是否在contentEditable容器内
      const contentEditableParent = activeElement.closest('[contenteditable="true"]');
      if (contentEditableParent) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取当前活动的文本编辑元素
   */
  private static getActiveTextElement(): HTMLElement | null {
    // 检查textContainer中的textarea
    const textContainer = document.getElementById('textContainer');
    if (textContainer && textContainer.style.display !== 'none') {
      const textarea = textContainer.querySelector('textarea');
      if (textarea) {
        return textarea as HTMLElement;
      }
    }

    // 检查普通的input/textarea
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        return activeElement;
      }

      // 检查contentEditable元素
      if (activeElement.getAttribute('contenteditable') === 'true') {
        return activeElement;
      }
    }

    return null;
  }

  /**
   * 自定义复制功能
   */
  static performCopy(): boolean {
    const textElement = TextOperationManager.getActiveTextElement();
    if (!textElement) {
      return false;
    }

    let selectedText = '';

    if (textElement.tagName === 'INPUT' || textElement.tagName === 'TEXTAREA') {
      const input = textElement as HTMLInputElement | HTMLTextAreaElement;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? start;
      selectedText = input.value.substring(start, end);
    } else if (textElement.getAttribute('contenteditable') === 'true') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        selectedText = range.toString();
      }
    }

    if (selectedText) {
      TextOperationManager.getInstance().internalClipboard = selectedText;
      TextOperationManager.getInstance().lastOperation = 'copy';
      
      // 可选：同时更新系统剪贴板以保持兼容性
      try {
        navigator.clipboard.writeText(selectedText);
      } catch (e) {
        // 某些环境下可能不支持navigator.clipboard
        console.warn('Could not write to system clipboard:', e);
      }
      
      return true;
    }

    return false;
  }

  /**
   * 自定义剪切功能
   */
  static performCut(): boolean {
    const textElement = TextOperationManager.getActiveTextElement();
    if (!textElement) {
      return false;
    }

    let selectedText = '';
    let cutSuccessful = false;

    if (textElement.tagName === 'INPUT' || textElement.tagName === 'TEXTAREA') {
      const input = textElement as HTMLInputElement | HTMLTextAreaElement;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? start;
      selectedText = input.value.substring(start, end);
      
      if (selectedText) {
        const newValue = input.value.substring(0, start) + input.value.substring(end);
        input.value = newValue;
        input.setSelectionRange(start, start);
        cutSuccessful = true;

        // 触发input事件以通知React组件
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
    } else if (textElement.getAttribute('contenteditable') === 'true') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        selectedText = range.toString();
        
        if (selectedText) {
          range.deleteContents();
          cutSuccessful = true;

          // 触发input事件
          const event = new Event('input', { bubbles: true });
          textElement.dispatchEvent(event);
        }
      }
    }

    if (selectedText) {
      TextOperationManager.getInstance().internalClipboard = selectedText;
      TextOperationManager.getInstance().lastOperation = 'cut';
      
      // 可选：同时更新系统剪贴板
      try {
        navigator.clipboard.writeText(selectedText);
      } catch (e) {
        console.warn('Could not write to system clipboard:', e);
      }
      
      return cutSuccessful;
    }

    return false;
  }

  /**
   * 自定义粘贴功能
   */
  static performPaste(): boolean {
    const textElement = TextOperationManager.getActiveTextElement();
    if (!textElement) {
      return false;
    }

    const clipboardText = TextOperationManager.getInstance().internalClipboard;
    if (!clipboardText) {
      return false;
    }

    let pasteSuccessful = false;

    if (textElement.tagName === 'INPUT' || textElement.tagName === 'TEXTAREA') {
      const input = textElement as HTMLInputElement | HTMLTextAreaElement;
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? start;
      
      const newValue = input.value.substring(0, start) + clipboardText + input.value.substring(end);
      input.value = newValue;
      
      const newCursorPosition = start + clipboardText.length;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
      pasteSuccessful = true;

      // 触发input事件
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    } else if (textElement.getAttribute('contenteditable') === 'true') {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // 创建文本节点并插入
        const textNode = document.createTextNode(clipboardText);
        range.insertNode(textNode);
        
        // 将光标移动到插入文本之后
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        pasteSuccessful = true;

        // 触发input事件
        const event = new Event('input', { bubbles: true });
        textElement.dispatchEvent(event);
      }
    }

    if (pasteSuccessful) {
      TextOperationManager.getInstance().lastOperation = 'paste';
    }

    return pasteSuccessful;
  }

  /**
   * 自定义全选功能
   */
  static performSelectAll(): boolean {
    const textElement = TextOperationManager.getActiveTextElement();
    if (!textElement) {
      return false;
    }

    let selectSuccessful = false;

    if (textElement.tagName === 'INPUT' || textElement.tagName === 'TEXTAREA') {
      const input = textElement as HTMLInputElement | HTMLTextAreaElement;
      input.setSelectionRange(0, input.value.length);
      selectSuccessful = true;
    } else if (textElement.getAttribute('contenteditable') === 'true') {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(textElement);
        selection.removeAllRanges();
        selection.addRange(range);
        selectSuccessful = true;
      }
    }

    if (selectSuccessful) {
      TextOperationManager.getInstance().lastOperation = 'selectall';
    }

    return selectSuccessful;
  }

  /**
   * 获取内部剪贴板内容
   */
  static getInternalClipboard(): string {
    return TextOperationManager.getInstance().internalClipboard;
  }

  /**
   * 设置内部剪贴板内容
   */
  static setInternalClipboard(text: string): void {
    TextOperationManager.getInstance().internalClipboard = text;
  }

  /**
   * 获取最后一次操作类型
   */
  static getLastOperation(): 'copy' | 'cut' | 'paste' | 'selectall' | null {
    return TextOperationManager.getInstance().lastOperation;
  }

  /**
   * 清空内部剪贴板
   */
  static clearClipboard(): void {
    TextOperationManager.getInstance().internalClipboard = '';
    TextOperationManager.getInstance().lastOperation = null;
  }
}

export default TextOperationManager;
