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
import React, { useEffect, useState } from 'react';
import { Fade } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { llmProgressManager, type LLMTask } from './manager';

const LLMProgressNotification: React.FC = () => {
  const [tasks, setTasks] = useState<LLMTask[]>([]);

  useEffect(() => {
    const unsubscribe = llmProgressManager.subscribe(() => {
      setTasks(llmProgressManager.getTasks());
    });

    // Initial load
    setTasks(llmProgressManager.getTasks());

    return unsubscribe;
  }, []);

  const getTaskIcon = (task: LLMTask) => {
    switch (task.status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />;
      case 'running':
        return (
          <CircularProgress
            size={20}
            thickness={3}
            sx={{
              color: 'primary.main',
            }}
          />
        );
      default:
        return (
          <CircularProgress
            size={20}
            thickness={3}
            sx={{
              color: 'action.disabled',
            }}
          />
        );
    }
  };

  const getTaskColor = (task: LLMTask) => {
    switch (task.status) {
      case 'completed':
        return 'success.main';
      case 'error':
        return 'error.main';
      case 'running':
        return 'primary.main';
      default:
        return 'text.secondary';
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {tasks.map((task) => (
        <Fade key={task.id} in timeout={300}>
          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
              p: 2,
              minWidth: 300,
              maxWidth: 400,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {getTaskIcon(task)}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: getTaskColor(task),
                  flex: 1,
                }}
              >
                {task.title}
              </Typography>
              <IconButton
                size="small"
                onClick={() => llmProgressManager.removeTask(task.id)}
                sx={{ p: 0.5 }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {task.description}
            </Typography>

            {task.status === 'running' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: 'action.disabled',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        borderRadius: 2,
                        backgroundColor: 'primary.main',
                        width: `${task.progress}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(task.progress)}%
                </Typography>
              </Box>
            )}

            {task.status === 'completed' && (
              <Typography variant="caption" color="success.main">
                已完成
              </Typography>
            )}

            {task.status === 'error' && (
              <Typography variant="caption" color="error.main">
                失败
              </Typography>
            )}
          </Box>
        </Fade>
      ))}
    </Box>
  );
};

export default LLMProgressNotification;
