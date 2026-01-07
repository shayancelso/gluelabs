# POC Prompt: ROI Calculator for Ramp

## Overview

Build an ROI Calculator for Ramp that helps their CS and Sales teams demonstrate concrete value to customers during renewals and competitive situations.

## Context

Ramp's core value proposition is helping businesses "spend less" - they claim customers save an average of 5% and close books 8x faster. In a competitive market against Brex, SAP Concur, and others, quantifying this value is critical for retention. This tool calculates and visualizes the ROI a customer has achieved with Ramp.

## Requirements

### Data Structure

```javascript
const valueMetrics = {
  timeSavings: {
    expenseReporting: { hoursPerMonth: 10, costPerHour: 50 },
    receiptManagement: { hoursPerMonth: 5, costPerHour: 50 },
    reconciliation: { hoursPerMonth: 15, costPerHour: 75 },
    approvalWorkflows: { hoursPerMonth: 8, costPerHour: 50 },
    vendorManagement: { hoursPerMonth: 12, costPerHour: 60 }
  },
  costSavings: {
    duplicatePayments: { percentPrevented: 2, description: 'Duplicate payments prevented' },
    fraudPrevention: { percentPrevented: 0.5, description: 'Fraud losses prevented' },
    earlyPaymentDiscounts: { percentCaptured: 1.5, description: 'Early payment discounts captured' },
    negotiatedSavings: { percentSaved: 3, description: 'Vendor negotiated savings' }
  },
  cashbackRewards: {
    rate: 1.5, // percent
    description: 'Cash back on all purchases'
  }
};

const sampleCustomerData = {
  accountName: 'TechStartup Inc',
  annualSpend: 2500000,
  employeeCount: 150,
  financeTeamSize: 5,
  monthsAsCustomer: 18,
  productsUsed: ['cards', 'expense', 'billpay'],
  monthlyTransactions: 450,
  monthlyBills: 120,
  bookCloseTime: {
    before: 15, // days
    after: 5    // days
  }
};
```

### Features

1. **Input Form**:
   - Company size (employees)
   - Annual spend through Ramp
   - Finance team size
   - Products used
   - Monthly transaction volume
   - Previous book close time

2. **ROI Summary Dashboard**:
   - Total value delivered (annualized)
   - Breakdown by category:
     - Time savings ($)
     - Cost savings ($)
     - Cash back earned ($)
   - ROI percentage vs. Ramp cost

3. **Time Savings Breakdown**:
   - Hours saved per month by activity
   - Dollar value based on hourly rates
   - Comparison: Before vs After Ramp
   - Visual bar chart

4. **Cost Savings Breakdown**:
   - Duplicate payments prevented
   - Fraud losses avoided
   - Early payment discounts captured
   - Vendor negotiation savings

5. **Book Close Improvement**:
   - Days to close: Before vs After
   - Visual timeline comparison
   - Productivity gain calculation

6. **Competitive Comparison**:
   - What you'd be paying with:
     - Traditional corporate card (annual fee, late fees)
     - SAP Concur (per-user pricing)
     - Brex (feature comparison)

7. **Export Options**:
   - One-page PDF summary
   - Detailed breakdown report
   - QBR slide format

### Calculations

```javascript
function calculateROI(customerData) {
  const timeSavings = calculateTimeSavings(customerData);
  const costSavings = calculateCostSavings(customerData);
  const cashBack = customerData.annualSpend * (valueMetrics.cashbackRewards.rate / 100);

  const totalValue = timeSavings + costSavings + cashBack;
  const rampCost = 0; // Free tier or calculate based on plan
  const roi = ((totalValue - rampCost) / rampCost) * 100;

  return { totalValue, timeSavings, costSavings, cashBack, roi };
}
```

### Design Requirements

- Use Glue design system
- Clean, professional appearance suitable for QBR presentations
- Ramp brand colors where appropriate
- Large, clear numbers for impact
- Print-friendly layout
- Dark mode support

### Technical Requirements

- Vanilla JavaScript only
- Single HTML file with embedded CSS/JS
- Interactive sliders for inputs
- Real-time calculation updates
- PDF export functionality
- Chart.js or similar for visualizations

## Sample Output

Dashboard should show:
- "Total Value Delivered: $187,500/year"
  - Time Savings: $112,500
  - Cost Savings: $37,500
  - Cash Back: $37,500
- "ROI: Infinite (Ramp is free)"
- "Book close improved from 15 days to 5 days"
- "892 hours saved annually for your finance team"

## Success Criteria

1. Clear value quantification - specific dollar amounts
2. Credible methodology - transparent calculations
3. Visual impact - presentation-ready
4. Personalized - uses actual customer data

## Build Command

```
Build an ROI Calculator for Ramp following the requirements above.
Use Glue's design system. Output a single HTML file with embedded CSS and JS.
Include interactive inputs, real-time calculations, and PDF export.
Pre-populate with sample data for a mid-market customer.
```
