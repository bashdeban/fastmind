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

interface LlmTestProps {
  closeModal?: () => void;
}

const LlmTest = ({ closeModal }: LlmTestProps): React.ReactElement => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Configuration state
  const [apiUrl, setApiUrl] = useState('https://open.bigmodel.cn/api/paas/v4/chat/completions');
  const [modelName, setModelName] = useState('glm-4.5-air');
  const [apiKey, setApiKey] = useState('b8237c13fdd94187a2248bbb86c50251.HTJcOFe52F7EYU3S');
  const [prompt, setPrompt] = useState('Hello, please introduce yourself briefly and tell me what you can do.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(150);

  const testLangChainConnection = async (): Promise<void> => {
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      console.log('🚀 Starting LLM connection test...');

      console.log('📋 Configuration:', {
        apiUrl,
        modelName,
        prompt,
        temperature,
        maxTokens,
        timestamp: new Date().toISOString()
      });

      console.log('📤 Sending request to LLM...');
      console.log('📝 Prompt:', prompt);

      const startTime = Date.now();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      const endTime = Date.now();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log('✅ Response received successfully!');
      console.log('⏱️ Response time:', `${endTime - startTime}ms`);
      console.log('🤖 LLM Response:', data.choices[0]?.message?.content);
      console.log('📊 Usage metadata:', data.usage);

      const content = data.choices[0]?.message?.content || 'No response content';
      setResult(content);
      console.log('🎉 Test completed successfully!');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ LLM Test Failed:', errorMessage);
      console.error('🔍 Full error details:', err);
      setError(`Connection failed: ${errorMessage}`);
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
        LLM Connection Test
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Test connection to any OpenAI-compatible API
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Configuration
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="API URL"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              fullWidth
              size="small"
              placeholder="https://api.openai.com/v1/chat/completions"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Model"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                fullWidth
                size="small"
                placeholder="gpt-3.5-turbo"
              />
              <TextField
                label="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                fullWidth
                size="small"
                type="password"
                placeholder="Your API key"
              />
            </Box>
            <TextField
              label="Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="Enter your test prompt here..."
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Temperature"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, max: 2, step: 0.1 }}
              />
              <TextField
                label="Max Tokens"
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
              Testing...
            </>
          ) : (
            'Test LLM Connection'
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
              Response:
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
          Open browser console for detailed logs
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LlmTest;
