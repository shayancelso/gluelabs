# POC Prompt: Stakeholder Map for Ramp

## Overview

Build a Stakeholder Map visualization tool for Ramp that helps their Enterprise sales and CS teams visualize relationships across complex buying committees in their 2,200+ enterprise accounts.

## Context

Ramp's enterprise customer base doubled YoY. These accounts have complex buying committees spanning Finance, IT, and Procurement. Multi-threading relationships is critical for retention and expansion. The tool should help identify relationship gaps and champion/detractor dynamics.

## Requirements

### Data Structure

```javascript
const relationshipTypes = [
  { id: 'champion', name: 'Champion', color: '#10B981', icon: 'star' },
  { id: 'supporter', name: 'Supporter', color: '#3B82F6', icon: 'thumbs-up' },
  { id: 'neutral', name: 'Neutral', color: '#6B7280', icon: 'minus' },
  { id: 'blocker', name: 'Blocker', color: '#EF4444', icon: 'alert' },
  { id: 'unknown', name: 'Unknown', color: '#9CA3AF', icon: 'question' }
];

const engagementLevels = ['high', 'medium', 'low', 'none'];

const sampleStakeholder = {
  id: 'stk_001',
  accountId: 'acct_enterprise_001',
  name: 'Sarah Johnson',
  title: 'VP of Finance',
  department: 'Finance',
  email: 'sjohnson@enterprise.com',
  phone: '+1 555-0123',
  linkedIn: 'linkedin.com/in/sarahjohnson',
  relationship: 'champion',
  engagementLevel: 'high',
  influence: 'high', // high, medium, low
  decisionMaker: true,
  budgetOwner: true,
  reportsTo: 'stk_002', // CFO
  lastContact: '2026-01-03',
  notes: 'Strong advocate. Led initial evaluation. Renews in Q2.',
  touchpoints: [
    { date: '2026-01-03', type: 'meeting', summary: 'QBR discussion' },
    { date: '2025-12-15', type: 'email', summary: 'Shared roadmap preview' }
  ]
};

const sampleAccount = {
  id: 'acct_enterprise_001',
  name: 'Enterprise Corp',
  arr: 250000,
  segment: 'Enterprise',
  products: ['cards', 'expense', 'billpay', 'procurement'],
  stakeholders: [/* array of stakeholders */],
  relationshipScore: 72, // overall multi-threading score
  coverageGaps: ['IT', 'Procurement'] // departments without contacts
};
```

### Features

1. **Org Chart Visualization**:
   - Hierarchical view of stakeholders
   - Color-coded by relationship type
   - Lines showing reporting structure
   - Click to expand/collapse branches

2. **Relationship Matrix**:
   - Grid view: Stakeholders vs Relationship strength
   - Filter by department, influence level
   - Highlight gaps in coverage

3. **Account Health Summary**:
   - Multi-threading score (% of key roles covered)
   - Champion count vs blockers
   - Department coverage map
   - Risk indicators

4. **Individual Stakeholder Card**:
   - Contact details
   - Relationship history
   - Recent touchpoints
   - Influence assessment
   - Connection to other stakeholders

5. **Action Recommendations**:
   - "No contact in Procurement - key for expansion"
   - "Champion leaving in 30 days - need backup"
   - "Blocker identified - escalation needed"

6. **Timeline View**:
   - Engagement activity over time
   - Identify accounts going dark
   - Track relationship momentum

### Design Requirements

- Use Glue design system
- Clean org chart visualization (tree or force-directed graph)
- Relationship colors clearly differentiated
- Responsive for desktop presentation
- Dark mode support

### Technical Requirements

- Vanilla JavaScript only
- Single HTML file with embedded CSS/JS
- Mock data generator for 3 enterprise accounts with 8-12 stakeholders each
- Interactive org chart (expand/collapse)
- Drag to rearrange stakeholders
- Export to PDF/PNG for QBR decks

## Sample Output

Dashboard should show for an account:
- "Relationship Score: 72% - Good coverage"
- "3 Champions, 1 Blocker, 2 Unknown"
- "Gap: No contact in IT department"
- "Risk: Primary champion Sarah has accepted new role"

## Success Criteria

1. Visual clarity - instantly see relationship landscape
2. Gap identification - know where to focus outreach
3. Risk alerts - catch champion churn early
4. Actionable - clear next steps for improvement

## Build Command

```
Build a Stakeholder Map for Ramp following the requirements above.
Use Glue's design system. Output a single HTML file with embedded CSS and JS.
Generate realistic mock data for 3 enterprise accounts with varied stakeholder dynamics.
Include org chart visualization and relationship matrix views.
```
