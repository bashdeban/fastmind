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
            defaultMessage: 'FastMind is a VS Code extension based on WiseMapping that provides powerful mind mapping capabilities for developers. It integrates AI-driven topic generation, OpenAI API compatible model integration, AI-generated content intelligent deduplication, VS Code native file system integration, and other advanced features to help developers better organize and visualize their ideas.',
          })}
        </Typography>

        {/* 主要功能特性 */}
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          {intl.formatMessage({
            id: 'information-dialog.features-title',
            defaultMessage: 'Key Features:',
          })}
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            {intl.formatMessage({
              id: 'information-dialog.feature-ai',
              defaultMessage: 'AI-driven topic generation',
            })}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            {intl.formatMessage({
              id: 'information-dialog.feature-api-integration',
              defaultMessage: 'OpenAI API compatible model integration',
            })}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            {intl.formatMessage({
              id: 'information-dialog.feature-deduplication',
              defaultMessage: 'AI-generated content intelligent deduplication',
            })}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            {intl.formatMessage({
              id: 'information-dialog.feature-vscode-integration',
              defaultMessage: 'VS Code native file system integration',
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
