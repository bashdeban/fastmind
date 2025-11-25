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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CloudIcon from '@mui/icons-material/Cloud';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import LlmConnectionTest from '../llm-connection-test';
import { LLMConfigListManager } from '../../../../services/llm/config-list';
import { LLMConfigManager } from '../../../../services/llm/config';
import type { LLMConfig } from '../../../../services/llm/types';
import {
  StyledDialogContent,
  CloseButton,
  StyledDialogPaper,
  Container,
  HeaderSection,
  ListContainer,
  StyledList,
  StyledListItem,
  ModelNameText,
  StatusChip,
  ActionButtonsContainer,
  LeftButtons,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateText,
  SwitchButtonContainer,
  SwitchModelButton,
  UpdateModelButton,
} from './styled';

interface ModelApiManagementProps {
  open: boolean;
  onClose: () => void;
}

const ModelApiManagement = ({ open, onClose }: ModelApiManagementProps): React.ReactElement => {
  const [showLlmTest, setShowLlmTest] = useState(false);
  const [configList, setConfigList] = useState<LLMConfig[]>([]);
  const [initialConfig, setInitialConfig] = useState<LLMConfig | undefined>(undefined);
  const [currentConfig, setCurrentConfig] = useState<LLMConfig | null>(null);

  // 加载配置列表和当前配置
  useEffect(() => {
    const configs = LLMConfigListManager.getConfigList();
    const current = LLMConfigManager.getConfig();
    setConfigList(configs);
    setCurrentConfig(current);
  }, [open]);

  const handleAddConfig = () => {
    setInitialConfig(undefined); // 新建配置时不需要初始值
    setShowLlmTest(true);
  };

  const handleLlmTestClose = () => {
    setShowLlmTest(false);
    // 刷新配置列表和当前配置
    const configs = LLMConfigListManager.getConfigList();
    const current = LLMConfigManager.getConfig();
    setConfigList(configs);
    setCurrentConfig(current);
  };

  const handleSwitchModel = (config: LLMConfig) => {
    // 直接保存为当前配置
    LLMConfigManager.saveConfig(config);
    // 更新当前配置状态
    setCurrentConfig(config);
  };

  const handleUpdateConfig = (config: LLMConfig) => {
    setInitialConfig(config);
    setShowLlmTest(true);
  };

  const handleDeleteConfig = (modelName: string) => {
    LLMConfigListManager.removeFromList(modelName);
    // 刷新配置列表和当前配置
    const configs = LLMConfigListManager.getConfigList();
    const current = LLMConfigManager.getConfig();
    setConfigList(configs);
    setCurrentConfig(current);
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
          Model API Management
          <CloseButton onClick={onClose} size="small">
            <CloseIcon />
          </CloseButton>
        </DialogTitle>

        <StyledDialogContent>
          <Container>
            <HeaderSection>
            </HeaderSection>

            <ListContainer>
              {configList.length === 0 ? (
                <EmptyStateContainer>
                  <EmptyStateIcon>
                    <CloudIcon />
                  </EmptyStateIcon>
                  <EmptyStateText variant="h6">
                    No API Configurations
                  </EmptyStateText>
                  <Typography variant="body2" color="text.secondary">
                    Add your first LLM API configuration to get started
                  </Typography>
                </EmptyStateContainer>
              ) : (
                <StyledList>
                  {configList.map((config) => {
                    const isActive = currentConfig?.modelName?.trim() === config.modelName?.trim();
                    return (
                      <StyledListItem key={config.modelName}>
                        <Box sx={{ flex: 1 }}>
                          <ModelNameText>
                            {config.modelName}
                          </ModelNameText>
                        </Box>
                        <SwitchButtonContainer>
                          {isActive ? (
                            <StatusChip
                              label="active"
                              status="active"
                              size="small"
                            />
                          ) : (
                            <>
                              <SwitchModelButton
                                variant="outlined"
                                size="small"
                                onClick={() => handleSwitchModel(config)}
                              >
                                Switch
                              </SwitchModelButton>
                              <UpdateModelButton
                                variant="outlined"
                                size="small"
                                onClick={() => handleUpdateConfig(config)}
                                startIcon={<EditIcon sx={{ fontSize: '14px' }} />}
                              >
                                Update
                              </UpdateModelButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteConfig(config.modelName)}
                                sx={{ ml: 1 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </SwitchButtonContainer>
                      </StyledListItem>
                    );
                  })}
                </StyledList>
              )}
            </ListContainer>

            <ActionButtonsContainer>
              <LeftButtons>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddConfig}
                >
                  Add Configuration
                </Button>
              </LeftButtons>
            </ActionButtonsContainer>
          </Container>
        </StyledDialogContent>
      </Dialog>

      {/* LLM Connection Test Dialog */}
      <LlmConnectionTest
        open={showLlmTest}
        onClose={handleLlmTestClose}
        initialConfig={initialConfig}
      />
    </>
  );
};

export default ModelApiManagement;
