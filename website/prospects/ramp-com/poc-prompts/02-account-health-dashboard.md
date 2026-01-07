# POC Prompt: Account Health Dashboard for Ramp

## Overview

Build an Account Health Dashboard for Ramp that provides visibility into customer health signals across their 50,000+ customer base, enabling proactive intervention before churn.

## Context

Ramp is scaling their Customer Success organization with a focus on "activation, growth, and retention." CSMs manage books of 50-70 accounts each. They need to quickly identify which accounts need attention across their massive customer base.

Key health indicators for a fintech/spend management platform:
- Product activation (are they using all purchased features?)
- Spend velocity (is card spend growing, flat, or declining?)
- Support ticket volume and sentiment
- Login frequency and user adoption
- Time since last QBR or check-in

## Requirements

### Data Structure

```javascript
const healthMetrics = {
  activation: { weight: 0.25, thresholds: { red: 40, yellow: 70, green: 85 } },
  spendTrend: { weight: 0.25, thresholds: { red: -10, yellow: 0, green: 10 } },
  supportHealth: { weight: 0.15, thresholds: { red: 30, yellow: 60, green: 80 } },
  userAdoption: { weight: 0.20, thresholds: { red: 30, yellow: 60, green: 80 } },
  engagement: { weight: 0.15, thresholds: { red: 30, yellow: 60, green: 75 } }
};

const sampleAccount = {
  id: 'acct_001',
  name: 'TechStartup Inc',
  segment: 'Mid-Market',
  arr: 45000,
  csm: 'Sarah Chen',
  renewalDate: '2026-06-15',
  daysToRenewal: 159,
  healthScore: 72,
  healthTrend: 'declining', // improving, stable, declining
  metrics: {
    activation: 85,      // % of purchased features activated
    spendTrend: -5,      // % change in spend MoM
    supportHealth: 65,   // inverse of ticket volume/severity
    userAdoption: 70,    // % of licensed users active
    engagement: 60       // login frequency, feature usage
  },
  alerts: [
    { type: 'spend_decline', message: 'Spend down 15% over 3 months', severity: 'warning' },
    { type: 'champion_left', message: 'Primary contact Sarah left company', severity: 'critical' }
  ],
  lastContact: '2025-12-15',
  products: ['cards', 'expense', 'billpay']
};
```

### Features

1. **Health Score Overview**:
   - Distribution chart (how many accounts in red/yellow/green)
   - Trend over time
   - Comparison by segment

2. **At-Risk Account List**:
   - Sorted by health score (lowest first)
   - Quick filters: Red only, Yellow only, Declining trend
   - Search by account name
   - Filter by CSM

3. **Individual Account Health Card**:
   - Overall health score with color indicator
   - Breakdown by metric category
   - Trend sparkline (30/60/90 day)
   - Active alerts
   - Days to renewal
   - Recommended actions

4. **CSM Portfolio View**:
   - Health distribution for a single CSM's book
   - Accounts needing attention this week
   - Portfolio trend vs company average

5. **Alert Center**:
   - All active alerts across portfolio
   - Grouped by severity (Critical, Warning, Info)
   - Dismissable with notes

### Health Score Calculation

```javascript
function calculateHealthScore(account) {
  let score = 0;
  for (const [metric, config] of Object.entries(healthMetrics)) {
    const value = account.metrics[metric];
    const normalizedScore = normalizeMetric(value, config.thresholds);
    score += normalizedScore * config.weight;
  }
  return Math.round(score);
}
```

### Design Requirements

- Use Glue design system
- Health colors: Red (#EF4444), Yellow (#F59E0B), Green (#10B981)
- Clean cards with clear visual hierarchy
- Responsive grid layout
- Dark mode support

### Technical Requirements

- Vanilla JavaScript only
- Single HTML file with embedded CSS/JS
- Mock data generator for 100 sample accounts
- Real-time filtering without page reload
- Sortable tables
- Expandable account details

## Sample Output

Dashboard should show:
- "23 accounts need attention (15 critical, 8 at-risk)"
- "Portfolio health: 74% (down 3% from last month)"
- "3 accounts with declining spend trend"
- "5 renewals in next 30 days - 2 at risk"

## Success Criteria

1. Instant visibility into portfolio health
2. Clear prioritization - know where to focus first
3. Actionable alerts with context
4. Trend visibility - catching problems early

## Build Command

```
Build an Account Health Dashboard for Ramp following the requirements above.
Use Glue's design system. Output a single HTML file with embedded CSS and JS.
Generate realistic mock data for 100 accounts with varied health scores and alerts.
Include CSM portfolio filtering and alert management.
```
