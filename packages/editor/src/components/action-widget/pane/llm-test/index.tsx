import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { LLMService, DEFAULT_LLM_CONFIG } from '../../../../services/llm';
import { FormattedMessage, useIntl } from 'react-intl';

interface LlmTestProps {
  closeModal?: () => void;
}

const LlmTest = ({ closeModal }: LlmTestProps): React.ReactElement => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // LLM Service instance
  const [llmService] = useState(() => new LLMService());

  // Configuration state - use defaults from service
  const [apiUrl, setApiUrl] = useState(DEFAULT_LLM_CONFIG.apiUrl);
  const [modelName, setModelName] = useState(DEFAULT_LLM_CONFIG.modelName);
  const [apiKey, setApiKey] = useState(DEFAULT_LLM_CONFIG.apiKey);
  const [prompt, setPrompt] = useState('Hello, please introduce yourself briefly and tell me what you can do.');
  const [temperature, setTemperature] = useState(DEFAULT_LLM_CONFIG.temperature);
  const [maxTokens, setMaxTokens] = useState(DEFAULT_LLM_CONFIG.maxTokens);

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

  const handleClose = () => {
    if (closeModal) {
      closeModal();
    }
  };

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '400px',
          border: '2px solid #ffa800',
          boxShadow: 'none',
        },
      }}
    >
      <DialogTitle>
        <FormattedMessage id="llm-connection-test.title" defaultMessage="LLM Connection Test" />
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <FormattedMessage id="llm-connection-test.description" defaultMessage="Test connection to any OpenAI-compatible API" />
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <FormattedMessage id="llm-connection-test.configuration" defaultMessage="Configuration" />
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
              rows={3}
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

        <Button
          variant="contained"
          onClick={testLangChainConnection}
          disabled={isLoading}
          fullWidth
          sx={{ mb: 2 }}
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              <FormattedMessage id="llm-connection-test.response" defaultMessage="Response:" />
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                maxHeight: 200,
                overflow: 'auto'
              }}
            >
              {result}
            </Box>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary">
          <FormattedMessage id="llm-connection-test.console-logs" defaultMessage="Open browser console for detailed logs" />
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          <FormattedMessage id="llm-connection-test.close" defaultMessage="Close" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LlmTest;
