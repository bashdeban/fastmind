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
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ManageIcon from '@mui/icons-material/ManageAccounts';
import SettingsIcon from '@mui/icons-material/Settings';
import { useIntl } from 'react-intl';
import ModelApiManagement from '../model-api-management';
import PromptManagerDialog from '../prompt-manager';
import { LLMConfigManager } from '../../../../services/llm/config';
import { PromptManager } from '../../../../services/prompt-manager';
import type { LLMConfig } from '../../../../services/llm/types';
import type { PromptTemplate } from '../../../../services/prompt-manager';
import {
  StyledDialogContent,
} from './styled';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SettingsDialog = ({ open, onClose }: SettingsDialogProps): React.ReactElement => {
  const intl = useIntl();
  const [showModelApiManagement, setShowModelApiManagement] = useState(false);
  const [showTopicGeneratorManager, setShowTopicGeneratorManager] = useState(false);
  const [showExplainerManager, setShowExplainerManager] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<LLMConfig | null>(null);
  const [activeTopicTemplate, setActiveTopicTemplate] = useState<PromptTemplate | null>(null);
  const [activeExplainerTemplate, setActiveExplainerTemplate] = useState<PromptTemplate | null>(null);

  // 加载当前配置
  useEffect(() => {
    if (open) {
      // 首次使用时迁移现有数据
      PromptManager.migrateExistingPrompts();

      const config = LLMConfigManager.getConfig();
      setCurrentConfig(config);

      // 加载激活的模板
      const topicTemplates = PromptManager.getActiveTemplates('topic-generator');
      const explainerTemplates = PromptManager.getActiveTemplates('explainer');

      // 使用相同的逻辑来初始化状态
      if (topicTemplates.length === 0) {
        setActiveTopicTemplate(null);
      } else if (topicTemplates.length === 1) {
        setActiveTopicTemplate(topicTemplates[0]);
      } else {
        setActiveTopicTemplate({
          id: 'multiple',
          name: `${topicTemplates.length} prompts enabled`,
          content: '',
          selected: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      if (explainerTemplates.length === 0) {
        setActiveExplainerTemplate(null);
      } else if (explainerTemplates.length === 1) {
        setActiveExplainerTemplate(explainerTemplates[0]);
      } else {
        setActiveExplainerTemplate({
          id: 'multiple',
          name: `${explainerTemplates.length} prompts enabled`,
          content: '',
          selected: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  }, [open]);

  const handleManageApi = () => {
    setShowModelApiManagement(true);
  };

  const handleModelApiManagementClose = () => {
    setShowModelApiManagement(false);
    // 重新加载当前配置
    const config = LLMConfigManager.getConfig();
    setCurrentConfig(config);
  };

  const handleTopicPromptChange = (templates: PromptTemplate[]) => {
    // 显示第一个激活的模板名称，或者显示"Multiple enabled"
    if (templates.length === 0) {
      setActiveTopicTemplate(null);
    } else if (templates.length === 1) {
      setActiveTopicTemplate(templates[0]);
    } else {
      // 多个激活时创建一个虚拟模板显示
      setActiveTopicTemplate({
        id: 'multiple',
        name: `${templates.length} prompts enabled`,
        content: '',
        selected: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  };

  const handleExplainerPromptChange = (templates: PromptTemplate[]) => {
    // 显示第一个激活的模板名称，或者显示"Multiple enabled"
    if (templates.length === 0) {
      setActiveExplainerTemplate(null);
    } else if (templates.length === 1) {
      setActiveExplainerTemplate(templates[0]);
    } else {
      // 多个激活时创建一个虚拟模板显示
      setActiveExplainerTemplate({
        id: 'multiple',
        name: `${templates.length} prompts enabled`,
        content: '',
        selected: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '350px',
            border: '2px solid #ffa800',
            boxShadow: 'none',
          },
        }}
      >
        <DialogTitle>
          {intl.formatMessage({ id: 'settings.title', defaultMessage: 'Settings' })}
        </DialogTitle>

        <StyledDialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.4 }}>
            {intl.formatMessage({
              id: 'settings.description',
              defaultMessage: 'Configure AI model settings and customize prompts for topic generation and concept explanation.'
            })}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* LLM Configuration */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                {intl.formatMessage({
                  id: 'settings.current-model',
                  defaultMessage: 'Current Model: {modelName}'
                }, { modelName: currentConfig?.modelName || intl.formatMessage({ id: 'settings.no-model', defaultMessage: 'No model configured' }) })}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ManageIcon />}
                onClick={handleManageApi}
                size="medium"
                fullWidth
              >
                {intl.formatMessage({ id: 'settings.model-api-management', defaultMessage: 'Model API Management' })}
              </Button>
            </Box>

            {/* AI Topic Generator Prompts */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
                {intl.formatMessage({ id: 'settings.ai-topic-generator-title', defaultMessage: 'AI Topic Generator' })}
              </Typography>

              {/* 当前激活的模板显示 - 状态和按钮在同一行 */}
              <Box sx={{
                mb: 1,
                border: '1px solid divider',
                borderRadius: 1
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    {intl.formatMessage({
                      id: 'settings.active-template',
                      defaultMessage: 'Custom Prompts'
                    })}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {activeTopicTemplate ? (
                      <Chip
                        label={activeTopicTemplate.name}
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label={intl.formatMessage({
                          id: 'settings.no-active-template',
                          defaultMessage: 'No active template'
                        })}
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    )}
                    <Tooltip title={intl.formatMessage({
                      id: 'settings.manage-prompts',
                      defaultMessage: 'Manage Prompts'
                    })}>
                      <IconButton
                        size="medium"
                        onClick={() => setShowTopicGeneratorManager(true)}
                      >
                        <SettingsIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Box>
            </Box>

            {/* AI Explainer Prompts */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                {intl.formatMessage({ id: 'settings.ai-explainer-title', defaultMessage: 'AI Explainer' })}
              </Typography>

              {/* 当前激活的模板显示 - 状态和按钮在同一行 */}
              <Box sx={{
                mb: 1,
                border: '1px solid divider',
                borderRadius: 1
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    {intl.formatMessage({
                      id: 'settings.active-template',
                      defaultMessage: 'Custom Prompts'
                    })}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {activeExplainerTemplate ? (
                      <Chip
                        label={activeExplainerTemplate.name}
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label={intl.formatMessage({
                          id: 'settings.no-active-template',
                          defaultMessage: 'No active template'
                        })}
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    )}
                    <Tooltip title={intl.formatMessage({
                      id: 'settings.manage-prompts',
                      defaultMessage: 'Manage Prompts'
                    })}>
                      <IconButton
                        size="medium"
                        onClick={() => setShowExplainerManager(true)}
                      >
                        <SettingsIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Box>
        </StyledDialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            {intl.formatMessage({ id: 'action.close', defaultMessage: 'Close' })}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Model API Management Dialog */}
      <ModelApiManagement
        open={showModelApiManagement}
        onClose={handleModelApiManagementClose}
      />

      {/* Topic Generator Prompt Manager */}
      <PromptManagerDialog
        type="topic-generator"
        open={showTopicGeneratorManager}
        onClose={() => setShowTopicGeneratorManager(false)}
        onActivePromptChange={handleTopicPromptChange}
      />

      {/* Explainer Prompt Manager */}
      <PromptManagerDialog
        type="explainer"
        open={showExplainerManager}
        onClose={() => setShowExplainerManager(false)}
        onActivePromptChange={handleExplainerPromptChange}
      />
    </>
  );
};

export default SettingsDialog;
