# Changelog

## [0.1.12] - 2025-12-21
### Added
- Added TopicActionTooltip component for comprehensive topic interaction menus with copy, paste, and operations
- Enhanced paste functionality to support hierarchical indented text structure from clipboard
- Added ParsedTopic interface and supporting methods for hierarchical topic structure building
- Implemented URL-encoded initial document content handling for improved security
- Enhanced VS Code extension and webview communication security with proper error handling
- Added comprehensive error handling and fallback mechanisms for content processing
- Improved type safety for VS Code API usage with strict TypeScript enforcement
- Enhanced copy functionality supporting multiple selected topics
- Improved topic text exporter for better copy operations with enhanced test coverage

### Changed
- Refactored EditorContent to EditorContentWithIntl for proper internationalization context
- Implemented component architecture split to enable better i18n access across components
- Updated Chinese comments to English for better code maintainability
- Enhanced pasteTextAsTopics method with both tab-based hierarchical parsing and line-based fallback
- Improved error handling and user feedback throughout the application
- Optimized component structure for better maintainability and internationalization support

### Fixed
- Fixed SVG export issues with proper namespace handling and CSS embedding
- Resolved export dialog layout issues for better responsive design
- Improved export error handling with more descriptive error messages
- Enhanced test coverage for copy functionality and edge cases

### Technical Improvements
- Added comprehensive localization support for new features
- Implemented robust content filtering system for AI responses
- Enhanced material-ui component integration with consistent styling
- Optimized performance for large file handling and multi-topic operations
- Strengthened security measures for content passing between extension and webview

## [0.1.11] - 2025-12-08
### Added
- Added delete subtopic functionality with keyboard shortcuts
- Added paste text as topics feature for quick topic creation from clipboard content
- Updated keyboard shortcuts documentation with new shortcuts for copy/paste operations and subtopic management
- Enhanced keyboard shortcuts help pane with comprehensive shortcut information

### Changed
- Improved topic management workflow with better copy/paste operations
- Enhanced user experience with more intuitive keyboard shortcuts for topic manipulation

## [0.1.10] - 2025-12-06
### Added
- Added enhanced export functionality with support for multiple formats (SVG, PDF, PNG, JPG, Markdown)
- Implemented comprehensive export options including quality settings, scale control, and watermark options
- Added copy and paste functionality for topics with support for maintaining structure and styling
- Added keyboard shortcuts (Ctrl+C/Ctrl+V) for topic duplication operations
- Added context menu options for copying and pasting topics

### Changed
- Updated EmojiPicker CSS styles across all components for consistent visual appearance
- Improved EmojiPicker search interface with better padding and border handling
- Enhanced EmojiPicker theme adaptation for both light and dark modes
- Optimized EmojiPicker layout in topic image picker, icon editor, and icon picker components
- Streamlined export dialog interface with improved user experience and error handling

### Fixed
- Fixed EmojiPicker border styling inconsistencies in different components
- Resolved export dialog layout issues for better responsive design
- Improved export error handling with more descriptive error messages

## [0.1.9] - 2025-12-04
### Fixed
- Fixed emoji character handling in topic text and note fields - emojis are now properly saved and loaded in .fastmind files
- Unicode supplementary plane characters (including emojis) are now correctly serialized/deserialized in XML

### Added
- Added keyboard shortcuts for canvas control (zoom, pan, and navigation)

### Changed
- Optimized XML serializer in mindplot package to use `codePointAt()` for proper Unicode support
- Improved character validation logic to handle multi-byte Unicode characters correctly

## [0.1.8] - 2025-12-03
### Fixed
- Fixed block quote CSS style rendering issues

### Changed
- Modified Note preview edit related keyboard shortcuts for better workflow
- Set up dedicated shortcuts for AI functionality access
- Optimized AI Topic generator result sorting algorithm for better organization

## [0.1.7] - 2025-12-02
### Added
- Added special tag filtering for AI responses to remove unwanted markers like `<thinking>`, `<reasoning>`, `<brainstorm>`, and other HTML/XML-style tags from LLM output
- Enhanced AI response processing in both `ai-explainer.ts` and `ai-topic-generator.ts` services with unified tag filtering mechanism

### Changed
- Improved AI response cleanliness by implementing robust content filtering system

## [0.1.6] - 2025-12-02
### Added
- Added Shift+Enter shortcut support for topic text line breaks
- Updated keyboard shortcut help documentation to display correct line break shortcut


### Changed
- Changed topic text line break shortcut from Ctrl+Enter to Shift+Enter for better user experience
- Optimized text editing experience with multi-line text input support

## [0.1.5] - 2025-11-28
### Fixed
- Fixed Windows font blur issue
- Fixed SVG export style loss bug

### Changed
- Optimized node expand/collapse animation effects

## [0.1.4] - 2025-11-21
### Added
- Implemented singleton editor pattern for improved performance and stability
- Added support for simultaneous editing of multiple .fastmind files

## [0.1.3] - 2025-11-20
### Changed
- Refactored fastmind extension architecture for improved code maintainability
- Optimized editor file naming structure for better code clarity

### Added
- Added comprehensive FastMind VS Code extension documentation

## [0.1.2] - 2025-11-19
### Fixed
- Removed custom editor activation event to fix extension loading issues
- Fixed file information transmission to editor communication issues
- Improved fastmind data exchange mechanism

### Added
- Implemented zero-intrusion global injection solution
- Added seamless VS Code workflow integration

## [0.1.1] - 2025-11-18
### Added
- Completed FastMind extension phase one development
- Implemented core mind map editing functionality
- Added file system integration and webview communication patterns

### Fixed
- Optimized extension activation and file opening process

## [0.1.0] - 2025-11-17
### Added
- Released FastMind VS Code extension initial version
- Added support for .fastmind file format custom editor
- Implemented basic mind map creation and editing functionality
- Added multi-language support configuration options
- Implemented auto-save functionality configuration

### Features
- AI-driven mind map generation
- Smart subtopic generation integrated with large language models
- Context-aware creative improvement features
- Seamless VS Code workflow integration

## [0.0.1] - 2025-11-15
### Added
- Project initialization
- Basic package structure and dependency configuration
- TypeScript configuration and build setup
- Extension manifest file configuration
