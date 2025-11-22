import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const LlmTest = (): React.ReactElement => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Configuration variables
  const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  const modelName = 'glm-4.5-air'; // 智谱AI GLM-4.5 model
  const apiKey = 'b8237c13fdd94187a2248bbb86c50251.HTJcOFe52F7EYU3S'; // 智谱AI API key

  const testLangChainConnection = async (): Promise<void> => {
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      console.log('🚀 Starting LLM connection test...');

      const prompt = 'Hello, please introduce yourself briefly and tell me what you can do.';

      console.log('📋 Configuration:', {
        apiUrl,
        modelName,
        prompt,
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
          temperature: 0.7,
          max_tokens: 150,
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

  return (
    <Box sx={{ p: 2, minWidth: 300 }}>
      <Typography variant="h6" gutterBottom>
        LLM Connection Test
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Test direct connection to 智谱AI (GLM) API
      </Typography>

      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Configuration:</strong>
      </Typography>
      <Typography variant="caption" component="div" sx={{ mb: 2, fontFamily: 'monospace' }}>
        URL: {apiUrl}<br />
        Model: {modelName}<br />
        API Key: {apiKey.substring(0, 10)}...
      </Typography>

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
    </Box>
  );
};

export default LlmTest;
