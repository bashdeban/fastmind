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

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useIntl } from 'react-intl';

interface InformationDialogProps {
  open: boolean;
  onClose: () => void;
}

const InformationDialog = ({ open, onClose }: InformationDialogProps): React.ReactElement => {
  const intl = useIntl();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: '2px solid #ffa800',
          boxShadow: 'none',
        },
      }}
    >
      <DialogTitle>
        {intl.formatMessage({
          id: 'information-dialog.title',
          defaultMessage: 'Information',
        })}
      </DialogTitle>

      <DialogContent>
        {/* FastMind 项目简介 */}
        <Typography variant="h6" gutterBottom>
          FastMind VS Code Extension
        </Typography>
        <Typography variant="body2" paragraph sx={{ lineHeight: 1.6 }}>
          {intl.formatMessage({
            id: 'information-dialog.fastmind-description',
            defaultMessage: 'FastMind 是一个基于 WiseMapping 的 VS Code 扩展，为开发者提供强大的思维导图编辑功能。它集成了 AI 主题生成、实时协作、多种布局选项等先进功能，帮助开发者更好地组织和可视化他们的想法。',
          })}
        </Typography>

        {/* 主要功能特性 */}
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          {intl.formatMessage({
            id: 'information-dialog.features-title',
            defaultMessage: '主要功能：',
          })}
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            {intl.formatMessage({
              id: 'information-dialog.feature-ai',
              defaultMessage: 'AI 驱动的主题生成',
            })}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            {intl.formatMessage({
              id: 'information-dialog.feature-api-integration',
              defaultMessage: '兼容OpenAI API规范的模型接入',
            })}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            {intl.formatMessage({
              id: 'information-dialog.feature-deduplication',
              defaultMessage: 'AI生成内容智能去重',
            })}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            {intl.formatMessage({
              id: 'information-dialog.feature-vscode-integration',
              defaultMessage: 'VS Code原生文件系统集成',
            })}
          </Typography>
        </Box>

        {/* Powered by WiseMapping */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {intl.formatMessage({
              id: 'information-dialog.powered-by',
              defaultMessage: 'Powered by',
            })}
          </Typography>
          <Link
            href="https://wisemapping.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <Typography variant="body2" component="span">
              WiseMapping
            </Typography>
            <OpenInNewIcon sx={{ fontSize: 14 }} />
          </Link>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {intl.formatMessage({
            id: 'information-dialog.close',
            defaultMessage: 'Close',
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InformationDialog;
