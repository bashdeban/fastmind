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
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopicNoteDialog } from './index';
import NodeProperty from '../../classes/model/node-property';

// Mock for testing
const mockNoteModel: NodeProperty<string | undefined> = {
  getValue: () => 'Test note content',
  setValue: jest.fn(),
};

describe('TopicNoteDialog', () => {
  let mockOnClose: jest.MockedFunction<() => void>;
  let mockOnEdit: jest.MockedFunction<() => void>;
  let mockOnBackToPreview: jest.MockedFunction<() => void>;

  beforeEach(() => {
    mockOnClose = jest.fn();
    mockOnEdit = jest.fn();
    mockOnBackToPreview = jest.fn();
    // Clear document event listeners
    document.removeEventListener('keydown', jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should close dialog when ESC is pressed in preview mode', () => {
    render(
      <TopicNoteDialog
        isOpen={true}
        mode="preview"
        noteModel={mockNoteModel}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onBackToPreview={mockOnBackToPreview}
      />
    );

    // Simulate ESC key press
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnBackToPreview).not.toHaveBeenCalled();
  });

  it('should return to preview when ESC is pressed in edit mode', () => {
    render(
      <TopicNoteDialog
        isOpen={true}
        mode="edit"
        noteModel={mockNoteModel}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onBackToPreview={mockOnBackToPreview}
      />
    );

    // Simulate ESC key press
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnBackToPreview).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should close dialog when ESC is pressed in edit mode without onBackToPreview', () => {
    render(
      <TopicNoteDialog
        isOpen={true}
        mode="edit"
        noteModel={mockNoteModel}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
      />
    );

    // Simulate ESC key press
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnBackToPreview).not.toHaveBeenCalled();
  });

  it('should not handle ESC when dialog is closed', () => {
    render(
      <TopicNoteDialog
        isOpen={false}
        mode="preview"
        noteModel={mockNoteModel}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onBackToPreview={mockOnBackToPreview}
      />
    );

    // Simulate ESC key press
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnBackToPreview).not.toHaveBeenCalled();
  });

  it('should not handle other keys', () => {
    render(
      <TopicNoteDialog
        isOpen={true}
        mode="preview"
        noteModel={mockNoteModel}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onBackToPreview={mockOnBackToPreview}
      />
    );

    // Simulate Enter key press
    fireEvent.keyDown(document, { key: 'Enter' });

    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnBackToPreview).not.toHaveBeenCalled();
  });
});
