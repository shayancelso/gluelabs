# POC: {tool_name}

**For**: {company_name} ({domain})
**Difficulty**: {difficulty}/5
**Estimated Build Time**: {time_estimate}

---

## Why This Tool for {company_name}

{2-3 paragraphs explaining:
- What pain point this addresses
- Evidence from research that this is relevant
- Expected impact/value for their team}

---

## Difficulty Assessment

**Rating**: {difficulty}/5

| Factor | Assessment |
|--------|------------|
| Data Requirements | {simple / moderate / complex} - {explanation} |
| Technical Complexity | {low / medium / high} - {explanation} |
| Design Complexity | {low / medium / high} - {explanation} |

**Key Challenges**:
- {challenge_1}
- {challenge_2}

---

## Claude Code Prompt

Copy and paste the following prompt into a new Claude Code session:

```
I need you to build a {tool_name} for a B2B SaaS company in the {industry} industry, similar to {company_name}.

## Business Context

{company_name} is a {brief_description}. They likely face challenges with {pain_point_description}.

This tool should help them {primary_value_prop}.

## Core Requirements

1. {requirement_1}
2. {requirement_2}
3. {requirement_3}
4. {requirement_4}
5. {requirement_5}

## Technical Specifications

- **Frontend**: Vanilla JavaScript (ES6+) - NO frameworks (no React, Vue, etc.)
- **Styling**: Pure CSS3 with CSS variables for theming
- **Design**: Glassmorphism UI with backdrop-filter effects
- **Data**: CSV import capability for demo data
- **Files**: Self-contained HTML/CSS/JS files
- **Responsive**: Mobile-friendly design

## Design System

Follow these design patterns:

```css
:root {
  /* Primary Colors */
  --color-primary: #6366f1;
  --color-secondary: #ec4899;
  --color-accent: #8b5cf6;
  --gradient-primary: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);

  /* Glass Effects */
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  /* Typography */
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

Use glassmorphism cards with:
- `backdrop-filter: blur(10px)`
- Subtle borders with `rgba(255, 255, 255, 0.3)`
- Soft shadows
- Gradient accents for CTAs and highlights

## Suggested Data Model

{data_model_description}

Example CSV structure:
```csv
{example_csv_headers}
{example_csv_row_1}
{example_csv_row_2}
{example_csv_row_3}
```

## Key Features

1. **{feature_1_name}**
   - {feature_1_description}

2. **{feature_2_name}**
   - {feature_2_description}

3. **{feature_3_name}**
   - {feature_3_description}

4. **{feature_4_name}**
   - {feature_4_description}

## User Flow

1. User lands on tool page, sees brief description and "Get Started" CTA
2. User uploads CSV or clicks "Load Sample Data"
3. Tool processes data and displays main dashboard/visualization
4. User can interact with data (filter, sort, click for details)
5. User can export results or take action

## Success Criteria

- Tool loads in under 2 seconds
- Works offline after initial load
- Intuitive for non-technical users
- Professional appearance suitable for enterprise demo
- Clear value demonstrated within 30 seconds of loading data

## File Structure

Create these files:
```
{tool_slug}/
├── index.html    # Main page with all markup
├── styles.css    # All styling
├── script.js     # All functionality
└── sample.csv    # Demo data file
```

## Important Notes

- This is a DEMO/POC - focus on visual impact and core functionality
- Include realistic sample data that tells a story
- Add subtle animations for polish (hover effects, transitions)
- Ensure the tool works without any server - pure client-side
- Include clear headings and labels so the demo is self-explanatory

Please build this tool now, starting with the HTML structure.
```

---

## Demo Talking Points

When presenting this POC to {company_name}:

1. **Opening Hook**: "{hook_based_on_pain_point}"

2. **Value Demo**:
   - Show {key_feature_1} → "{what_it_reveals}"
   - Highlight {key_feature_2} → "{business_impact}"

3. **Customization Story**: "This is built specifically for companies like yours. We can customize {x}, {y}, and {z} based on your exact data and workflow."

4. **Call to Action**: "Want to see this with your actual data? We can have a working version ready in {timeframe}."

---

## Sample Data Suggestions

For the demo, include sample data that:
- Reflects {company_name}'s industry ({industry})
- Shows realistic scenarios they'd encounter
- Tells a clear story (e.g., accounts at risk, opportunities to pursue)
- Includes 10-20 records for a quick demo, 50+ for a realistic feel

---

## Post-Build Checklist

After building, verify:
- [ ] Tool loads without errors
- [ ] Sample data loads correctly
- [ ] All interactive elements work
- [ ] Mobile view is usable
- [ ] Visual design matches Glue's style
- [ ] Clear value proposition visible immediately
