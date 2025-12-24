# Glue Website Development Guide

This document outlines important development patterns, common issues, and best practices for the Glue website project.

## Project Structure

```
/
├── index.html              # Main landing page
├── styles.css              # Global styles and CSS variables
├── script.js               # Main site JavaScript (navigation, etc.)
├── tools/
│   ├── index.html          # Tools overview page
│   ├── tools.css           # Shared tool page styles
│   └── [tool-name]/
│       ├── index.html      # Individual tool page
│       ├── styles.css      # Tool-specific styles
│       ├── app.js          # Tool-specific functionality
│       └── [other-files]   # Tool assets
```

## Critical Dependencies

### Navigation Scroll Behavior
**Issue**: The main site navigation uses a scroll effect that requires JavaScript to function properly.

**Required**: Every page must include `/script.js` for navigation to work correctly:
```html
<script src="../../script.js"></script>  <!-- For tool pages -->
<script src="script.js"></script>        <!-- For root pages -->
```

**What it does**:
- Listens for scroll events
- Adds `scrolled` class to `.nav` when scrolling past 50px
- Enables solid white background transition
- Prevents content overlap with navigation

**Symptoms when missing**:
- Navigation stays transparent while scrolling
- Content appears to "bleed through" navigation header
- Text overlap with navigation bar

### CSS Loading Order
Tool pages must load CSS in this specific order:
1. `../../styles.css` - Global styles and CSS variables
2. `../tools.css` - Shared tool styles  
3. `styles.css` - Tool-specific styles

## Common Patterns

### Fixed Navigation Spacing
Pages with fixed navigation need proper top spacing:

```css
.tool-hero,
.tool-interface {
    margin-top: 120px;        /* Account for fixed navigation */
    padding-top: var(--space-xl); /* Additional visual spacing */
}
```

### Sticky/Frozen Columns
When implementing sticky table columns, use separate containers instead of `position: sticky`:

```html
<div class="matrix-layout">
    <div class="matrix-accounts">     <!-- Fixed left column -->
        <!-- Account names -->
    </div>
    <div class="matrix-products">     <!-- Scrollable columns -->
        <!-- Product data -->
    </div>
</div>
```

```css
.matrix-layout { display: flex; }
.matrix-accounts { flex-shrink: 0; width: 200px; }
.matrix-products { flex: 1; overflow-x: auto; }
```

### Responsive Design
The site uses a desktop-first approach with these breakpoints:
- `1024px` - Tablet layout
- `768px` - Mobile layout  
- `480px` - Small mobile

## Development Best Practices

### CSS Variables
Use CSS variables defined in `:root` for consistency:
- `--color-primary`, `--color-bg`, etc. for colors
- `--space-sm`, `--space-md`, etc. for spacing
- `--radius-sm`, `--radius-md`, etc. for border radius

### Avoid Complexity
- Keep sorting/filtering features simple or avoid them entirely
- Prefer CSS-only solutions over JavaScript when possible
- Use existing patterns rather than creating new ones

### Design Guidelines Reference
For detailed design specifications, component guidelines, and visual standards, refer to:
**[CLAUDE.md](./CLAUDE.md)** - Contains comprehensive project overview, architecture patterns, and development guidelines specifically for Claude Code integration.

### Testing Checklist
When adding new pages or features:
- [ ] Include `/script.js` for navigation behavior
- [ ] Test navigation scroll effects
- [ ] Verify proper top spacing (no content overlap)
- [ ] Check responsive behavior on mobile
- [ ] Test on actual deployment (Vercel)

## Deployment

### Vercel Integration
- Automatic deployment on push to `main` branch
- Uses `/_vercel/insights/script.js` for analytics
- Check Vercel dashboard for deployment status

### Troubleshooting
Common deployment issues:
1. **Navigation not working**: Missing `script.js` inclusion
2. **Styling broken**: CSS load order incorrect
3. **Content overlap**: Missing top margin/padding for fixed navigation

## File Modifications Log

Keep track of significant architectural changes:
- **Matrix Table**: Converted from `<table>` to flexbox layout for better sticky column support
- **Navigation**: Enhanced z-index and solid background for better scroll behavior
- **Tool Pages**: Standardized top spacing pattern for fixed navigation

---

*This README should be updated whenever significant architectural changes are made to maintain development consistency.*