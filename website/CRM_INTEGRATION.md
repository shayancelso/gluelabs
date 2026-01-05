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

4. **Deploy:**
   - Commit changes to the website repo
   - Vercel will auto-deploy

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
