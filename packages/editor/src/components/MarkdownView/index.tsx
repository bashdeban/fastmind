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
import React from 'react';
import { marked } from 'marked';
import Box from '@mui/material/Box';

type MarkdownViewProps = {
  content: string;
};

/**
 * Simple Markdown renderer component
 * Supports basic markdown syntax: headers, bold, italic, strikethrough, lists, tables, code blocks
 */
const MarkdownView = ({ content }: MarkdownViewProps): React.ReactElement => {
  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true, // GitHub Flavored Markdown
  });

  // Parse markdown to HTML
  const html = marked(content);

  return (
    <Box
      sx={{
        '& h1': {
          fontSize: '1.5rem',
          fontWeight: 'bold',
          margin: '0.75rem 0 0.375rem 0',
          color: 'text.primary',
        },
        '& h2': {
          fontSize: '1.25rem',
          fontWeight: 'bold',
          margin: '0.625rem 0 0.375rem 0',
          color: 'text.primary',
        },
        '& h3': {
          fontSize: '1.125rem',
          fontWeight: 'bold',
          margin: '0.5rem 0 0.25rem 0',
          color: 'text.primary',
        },
        '& h4': {
          fontSize: '1rem',
          fontWeight: 'bold',
          margin: '0.5rem 0 0.25rem 0',
          color: 'text.primary',
        },
        '& h5': {
          fontSize: '0.875rem',
          fontWeight: 'bold',
          margin: '0.375rem 0 0.125rem 0',
          color: 'text.primary',
        },
        '& h6': {
          fontSize: '0.8rem',
          fontWeight: 'bold',
          margin: '0.375rem 0 0.125rem 0',
          color: 'text.primary',
        },
        '& p': {
          margin: '0.375rem 0',
          color: 'text.primary',
          lineHeight: 1.5,
        },
        '& ul, & ol': {
          margin: '0.375rem 0',
          paddingLeft: '1.25rem',
          color: 'text.primary',
        },
        '& li': {
          margin: '0.125rem 0',
          lineHeight: 1.5,
        },
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          margin: '0.375rem 0',
          fontSize: '0.875rem',
        },
        '& th, & td': {
          border: '1px solid',
          borderColor: 'divider',
          padding: '0.375rem',
          textAlign: 'left',
        },
        '& th': {
          backgroundColor: 'action.hover',
          fontWeight: 'bold',
        },
        '& pre': {
          backgroundColor: 'grey.100',
          padding: '0.5rem',
          borderRadius: 0.5,
          overflow: 'auto',
          margin: '0.375rem 0',
          fontSize: '0.8rem',
        },
        '& code': {
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          backgroundColor: 'grey.100',
          padding: '0.0625rem 0.125rem',
          borderRadius: 0.25,
        },
        '& pre code': {
          backgroundColor: 'transparent',
          padding: 0,
        },
        '& blockquote': {
          borderLeft: '3px solid',
          borderColor: 'primary.main',
          paddingLeft: '0.75rem',
          margin: '0.375rem 0',
          fontStyle: 'italic',
          color: 'text.secondary',
        },
        '& strong': {
          fontWeight: 'bold',
        },
        '& em': {
          fontStyle: 'italic',
        },
        '& del': {
          textDecoration: 'line-through',
          color: 'text.secondary',
        },
        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        '& hr': {
          border: 'none',
          borderTop: '1px solid',
          borderColor: 'divider',
          margin: '0.75rem 0',
        },
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: html as string }} />
    </Box>
  );
};

export default MarkdownView;
