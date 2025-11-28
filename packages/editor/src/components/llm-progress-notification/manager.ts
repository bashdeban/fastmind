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

export interface LLMTask {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime: number;
}

class LLMProgressManager {
  private tasks: Map<string, LLMTask> = new Map();
  private listeners: Set<() => void> = new Set();
  private taskIdCounter = 0;

  /**
   * Create a new LLM task
   */
  createTask(config: { title: string; description: string }): string {
    const taskId = `llm-task-${++this.taskIdCounter}`;
    const task: LLMTask = {
      id: taskId,
      title: config.title,
      description: config.description,
      progress: 0,
      status: 'pending',
      startTime: Date.now(),
    };

    this.tasks.set(taskId, task);
    this.notifyListeners();

    return taskId;
  }

  /**
   * Update task progress
   */
  updateTaskProgress(taskId: string, progress: number): void {
    const task = this.tasks.get(taskId);
    if (task && progress >= 0 && progress <= 100) {
      task.progress = Math.min(100, Math.max(0, progress));
      if (task.status === 'pending') {
        task.status = 'running';
      }
      this.notifyListeners();
    }
  }

  /**
   * Complete a task
   */
  completeTask(taskId: string, success: boolean): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = success ? 'completed' : 'error';
      task.progress = 100;
      this.notifyListeners();

      // Auto-remove completed tasks after 3 seconds
      setTimeout(() => {
        this.removeTask(taskId);
      }, 1000);
    }
  }

  /**
   * Remove a task
   */
  removeTask(taskId: string): void {
    this.tasks.delete(taskId);
    this.notifyListeners();
  }

  /**
   * Get all tasks
   */
  getTasks(): LLMTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Subscribe to task updates
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Singleton instance
export const llmProgressManager = new LLMProgressManager();
