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
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Slider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { aiTopicGeneratorService, type AITopicGeneratorOptions } from '../../../../services/ai-topic-generator';
import type { AITopicGeneratorProps } from './types';

const AITopicGenerator: React.FC<AITopicGeneratorProps> = ({
  closeModal,
  selectedTopicText,
  parentTopicId,
  designer,
}) => {
  const [options, setOptions] = useState<AITopicGeneratorOptions>({
    count: 5,
    customPrompt: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCountChange = (event: Event, newValue: number | number[]) => {
    setOptions(prev => ({ ...prev, count: newValue as number }));
  };

  const handleCustomPromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({ ...prev, customPrompt: event.target.value }));
  };

  const generateTopics = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedTopics([]);

    try {
      const topics = await aiTopicGeneratorService.generateTopics(selectedTopicText, options);
      setGeneratedTopics(topics.map(topic => topic.text));
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成主题时发生错误');
    } finally {
      setIsGenerating(false);
    }
  };

  const addTopicsToMap = async () => {
    if (generatedTopics.length === 0) return;

    try {
      // Create NodeModel instances
      const topicModels = aiTopicGeneratorService.createTopicModels(
        generatedTopics.map(text => ({ text })),
        designer,
        parentTopicId,
      );

      // Add topics to the mindmap one by one using action dispatcher
      for (const topicModel of topicModels) {
        designer.getActionDispatcher().addTopics([topicModel], [parentTopicId]);
      }
      
      // Close modal after successful addition
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加主题时发生错误');
    }
  };

  const regenerateTopics = () => {
    generateTopics();
  };

  return (
    <Dialog open maxWidth="md" fullWidth onClose={closeModal}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon color="primary" />
        AI 主题生成器
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={{ ml: 'auto' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            基于主题 <strong>{selectedTopicText}</strong> 生成相关子主题
          </Typography>

          {/* Topic Count Slider */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              生成主题数量: {options.count}
            </Typography>
            <Slider
              value={options.count}
              onChange={handleCountChange}
              min={3}
              max={8}
              marks={[
                { value: 3, label: '3' },
                { value: 5, label: '5' },
                { value: 8, label: '8' },
              ]}
              valueLabelDisplay="auto"
              disabled={isGenerating}
            />
          </Box>

          {/* Custom Prompt */}
          <Box sx={{ mb: 3 }}>
            <TextField
              label="自定义提示 (可选)"
              multiline
              rows={3}
              fullWidth
              placeholder="例如：重点关注技术实现方面"
              value={options.customPrompt}
              onChange={handleCustomPromptChange}
              disabled={isGenerating}
              helperText="为AI生成提供额外的上下文或要求"
            />
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              正在生成主题，请稍候...
            </Typography>
          </Box>
        )}

        {/* Generated Topics Preview */}
        {generatedTopics.length > 0 && !isGenerating && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              生成的主题预览:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {generatedTopics.map((topic, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'background.default',
                  }}
                >
                  <Typography variant="body2">
                    {index + 1}. {topic}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {generatedTopics.length === 0 ? (
          <>
            <Button onClick={closeModal} disabled={isGenerating}>
              取消
            </Button>
            <Button
              onClick={generateTopics}
              variant="contained"
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={16} /> : <AIIcon />}
            >
              {isGenerating ? '生成中...' : '生成主题'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={regenerateTopics} disabled={isGenerating}>
              重新生成
            </Button>
            <Button onClick={closeModal} disabled={isGenerating}>
              取消
            </Button>
            <Button
              onClick={addTopicsToMap}
              variant="contained"
              disabled={isGenerating}
              startIcon={<AIIcon />}
            >
              添加到思维导图
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AITopicGenerator;
