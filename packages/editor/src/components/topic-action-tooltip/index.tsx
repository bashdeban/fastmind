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
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { IntlShape } from 'react-intl';

import { aiTopicGeneratorService } from '../../services/ai-topic-generator';
import { aiExplainerService } from '../../services/ai-explainer';
import { SettingsManager } from '../../services/settings/config';
import { Designer, Topic } from '@wisemapping/mindplot';

export type TopicActionTooltipProps = {
  designer: Designer;
  intl: IntlShape;
};

const TopicActionTooltip = ({ designer, intl }: TopicActionTooltipProps): React.ReactElement | null => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [shouldShowTooltip, setShouldShowTooltip] = useState(false);
  const [open, setOpen] = useState(false);
  const popperRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const lastSelectedTopicRef = useRef<Topic | null>(null);

  // Check selection status changes and update tooltip
  const checkAndUpdateTooltip = useCallback(() => {
    const topics = designer.getModel().filterSelectedTopics();
    const currentSelectedTopic = topics.length === 1 ? topics[0] : null;

    // Check if topic switching occurred
    if (currentSelectedTopic && currentSelectedTopic !== lastSelectedTopicRef.current) {
      // New topic selected
      lastSelectedTopicRef.current = currentSelectedTopic;

      try {
        const topic2DElement = currentSelectedTopic.get2DElement();
        const topicElement = topic2DElement.peer._native as SVGElement;

        if (topicElement) {
          const rect = topicElement.getBoundingClientRect();

          setPosition({
            top: rect.bottom + 8,
            left: rect.left + rect.width / 2
          });
          setAnchorEl(topicElement as unknown as HTMLElement);
          setSelectedTopic(currentSelectedTopic);
          setShouldShowTooltip(true);
          setOpen(true);
        }
      } catch (error) {
        console.warn('Failed to get topic position:', error);
      }
    } else if (!currentSelectedTopic && lastSelectedTopicRef.current) {
      // Deselected
      lastSelectedTopicRef.current = null;
      setShouldShowTooltip(false);
      setSelectedTopic(null);
      setOpen(false);
      setAnchorEl(null);
    }
  }, [designer, shouldShowTooltip]);

  // Handle topic focus event
  const handleTopicFocus = useCallback(() => {
    checkAndUpdateTooltip();
  }, [checkAndUpdateTooltip]);

  // Handle topic blur event
  const handleTopicBlur = useCallback(() => {
    // Delayed check to give other events time to process
    setTimeout(() => {
      checkAndUpdateTooltip();
    }, 10);
  }, [checkAndUpdateTooltip]);

  // Handle canvas click event - hide tooltip
  const handleCanvasClick = useCallback(() => {
    setShouldShowTooltip(false);
    setSelectedTopic(null);
    setOpen(false);
    setAnchorEl(null);
    lastSelectedTopicRef.current = null;
  }, []);

  // Handle canvas update event - hide tooltip when canvas moves
  const handleCanvasUpdate = useCallback(() => {
    // Only hide when tooltip is showing to avoid unnecessary state updates
    if (shouldShowTooltip) {
      setShouldShowTooltip(false);
      setOpen(false);
    }
  }, [shouldShowTooltip]);

  // Listen to editor menu and note edit events - hide tooltip
  const handleFeatureEdit = useCallback((event: unknown) => {
    // Type guard: check if event contains event property
    if (event && typeof event === 'object' && 'event' in event) {
      const featureEvent = event as { event: string; topic?: Topic };

      // Hide tooltip when opening edit menu or note
      if (featureEvent.event === 'link' || featureEvent.event === 'note' || featureEvent.event === 'ai-topic-generator' || featureEvent.event === 'ai-explainer') {
        
        // For note events, add delay to wait for topic selection to complete
        if (featureEvent.event === 'note') {
          setTimeout(() => {
            setShouldShowTooltip(false);
            setOpen(false);
          }, 50); // 50ms delay to ensure topic selection is completed
        } else {
          // Other events hide immediately
          setShouldShowTooltip(false);
          setOpen(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Listen to designer events
    designer.addEvent('onfocus', handleTopicFocus);
    designer.addEvent('onblur', handleTopicBlur);
    designer.addEvent('featureEdit', handleFeatureEdit);

    // Listen to canvas click and update events
    const canvas = designer.getWorkSpace();
    const screenManager = canvas.getScreenManager();
    screenManager.addEvent('click', handleCanvasClick);
    screenManager.addEvent('update', handleCanvasUpdate);

    return (): void => {
      designer.removeEvent('onfocus', handleTopicFocus);
      designer.removeEvent('onblur', handleTopicBlur);
      designer.removeEvent('featureEdit', handleFeatureEdit);
      screenManager.removeEvent('click', handleCanvasClick);
      screenManager.removeEvent('update', handleCanvasUpdate);
    };
  }, [designer, handleTopicFocus, handleTopicBlur, handleCanvasClick, handleFeatureEdit, handleCanvasUpdate]);

  const handleAIGenerateTopics = async (): Promise<void> => {
    if (!selectedTopic) return;

    try {
      const globalCustomPrompt = SettingsManager.getTopicGeneratorPrompt();
      await aiTopicGeneratorService.generateAndAddTopicsDirectly(
        selectedTopic,
        designer,
        { customPrompt: globalCustomPrompt }
      );
    } catch (error) {
      console.error('AI topic generation failed:', error);
    }
  };

  const handleAIExplain = async (): Promise<void> => {
    if (!selectedTopic) return;

    try {
      const globalCustomPrompt = SettingsManager.getExplainerPrompt();
      await aiExplainerService.generateAndStoreAnalysis(
        selectedTopic,
        designer,
        { customPrompt: globalCustomPrompt }
      );
    } catch (error) {
      console.error('AI explainer failed:', error);
    }
  };

  const handleCopy = async (): Promise<void> => {
    // Reuse Designer's copyToClipboard method
    await designer.copySelectedTopicsAsText();
    // Hide tooltip after operation completes
    setShouldShowTooltip(false);
    setOpen(false);
  };

  const handlePaste = async (): Promise<void> => {
    // Reuse Designer's pasteTextAsTopics method
    await designer.pasteTextAsTopics();
    // Hide tooltip after operation completes
    setShouldShowTooltip(false);
    setOpen(false);
  };

  const handleDeleteSubtopics = (): void => {
    // Reuse Designer's deleteChildTopics method
    designer.deleteChildTopics();
    // Hide tooltip after operation completes
    setShouldShowTooltip(false);
    setOpen(false);
  };

  const handleClickAway = (): void => {
    setShouldShowTooltip(false);
    setOpen(false);
  };

  // Only show tooltip when all conditions are met
  const shouldDisplay = shouldShowTooltip && selectedTopic && open;
  if (!shouldDisplay) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Popper
        open={shouldDisplay}
        anchorEl={anchorEl}
        placement="bottom"
        disablePortal
        ref={popperRef}
        style={{
          top: position.top,
          left: position.left,
          transform: 'translateX(-50%)',
          zIndex: 10000 // Increase z-index to ensure not blocked by note diagram
        }}
      >
        <Paper
          elevation={8}
          sx={{
            padding: 0.5,
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(33, 33, 33, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            display: 'flex',
            gap: 0.5
          }}
        >
          <Tooltip
            title={intl.formatMessage({
              id: 'editor-panel.tooltip-ai-topic-generator',
              defaultMessage: 'AI Topic Generator'
            })}
            placement="top"
            arrow
          >
            <IconButton
              size="small"
              onClick={handleAIGenerateTopics}
              sx={{
                color: theme.palette.success.main,
                '&:hover': {
                  backgroundColor: theme.palette.success.main,
                  color: theme.palette.success.contrastText
                }
              }}
            >
              <SmartToyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={intl.formatMessage({
              id: 'editor-panel.tooltip-ai-explainer',
              defaultMessage: 'AI Explainer'
            })}
            placement="top"
            arrow
          >
            <IconButton
              size="small"
              onClick={handleAIExplain}
              sx={{
                color: theme.palette.info.main,
                '&:hover': {
                  backgroundColor: theme.palette.info.main,
                  color: theme.palette.info.contrastText
                }
              }}
            >
              <AutoAwesomeIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={intl.formatMessage({
              id: 'shortcut-help-pane.copy-topic-as-text',
              defaultMessage: 'Copy topic as text'
            })}
            placement="top"
            arrow
          >
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                color: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText
                }
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={intl.formatMessage({
              id: 'shortcut-help-pane.paste-text-as-topics',
              defaultMessage: 'Paste text as topics'
            })}
            placement="top"
            arrow
          >
            <IconButton
              size="small"
              onClick={handlePaste}
              sx={{
                color: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText
                }
              }}
            >
              <ContentPasteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={intl.formatMessage({
              id: 'shortcut-help-pane.delete-child-topics',
              defaultMessage: 'Delete child topics'
            })}
            placement="top"
            arrow
          >
            <IconButton
              size="small"
              onClick={handleDeleteSubtopics}
              sx={{
                color: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText
                }
              }}
            >
              <DeleteSweepIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>
      </Popper>
    </ClickAwayListener>
  );
};

export default TopicActionTooltip;
