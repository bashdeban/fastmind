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
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useIntl } from 'react-intl';
import ExportFormatSelector from './ExportFormatSelector';
import ExportOptions from './ExportOptions';
import { ExportFormat, ExportDialogProps, ExportOptions as ExportOptionsType } from './types';

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  onExport,
  mindmapTitle = 'mindmap',
}) => {
  const intl = useIntl();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('md');
  const [exportOptions, setExportOptions] = useState<ExportOptionsType>({
    format: 'md',
    filename: mindmapTitle,
    includeWatermark: false,
    scale: 1,
    quality: 90,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setExportOptions(prev => ({ ...prev, format: selectedFormat }));
  }, [selectedFormat]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(null);

    try {
      const result = await onExport(exportOptions);

      // Handle different export types
      if (selectedFormat === 'md') {
        setExportSuccess(
          intl.formatMessage({
            id: 'export.dialog.clipboard-success',
            defaultMessage: 'Content copied to clipboard!',
          })
        );
      }
      // Don't close dialog to show success message
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(
        error instanceof Error
          ? error.message
          : intl.formatMessage({
            id: 'export.dialog.error-generic',
            defaultMessage: 'Export failed, please try again later.',
          })
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setExportError(null);
      setExportSuccess(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      PaperProps={{
        sx: {
          minWidth: '500px',
          border: '2px solid #ffa800',
          boxShadow: 'none',
        }
      }}
    >
      <DialogTitle>
        {intl.formatMessage({
          id: 'export.dialog.title',
          defaultMessage: 'Export Mindmap',
        })}
      </DialogTitle>

      <DialogContent>
        {exportError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {exportError}
          </Alert>
        )}

        {exportSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {exportSuccess}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <ExportFormatSelector
            selectedFormat={selectedFormat}
            onFormatChange={setSelectedFormat}
          />

          <ExportOptions
            format={selectedFormat}
            options={exportOptions}
            onOptionsChange={setExportOptions}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={isExporting}
        >
          {intl.formatMessage({
            id: 'export.dialog.cancel',
            defaultMessage: 'Cancel',
          })}
        </Button>

        <Button
          onClick={handleExport}
          variant="contained"
          disabled={isExporting}
          startIcon={isExporting ? <CircularProgress size={20} /> : null}
        >
          {isExporting
            ? intl.formatMessage({
              id: 'export.dialog.exporting',
              defaultMessage: 'Exporting...',
            })
            : intl.formatMessage({
              id: 'export.dialog.export',
              defaultMessage: 'Export',
            })
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
