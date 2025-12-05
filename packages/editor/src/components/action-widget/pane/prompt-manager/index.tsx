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
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { PromptManager as PromptManagerService, type PromptType, type PromptTemplate } from '../../../../services/prompt-manager';
import { getDefaultPrompts } from '../../../../services/default-prompts';
import PromptEditor from './PromptEditor';
import { StyledDialogContent, StyledListItem, ListContainer, StyledList, PromptNameText, StyledDialogPaper, Container, ActionButtonsContainer, SwitchButtonContainer, CloseButton } from './styled';

export interface PromptManagerDialogProps {
  type: PromptType;
  open: boolean;
  onClose: () => void;
  onActivePromptChange?: (activeTemplates: PromptTemplate[]) => void;
}

const PromptManagerDialog: React.FC<PromptManagerDialogProps> = ({
  type,
  open,
  onClose,
  onActivePromptChange
}) => {
  const intl = useIntl();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

  // 加载prompt数据
  useEffect(() => {
    if (open) {
      // 首次使用时迁移现有数据
      PromptManagerService.migrateExistingPrompts();

      const loadedPrompts = PromptManagerService.getTemplates(type);
      setTemplates(loadedPrompts);
    }
  }, [type, open]);

  const handleToggleTemplate = (prompt: PromptTemplate) => {
    PromptManagerService.toggleTemplate(type, prompt.id);
    const updatedActive = PromptManagerService.getActiveTemplates(type);
    const updatedPrompts = PromptManagerService.getTemplates(type);
    setTemplates(updatedPrompts);
    onActivePromptChange?.(updatedActive);
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (prompt: PromptTemplate) => {
    setEditingTemplate(prompt);
    setShowEditor(true);
  };

  const handleDeleteTemplate = (prompt: PromptTemplate) => {
    // 直接删除，不需要确认
    PromptManagerService.deleteTemplate(type, prompt.id);

    // 更新本地状态
    const updatedPrompts = PromptManagerService.getTemplates(type);
    const updatedActive = PromptManagerService.getActiveTemplates(type);
    setTemplates(updatedPrompts);
    onActivePromptChange?.(updatedActive);
  };

  const handleSaveTemplate = (name: string, content: string) => {
    if (editingTemplate) {
      // 更新现有prompt
      PromptManagerService.updateTemplate(type, editingTemplate.id, { name, content });
    } else {
      // 创建新prompt，默认启用
      PromptManagerService.saveTemplate(type, { name, content, selected: true });
    }

    // 重新加载数据
    const updatedPrompts = PromptManagerService.getTemplates(type);
    const updatedActive = PromptManagerService.getActiveTemplates(type);
    setTemplates(updatedPrompts);
    setShowEditor(false);
    setEditingTemplate(null);
    onActivePromptChange?.(updatedActive);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleLoadDefaultPrompts = () => {
    // 获取默认prompts
    const defaultPrompts = getDefaultPrompts(type);

    // 批量添加默认prompts，默认不启用
    defaultPrompts.forEach(prompt => {
      PromptManagerService.saveTemplate(type, {
        name: prompt.name,
        content: prompt.content,
        selected: false
      });
    });

    // 重新加载数据
    const updatedPrompts = PromptManagerService.getTemplates(type);
    const updatedActive = PromptManagerService.getActiveTemplates(type);
    setTemplates(updatedPrompts);
    onActivePromptChange?.(updatedActive);
  };

  const getTitle = () => {
    if (type === 'topic-generator') {
      return intl.formatMessage({
        id: 'prompt-manager.title.topic-generator',
        defaultMessage: 'AI Topic Generator'
      });
    } else {
      return intl.formatMessage({
        id: 'prompt-manager.title.explainer',
        defaultMessage: 'AI Explainer'
      });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        PaperComponent={StyledDialogPaper}
      >
        <DialogTitle>
          {getTitle()}
          <CloseButton onClick={onClose} size="small">
            <CloseIcon />
          </CloseButton>
        </DialogTitle>

        <StyledDialogContent>
          <Container>
            {/* Prompt列表 */}
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
              {intl.formatMessage({
                id: 'prompt-manager.prompts-list',
                defaultMessage: 'Prompts List'
              })}
            </Typography>

            <ListContainer>
              {templates.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography variant="body2">
                    {intl.formatMessage({
                      id: 'prompt-manager.no-prompts',
                      defaultMessage: 'No prompts found. Create your first prompt!'
                    })}
                  </Typography>
                </Box>
              ) : (
                <StyledList>
                  {templates.map((template) => (
                    <StyledListItem key={template.id}>
                      <Box sx={{ flex: 1 }}>
                        <PromptNameText>
                          {template.name}
                        </PromptNameText>
                      </Box>
                      <SwitchButtonContainer>
                        <Tooltip title={intl.formatMessage({
                          id: 'prompt-manager.tooltip-toggle',
                          defaultMessage: 'Enable/Disable'
                        })}>
                          <Switch
                            checked={template.selected}
                            onChange={() => handleToggleTemplate(template)}
                            size="small"
                          />
                        </Tooltip>
                        <Tooltip title={intl.formatMessage({
                          id: 'prompt-manager.tooltip-edit',
                          defaultMessage: 'Edit Prompt'
                        })}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={intl.formatMessage({
                          id: 'prompt-manager.tooltip-delete',
                          defaultMessage: 'Delete Prompt'
                        })}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTemplate(template)}
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </SwitchButtonContainer>
                    </StyledListItem>
                  ))}
                </StyledList>
              )}
            </ListContainer>

            <ActionButtonsContainer>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddTemplate}
                >
                  {intl.formatMessage({
                    id: 'prompt-manager.add-prompt',
                    defaultMessage: 'Add Prompt'
                  })}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleLoadDefaultPrompts}
                >
                  {intl.formatMessage({
                    id: 'prompt-manager.load-default-prompts',
                    defaultMessage: 'Load Default Prompts'
                  })}
                </Button>
              </Box>
            </ActionButtonsContainer>
          </Container>
        </StyledDialogContent>
      </Dialog>

      {/* Prompt编辑器 */}
      <PromptEditor
        open={showEditor}
        template={editingTemplate}
        onSave={handleSaveTemplate}
        onCancel={handleCloseEditor}
        type={type}
      />
    </>
  );
};

export default PromptManagerDialog;
