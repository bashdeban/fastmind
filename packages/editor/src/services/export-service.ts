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
import { Designer } from '@wisemapping/mindplot';
import ImageExporterFactory from '@wisemapping/mindplot/src/components/export/ImageExporterFactory';
import TextExporterFactory from '@wisemapping/mindplot/src/components/export/TextExporterFactory';
import { ExportFormat, ExportOptions } from '../components/action-widget/pane/export-dialog/types';

// Global type declarations for VS Code API
declare global {
  interface Window {
    vscodePersistenceManager?: {
      exportImage: (imageData: string, fileName: string, format: string) => Promise<void>;
    };
    // VS Code API instance (from bootstrap)
    vscode?: {
      postMessage: (message: unknown) => void;
    };
    acquireVsCodeApi?(): {
      postMessage: (message: unknown) => void;
    };
    // VS Code bootstrap detection
    __FAST_MIND_VSCODE_BOOTSTRAP__?: {
      fileName?: string;
      resourceUrl?: string;
      mapId?: string;
      locale?: string;
      onChanged?: (newXml: string) => void;
      onSaveStatus?: (status: unknown) => void;
    };
  }
}

/**
 * Check if running in VS Code environment
 */
function isVSCodeEnvironment(): boolean {
  return typeof window !== 'undefined' && 
         (typeof window.vscode !== 'undefined' || 
          typeof window.__FAST_MIND_VSCODE_BOOTSTRAP__ !== 'undefined' ||
          typeof window.acquireVsCodeApi === 'function');
}

/**
 * Handle image export for VS Code environment
 */
