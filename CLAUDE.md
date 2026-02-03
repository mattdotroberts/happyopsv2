# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Happy Operators is a business website for AI & automation workshops. Built with Astro 5, using markdown content collections.

**Live URL**: https://happyoperators.com
**Stack**: Astro 5, CSS Custom Properties, Markdown

## Commands

```bash
npm run dev      # Start dev server (localhost:4321)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

### Content Collections (`src/content.config.ts`)

Three collections using Astro's glob loader:

- **blog**: Posts with title, description, pubDate, tags, image, featured, draft
- **services**: Service pages with title, description, features[], icon, order, featured
- **useCases**: Use case articles with title, description, category (enum), pubDate, image, headline, featured

Categories for useCases: `Human Resources`, `Sales`, `Marketing`, `Customer Support`, `AI`, `Automation`

### Key Integrations

**Newsletter Signup** (`src/components/NewsletterSignup.astro`): Posts to n8n webhook. Uses `navigator.sendBeacon` for reliability.

**Contact Form** (`src/pages/contact.astro`): Posts JSON to n8n webhook at `https://happyoperators.app.n8n.cloud/webhook/...`

**Booking**: Cal.com integration at `https://cal.com/happyoperators/30min`

### Design System (`src/styles/variables.css`)

Light-mode-first with dark mode override via `[data-theme="dark"]`. Brand colors:
- Accent: `#F26A3D` (orange)
- Background: `#FAF8F5` (warm cream)

Theme respects system preference, stored in localStorage.

### Images

Store in `public/images/` with subdirectories:
- `use-cases/` - Use case article images
- `case-study/` - Case study photos
- `testimonials/` - Customer photos
- `founders/` - Team photos

Reference in markdown frontmatter as `/images/use-cases/filename.png`

## Adding Content

### Use Case
Create `src/content/use-cases/slug.md`:
```yaml
---
title: "Title"
description: "Description"
category: "Sales"
pubDate: 2025-01-17
headline: "Compelling headline"
image: "/images/use-cases/slug.png"
featured: true
---
```

### Blog Post
Create `src/content/blog/slug.md`:
```yaml
---
title: "Title"
description: "Description"
pubDate: 2025-01-17
tags: ["ai", "automation"]
draft: false
---
```

## Deployment

Deployed to Vercel. Push to main triggers automatic deployment.

## Design Principles

### Visual Philosophy
- **Minimal and clean** - Lots of whitespace, no clutter
- **Developer aesthetic** - Monospace body text, bracketed labels, terminal-inspired
- **Warm but professional** - Cream backgrounds (light mode), dark grays (dark mode), orange accent

### Typography Hierarchy
- **Headings**: Crimson Pro (serif) - elegant, editorial feel
- **Body/UI**: Geist Mono (monospace) - technical, developer-friendly
- **Labels**: Uppercase mono, wider letter-spacing, often in `[BRACKETS]`

### Color Usage
- Accent orange (`--color-accent-primary`) for: CTAs, links, hover states, labels
- Never use raw hex values - always use CSS variables
- Text hierarchy: `--color-text-primary` → `--color-text-secondary` → `--color-text-muted`

### Spacing
Always use the spacing scale variables:
```css
--space-xs: 0.25rem    /* Tiny gaps */
--space-sm: 0.5rem     /* Inline spacing */
--space-md: 1rem       /* Default padding */
--space-lg: 1.5rem     /* Card padding */
--space-xl: 2rem       /* Section gaps */
--space-2xl: 3rem      /* Between sections */
--space-3xl: 4rem      /* Major breaks */
--space-4xl: 6rem      /* Section padding */
```

## Component Patterns

### CSS Naming
Use BEM-like convention:
```css
.component { }
.component__element { }
.component--modifier { }
```

### Section Structure
```astro
<section class="container section">
  <header class="section__header reveal">
    <span class="section__label">[LABEL]</span>
    <h2 class="section__title">Title</h2>
  </header>
  <!-- content with reveal stagger-children -->
</section>
```

### Card Components
- Border: `1px solid var(--color-border)`
- Border radius: `var(--border-radius-md)` (8px)
- Hover: `border-color: var(--color-accent-primary)` + subtle lift
- Always use `transition: var(--transition-fast)` for hover states

### Buttons
```astro
<a href="/path" class="button">Default</a>
<a href="/path" class="button button--primary">Primary</a>
```

### Animation Classes
- `reveal` - Fade up on scroll (add to elements)
- `stagger-children` - Stagger children animations (add to container)
- Always respect `prefers-reduced-motion`

## Do's and Don'ts

### Do
- Use CSS variables for all colors, spacing, typography
- Keep component styles scoped in `<style>` tags
- Add `reveal` class to section headers and content blocks
- Use `.container` for max-width centering
- Include `@media (max-width: 768px)` breakpoint for mobile

### Don't
- Don't use inline styles
- Don't use arbitrary pixel values - use the scale
- Don't add new fonts without updating variables.css
- Don't hardcode colors - use semantic variables
- Don't skip the bracketed label pattern for sections
- Don't forget dark mode - test both themes

## Component Reference

| Component | Use Case |
|-----------|----------|
| `FeatureBox` | Large CTA cards with scroll animation |
| `BlogCard` | Blog post cards (standard + featured variants) |
| `ServiceCard` | Service listing items |
| `UseCaseCard` | Use case listing items |
| `Testimonial` | Customer quotes |
| `CTASection` | Call-to-action banners |
| `TagBadge` | Bracketed tag labels |
| `HeroScrollReveal` | Homepage hero with parallax |
| `MinimalHero` | Simple page headers |
