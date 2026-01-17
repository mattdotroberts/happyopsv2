# Happy Operators - Project Documentation

## Overview

Happy Operators is a business website for AI & automation workshops. Built with Astro 5, using markdown content collections for services and blog posts.

**Live URL**: https://happyoperators.com
**Stack**: Astro 5, CSS Custom Properties, Markdown

## Project Structure

```
src/
├── components/
│   ├── ArticleCard.astro      # Blog post preview card
│   ├── CTASection.astro       # Reusable call-to-action section
│   ├── Footer.astro           # Site footer with newsletter
│   ├── Header.astro           # Site header with navigation
│   ├── Hero.astro             # Homepage hero section
│   ├── NewsletterSignup.astro # Email signup (n8n webhook)
│   ├── ServiceCard.astro      # Service display card
│   ├── TagBadge.astro         # Tag display component
│   ├── Testimonial.astro      # Testimonial quote block
│   └── ThemeToggle.astro      # Dark/light mode toggle
├── content/
│   ├── blog/                  # Blog posts (markdown)
│   └── services/              # Service pages (markdown)
├── layouts/
│   ├── BaseLayout.astro       # Main layout wrapper
│   └── BlogPostLayout.astro   # Blog post layout
├── pages/
│   ├── blog/                  # Blog listing and posts
│   ├── services/              # Services listing
│   ├── tags/                  # Tag pages
│   ├── about.astro            # About page
│   ├── contact.astro          # Contact page
│   ├── index.astro            # Homepage
│   └── rss.xml.js             # RSS feed
└── styles/
    ├── components.css         # Component styles
    ├── global.css             # Global styles and resets
    └── variables.css          # CSS custom properties (design system)
```

## Key Files

### Newsletter Webhook
`src/components/NewsletterSignup.astro:59` - Contains n8n webhook URL for email subscriptions. Do not modify the webhook URL without updating n8n workflow.

### Content Collections
`src/content.config.ts` - Defines schemas for:
- `blog`: Posts with title, description, pubDate, tags, etc.
- `services`: Service pages with title, description, features[], order

### Design System
`src/styles/variables.css` - Complete design token system including:
- Colors (dark-first with light mode overrides)
- Typography (fluid type scale)
- Spacing scale
- Layout constraints
- Effects and transitions

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Content Management

### Adding a Blog Post
Create `src/content/blog/post-slug.md`:
```yaml
---
title: "Post Title"
description: "Brief description"
pubDate: 2025-01-17
tags: ["tag1", "tag2"]
draft: false
---

Post content here...
```

### Adding a Service
Create `src/content/services/service-slug.md`:
```yaml
---
title: "Service Name"
description: "Service description"
features:
  - "Feature 1"
  - "Feature 2"
icon: "🎯"
order: 1
featured: true
---

Service details here...
```

## Deployment

Deployed to Vercel. Push to main branch triggers automatic deployment.

## Notes

- Theme defaults to dark mode, respects system preference
- Newsletter form uses `navigator.sendBeacon` for reliability
- All pages include proper meta tags for SEO and social sharing
- RSS feed available at `/rss.xml`
- Sitemap generated at `/sitemap-index.xml`
