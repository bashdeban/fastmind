# WiseMapping Frontend - Project Brief

**Project**: WiseMapping Front End - Open Source Mind Mapping Tool  
**Version**: 6.0.1  
**License**: WiseMapping Public License 1.0 (Apache 2.0 based)  
**Author**: Paulo Veiga <pveiga@wisemapping.com>  
**Contributors**: Ezequiel Bergamaschi  

## Project Overview

WiseMapping Front End is an integral component of the MindMap Open Source Project, which began in 2010 and underwent significant architectural revitalization in 2021. The project has evolved from web-based applications to include VS Code extension development, aiming to provide modern, intuitive, and powerful mind mapping solutions across multiple platforms.

### Core Modules

This repository contains all user interface-related elements, comprising the following modules:

1. **web2d** - A lightweight abstraction layer over SVG for elegant and efficient chart rendering
2. **mindplot** - Pure vanilla ES6 classes responsible for rendering mind maps and editing functionalities  
3. **editor** - React component wrapper around mindplot
4. **fastmind** - VS Code Extension for editing `.fastmind` files with WiseMapping editor
5. **editor-standalone** - Standalone build of the editor for VS Code integration

**Note**: The `webapp` package has been deprecated and removed as the project focus shifted to VS Code extension development.

## Project Roots & History

- **Started**: 2010 as MindMap Open Source Project
- **Major Revitalization**: 2021 - Significant architectural updates to revitalize visual aesthetics and technological framework
- **Backend Repository**: https://github.com/wisemapping/wisemapping-open-source

## Key Requirements

- **Function**: Real-time collaborative mind mapping with intuitive UX across web and VS Code environments
- **AI-Enhanced Features**: Intelligent topic generation using LLM integration for improved productivity
- **Target**: 
  - VS Code Extension for `.fastmind` file editing (primary focus)
  - Web-based application for individual and team use (secondary)
  - Standalone editor integration for external tools
- **Distribution**: Open source under WiseMapping Public License
- **Performance**: Efficient rendering and bundle optimization critical
- **Ui/UX**: Modern, intuitive, and accessible design with AI-powered assistance
- **Integration**: Seamless VS Code extension experience with bidirectional communication and AI services

## Success Metrics

- **User Experience**: Fluid and intuitive interaction paradigm across VS Code and web
- **VS Code Extension Performance**: Sub-100ms save response time, seamless bidirectional communication
- **Rendering Performance**: Efficient rendering with optimized bundle sizes
- **Maintainability**: Clean architecture following React functional components with hooks
- **Code Quality**: Zero tolerance for linting errors, TypeScript strict mode enforced
- **Bundle Optimization**: Critical attention to Material-UI tree-shaking (500KB+ impact)
- **Extension Reliability**: Robust error handling with 3-retry mechanism and graceful degradation

## Stakeholders

- **Founder**: Paulo Veiga
- **Past Individual Contributors**: Ezequiel Bergamaschi
- **Community**: Open source contributors
- **Users**: Individuals and teams needing collaborative mind mapping

## High-Level Vision

The project aims to provide a professional-grade, open-source mind mapping solution that combines modern web technologies with an exceptional user experience across multiple platforms. The current strategic focus is on VS Code extension development, bringing powerful mind mapping capabilities directly into developers' workflows while maintaining the vision of enabling users to visualize and organize their thoughts effectively through intuitive mind map interfaces.

**Current Strategic Focus**: VS Code Extension Development
- Primary deliverable: FastMind VS Code Extension for `.fastmind` file editing
- Secondary: Web-based applications and standalone editor integrations
- Goal: Seamless integration of mind mapping into developer ecosystems
