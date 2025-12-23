# Glue Design Guidelines

## Overview
Glue's design system creates a modern, premium B2B SaaS aesthetic using glassmorphism, sophisticated gradients, and smooth micro-interactions. This guide ensures consistency across all UI elements.

## Color Palette

### Core Colors
```css
/* Backgrounds */
--color-bg: #fafafa;           /* Primary background */
--color-bg-alt: #ffffff;       /* Alternate background */

/* Text */
--color-text: #0f172a;         /* Primary text */
--color-text-secondary: #475569; /* Secondary text */
--color-text-muted: #94a3b8;    /* Muted text */

/* Brand Colors */
--color-primary: #6366f1;      /* Primary purple */
--color-secondary: #ec4899;    /* Secondary pink */
--color-accent: #8b5cf6;       /* Accent purple */
```

### Gradients
```css
/* Primary Brand Gradient */
background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);

/* Subtle Background Gradient */
background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
```

### Glass Effects
```css
/* Glass Morphism */
background: rgba(255, 255, 255, 0.7);
border: 1px solid rgba(255, 255, 255, 0.5);
backdrop-filter: blur(20px);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
```

## Typography

### Font Stack
- **Display**: Space Grotesk (headings, important text)
- **Body**: Inter (paragraphs, UI text)

### Type Scale
```css
/* Headings with fluid sizing */
h1: clamp(2.5rem, 5vw, 4rem)
h2: clamp(2rem, 4vw, 3rem)
h3: clamp(1.25rem, 2vw, 1.5rem)

/* Body Text */
Base: 16px
Small: 0.9rem (14.4px)
Tiny: 0.75rem (12px)
```

### Font Weights
- 400: Regular body text
- 500: Medium emphasis
- 600: Semibold for headings
- 700: Bold for CTAs
- 800: Extra bold for hero text

## Spacing System

Use consistent spacing tokens:
```css
--space-xs: 0.5rem;   /* 8px - tight spacing */
--space-sm: 1rem;     /* 16px - compact elements */
--space-md: 1.5rem;   /* 24px - standard spacing */
--space-lg: 2rem;     /* 32px - section spacing */
--space-xl: 3rem;     /* 48px - large gaps */
--space-2xl: 4rem;    /* 64px - section breaks */
--space-3xl: 6rem;    /* 96px - hero spacing */
```

## Components

### Buttons

#### Primary Button
```css
background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
color: white;
padding: var(--space-sm) var(--space-lg);
border-radius: var(--radius-full);
font-weight: 600;
transition: all 0.3s ease;

/* Hover */
transform: translateY(-2px);
box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
```

#### Glass Button
```css
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);
backdrop-filter: blur(10px);
color: var(--color-text);
```

### Cards

#### Standard Card
```css
background: var(--glass-bg);
border: 1px solid var(--glass-border);
border-radius: var(--radius-xl);
padding: var(--space-xl);
box-shadow: var(--glass-shadow);
transition: all 0.3s ease;
```

#### Hover State
```css
transform: translateY(-8px);
border-color: var(--color-primary);
box-shadow: 0 16px 48px rgba(99, 102, 241, 0.2);
```

### Form Elements

#### Input Fields
```css
background: var(--color-bg);
border: 1px solid var(--glass-border);
border-radius: var(--radius-md);
padding: var(--space-sm) var(--space-md);
transition: all 0.3s ease;

/* Focus */
border-color: var(--color-primary);
box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
```

## Layout Principles

### Container
- Max width: 1200px
- Padding: 0 2rem (32px)
- Center aligned with auto margins

### Grid Systems
- Use CSS Grid for complex layouts
- Default gap: var(--space-xl)
- Responsive columns: `repeat(auto-fit, minmax(300px, 1fr))`

### Sections
- Vertical padding: var(--space-3xl) for major sections
- Use alternating backgrounds (#fafafa vs #ffffff)

## Animation Guidelines

### Timing Functions
```css
--transition-fast: 0.15s ease;   /* Micro-interactions */
--transition-base: 0.3s ease;    /* Standard transitions */
--transition-slow: 0.5s ease;    /* Page transitions */
```

### Common Animations

#### Hover Lift
```css
transform: translateY(-2px);
```

#### Fade In Up
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

#### Pulse Effect
```css
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
```

## Special Effects

### Gradient Text
```css
background: var(--gradient-primary);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

### Noise Texture
Apply subtle texture with 3% opacity SVG noise overlay

### Border Radius Scale
```css
--radius-sm: 8px;    /* Small elements */
--radius-md: 12px;   /* Buttons, inputs */
--radius-lg: 16px;   /* Cards */
--radius-xl: 24px;   /* Large cards */
--radius-full: 9999px; /* Pills, circular */
```

## Responsive Design

### Breakpoints
- Desktop first approach
- 1024px: Tablet layout
- 768px: Mobile layout
- 480px: Small mobile

### Mobile Considerations
- Hide decorative elements (particles, complex animations)
- Stack layouts to single column
- Increase tap targets to 44px minimum
- Simplify navigation to hamburger menu

## Accessibility

### Focus States
All interactive elements must have visible focus states:
```css
outline: 2px solid var(--color-primary);
outline-offset: 2px;
```

### Color Contrast
- Ensure 4.5:1 ratio for normal text
- 3:1 ratio for large text
- Test gradient text for readability

### Motion
Respect prefers-reduced-motion:
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

## Implementation Notes

1. **Consistency**: Always use CSS variables for colors, spacing, and transitions
2. **Performance**: Limit backdrop-filter usage on mobile devices
3. **Browser Support**: Provide fallbacks for backdrop-filter
4. **Dark Mode**: Currently not implemented but color system supports future addition
5. **Component Reuse**: Extend base classes rather than creating one-off styles