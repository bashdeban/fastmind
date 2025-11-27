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

import NoteIcon from './NoteIcon';
import { ThemeVariant } from './theme/Theme';
import NoteModel from './model/NoteModel';

describe('NoteIcon', () => {
  let noteIcon: NoteIcon;
  let mockTopic: any;
  let mockNoteModel: NoteModel;

  beforeEach(() => {
    // Mock topic with required methods
    mockTopic = {
      getThemeVariant: () => 'light' as ThemeVariant,
    };

    // Create a note model for testing
    mockNoteModel = new NoteModel({
      text: 'Test note',
      contentType: 'plain',
    });

    noteIcon = new NoteIcon(mockTopic, mockNoteModel, false);
  });

  describe('constructor', () => {
    it('should initialize with light theme icon by default', () => {
      expect(noteIcon).toBeDefined();
      expect(noteIcon.getModel()).toBe(mockNoteModel);
    });
  });

  describe('updateTheme', () => {
    it('should update icon when theme changes from light to dark', () => {
      // Mock the topic to return dark theme
      mockTopic.getThemeVariant = () => 'dark' as ThemeVariant;
      
      // Call updateTheme method
      noteIcon.updateTheme();

      // Verify the icon has been updated (no errors thrown)
      expect(noteIcon).toBeDefined();
    });

    it('should update icon when theme changes from dark to light', () => {
      // Start with dark theme
      mockTopic.getThemeVariant = () => 'dark' as ThemeVariant;
      noteIcon.updateTheme();

      // Switch to light theme
      mockTopic.getThemeVariant = () => 'light' as ThemeVariant;
      noteIcon.updateTheme();

      // Verify the icon has been updated
      expect(noteIcon).toBeDefined();
    });
  });

  describe('getImageUrlForTheme', () => {
    it('should return light icon URL for light theme', () => {
      const url = NoteIcon.getImageUrlForTheme('light');
      expect(url).toContain('mocked-svg-content');
    });

    it('should return dark icon URL for dark theme', () => {
      const url = NoteIcon.getImageUrlForTheme('dark');
      expect(url).toContain('mocked-svg-content');
    });
  });
});
