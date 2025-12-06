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

import { styled } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
}));

export const StyledListItem = styled(ListItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 2),

  '&:last-child': {
    borderBottom: 'none',
  },

  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },

  '& .MuiListItemIcon-root': {
    minWidth: '32px',
  },

  '& .MuiListItemText-primary': {
    fontWeight: 500,
    fontSize: '0.9rem',
  },

  '& .MuiListItemText-secondary': {
    marginTop: theme.spacing(0.25),
  },
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

export const PromptNameText = styled(Box)(() => ({
  fontWeight: 600,
  fontSize: '0.875rem',
}));

export const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

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

export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
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
