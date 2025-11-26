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
import Exporter from '@wisemapping/mindplot/src/components/export/Exporter';
import ImageExporterFactory from '@wisemapping/mindplot/src/components/export/ImageExporterFactory';
import TextExporterFactory from '@wisemapping/mindplot/src/components/export/TextExporterFactory';
import { ExportFormat, ExportOptions } from '../components/action-widget/pane/export-dialog/types';

// Interface for exporters that have exportAndEncode method
interface ImageExporter extends Exporter {
  exportAndEncode(): Promise<string>;
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
   * Export the mindmap to the specified format (always copies to clipboard)
   */
  async export(options: ExportOptions): Promise<void> {
    const { format, scale = 1 } = options;
    
    try {
      // Get the mindmap model
      const mindmap = this.designer.getMindmap();
      if (!mindmap) {
        throw new Error('No mindmap found to export');
      }

      // Get the SVG element for image exports
      const svgElement = this.getSvgElement();
      if (!svgElement && ['svg', 'png'].includes(format)) {
        throw new Error('No SVG element found for image export');
      }

      // Perform the export based on format
      let exportResult: string | Blob;
      
      if (format === 'png') {
        // For PNG export, create BinaryImageExporter and use exportAndEncode
        const svgSvgElement = svgElement as SVGSVGElement;
        const bbox = svgSvgElement.getBBox();
        const width = bbox.width * scale;
        const height = bbox.height * scale;
        
        const pngExporter = ImageExporterFactory.create(
          'png', 
          svgElement!, 
          width, 
          height,
          true // adjustToFit
        ) as ImageExporter;
        
        const dataUrl = await pngExporter.exportAndEncode();
        
        // Convert data URL to blob for clipboard
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        exportResult = blob;
      } else if (format === 'svg') {
        // For SVG export, use regular export method
        const svgSvgElement = svgElement as SVGSVGElement;
        const bbox = svgSvgElement.getBBox();
        const width = bbox.width * scale;
        const height = bbox.height * scale;
        
        const svgExporter = ImageExporterFactory.create(
          'svg', 
          svgElement!, 
          width, 
          height,
          true // adjustToFit
        );
        
        exportResult = await svgExporter.export();
      } else {
        // For text formats (WXML, MD)
        const textExporter = TextExporterFactory.create(format as 'wxml' | 'md', mindmap);
        exportResult = await textExporter.export();
      }

      // Always copy to clipboard
      await this.copyToClipboard(exportResult, format);

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
      if (mindplotComponent && mindplotComponent.shadowRoot) {
        const shadowSvg = mindplotComponent.shadowRoot.querySelector('svg');
        if (shadowSvg && shadowSvg instanceof SVGSVGElement) {
          console.log('Found SVG element in shadow DOM:', shadowSvg);
          return shadowSvg;
        }

        // Try to find any SVG element in shadow DOM
        const allShadowSvgs = mindplotComponent.shadowRoot.querySelectorAll('svg');
        for (const svg of allShadowSvgs) {
          if (svg instanceof SVGSVGElement && svg.getBBox().width > 0 && svg.getBBox().height > 0) {
            console.log('Found valid SVG element in shadow DOM:', svg);
            return svg;
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
      for (const svg of allSvgs) {
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
   * Copy content to clipboard based on format
   */
  private async copyToClipboard(content: string | Blob, format: ExportFormat): Promise<void> {
    try {
      // Check if Clipboard API is available
      if (!navigator.clipboard) {
        throw new Error('剪贴板功能在此浏览器中不受支持。请升级到最新版本的现代浏览器。');
      }

      if (format === 'png') {
        // Handle PNG as image blob
        await this.copyImageToClipboard(content);
      } else {
        // Handle text-based formats (SVG, WXML, MD)
        await this.copyTextToClipboard(content as string);
      }

    } catch (error) {
      console.error('Clipboard copy error:', error);
      
      // Provide fallback error message based on common issues
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          throw new Error('剪贴板功能在此浏览器中不受支持。请尝试使用现代浏览器（Chrome、Firefox、Safari、Edge）。');
        } else if (error.message.includes('denied')) {
          throw new Error('剪贴板访问被拒绝。请检查浏览器权限设置并允许剪贴板访问。');
        } else if (error.message.includes('NotAllowedError')) {
          throw new Error('剪贴板访问被拒绝。请确保在 HTTPS 环境下使用，并授予剪贴板权限。');
        }
      }
      
      throw new Error('复制到剪贴板失败，请稍后重试。');
    }
  }

  /**
   * Copy PNG image to clipboard
   */
  private async copyImageToClipboard(content: string | Blob): Promise<void> {
    // Check if clipboard.write is available (required for images)
    if (!navigator.clipboard.write) {
      throw new Error('图像剪贴板功能在此浏览器中不受支持。请尝试使用最新版本的现代浏览器。');
    }

    let blob: Blob;

    if (content instanceof Blob) {
      blob = content;
    } else {
      // Convert string to blob
      blob = new Blob([content], { type: 'image/png' });
    }

    // Create ClipboardItem for image
    const clipboardItem = new ClipboardItem({
      'image/png': blob
    });

    // Write to clipboard
    await navigator.clipboard.write([clipboardItem]);
  }

  /**
   * Copy text content to clipboard
   */
  private async copyTextToClipboard(content: string): Promise<void> {
    await navigator.clipboard.writeText(content);
  }

  /**
   * Check if clipboard API is supported
   */
  isClipboardSupported(): boolean {
    return !!(navigator.clipboard && 
      (navigator.clipboard.write || navigator.clipboard.writeText));
  }

  /**
   * Check if image clipboard is supported
   */
  isImageClipboardSupported(): boolean {
    return !!(navigator.clipboard && navigator.clipboard.write);
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): ExportFormat[] {
    return ['svg', 'png', 'wxml', 'md'];
  }
}

/**
 * Create an export service instance
 */
export function createExportService(designer: Designer): ExportService {
  return new ExportService(designer);
}

export default ExportService;
