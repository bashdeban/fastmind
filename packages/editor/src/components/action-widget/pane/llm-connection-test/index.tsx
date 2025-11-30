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
import { useIntl } from 'react-intl';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import { LLMService, DEFAULT_LLM_CONFIG } from '../../../../services/llm';
import { LLMConfigListManager } from '../../../../services/llm/config-list';
import type { LLMConfig } from '../../../../services/llm/types';
import {
  StyledDialogContent,
  CloseButton,
  StyledDialogPaper,
  FormContainer,
  ConfigurationSection,
  ResultSection,
  ResponseBox,
} from './styled';

interface LlmConnectionTestProps {
  open: boolean;
  onClose: () => void;
  initialConfig?: LLMConfig;
}

const LlmConnectionTest = ({ open, onClose, initialConfig }: LlmConnectionTestProps): React.ReactElement => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // LLM Service instance
  const [llmService] = useState(() => new LLMService());

  // Configuration state - initialize with default values
  const [apiUrl, setApiUrl] = useState(DEFAULT_LLM_CONFIG.apiUrl);
  const [modelName, setModelName] = useState(DEFAULT_LLM_CONFIG.modelName);
  const [apiKey, setApiKey] = useState(DEFAULT_LLM_CONFIG.apiKey);
  const [prompt, setPrompt] = useState('Hello, please introduce yourself briefly.');
  const [temperature, setTemperature] = useState(DEFAULT_LLM_CONFIG.temperature);
  const [maxTokens, setMaxTokens] = useState(DEFAULT_LLM_CONFIG.maxTokens);

  // Update form when dialog opens or initialConfig changes
  useEffect(() => {
    if (open) {
      // Clear results and errors when dialog opens
      setResult('');
      setError('');

      if (initialConfig) {
        setApiUrl(initialConfig.apiUrl);
        setModelName(initialConfig.modelName);
        setApiKey(initialConfig.apiKey);
        setTemperature(initialConfig.temperature);
        setMaxTokens(initialConfig.maxTokens);
      } else {
        // Reset to default values when adding new configuration
        setApiUrl(DEFAULT_LLM_CONFIG.apiUrl);
        setModelName(DEFAULT_LLM_CONFIG.modelName);
        setApiKey(DEFAULT_LLM_CONFIG.apiKey);
        setTemperature(DEFAULT_LLM_CONFIG.temperature);
        setMaxTokens(DEFAULT_LLM_CONFIG.maxTokens);
      }
    }
  }, [open, initialConfig]);

  const testLangChainConnection = async (): Promise<void> => {
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      console.log('🚀 Starting LLM connection test...');

      // Update service configuration with current form values
      const config = {
        apiUrl,
        modelName,
        apiKey,
        temperature,
        maxTokens,
      };

      console.log('📋 Configuration:', {
        ...config,
        prompt,
        timestamp: new Date().toISOString()
      });

      console.log('📤 Sending request to LLM...');
      console.log('📝 Prompt:', prompt);

      const startTime = Date.now();

      // Use the LLM service instead of direct fetch
      const content = await llmService.generateResponseWithConfig(prompt, config);

      const endTime = Date.now();

      console.log('✅ Response received successfully!');
      console.log('⏱️ Response time:', `${endTime - startTime}ms`);
      console.log('🤖 LLM Response:', content);

      setResult(content);
      console.log('🎉 Test completed successfully!');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : intl.formatMessage({ id: 'llm-connection-test.error-unknown', defaultMessage: 'Unknown error occurred' });
      console.error('❌ LLM Test Failed:', errorMessage);
      console.error('🔍 Full error details:', err);
      setError(`${intl.formatMessage({ id: 'llm-connection-test.error-connection-failed', defaultMessage: 'Connection failed' })}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (): Promise<void> => {
    try {
      const config = {
        apiUrl,
        modelName,
        apiKey,
        temperature,
        maxTokens,
      };

      // 只保存到配置列表中（自动去重），不保存为当前配置
      LLMConfigListManager.saveToList(config);

      console.log('✅ Configuration saved to list successfully:', modelName);

      // 关闭对话框并返回 Model API Management
      handleClose();

    } catch (error) {
      console.error('❌ Failed to save configuration:', error);
      setError(`${intl.formatMessage({ id: 'llm-connection-test.error-failed-config', defaultMessage: 'Configuration error' })}: ${error instanceof Error ? error.message : intl.formatMessage({ id: 'llm-connection-test.error-unknown', defaultMessage: 'Unknown error occurred' })}`);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperComponent={StyledDialogPaper}
    >
      <DialogTitle>
        {intl.formatMessage({ id: 'llm-connection-test.title', defaultMessage: 'LLM Connection Test' })}
        <CloseButton onClick={handleClose} size="small">
          <CloseIcon />
        </CloseButton>
      </DialogTitle>

      <StyledDialogContent>
        <FormContainer>
          <ConfigurationSection>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {intl.formatMessage({ id: 'llm-connection-test.description', defaultMessage: 'Test connection to any OpenAI-compatible API' })}
            </Typography>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {intl.formatMessage({ id: 'llm-connection-test.configuration', defaultMessage: 'Configuration' })}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label={intl.formatMessage({ id: 'llm-connection-test.api-url', defaultMessage: 'API URL' })}
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder={intl.formatMessage({ id: 'llm-connection-test.api-url-placeholder', defaultMessage: 'https://api.openai.com/v1/chat/completions' })}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label={intl.formatMessage({ id: 'llm-connection-test.model', defaultMessage: 'Model' })}
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder={intl.formatMessage({ id: 'llm-connection-test.model-placeholder', defaultMessage: 'gpt-3.5-turbo' })}
                  />
                  <TextField
                    label={intl.formatMessage({ id: 'llm-connection-test.api-key', defaultMessage: 'API Key' })}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    fullWidth
                    size="small"
                    type="password"
                    placeholder={intl.formatMessage({ id: 'llm-connection-test.api-key-placeholder', defaultMessage: 'Your API key' })}
                  />
                </Box>
                <TextField
                  label={intl.formatMessage({ id: 'llm-connection-test.prompt', defaultMessage: 'Prompt' })}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder={intl.formatMessage({ id: 'llm-connection-test.prompt-placeholder', defaultMessage: 'Enter your test prompt here...' })}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label={intl.formatMessage({ id: 'llm-connection-test.temperature', defaultMessage: 'Temperature' })}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    fullWidth
                    size="small"
                    type="number"
                    inputProps={{ min: 0, max: 2, step: 0.1 }}
                  />
                  <TextField
                    label={intl.formatMessage({ id: 'llm-connection-test.max-tokens', defaultMessage: 'Max Tokens' })}
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    fullWidth
                    size="small"
                    type="number"
                    inputProps={{ min: 1, max: 4096, step: 1 }}
                  />
                </Box>
              </Box>
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, p: 1 }}>
              <Button
                variant="contained"
                onClick={testLangChainConnection}
                disabled={isLoading}
                sx={{ mr: 2 }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {intl.formatMessage({ id: 'llm-connection-test.testing', defaultMessage: 'Testing...' })}
                  </>
                ) : (
                  intl.formatMessage({ id: 'llm-connection-test.test-connection', defaultMessage: 'Test LLM Connection' })
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={handleSaveConfig}
                disabled={isLoading}
              >
                {intl.formatMessage({ id: 'llm-connection-test.save-configuration', defaultMessage: 'Save Configuration' })}
              </Button>
            </Box>
          </ConfigurationSection>
          <ResultSection>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {result && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  {intl.formatMessage({ id: 'llm-connection-test.response', defaultMessage: 'Response:' })}
                </Typography>
                <ResponseBox>
                  {result}
                </ResponseBox>
              </Box>
            )}
          </ResultSection>
        </FormContainer>
      </StyledDialogContent>

      <DialogActions>

      </DialogActions>
    </Dialog>
  );
};

export default LlmConnectionTest;
