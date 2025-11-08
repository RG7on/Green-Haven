# Green Haven - AI Coding Agent Instructions

## Project Overview
Green Haven is a React 19 single-page application built with Vite 7 and SWC for fast refresh. This is currently a minimal setup based on the Vite React template, serving as a foundation for future development.

## Tech Stack & Architecture
- **Build Tool**: Vite 7 with SWC plugin (`@vitejs/plugin-react-swc`) for Fast Refresh
- **Framework**: React 19.1.1 with React DOM 19.1.1
- **JavaScript**: ES2020+ with ESM modules (`"type": "module"` in package.json)
- **Styling**: Plain CSS with CSS custom properties (see `src/index.css`)
- **Linting**: ESLint 9 with flat config format (see `eslint.config.js`)

## Project Structure
```
src/
  main.jsx          # Entry point - renders App with StrictMode
  App.jsx           # Root component
  App.css           # Component-specific styles
  index.css         # Global styles (color scheme, resets, typography)
  assets/           # Static assets (logos, images)
public/             # Public assets served as-is
index.html          # HTML entry point (links to /src/main.jsx)
```

## Development Commands
- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on all JS/JSX files

## Code Conventions

### ESLint Configuration
- Uses **flat config format** (`eslint.config.js`, not `.eslintrc`)
- Extends: ESLint recommended, React Hooks recommended-latest, React Refresh Vite
- Custom rule: `no-unused-vars` allows uppercase/underscore prefixed vars (e.g., `const _UNUSED = 'ok'`)
- Ignores `dist/` directory
- Targets browser globals and ECMAScript 2020

### React Patterns
- Uses **React 19** - leverage latest features and APIs
- Strict Mode is enabled in `main.jsx` for development checks
- Component structure: Functional components with hooks (see `App.jsx`)
- Import React methods explicitly (e.g., `import { useState } from 'react'`)

### Styling Conventions
- **Global styles** in `src/index.css` - color scheme, typography, reset
- **Component styles** in separate CSS files (e.g., `App.css` for `App.jsx`)
- Uses CSS custom properties for theming (`:root` selector)
- Supports light/dark color schemes via `@media (prefers-color-scheme)`
- Default dark mode: `#242424` background, light text
- Default light mode: `#ffffff` background, dark text

### File Naming
- React components: PascalCase with `.jsx` extension (e.g., `App.jsx`)
- Styles: match component name (e.g., `App.css` for `App.jsx`)
- Entry point: lowercase `main.jsx`
- Config files: lowercase with extension (e.g., `vite.config.js`)

## Important Notes
- **Do NOT use TypeScript** - this is a JavaScript-only project
- **SWC is required** - not compatible with React Compiler, uses SWC for Fast Refresh
- **React 19** - ensure compatibility when suggesting new dependencies
- Public assets go in `/public`, imported assets go in `/src/assets`
- Vite serves public files from root (e.g., `/vite.svg` references `public/vite.svg`)

## When Adding Dependencies
- Check compatibility with React 19 and Vite 7
- Use `npm install` for package management
- Update ESLint config if adding new file types or requiring special linting
