/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically Apache License, Version 2.0 (the "License") plus the
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
import { ExportFormat, ExportOptions } from './types';

interface ExportOptionsProps {
  format: ExportFormat;
  options: ExportOptions;
  onOptionsChange: (options: ExportOptions) => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = () => {
  return (
    <Box>
      {/* No export options needed - simplified interface */}
    </Box>
  );
};

export default ExportOptions;
