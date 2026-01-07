# POC Prompt: Whitespace Visualizer for Ramp

## Overview

Build a Whitespace Visualizer dashboard for Ramp that shows expansion opportunities across their 6 product lines for existing customers.

## Context

Ramp has 50,000+ customers and 6 distinct product lines:
1. Corporate Cards
2. Expense Management
3. Bill Pay
4. Procurement
5. Travel
6. Treasury

Their business model is land-and-expand, with 200%+ net dollar retention driven by customers adopting additional products. This tool will help Growth Account Managers identify which customers are candidates for which products.

## Requirements

### Data Structure

```javascript
const rampProducts = [
  { id: 'cards', name: 'Corporate Cards', avgARR: 12000, color: '#00D4AA' },
  { id: 'expense', name: 'Expense Management', avgARR: 8000, color: '#0066FF' },
  { id: 'billpay', name: 'Bill Pay', avgARR: 15000, color: '#7C3AED' },
  { id: 'procurement', name: 'Procurement', avgARR: 25000, color: '#F59E0B' },
  { id: 'travel', name: 'Travel', avgARR: 10000, color: '#EF4444' },
  { id: 'treasury', name: 'Treasury', avgARR: 20000, color: '#10B981' }
];

const sampleAccounts = [
  {
    id: 'acct_001',
    name: 'TechStartup Inc',
    segment: 'SMB',
    currentARR: 20000,
    products: ['cards', 'expense'],
    employeeCount: 150,
    industry: 'Technology',
    csm: 'Sarah Chen',
    healthScore: 85,
    lastActivity: '2026-01-05'
  },
  // ... more accounts
];
```

### Features

1. **Grid View**: Matrix showing accounts (rows) vs products (columns)
   - Filled cells = adopted product
   - Empty cells = whitespace opportunity
   - Color intensity based on expansion potential

2. **Expansion Potential Calculator**:
   - Based on company size, industry, current spend
   - Shows estimated ARR if product adopted

3. **Filters**:
   - By segment (SMB, Mid-Market, Enterprise)
   - By CSM
   - By health score (only show healthy accounts)
   - By product gaps

4. **Summary Stats**:
   - Total whitespace ARR potential
   - Average products per customer
   - Top expansion opportunities

5. **Account Detail Modal**:
   - Current products with ARR
   - Recommended next product
   - Key contacts
   - Recent activity

### Design Requirements

- Use Glue design system (see /design-system)
- Clean, modern fintech aesthetic
- Ramp brand colors where appropriate (#00D4AA primary)
- Responsive for desktop and tablet
- Dark mode support

### Technical Requirements

- Vanilla JavaScript only, no frameworks
- Single HTML file with embedded CSS/JS
- Mock data generator for demo
- Sorting and filtering without page reload
- Export to CSV functionality

## Sample Output

The dashboard should show at a glance:
- "You have $45M in expansion potential across 12,500 accounts"
- "73% of customers use only 1-2 products"
- "Top recommendation: Bill Pay for accounts with Cards + Expense"

## Success Criteria

1. Visual clarity - expansion opportunities obvious at a glance
2. Actionable - click to see specific accounts to target
3. Filterable - CSMs can focus on their book
4. Quantified - dollar values for prioritization

## Build Command

```
Build a Whitespace Visualizer for Ramp following the requirements above.
Use Glue's design system. Output a single HTML file with embedded CSS and JS.
Generate realistic mock data for 50 sample accounts across their 6 products.
```
