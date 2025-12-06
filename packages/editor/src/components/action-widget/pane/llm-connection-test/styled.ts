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

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';

// Reuse styles from outline-view-dialog
export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '26px',
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

export const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: 16,
  right: 16,
  zIndex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
});

export const StyledDialogPaper = styled(Paper)(({ theme }) => ({
  margin: '8vh 12.5vw',
  height: '85vh',
  width: '75vw',
  maxWidth: 'none',
  maxHeight: 'none',
  border: '2px solid #ffa800',
  overflow: 'hidden',
  zIndex: theme.zIndex.modal + 1,
}));

export const FormContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  gap: theme.spacing(2),
}));

export const ConfigurationSection = styled(Box)(({ theme }) => ({

  padding: theme.spacing(1),
}));

export const ResultSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  minHeight: 0,
}));

export const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const ResponseBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  fontFamily: 'monospace',
  fontSize: '0.675rem',
  maxHeight: '400px',
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
}));
