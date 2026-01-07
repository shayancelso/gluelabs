# POC Prompt: Renewal Tracker for Ramp

## Overview

Build a Renewal Tracker dashboard for Ramp that provides 90/60/30 day pipeline visibility for upcoming renewals across their 50,000+ customer base.

## Context

Ramp has grown to 50,000+ customers on annual contracts. CSMs manage books of 50-70 accounts each. With this volume, systematic renewal tracking is critical to prevent revenue leakage and ensure proactive outreach at the right time.

## Requirements

### Data Structure

```javascript
const renewalStages = [
  { id: 'upcoming_90', name: '90 Days Out', color: '#10B981' },
  { id: 'upcoming_60', name: '60 Days Out', color: '#F59E0B' },
  { id: 'upcoming_30', name: '30 Days Out', color: '#EF4444' },
  { id: 'overdue', name: 'Overdue', color: '#7C3AED' }
];

const renewalStatuses = [
  'not_started',
  'outreach_sent',
  'in_discussion',
  'verbal_commit',
  'contract_sent',
  'renewed',
  'churned',
  'expansion'
];

const sampleRenewal = {
  id: 'ren_001',
  accountId: 'acct_001',
  accountName: 'TechStartup Inc',
  segment: 'Mid-Market',
  currentARR: 45000,
  renewalDate: '2026-03-15',
  daysToRenewal: 67,
  stage: 'upcoming_60',
  status: 'in_discussion',
  healthScore: 78,
  csm: 'Sarah Chen',
  primaryContact: {
    name: 'John Smith',
    title: 'VP Finance',
    email: 'jsmith@techstartup.com'
  },
  products: ['cards', 'expense', 'billpay'],
  expansionOpportunity: 25000, // potential upsell ARR
  riskFactors: ['champion_change', 'competitor_eval'],
  lastActivity: '2026-01-03',
  notes: 'Discussing adding Procurement module. Decision by Feb 1.'
};
```

### Features

1. **Pipeline Overview**:
   - Kanban view by renewal stage (90/60/30/Overdue)
   - Card count and ARR value per stage
   - Drag-and-drop status updates

2. **List View**:
   - Sortable table of all renewals
   - Columns: Account, ARR, Renewal Date, Days Out, Status, Health, CSM
   - Quick filters by stage, status, CSM, segment

3. **Summary Metrics**:
   - Total ARR up for renewal (30/60/90 days)
   - Renewal rate (YTD)
   - At-risk ARR (low health + upcoming renewal)
   - Expansion pipeline

4. **Individual Renewal Card**:
   - Account details and contacts
   - Current products and expansion opportunity
   - Risk factors
   - Activity timeline
   - Notes field

5. **Calendar View**:
   - Monthly calendar showing renewal dates
   - Color-coded by health/risk
   - Click to see details

6. **Alerts**:
   - "5 renewals in 30 days with no outreach"
   - "3 at-risk accounts renewing soon"
   - "2 overdue renewals need attention"

### Design Requirements

- Use Glue design system
- Clean pipeline visualization
- Urgency colors: Green (90), Yellow (60), Red (30), Purple (Overdue)
- Responsive layout
- Dark mode support

### Technical Requirements

- Vanilla JavaScript only
- Single HTML file with embedded CSS/JS
- Mock data generator for 75 renewals across stages
- Kanban drag-and-drop functionality
- Local storage for status updates
- Export to CSV

## Sample Output

Dashboard should show:
- "$4.2M ARR renewing in next 90 days"
- "28 renewals: 12 in progress, 8 not started, 5 at risk, 3 overdue"
- "92% renewal rate YTD"
- "$850K expansion opportunity in pipeline"

## Success Criteria

1. Never miss a renewal - clear timeline visibility
2. Prioritization - know which renewals need attention
3. Progress tracking - see status of each renewal
4. Expansion visibility - surface upsell opportunities

## Build Command

```
Build a Renewal Tracker for Ramp following the requirements above.
Use Glue's design system. Output a single HTML file with embedded CSS and JS.
Generate realistic mock data for 75 renewals distributed across 90/60/30 day windows.
Include Kanban drag-and-drop and calendar view options.
```
