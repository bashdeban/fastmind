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
import Box from '@mui/material/Box';
import React, { ReactElement, useState, useEffect, useRef } from 'react';
import NodeProperty from '../../../../classes/model/node-property';
import Input from '../../input';
import SaveAndDelete from '../save-and-delete';
import TextOperationManager from '../../../../../../mindplot/src/components/util/TextOperationManager';

type TexttNodeEditorProps = {
  closeModal: () => void;
  noteModel: NodeProperty<string | undefined>;
};

/**
 * Note form for toolbar and node contextual editor
 */
const TopicNoteEditor = ({ closeModal, noteModel }: TexttNodeEditorProps): ReactElement => {
  const value = noteModel.getValue();
  const [note, setNote] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const submitHandler = () => {
    closeModal();
    if (noteModel.setValue) {
      noteModel.setValue(note);
    }
  };

  // Handle keyboard events for custom text operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for text operation shortcuts and handle them with custom implementation
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'c':
            // Handle custom copy
            if (TextOperationManager.performCopy()) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            break;
          case 'v':
            // Handle custom paste
            if (TextOperationManager.performPaste()) {
              event.preventDefault();
              event.stopPropagation();
              // Update the note state after paste
              setTimeout(() => {
                if (inputRef.current) {
                  setNote(inputRef.current.value);
                }
              }, 0);
              return;
            }
            break;
          case 'a':
            // Handle custom select all
            if (TextOperationManager.performSelectAll()) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            break;
          case 'x':
            // Handle custom cut
            if (TextOperationManager.performCut()) {
              event.preventDefault();
              event.stopPropagation();
              // Update the note state after cut
              setTimeout(() => {
                if (inputRef.current) {
                  setNote(inputRef.current.value);
                }
              }, 0);
              return;
            }
            break;
        }
      }
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('keydown', handleKeyDown);
      
      return () => {
        inputElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [note]);

  return (
    <Box sx={{ px: 2, pb: 2, width: '300px' }}>
      <Input
        inputRef={inputRef}
        autoFocus
        multiline
        variant="outlined"
        fullWidth
        rows={12}
        margin="dense"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <br />
      <SaveAndDelete model={noteModel} closeModal={closeModal} submitHandler={submitHandler} />
    </Box>
  );
};

export default TopicNoteEditor;
