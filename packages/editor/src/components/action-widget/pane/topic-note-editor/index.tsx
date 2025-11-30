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
import Typography from '@mui/material/Typography';
import React, { ReactElement, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useIntl } from 'react-intl';
import NodeProperty from '../../../../classes/model/node-property';
import Input from '../../input';
import SaveAndDelete from '../save-and-delete';
import { StyledEditorContainer } from '../shared/StyledEditorContainer';
import { StyledPreviewEditorContainer } from '../shared/StyledPreviewEditorContainer';
import { StyledEditorFixedContainer } from '../shared/StyledEditorFixedContainer';

type TexttNodeEditorProps = {
  closeModal: () => void;
  noteModel: NodeProperty<string | undefined>;
  isFromPreview?: boolean; // New prop to distinguish preview mode editor
  isFromEditorBar?: boolean; // New prop to distinguish EditorBar mode
};

/**
 * Note form for toolbar and node contextual editor
 */
const TopicNoteEditor = ({ closeModal, noteModel, isFromPreview = false, isFromEditorBar = false }: TexttNodeEditorProps): ReactElement => {
  const intl = useIntl();
  const value = noteModel.getValue();
  const [note, setNote] = useState(value);

  const submitHandler = () => {
    closeModal();
    if (noteModel.setValue) {
      // If note is empty or only whitespace, delete it
      if (!note || note.trim() === '') {
        noteModel.setValue(undefined);
      } else {
        noteModel.setValue(note);
      }
    }
  };

  // Choose the appropriate container based on the mode
  const Container = isFromPreview ? StyledPreviewEditorContainer : (isFromEditorBar ? StyledEditorFixedContainer : StyledEditorContainer);

  return (
    <Container>
      <IconButton
        onClick={closeModal}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 10,
          width: 24,
          height: 24,
          '& .MuiSvgIcon-root': {
            fontSize: '16px',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ mb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
          {isFromPreview 
            ? intl.formatMessage({
                id: 'topic-note-editor.edit-note',
                defaultMessage: 'Edit Note',
              })
            : intl.formatMessage({
                id: 'topic-note-editor.add-note',
                defaultMessage: 'Add Note',
              })}
        </Typography>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Input
            autoFocus
            multiline
            variant="outlined"
            fullWidth
            minRows={isFromPreview ? 8 : 6}
            maxRows={isFromPreview ? 25 : 20}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            sx={{ 
              flex: 1,
              minHeight: 0, // 重要：允许flex收缩
              '& .MuiOutlinedInput-root': {
                height: '100%',
                alignItems: 'flex-start', // 确保文本从顶部开始
                flexDirection: 'column',
              },
              '& .MuiOutlinedInput-input': {
                height: '100% !important',
                overflow: 'auto !important',
                resize: 'none', // 防止用户调整大小
                flex: 1,
              },
              '& .MuiInputBase-root': {
                height: '100% !important',
              }
            }}
          />

          <Box sx={{ 
            mt: 2, 
            flexShrink: 0, // 确保按钮区域不被压缩
            minHeight: '40px' // 保证按钮区域的最小高度
          }}>
            <SaveAndDelete model={noteModel} closeModal={closeModal} submitHandler={submitHandler} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default TopicNoteEditor;
