/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this copy of the license at
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
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';
import { ExportFormat, ExportFormatInfo } from './types';

interface ExportFormatSelectorProps {
  selectedFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
}

const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
}) => {
  const intl = useIntl();

  const exportFormats: ExportFormatInfo[] = [
    {
      id: 'svg',
      name: 'SVG',
      description: intl.formatMessage({
        id: 'export.format.svg.description',
        defaultMessage: 'Scalable Vector Graphics - Vector graphics, infinitely scalable, small file size',
      }),
      extension: 'svg',
      category: 'image',
      recommended: true,
    },
    {
      id: 'wxml',
      name: 'WiseMapping XML',
      description: intl.formatMessage({
        id: 'export.format.wxml.description',
        defaultMessage: 'WiseMapping XML - Native format, retains all editing features, can be re-imported for editing',
      }),
      extension: 'wxml',
      category: 'text',
      recommended: true,
    },
    {
      id: 'md',
      name: 'Markdown',
      description: intl.formatMessage({
        id: 'export.format.md.description',
        defaultMessage: 'Markdown format - Suitable for document writing and version control, supports GitHub and other platforms',
      }),
      extension: 'md',
      category: 'text',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {exportFormats.map((format) => (
        <Card
          key={format.id}
          sx={{
            cursor: 'pointer',
            border: selectedFormat === format.id ? '1px solid #1976d2' : '1px solid #e0e0e0',
            outline: selectedFormat === format.id ? '1px solid #1976d2' : 'none',
            outlineOffset: '-1px',
            boxShadow: selectedFormat === format.id ? 2 : 0,
            '&:hover': {
              border: '1px solid #1976d2',
              outline: '1px solid #1976d2',
              outlineOffset: '-1px',
              boxShadow: 2,
            },
          }}
          onClick={() => onFormatChange(format.id)}
        >
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography
              variant="subtitle2"
              component="div"
              sx={{ fontWeight: 'bold', mb: 0.25, fontSize: '0.875rem' }}
            >
              {format.name}
              {format.recommended && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    px: 1,
                    borderRadius: 1,
                    fontSize: '0.6rem',
                    ml: 1,
                  }}
                >
                  {intl.formatMessage({
                    id: 'export.format.recommended',
                    defaultMessage: 'Recommended',
                  })}
                </Typography>
              )}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.2, fontSize: '0.75rem' }}
            >
              {format.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ExportFormatSelector;
