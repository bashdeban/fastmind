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

export type ExportFormat = 
  // Image formats
  | 'svg' 
  // Text/Data formats
  | 'wxml' 
  | 'md';

export interface ExportFormatInfo {
  id: ExportFormat;
  name: string;
  description: string;
  extension: string;
  category: 'image' | 'text';
  recommended?: boolean;
}

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeWatermark?: boolean;
  scale?: number; // For image formats
  quality?: number; // For jpg/jpeg (0-100)
  copyToClipboard?: boolean; // For PNG - copy to clipboard instead of download
}

export interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  mindmapTitle?: string;
}
