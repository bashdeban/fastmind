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
import React, { ReactElement } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import NodeProperty from '../../../../classes/model/node-property';
import { StyledPreviewContainer } from './StyledPreviewContainer';
import MarkdownView from '../../../MarkdownView';

type TopicNotePreviewProps = {
  closeModal: () => void;
  onEdit: () => void;
  noteModel: NodeProperty<string | undefined>;
};

/**
 * Topic Note preview component that displays note content
 * Clicking on content area triggers edit mode
 */
const TopicNotePreview = ({ closeModal, onEdit, noteModel }: TopicNotePreviewProps): ReactElement => {
  const value = noteModel.getValue();

  return (
    <StyledPreviewContainer>
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

      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflow: 'auto',
            cursor: 'pointer',
          }}
          onClick={onEdit}
        >
          {value ? (
            <MarkdownView content={value} />
          ) : (
            <Box
              sx={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: 'text.secondary',
                fontStyle: 'italic',
              }}
            >
              No note content
            </Box>
          )}
        </Box>
      </Box>
    </StyledPreviewContainer>
  );
};

export default TopicNotePreview;
