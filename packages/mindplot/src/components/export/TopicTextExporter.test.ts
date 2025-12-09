import TopicTextExporter from './TopicTextExporter';

// Mock Topic class for testing
class MockTopic {
  private _text: string;

  private _children: MockTopic[];

  constructor(text: string, children: MockTopic[] = []) {
    this._text = text;
    this._children = children;
  }

  getText(): string {
    return this._text;
  }

  getChildren(): MockTopic[] {
    return this._children;
  }

  setChildren(children: MockTopic[]): void {
    this._children = children;
  }
}

describe('TopicTextExporter', () => {
  it('should export simple topic hierarchy', () => {
    const child1 = new MockTopic('Child 1');
    const child2 = new MockTopic('Child 2');
    const grandChild1 = new MockTopic('Grandchild 1');
    const grandChild2 = new MockTopic('Grandchild 2');
    child2.setChildren([grandChild1, grandChild2]);

    const parent = new MockTopic('Parent Topic', [child1, child2]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = TopicTextExporter.exportTopicHierarchy(parent as any);

    const expected = `- Parent Topic
    - Child 1
    - Child 2
        - Grandchild 1
        - Grandchild 2`;

    expect(result.trim()).toBe(expected.trim());
  });

  it('should handle empty topic', () => {
    const emptyTopic = new MockTopic('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = TopicTextExporter.exportTopicHierarchy(emptyTopic as any);
    expect(result.trim()).toBe('-');
  });

  it('should handle single topic without children', () => {
    const singleTopic = new MockTopic('Single Topic');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = TopicTextExporter.exportTopicHierarchy(singleTopic as any);
    expect(result.trim()).toBe('- Single Topic');
  });

  it('should handle multiple levels of nesting', () => {
    const level3 = new MockTopic('Level 3');
    const level2 = new MockTopic('Level 2', [level3]);
    const level1 = new MockTopic('Level 1', [level2]);
    const root = new MockTopic('Root', [level1]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = TopicTextExporter.exportTopicHierarchy(root as any);

    const expected = `- Root
    - Level 1
        - Level 2
            - Level 3`;

    expect(result.trim()).toBe(expected.trim());
  });

  it('should handle special characters in topic text', () => {
    const specialTopic = new MockTopic('Topic with & special <characters>');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = TopicTextExporter.exportTopicHierarchy(specialTopic as any);
    expect(result.trim()).toBe('- Topic with & special <characters>');
  });
});
