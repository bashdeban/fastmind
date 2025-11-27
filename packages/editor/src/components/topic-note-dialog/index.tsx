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
import React, { useEffect } from 'react';
import TopicNotePreview from '../action-widget/pane/topic-note-preview';
import TopicNoteEditor from '../action-widget/pane/topic-note-editor';
import NodeProperty from '../../classes/model/node-property';

type TopicNoteDialogProps = {
  isOpen: boolean;
  mode: 'preview' | 'edit';
  noteModel: NodeProperty<string | undefined>;
  onClose: () => void;
  onEdit: () => void;
};

export const TopicNoteDialog = ({
  isOpen,
  mode,
  noteModel,
  onClose,
  onEdit,
}: TopicNoteDialogProps): React.ReactElement => {
  // Handle ESC key to close dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return <></>;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {mode === 'preview' ? (
          <TopicNotePreview
            closeModal={onClose}
            onEdit={onEdit}
            noteModel={noteModel}
          />
        ) : (
          <TopicNoteEditor
            closeModal={onClose}
            noteModel={noteModel}
            isFromPreview={true} // This edit mode is from preview
          />
        )}
      </div>
    </div>
  );
};
