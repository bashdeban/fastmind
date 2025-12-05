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
import { PromptManager } from '../../../../services/prompt-manager';
import { useIntl } from 'react-intl';
import type { AITopicGeneratorProps } from './types';

const AITopicGenerator: React.FC<AITopicGeneratorProps> = ({
  closeModal,
  selectedTopicText,
  parentTopicId,
  designer,
}) => {
  const intl = useIntl();
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
      // 获取所有激活的模板提示词组合
      const globalCustomPrompt = PromptManager.getCombinedActiveContent('topic-generator');
      
      // 合并激活模板和本地自定义提示词
      const mergedOptions: AITopicGeneratorOptions = {
        ...options,
        customPrompt: globalCustomPrompt && options.customPrompt 
          ? `${globalCustomPrompt}\n\n${options.customPrompt}`
          : globalCustomPrompt || options.customPrompt
      };
      
      const topics = await aiTopicGeneratorService.generateTopics(selectedTopicText, mergedOptions);
      setGeneratedTopics(topics.map(topic => topic.text));
    } catch (err) {
      setError(err instanceof Error ? err.message : intl.formatMessage({ id: 'ai-topic-generator.error-generate', defaultMessage: 'Error occurred while generating topics' }));
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

      // Add topics to mindmap one by one using action dispatcher
      for (const topicModel of topicModels) {
        designer.getActionDispatcher().addTopics([topicModel], [parentTopicId]);
      }
      
      // Close modal after successful addition
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : intl.formatMessage({ id: 'ai-topic-generator.error-add', defaultMessage: 'Error occurred while adding topics' }));
    }
  };

  const regenerateTopics = () => {
    generateTopics();
  };

  return (
    <Dialog open maxWidth="md" fullWidth onClose={closeModal}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon color="primary" />
        {intl.formatMessage({ id: 'ai-topic-generator.title', defaultMessage: 'AI Topic Generator' })}
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
            {intl.formatMessage(
              { id: 'ai-topic-generator.description', defaultMessage: 'Generate related subtopics based on <strong>{topicText}</strong>' },
              { topicText: selectedTopicText }
            )}
          </Typography>

          {/* Topic Count Slider */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {intl.formatMessage(
                { id: 'ai-topic-generator.count-label', defaultMessage: 'Number of topics to generate: {count}' },
                { count: options.count }
              )}
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
              label={intl.formatMessage({ id: 'ai-topic-generator.custom-prompt-label', defaultMessage: 'Custom Prompt (Optional)' })}
              multiline
              rows={3}
              fullWidth
              placeholder={intl.formatMessage({ id: 'ai-topic-generator.custom-prompt-placeholder', defaultMessage: 'e.g.: Focus on technical implementation aspects' })}
              value={options.customPrompt}
              onChange={handleCustomPromptChange}
              disabled={isGenerating}
              helperText={intl.formatMessage({ id: 'ai-topic-generator.custom-prompt-helper', defaultMessage: 'Provide additional context or requirements for AI generation' })}
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
              {intl.formatMessage({ id: 'ai-topic-generator.generating', defaultMessage: 'Generating topics, please wait...' })}
            </Typography>
          </Box>
        )}

        {/* Generated Topics Preview */}
        {generatedTopics.length > 0 && !isGenerating && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {intl.formatMessage({ id: 'ai-topic-generator.preview-title', defaultMessage: 'Generated topics preview:' })}
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
              {intl.formatMessage({ id: 'ai-topic-generator.cancel', defaultMessage: 'Cancel' })}
            </Button>
            <Button
              onClick={generateTopics}
              variant="contained"
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={16} /> : <AIIcon />}
            >
              {intl.formatMessage({ 
                id: isGenerating ? 'ai-topic-generator.generating-button' : 'ai-topic-generator.generate', 
                defaultMessage: isGenerating ? 'Generating...' : 'Generate Topics' 
              })}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={regenerateTopics} disabled={isGenerating}>
              {intl.formatMessage({ id: 'ai-topic-generator.regenerate', defaultMessage: 'Regenerate' })}
            </Button>
            <Button onClick={closeModal} disabled={isGenerating}>
              {intl.formatMessage({ id: 'ai-topic-generator.cancel', defaultMessage: 'Cancel' })}
            </Button>
            <Button
              onClick={addTopicsToMap}
              variant="contained"
              disabled={isGenerating}
              startIcon={<AIIcon />}
            >
              {intl.formatMessage({ id: 'ai-topic-generator.add-to-mindmap', defaultMessage: 'Add to Mindmap' })}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AITopicGenerator;
