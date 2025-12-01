# FastMind - AI-Powered Mind Mapping Editor - Project Brief

**Project**: FastMind - AI-Driven Mind Mapping Editor  
**Version**: 1.0.0  
**License**: WiseMapping Public License 1.0 (Apache 2.0 based)  
**Author**: bashdeban <bashdeban@gmail.com>  
**Contributors**: Ezequiel Bergamaschi , Paulo Veiga

## Project Overview

FastMind is an AI-powered mind mapping editor that originated from the WiseMapping Frontend project in November 2025. Built specifically for developers, FastMind provides intelligent content creation capabilities through advanced LLM integration, enabling users to brainstorm, design architectures, take study notes, and plan projects without ever leaving their editor. The project represents the evolution from traditional mind mapping to AI-assisted visual thinking.

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
- **Strategic Pivot**: November 2025 - Branched from WiseMapping Frontend to create FastMind with AI capabilities
- **AI Integration Milestone**: November 2025 - Complete AI Topic Generation System implementation
- **Internationalization**: November 2025 - Full multi-language support (10 languages)
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

FastMind aims to revolutionize mind mapping by integrating advanced AI capabilities directly into the developer workflow. The project has successfully evolved from a traditional mind mapping tool to an AI-powered visual thinking platform that understands context, generates intelligent content, and supports multiple LLM providers.

**Current Strategic Focus**: Production-Ready AI-Powered Mind Mapping
- Primary deliverable: FastMind VS Code Extension - 100% complete and production-ready
- Major achievement: Complete AI Topic Generation System with multi-LLM support
- Internationalization: Full support for 10 languages implemented
- Multi-LLM Integration: Support for OpenAI, Claude, Azure, local models (Ollama, LM Studio)
- Developer Experience: Git-friendly XML format, offline support, seamless VS Code integration
- Status: All core features complete, ready for market deployment and user feedback
