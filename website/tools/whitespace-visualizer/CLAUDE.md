# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for Glue, a B2B SaaS consulting company that builds custom tools for account management and sales teams. The website showcases various business intelligence tools, with the whitespace-visualizer being the most developed.

## Development Commands

This is a vanilla static website with no build process:

```bash
# Start local development server (Python 3)
python3 -m http.server 8000

# Or with Node.js http-server (if installed)
npx http-server

# Or simply open index.html in a browser
open index.html
```

## Architecture

### Directory Structure
- `/` - Main website root (landing page, global styles)
- `/tools/` - Individual tool showcases, each self-contained
- `/tools/whitespace-visualizer/` - Revenue expansion analysis tool

### Styling Cascade
1. `/styles.css` - Global website styles, CSS variables
2. `/tools/tools.css` - Shared tool page styles  
3. `/tools/[tool-name]/styles.css` - Tool-specific styles

### JavaScript Architecture (Whitespace Visualizer)
- `whitespace-engine.js` - Core business logic and calculations
- `app.js` - UI controller and DOM manipulation
- `data.js` - Sample data and data structures
- `script.js` - Page initialization and event handlers

### Key Design Patterns
- **Glassmorphism UI**: Uses CSS backdrop-filter, transparency, and blur effects
- **CSS Variables**: All colors, spacing, and transitions defined in :root
- **No Framework**: Pure vanilla JavaScript with class-based architecture
- **Progressive Enhancement**: Each tool is independent and self-contained

## Important Implementation Details

### Whitespace Visualizer Tool
The main application class `WhitespaceApp` manages:
- CSV data import and parsing
- Account/product matrix generation
- Revenue projections and opportunity scoring
- Expansion playbook generation with AI-style recommendations

### CSS Specificity Issues
When modifying styles, be aware that multiple CSS files load in order. Use specific selectors or `!important` when parent styles interfere.

### Responsive Design
- Desktop-first approach
- Breakpoints: 1024px (tablet), 768px (mobile), 480px (small mobile)
- Grid layouts collapse to single column on mobile

## Deployment
The site deploys automatically via Vercel (see `/_vercel/insights/script.js` references in HTML).