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

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

/**
 * Styled container for preview mode editor dialog
 * Same dimensions as StyledPreviewContainer for consistent user experience
 * Used when editing from preview mode, not from Add Note
 */
export const StyledPreviewEditorContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    width: 'clamp(600px, 85vw, 1000px)',
    height: 'clamp(500px, 75vh, 800px)',
    maxHeight: '90vh',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '12px',
    border: '1px solid',
    borderColor: theme.palette.divider,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.shadows[8],
}));