async function handleImageExportForVSCode(
  dataUrl: string,
  options: ExportOptions
): Promise<string> {
  try {
    // Generate filename with proper extension
    const format = options.format === 'jpg' || options.format === 'jpeg' ? 'jpeg' : 'png';
    const extension = format === 'jpeg' ? 'jpg' : format;
    const filename = `${options.filename || 'mindmap'}.${extension}`;
    
    // Get VS Code persistence manager if available
    if (window.vscodePersistenceManager && 
        typeof window.vscodePersistenceManager.exportImage === 'function') {
      await window.vscodePersistenceManager.exportImage(dataUrl, filename, format);
      return dataUrl;
    }
    
    // Use the VS Code API instance from bootstrap (preferred)
    if (window.vscode) {
      window.vscode.postMessage({
        type: 'imageExport',
        imageData: dataUrl,
        fileName: filename
      });
      return dataUrl;
    }
    
    // Fallback: try to get VS Code API (only if not already acquired)
    if (typeof window.acquireVsCodeApi === 'function' && !window.vscode) {
      try {
        const vscode = window.acquireVsCodeApi();
        if (vscode) {
          vscode.postMessage({
            type: 'imageExport',
            imageData: dataUrl,
            fileName: filename
          });
          return dataUrl;
        }
      } catch (apiError) {
        console.warn('Failed to acquire VS Code API:', apiError);
      }
    }
    
    throw new Error('VS Code export API not available');
    
  } catch (error) {
    console.error('VS Code image export failed:', error);
    throw new Error('VS Code image export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Handle markdown export for VS Code environment
 */
async function handleMarkdownExportForVSCode(
  content: string,
  options: ExportOptions
): Promise<string> {
  try {
    // Generate filename with .md extension
    const filename = `${options.filename || 'mindmap'}.md`;
    
    // Use the VS Code API instance from bootstrap (preferred)
    if (window.vscode) {
      window.vscode.postMessage({
        type: 'markdownExport',
        markdownData: content,
        fileName: filename
      });
      return content;
    }
    
    // Fallback: try to get VS Code API (only if not already acquired)
    if (typeof window.acquireVsCodeApi === 'function' && !window.vscode) {
      try {
        const vscode = window.acquireVsCodeApi();
        if (vscode) {
          vscode.postMessage({
            type: 'markdownExport',
            markdownData: content,
            fileName: filename
          });
          return content;
        }
      } catch (apiError) {
        console.warn('Failed to acquire VS Code API:', apiError);
      }
    }
    
    throw new Error('VS Code export API not available');
    
  } catch (error) {
    console.error('VS Code markdown export failed:', error);
    throw new Error('VS Code markdown export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Export service that handles all export operations for mindmaps
 */
export class ExportService {
  private designer: Designer;

  constructor(designer: Designer) {
    this.designer = designer;
  }

  /**
   * Export mindmap to the specified format
   */
  async export(options: ExportOptions): Promise<string | void> {
    const { format, scale = 1 } = options;
    
    try {
      // Get the mindmap model
      const mindmap = this.designer.getMindmap();
      if (!mindmap) {
        throw new Error('No mindmap found to export');
      }

      // Get the SVG element for image exports
      const svgElement = this.getSvgElement();
      if (!svgElement && ['png', 'jpg', 'jpeg'].includes(format)) {
        throw new Error('No SVG element found for image export');
      }

      // Perform the export based on format
      let exportResult: string;
      
      if (format === 'png' || format === 'jpg' || format === 'jpeg') {
        // For image formats (PNG, JPG), use binary image exporter
        const bbox = (svgElement as SVGSVGElement).getBBox();
        const width = bbox.width * scale;
        const height = bbox.height * scale;
        
        // Convert 'jpeg' to 'jpg' for the factory
        const imageFormat = format === 'jpeg' ? 'jpg' : format as 'png' | 'jpg';
        
        const imageExporter = ImageExporterFactory.create(
          imageFormat,
          svgElement!, 
          width, 
          height,
          true // adjustToFit
        );
        
        // Use exportAndEncode to get base64 data URL
        exportResult = await imageExporter.exportAndEncode();
        
        // Check if running in VS Code environment
        if (isVSCodeEnvironment()) {
          return await handleImageExportForVSCode(exportResult, options);
        }
        
        // For non-VS Code environments, return the data URL
        return exportResult;
      } else if (format === 'md') {
        // For Markdown format
        const textExporter = TextExporterFactory.create('md', mindmap);
        exportResult = await textExporter.export();
        
        // Check if running in VS Code environment
        if (isVSCodeEnvironment()) {
          return await handleMarkdownExportForVSCode(exportResult, options);
        }
        
        // For non-VS Code environments, copy to clipboard
        await this.copyToClipboard(exportResult, format);
        return exportResult;
      } else {
        // For other text formats (if any in future)
        const textExporter = TextExporterFactory.create(format as 'wxml' | 'md', mindmap);
        exportResult = await textExporter.export();
        
        // For text formats, copy to clipboard
        await this.copyToClipboard(exportResult, format);
        return exportResult;
      }

    } catch (error) {
      console.error('Export error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : `Failed to export as ${format.toUpperCase()}`
      );
    }
  }

  /**
   * Get the SVG element from the designer
   */
  private getSvgElement(): SVGElement | null {
    try {
      // First try to get SVG from mindplot-component's shadow DOM
      const mindplotComponent = document.querySelector('mindplot-component');
      if (mindplotComponent) {
        const component = mindplotComponent as unknown as { shadowRoot: ShadowRoot };
        if (component.shadowRoot) {
          const shadowSvg = component.shadowRoot.querySelector('svg');
          if (shadowSvg && shadowSvg instanceof SVGSVGElement) {
            console.log('Found SVG element in shadow DOM:', shadowSvg);
            return shadowSvg;
          }

          // Try to find any SVG element in shadow DOM
          const allShadowSvgs = component.shadowRoot.querySelectorAll('svg');
          for (let i = 0; i < allShadowSvgs.length; i++) {
            const svg = allShadowSvgs[i];
            if (svg instanceof SVGSVGElement && svg.getBBox().width > 0 && svg.getBBox().height > 0) {
              console.log('Found valid SVG element in shadow DOM:', svg);
              return svg;
            }
          }
        }
      }

      // Fallback: try to find SVG in regular DOM (for backward compatibility)
      const selectors = [
        '.mindplot-container svg',
        '#mindplot-svg',
        'svg[width][height]',
        'svg'
      ];

      for (const selector of selectors) {
        const svgElement = document.querySelector(selector);
        if (svgElement && svgElement instanceof SVGSVGElement) {
          console.log('Found SVG element with selector:', selector);
          return svgElement;
        }
      }

      // Try to find any SVG element with content in regular DOM
      const allSvgs = document.querySelectorAll('svg');
      for (let i = 0; i < allSvgs.length; i++) {
        const svg = allSvgs[i];
        if (svg instanceof SVGSVGElement && svg.getBBox().width > 0 && svg.getBBox().height > 0) {
          console.log('Found valid SVG element:', svg);
          return svg;
        }
      }

      console.warn('No SVG element found for export');
      return null;
    } catch (error) {
      console.error('Error getting SVG element:', error);
      return null;
    }
  }

  /**
   * Copy content to clipboard based on format
   */
  private async copyToClipboard(content: string, format: ExportFormat): Promise<void> {
    try {
      // For text formats, use text clipboard
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      throw new Error('Failed to copy to clipboard');
    }
  }

  /**
   * Check if export is available for the current mindmap
   */
  isExportAvailable(): boolean {
    try {
      const mindmap = this.designer.getMindmap();
      return mindmap !== null;
    } catch {
      return false;
    }
  }

  /**
   * Check if clipboard API is supported
   */
  isClipboardSupported(): boolean {
    return !!(navigator.clipboard && 
      (navigator.clipboard.write || navigator.clipboard.writeText));
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): ExportFormat[] {
    return ['png', 'jpg', 'jpeg', 'md'];
  }
}

/**
 * Create an export service instance
 */
export function createExportService(designer: Designer): ExportService {
  return new ExportService(designer);
}

export default ExportService;
