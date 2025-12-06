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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// Reuse styles from outline-view-dialog
export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  position: 'relative',
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
  margin: '12.5vh 25vw',
  height: '75vh',
  width: '50vw',
  maxWidth: '600px',
  maxHeight: 'none',
  border: '2px solid #ffa800',
  overflow: 'hidden',
  zIndex: theme.zIndex.modal + 1,
}));

export const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

export const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const ListContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

export const StyledList = styled(List)(() => ({
  padding: 0,
}));

export const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const ModelNameText = styled(Box)(() => ({
  fontWeight: 600,
  fontSize: '1rem',
}));

export const ModelUrlText = styled(Box)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

export const StatusChip = styled(Chip)<{ status: 'active' | 'inactive' }>(({ theme, status }) => ({
  backgroundColor: status === 'active'
    ? theme.palette.success.main
    : theme.palette.grey[500],
  color: theme.palette.common.white,
  fontSize: '0.75rem',
  height: '24px',
}));

export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
}));

export const LeftButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

export const RightButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
}));

export const EmptyStateIcon = styled(Box)(({ theme }) => ({
  fontSize: '4rem',
  marginBottom: theme.spacing(2),
  opacity: 0.5,
}));

export const EmptyStateText = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

export const SwitchButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

export const SwitchModelButton = styled(Button)(({ theme }) => ({
  fontSize: '0.75rem',
  padding: theme.spacing(0.5, 1),
  minWidth: '80px',
  height: '28px',
}));

export const UpdateModelButton = styled(Button)(({ theme }) => ({
  fontSize: '0.75rem',
  padding: theme.spacing(0.5, 1),
  minWidth: '80px',
  height: '28px',
  borderColor: theme.palette.warning.main,
  color: theme.palette.warning.main,
  '&:hover': {
    borderColor: theme.palette.warning.dark,
    backgroundColor: theme.palette.warning.light,
  },
}));
