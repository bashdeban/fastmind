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
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import ManageIcon from '@mui/icons-material/ManageAccounts';
import { useIntl } from 'react-intl';
import ModelApiManagement from '../model-api-management';
import { LLMConfigManager } from '../../../../services/llm/config';
import { SettingsManager } from '../../../../services/settings/config';
import type { LLMConfig } from '../../../../services/llm/types';
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
  const [currentConfig, setCurrentConfig] = useState<LLMConfig | null>(null);

  const [topicGeneratorPrompt, setTopicGeneratorPrompt] = useState(
    ''
  );
  const [explainerPrompt, setExplainerPrompt] = useState(
    ''
  );

  // 加载当前配置
  useEffect(() => {
    if (open) {
      const config = LLMConfigManager.getConfig();
      setCurrentConfig(config);

      // 加载自定义提示词
      const settingsConfig = SettingsManager.getConfig();
      setTopicGeneratorPrompt(settingsConfig.topicGeneratorPrompt || '');
      setExplainerPrompt(settingsConfig.explainerPrompt || '');
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

  const handleSave = () => {
    // 保存自定义提示词到localStorage
    SettingsManager.savePrompts(topicGeneratorPrompt, explainerPrompt);
    onClose();
  };

  const handleCancel = () => {
    // 重置为原始值
    const settingsConfig = SettingsManager.getConfig();
    setTopicGeneratorPrompt(settingsConfig.topicGeneratorPrompt || '');
    setExplainerPrompt(settingsConfig.explainerPrompt || '');
    onClose();
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
                size="small"
                fullWidth
              >
                {intl.formatMessage({ id: 'settings.model-api-management', defaultMessage: 'Model API Management' })}
              </Button>
            </Box>

            {/* AI Prompts */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
                {intl.formatMessage({ id: 'settings.ai-topic-generator-title', defaultMessage: 'AI Topic Generator with User-Defined Prompts' })}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                variant="outlined"
                value={topicGeneratorPrompt}
                onChange={(e) => setTopicGeneratorPrompt(e.target.value)}
                placeholder={intl.formatMessage({ id: 'settings.topic-generator-placeholder', defaultMessage: 'Enter custom prompt for topic generation...' })}
                size="small"
                sx={{
                  mb: 1,
                  '& .MuiInputBase-input': {
                    fontSize: '0.8rem',
                  }
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                {intl.formatMessage({ id: 'settings.ai-explainer-title', defaultMessage: 'AI Explainer with User-Defined Prompts' })}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                value={explainerPrompt}
                onChange={(e) => setExplainerPrompt(e.target.value)}
                placeholder={intl.formatMessage({ id: 'settings.explainer-placeholder', defaultMessage: 'Enter custom prompt for concept explanation...' })}
                size="small"
                sx={{
                  mb: 1,
                  '& .MuiInputBase-input': {
                    fontSize: '0.8rem',
                  }
                }}
              />
            </Box>
          </Box>
        </StyledDialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>
            {intl.formatMessage({ id: 'action.cancel', defaultMessage: 'Cancel' })}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
          >
            {intl.formatMessage({ id: 'action.accept', defaultMessage: 'Accept' })}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Model API Management Dialog */}
      <ModelApiManagement
        open={showModelApiManagement}
        onClose={handleModelApiManagementClose}
      />
    </>
  );
};

export default SettingsDialog;
