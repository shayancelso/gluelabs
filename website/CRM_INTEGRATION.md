# CRM Integration Guide

This document explains the relationship between the Glue website and the internal CRM system.

## Overview

Glue operates two separate systems:

1. **Website** (`/website`) - Static marketing site deployed on Vercel
2. **CRM** (`/CRM/glooadmin`) - Internal admin tool built with React/Lovable, backed by Supabase

These systems share some data that must be kept in sync manually.

## Directory Structure

```
/Users/shayanmirzazadeh/Documents/Vibes/Glue/
├── website/                    # This repository (static site)
│   ├── tools/
│   │   └── prototype-studio/   # Tool demo platform
│   └── CRM_INTEGRATION.md      # This file
│
└── CRM/
    └── glooadmin/              # Internal CRM (Lovable + Supabase)
        └── src/
            └── lib/
                └── toolCatalog.ts  # Source of truth for tools
```

## Tools of Interest Sync

### What Needs Syncing

The "Tools of Interest" list appears in the contact form when prospects express interest. This list must match between:

| Location | File | Type |
|----------|------|------|
| Website | `tools/prototype-studio/src/components/prototypes/ContactDialog.tsx` | Hardcoded array |
| CRM | `src/lib/toolCatalog.ts` + Supabase `tool_catalog` table | Database-driven |

### Source of Truth

**The CRM's `tool_catalog` table is the source of truth.**

The website's `TOOL_CATEGORIES` array is a static copy that must be manually synced when the CRM catalog changes.

### When to Sync

Sync the website when:
- New tools are added to the CRM catalog
- Tool names are changed
- Categories are reorganized
- Tools are removed or deprecated

### How to Sync

1. **Check the CRM tool catalog:**
   - Open the CRM at `https://glooxlovable-expertbuilder.lovable.app/`
   - Navigate to Tools > Catalog tab
   - Review current tools and categories

2. **Or query the database directly:**
   ```sql
   SELECT category, category_name, name, sort_order
   FROM tool_catalog
   ORDER BY category, sort_order;
   ```

3. **Update the website file:**
   - Edit `tools/prototype-studio/src/components/prototypes/ContactDialog.tsx`
   - Update the `TOOL_CATEGORIES` constant to match

4. **Build and Deploy** (see detailed steps below)

## Prototype Studio Build Process

The prototype-studio is a **React/Vite app** that must be built before deployment. The `dist/` folder is gitignored, so built assets must be manually copied to the committed `assets/` folder.

### Important: Two HTML Files Load the App

There are **two entry points** that load the prototype-studio React app:

| URL | File | Purpose |
|-----|------|---------|
| `/tools/` | `tools/index.html` | Main tools page |
| `/tools/prototype-studio/` | `tools/prototype-studio/index.html` | Direct prototype-studio access |

**Both files must reference the same JS bundle.** If you update one and not the other, users will see different versions depending on which URL they visit.

### Build & Deploy Steps

After editing any prototype-studio source files:

```bash
# 1. Navigate to prototype-studio
cd tools/prototype-studio

# 2. Build the React app
npm run build

# 3. Copy the new bundle to the committed assets folder
# (Check dist/index.html for the new filename)
cp dist/assets/index-*.js assets/
cp dist/assets/index-*.css assets/

# 4. Update BOTH HTML files with the new bundle filename
# - tools/index.html
# - tools/prototype-studio/index.html
# Look for the <script type="module" src="..."> tag

# 5. Commit and push
git add .
git commit -m "Update prototype-studio build"
git push
```

### Verifying the Update

After pushing, verify both entry points show the same content:
- `https://buildwithgloo.com/tools/` - Click "Get in Touch" on any tool
- `https://buildwithgloo.com/tools/prototype-studio/` - Click "Get in Touch"

Both should show identical tools of interest lists.

### Common Pitfall

If you only update `tools/prototype-studio/index.html` but forget `tools/index.html`, users visiting `/tools/` will see the old content while `/tools/prototype-studio/` shows the new content. Always update both files.

## Current Tool Categories

As of January 2026, the tool catalog contains 9 categories:

| Category | Name | Tools |
|----------|------|-------|
| A | Sales & New Logo | 8 |
| B | Onboarding & Implementation | 7 |
| C | Account Management | 8 |
| D | Expansion & Growth | 7 |
| E | Renewal & Retention | 7 |
| F | Business Reviews | 6 |
| G | RevOps & Leadership | 6 |
| H | AI-Powered Tools | 7 |
| I | GTM Leadership | 6 |

**Total: 62 tools**

## CRM Database Schema

### tool_catalog Table

```sql
CREATE TABLE tool_catalog (
  id UUID PRIMARY KEY,
  tool_code TEXT,           -- e.g., 'A-01', 'B-02'
  name TEXT NOT NULL,
  category TEXT NOT NULL,   -- 'A', 'B', 'C', etc.
  category_name TEXT,       -- 'Sales & New Logo', etc.
  description TEXT,
  has_discovery BOOLEAN,
  has_template BOOLEAN,
  sort_order INTEGER
);
```

### Related Tables

- `client_tool_coverage` - Which tools each client has/wants
- `client_tools` - Deployed tool instances for clients
- `tool_discovery_templates` - Discovery questions per tool
- `tool_templates` - Template configurations per tool

## Other Shared Data

### Website Links (Marketing Consistency)

The CRM stores canonical website URLs for messaging consistency:
- Main site: `https://buildwithgloo.com`
- Tools page: `https://buildwithgloo.com/tools`
- Contact: `https://buildwithgloo.com/#contact`

Located in: `CRM/glooadmin/src/pages/marketing/WebsiteLinks.tsx`

### Prototype Inquiries

When prospects submit the contact form:
- **Website**: Sends to Formspree (external service)
- **CRM**: Saves to Supabase `prototype_inquiries` table + sends email via edge function

These are separate systems - website leads go to Formspree, CRM leads go to Supabase.

## Future Considerations

To eliminate manual syncing, consider:

1. **API Endpoint**: Expose `tool_catalog` via Supabase public API
2. **Build-time Fetch**: Fetch tools during website build
3. **Shared Config File**: Single JSON file imported by both systems

Currently manual sync is acceptable given low change frequency.
