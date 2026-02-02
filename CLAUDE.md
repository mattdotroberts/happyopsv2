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
