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

import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { useIntl } from 'react-intl';
import { type PromptType, type PromptTemplate } from '../../../../services/prompt-manager';

export interface PromptEditorProps {
  open: boolean;
  template: PromptTemplate | null;
  type: PromptType;
  onSave: (name: string, content: string) => void;
  onCancel: () => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  open,
  template,
  type,
  onSave,
  onCancel
}) => {
  const intl = useIntl();
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  // 重置表单
  useEffect(() => {
    if (open) {
      if (template) {
        setName(template.name);
        setContent(template.content);
      } else {
        setName('');
        setContent('');
      }
    }
  }, [open, template]);

  const handleSave = () => {
    if (!name.trim()) {
      alert(intl.formatMessage({
        id: 'prompt-editor.name-required',
        defaultMessage: 'Please enter a prompt name'
      }));
      return;
    }

    if (!content.trim()) {
      alert(intl.formatMessage({
        id: 'prompt-editor.content-required',
        defaultMessage: 'Please enter prompt content'
      }));
      return;
    }

    onSave(name.trim(), content.trim());
  };

  const getTitle = () => {
    if (template) {
      return intl.formatMessage({
        id: 'prompt-editor.edit-title',
        defaultMessage: 'Edit Prompt'
      });
    } else {
      return intl.formatMessage({
        id: 'prompt-editor.create-title',
        defaultMessage: 'Create New Prompt'
      });
    }
  };

  const getPlaceholder = () => {
    if (type === 'topic-generator') {
      return intl.formatMessage({
        id: 'prompt-editor.topic-generator-placeholder',
        defaultMessage: 'Enter your AI topic generation prompt here...'
      });
    } else {
      return intl.formatMessage({
        id: 'prompt-editor.explainer-placeholder',
        defaultMessage: 'Enter your AI explainer prompt here...'
      });
    }
  };

  const getHelperText = () => {
    if (type === 'topic-generator') {
      return intl.formatMessage({
        id: 'prompt-editor.topic-generator-helper',
        defaultMessage: 'This prompt will be used to generate topics for your mind map.'
      });
    } else {
      return intl.formatMessage({
        id: 'prompt-editor.explainer-helper',
        defaultMessage: 'This prompt will be used to explain selected topics.'
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: '40vw',
          maxWidth: '500px',
          border: '2px solid #ffa800',
          boxShadow: 'none',
        },
      }}
    >
      <DialogTitle>
        {getTitle()}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Prompt名称 */}
          <TextField
            label={intl.formatMessage({
              id: 'prompt-editor.name-label',
              defaultMessage: 'Prompt Name'
            })}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            placeholder={intl.formatMessage({
              id: 'prompt-editor.name-placeholder',
              defaultMessage: 'e.g., Creative Writing, Technical Analysis'
            })}
          />

          {/* Prompt内容 */}
          <TextField
            label={intl.formatMessage({
              id: 'prompt-editor.content-label',
              defaultMessage: 'Prompt Content'
            })}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={8}
            required
            placeholder={getPlaceholder()}
            helperText={getHelperText()}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel}>
          {intl.formatMessage({ id: 'action.cancel', defaultMessage: 'Cancel' })}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim() || !content.trim()}
        >
          {intl.formatMessage({ id: 'action.save', defaultMessage: 'Save' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptEditor;
