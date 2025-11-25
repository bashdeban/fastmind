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

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import CloudIcon from '@mui/icons-material/Cloud';
import LlmConnectionTest from '../llm-connection-test';
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
  ModelUrlText,
  StatusChip,
  ActionButtonsContainer,
  LeftButtons,
  RightButtons,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateText,
} from './styled';

// Mock data for API configurations
const mockApiConfigs = [
  {
    id: '1',
    name: 'GPT-4',
    url: 'https://api.openai.com/v1/chat/completions',
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Claude-3',
    url: 'https://api.anthropic.com/v1/messages',
    status: 'active' as const,
  },
  {
    id: '3',
    name: 'Local LLM',
    url: 'http://localhost:11434/api/generate',
    status: 'inactive' as const,
  },
];

interface ModelApiManagementProps {
  open: boolean;
  onClose: () => void;
}

const ModelApiManagement = ({ open, onClose }: ModelApiManagementProps): React.ReactElement => {
  const [showLlmTest, setShowLlmTest] = useState(false);
  const [apiConfigs] = useState(mockApiConfigs);

  const handleAddConfig = () => {
    setShowLlmTest(true);
  };

  const handleLlmTestClose = () => {
    setShowLlmTest(false);
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
            <SettingsIcon />
          </CloseButton>
        </DialogTitle>
        
        <StyledDialogContent>
          <Container>
            <HeaderSection>
              <Typography variant="h6" gutterBottom>
                LLM API Configurations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your configured language model APIs
              </Typography>
            </HeaderSection>

            <ListContainer>
              {apiConfigs.length === 0 ? (
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
                  {apiConfigs.map((config) => (
                    <StyledListItem key={config.id}>
                      <Box sx={{ flex: 1 }}>
                        <ModelNameText>
                          {config.name}
                        </ModelNameText>
                        <ModelUrlText>
                          {config.url}
                        </ModelUrlText>
                      </Box>
                      <StatusChip 
                        label={config.status} 
                        status={config.status}
                        size="small"
                      />
                    </StyledListItem>
                  ))}
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
              <RightButtons>
                <Button onClick={onClose}>
                  Close
                </Button>
              </RightButtons>
            </ActionButtonsContainer>
          </Container>
        </StyledDialogContent>
      </Dialog>

      {/* LLM Connection Test Dialog */}
      <LlmConnectionTest
        open={showLlmTest}
        onClose={handleLlmTestClose}
      />
    </>
  );
};

export default ModelApiManagement;
