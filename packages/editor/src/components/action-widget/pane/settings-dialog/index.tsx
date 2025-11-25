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

import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import ManageIcon from '@mui/icons-material/ManageAccounts';
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
  const [showModelApiManagement, setShowModelApiManagement] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<LLMConfig | null>(null);

  const [topicGeneratorPrompt, setTopicGeneratorPrompt] = useState(
    ''
  );
  const [explainerPrompt, setExplainerPrompt] = useState(
    ''
  );
  const [deduplicationEnabled, setDeduplicationEnabled] = useState(false);

  // 加载当前配置
  useEffect(() => {
    if (open) {
      const config = LLMConfigManager.getConfig();
      setCurrentConfig(config);

      // 加载自定义提示词和去重设置
      const settingsConfig = SettingsManager.getConfig();
      setTopicGeneratorPrompt(settingsConfig.topicGeneratorPrompt || '');
      setExplainerPrompt(settingsConfig.explainerPrompt || '');
      setDeduplicationEnabled(settingsConfig.deduplicationEnabled || false);
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
    // 保存自定义提示词和去重设置到localStorage
    SettingsManager.savePrompts(topicGeneratorPrompt, explainerPrompt, deduplicationEnabled);
    onClose();
  };

  const handleCancel = () => {
    // 重置为原始值
    const settingsConfig = SettingsManager.getConfig();
    setTopicGeneratorPrompt(settingsConfig.topicGeneratorPrompt || '');
    setExplainerPrompt(settingsConfig.explainerPrompt || '');
    setDeduplicationEnabled(settingsConfig.deduplicationEnabled || false);
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
          Settings
        </DialogTitle>

        <StyledDialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.4 }}>
            Configure AI model settings and customize prompts for topic generation and concept explanation.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* LLM Configuration */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                Current Model: {currentConfig?.modelName || 'No model configured'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ManageIcon />}
                onClick={handleManageApi}
                size="small"
                fullWidth
              >
                Model API Management
              </Button>
            </Box>

            {/* AI Prompts */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  AI Topic Generator with User-Defined Prompts
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={deduplicationEnabled}
                      onChange={(e) => setDeduplicationEnabled(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Deduplication"
                  labelPlacement="start"
                  sx={{ 
                    ml: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem', // subtitle2 size
                      fontWeight: 'bold'
                    }
                  }}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                value={topicGeneratorPrompt}
                onChange={(e) => setTopicGeneratorPrompt(e.target.value)}
                placeholder="Enter custom prompt for topic generation..."
                size="small"
                sx={{ mb: 2 }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                AI Explainer with User-Defined Prompts
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                value={explainerPrompt}
                onChange={(e) => setExplainerPrompt(e.target.value)}
                placeholder="Enter custom prompt for concept explanation..."
                size="small"
                sx={{ mb: 2 }}
              />
            </Box>
          </Box>
        </StyledDialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
          >
            Save
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
