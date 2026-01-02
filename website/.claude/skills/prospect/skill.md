# Prospect Research Skill (Enhanced)

Deep company research that beats ZoomInfo - real-time AI research with technographics, financials, and verified contacts.

## Trigger

```
/prospect <domain>
```

Example: `/prospect salesforce.com`

## Description

This skill performs comprehensive prospect research across 8 phases, generating:
- Deep company intelligence (financials, technographics, market position)
- Verified contacts with email patterns and confidence scores
- Pain point analysis with evidence chains
- POC recommendations with scoring
- CRM-ready structured data (JSON)
- Professional PDF report

## Output Schema

All research outputs a `research-data.json` file with this structure for CRM export:

```json
{
  "company": {
    "domain": "example.com",
    "name": "Example Inc",
    "description": "...",
    "industry": "SaaS",
    "businessModel": "B2B Subscription",
    "founded": "2015",
    "headquarters": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    },
    "subsidiaries": [],
    "parentCompany": null
  },
  "financials": {
    "estimatedRevenue": { "value": "$50M-100M", "confidence": "medium", "sources": [] },
    "funding": {
      "totalRaised": "$45M",
      "lastRound": { "type": "Series B", "amount": "$25M", "date": "2024-03", "investors": [] },
      "confidence": "high"
    },
    "headcount": { "current": 250, "trend": "growing", "growthRate": "15%", "confidence": "medium" },
    "valuation": { "value": null, "confidence": "low" }
  },
  "technographics": {
    "crm": { "value": "Salesforce", "confidence": "high", "source": "job_posting" },
    "customerSuccess": { "value": "Gainsight", "confidence": "medium", "source": "stackshare" },
    "marketing": { "value": "HubSpot Marketing", "confidence": "high", "source": "website" },
    "dataWarehouse": { "value": "Snowflake", "confidence": "low", "source": "inferred" },
    "engineering": ["React", "Node.js", "AWS"],
    "integrations": ["Slack", "Zoom", "Jira"],
    "allTools": []
  },
  "marketPosition": {
    "competitors": [{ "name": "...", "relationship": "direct" }],
    "marketShare": { "value": null, "confidence": "low" },
    "growthStage": "growth",
    "recentNews": []
  },
  "contacts": [{
    "name": "Jane Smith",
    "title": "VP Customer Success",
    "tier": 1,
    "linkedIn": "linkedin.com/in/janesmith",
    "email": {
      "address": null,
      "pattern": "first.last@example.com",
      "confidence": "medium"
    },
    "phone": null,
    "verification": {
      "confidence": "high",
      "lastVerified": "2025-01-15",
      "sources": ["company_website", "linkedin"],
      "notes": "Confirmed on leadership page"
    },
    "relevance": "Budget owner for CS tools"
  }],
  "painPoints": [{
    "id": "pp1",
    "title": "Expansion Revenue Visibility",
    "description": "...",
    "confidence": "high",
    "score": 10,
    "validation": {
      "directEvidence": 3,
      "quantifiedImpact": 2,
      "recency": 3,
      "sourceDiversity": 2
    },
    "evidence": [
      { "type": "PRIMARY", "source": "job_posting", "text": "...", "date": "2025-01", "url": "..." }
    ],
    "glueToolFit": "whitespace-visualizer",
    "opportunity": "..."
  }],
  "pocRecommendations": [{
    "rank": 1,
    "tool": "whitespace-visualizer",
    "relevanceScore": 9,
    "difficultyScore": 2,
    "rationale": "...",
    "painPointIds": ["pp1", "pp2"]
  }],
  "metadata": {
    "researchDate": "2025-01-28",
    "researchDuration": 485000,
    "skillVersion": "2.0",
    "dataFreshness": "2025-01-28",
    "overallConfidence": "high"
  }
}
```

## Workflow

When invoked with `/prospect <domain>`, execute the following 8 phases:

---

### Phase 1: Deep Company Discovery

**Goal**: Build comprehensive company profile beyond basic information.

#### 1.1 Basic Company Info
Use WebSearch:
- `"<domain>" company overview`
- `"<company_name>" about`
- `"<company_name>" founded history`

Use WebFetch:
- `https://<domain>` (homepage)
- `https://<domain>/about` or `/about-us` or `/company`
- `https://<domain>/careers` or `/jobs`

Extract:
- Company name, description, tagline
- Industry classification
- Business model (B2B/B2C, SaaS/Services, etc.)
- Year founded
- Headquarters location
- Geographic presence

#### 1.2 Corporate Structure
Use WebSearch:
- `"<company_name>" subsidiaries acquisitions`
- `"<company_name>" parent company`
- `"<company_name>" acquired by`

Document:
- Parent company (if any)
- Subsidiaries or acquired companies
- Recent M&A activity

#### 1.3 Target Market
Use WebFetch:
- `https://<domain>/customers` or `/case-studies`

Use WebSearch:
- `"<company_name>" customers case studies`
- `"<company_name>" target market`

Extract:
- Customer segments
- Industries served
- Company size focus (SMB/Mid-market/Enterprise)
- Notable customers

---

### Phase 2: Market Position Analysis

**Goal**: Understand competitive landscape and growth trajectory.

#### 2.1 Competitor Identification
Use WebSearch:
- `"<company_name>" competitors alternatives`
- `"<company_name>" vs`
- `site:g2.com "<company_name>" alternatives`
- `site:capterra.com "<company_name>"`

Document:
- Direct competitors (same product category)
- Indirect competitors (adjacent solutions)
- Competitive positioning

#### 2.2 Market Position
Use WebSearch:
- `"<company_name>" market share`
- `"<company_name>" industry leader`
- `"<company_name>" analyst report gartner forrester`

Extract:
- Market share indicators
- Analyst mentions (Gartner, Forrester, etc.)
- Industry rankings

#### 2.3 Recent Strategic Moves
Use WebSearch:
- `"<company_name>" news 2025`
- `"<company_name>" partnership announcement 2024 2025`
- `"<company_name>" product launch 2024 2025`
- `"<company_name>" expansion 2024 2025`

Document:
- Recent product launches
- Partnership announcements
- Geographic expansion
- Strategic pivots

#### 2.4 Growth Stage Classification
Based on findings, classify:
- **Startup**: <$10M revenue, <50 employees, early funding
- **Growth**: $10M-$100M revenue, 50-500 employees, Series A-C
- **Scale-up**: $100M-$500M revenue, 500-2000 employees, late stage
- **Enterprise**: >$500M revenue, >2000 employees, public or PE-backed

---

### Phase 3: Technographic Analysis (NEW)

**Goal**: Map their technology stack to identify tool gaps and integration opportunities.

#### 3.1 Tech Stack Discovery
Use WebSearch:
- `site:stackshare.io "<company_name>"`
- `site:builtwith.com "<domain>"`
- `"<company_name>" tech stack engineering blog`
- `"<company_name>" engineering jobs requirements`

Use WebFetch (if results found):
- StackShare page
- BuiltWith page
- Engineering blog

#### 3.2 Sales & CS Tool Stack
Use WebSearch:
- `"<company_name>" salesforce OR hubspot OR pipedrive site:linkedin.com`
- `"<company_name>" gainsight OR churnzero OR totango`
- `"<company_name>" sales ops tools`
- `"<company_name>" customer success platform`

Check job postings for tool requirements:
- CRM system (Salesforce, HubSpot, etc.)
- CS Platform (Gainsight, ChurnZero, Totango)
- Sales engagement (Outreach, Salesloft)
- Revenue intelligence (Gong, Chorus)

#### 3.3 Marketing & Data Stack
Use WebSearch:
- `"<company_name>" marketing automation`
- `"<company_name>" analytics data warehouse`
- `"<company_name>" BI tool tableau looker`

Look for:
- Marketing automation (HubSpot, Marketo, Pardot)
- Analytics (Google Analytics, Mixpanel, Amplitude)
- Data warehouse (Snowflake, BigQuery, Redshift)
- BI tools (Tableau, Looker, Power BI)

#### 3.4 Integration Landscape
Use WebSearch:
- `"<company_name>" integrations`
- `site:<domain> integrations`

Use WebFetch:
- `https://<domain>/integrations` (if exists)

Document all identified integrations.

#### 3.5 Confidence Scoring for Tech Stack
For each tool identified:
- **High**: Found on company website, job posting with specific version/experience
- **Medium**: Found on StackShare, mentioned in news, implied by job posting
- **Low**: Inferred from industry norms, mentioned in old sources

---

### Phase 4: Financial Intelligence (NEW)

**Goal**: Estimate revenue, funding status, and financial health indicators.

#### 4.1 Funding History
Use WebSearch:
- `"<company_name>" funding series round 2024 2025`
- `site:crunchbase.com "<company_name>"`
- `site:pitchbook.com "<company_name>"`
- `"<company_name>" raises million`

Use WebFetch:
- Crunchbase page (if found)
- TechCrunch funding announcement

Extract:
- Total funding raised
- Last round (type, amount, date)
- Key investors
- Valuation (if disclosed)

#### 4.2 Revenue Estimation
Use WebSearch:
- `"<company_name>" revenue ARR MRR`
- `"<company_name>" annual revenue`
- `"<company_name>" "$" million revenue`

Revenue inference methods:
1. **Direct disclosure**: Press releases, interviews
2. **Funding-based**: Series B typically = $10-30M ARR
3. **Employee-based**: ~$150-250K revenue per employee for SaaS
4. **Customer-based**: Estimate from known customer count × ARPU

Always note confidence level and estimation method.

#### 4.3 Headcount Trends
Use WebSearch:
- `"<company_name>" employees headcount`
- `"<company_name>" hiring growing`
- `"<company_name>" layoffs`
- `site:linkedin.com "<company_name>" employees`

Track:
- Current employee count
- Growth/decline trend (hiring vs layoffs)
- Recent job posting volume (indicator of growth)

#### 4.4 Financial Health Signals
Look for:
- Profitability mentions
- Burn rate indicators
- Runway concerns
- Path to profitability announcements

---

### Phase 5: Pain Point Analysis

**Goal**: Identify operational challenges with evidence-based validation.

#### 5.1 Pain Point Discovery
Use WebSearch:
- `"<company_name>" customer success challenges`
- `"<company_name>" account management jobs site:linkedin.com`
- `"<company_name>" sales operations hiring`
- `"<company_name>" revenue operations`
- `site:glassdoor.com "<company_name>" reviews operations`
- `"<industry>" customer retention challenges 2025`

Analyze job postings for:
- Tools and systems they use
- Gaps in current tooling
- Team structure (CS, AM, Sales Ops, RevOps)
- Pain points in job descriptions

#### 5.2 Pain Point Categories
Identify pain points related to:
- Account expansion and whitespace
- Customer health monitoring
- Churn prediction and prevention
- Renewal management
- QBR automation
- ROI tracking
- Stakeholder mapping
- Revenue planning

#### 5.3 Pain Point Validation (CRITICAL)

For each pain point, score against validation criteria:

**Validation Scoring (0-3 per dimension)**

1. **Direct Evidence Score (0-3)**
   - 3: Company explicitly states in own content (job posts, press releases)
   - 2: Mentioned by employees (Glassdoor, LinkedIn)
   - 1: Common in their industry/segment
   - 0: Speculation based on business model

2. **Quantified Impact Score (0-3)**
   - 3: Specific numbers (e.g., "15% churn", "$2M at risk")
   - 2: Relative scale (e.g., "growing fast", "top priority")
   - 1: Implied significance (hiring for this area)
   - 0: No quantification

3. **Recency Score (0-3)**
   - 3: Evidence from last 6 months (2025)
   - 2: Evidence from last 12 months
   - 1: Evidence from 1-2 years ago
   - 0: Older or undated

4. **Source Diversity Score (0-3)**
   - 3: 3+ independent sources confirm
   - 2: 2 sources confirm
   - 1: Single source
   - 0: Speculation only

**Confidence Levels:**
- 9-12 points: **High** - Lead with this pain point
- 5-8 points: **Medium** - Valid but needs validation
- 0-4 points: **Low** - Use only as context

**Evidence Chain Tags:**
- `[PRIMARY]` - Company's own words
- `[SECONDARY]` - Third-party sources
- `[INFERRED]` - Deduced from business model

---

### Phase 6: Enhanced Contact Discovery

**Goal**: Find decision makers with verified contact info and email patterns.

#### 6.1 Leadership Changes Check
**CRITICAL**: Search for recent departures first:
- `"<company_name>" leadership changes 2025`
- `"<company_name>" "new hire" OR "joins" OR "appointed" 2025`
- `"<company_name>" "former" OR "left" executive 2024 2025`

#### 6.2 Decision Maker Search
Use WebSearch:
- `"<company_name>" "VP Customer Success" site:linkedin.com`
- `"<company_name>" "Director Customer Success" site:linkedin.com`
- `"<company_name>" "Head of Account Management" site:linkedin.com`
- `"<company_name>" "VP Sales Operations" site:linkedin.com`
- `"<company_name>" "Director Revenue Operations" site:linkedin.com`
- `"<company_name>" "Chief Revenue Officer" site:linkedin.com`

Use WebFetch:
- `https://<domain>/about/team` or `/leadership` or `/about-us`

**Contact Tiers:**
- **Tier 1**: VP/Director of Customer Success, CRO, VP Revenue
- **Tier 2**: Director of Sales Ops, Head of AM, Director RevOps
- **Tier 3**: Senior Manager CS, Account Management Lead

#### 6.3 Contact Verification
For each contact:
1. Check company leadership page (most authoritative)
2. Search `"<name>" "<company_name>" 2025` for recent mentions
3. Look for "former" in search results
4. Check for recent LinkedIn activity

**Verification Confidence:**
- **High**: Confirmed on company website leadership page
- **Medium**: Recent LinkedIn activity at company
- **Low**: Only found in older sources

**Red Flags:**
- "Former" in search snippets
- No 2025 mentions
- Company page doesn't list them

#### 6.4 Email Pattern Detection (NEW)
Use WebSearch:
- `site:hunter.io "<domain>" email format`
- `"@<domain>" email format pattern`
- `"<company_name>" email address format`

Look for email patterns in:
- Press releases (PR contact emails)
- Support pages (support@, info@)
- Job postings (recruiter emails)
- News articles (quoted employees)

Common patterns to identify:
- `first.last@domain.com`
- `first@domain.com`
- `flast@domain.com`
- `firstl@domain.com`
- `first_last@domain.com`

For each contact, generate likely email based on pattern found.
Note confidence level (high if pattern confirmed, medium if inferred).

#### 6.5 Contact Output Format
For each contact:
```json
{
  "name": "Jane Smith",
  "title": "VP Customer Success",
  "tier": 1,
  "linkedIn": "linkedin.com/in/janesmith",
  "email": {
    "address": null,
    "pattern": "first.last@example.com",
    "confidence": "medium"
  },
  "verification": {
    "confidence": "high",
    "lastVerified": "2025-01-28",
    "sources": ["company_website"],
    "notes": "Listed on /about/leadership"
  },
  "relevance": "Budget owner for CS tools, reports to CRO"
}
```

---

### Phase 7: POC Recommendation Generation

**Goal**: Match pain points to Glue tools with scoring.

#### 7.1 Pain Point to Tool Matching
Reference `knowledge/glue-capabilities.md` for tool mapping:

| Pain Point | Glue Tool | Description |
|------------|-----------|-------------|
| Account expansion | Whitespace Visualizer | Revenue expansion analysis |
| Customer health | Account Health Dashboard | Health monitoring |
| Churn risk | Churn Predictor | Risk scoring |
| Renewal management | Renewal Tracker | Pipeline management |
| QBR automation | QBR Builder | Automated QBRs |
| ROI tracking | ROI Calculator | Value demonstration |
| Stakeholder mapping | Stakeholder Map | Relationship visualization |
| Revenue planning | Work-back Planner | Goal planning |

#### 7.2 Relevance Scoring (1-10)
For each POC, score based on:
- Direct evidence of pain point (0-4 points)
- Industry fit (0-2 points)
- Company size fit (0-2 points)
- Likelihood of immediate value (0-2 points)

#### 7.3 Difficulty Assessment (1-5)
- **1**: Simple demo, minimal data needed
- **2**: Standard implementation, common data
- **3**: Moderate complexity, custom data mapping
- **4**: Complex, significant data requirements
- **5**: Very complex, extensive customization

#### 7.4 POC Prompt Generation
Use `templates/poc-prompt.md` template for each of top 5 POCs.

---

### Phase 8: Output Generation

**Goal**: Create all deliverables in structured format.

#### 8.1 Directory Structure
Create:
```
prospects/<domain-sanitized>/
├── research-data.json      # Structured data for CRM export (NEW)
├── research-report.md      # Human-readable report
├── research-report.pdf     # PDF version
├── contacts.md            # Contact list
└── poc-prompts/
    ├── 01-<tool-slug>.md
    ├── 02-<tool-slug>.md
    ├── 03-<tool-slug>.md
    ├── 04-<tool-slug>.md
    └── 05-<tool-slug>.md
```

#### 8.2 research-data.json (NEW)
Generate JSON following the schema defined at the top of this document.
This file enables:
- CRM import (HubSpot, Salesforce)
- Batch comparison across companies
- Programmatic access to research data

#### 8.3 research-report.md
Comprehensive report including:
- Executive Summary
- Company Overview
- Market Position
- Tech Stack
- Financial Intelligence
- Pain Points (with evidence)
- Contacts
- POC Recommendations
- Outreach Strategy

#### 8.4 PDF Generation
Use `document-skills:pdf` to convert research-report.md:
- Company name as title
- Clean typography
- Tables formatted for readability
- Page numbers
- Research date in header

---

## Confidence Framework

Every data point should include confidence scoring:

| Confidence | Criteria |
|------------|----------|
| **High** | 3+ independent sources confirm, or found on company's official website |
| **Medium** | 2 sources confirm, or 1 authoritative source |
| **Low** | Single non-authoritative source |
| **Inferred** | Deduced from business model, industry norms |

---

## Important Notes

- Always sanitize domain for directory names (`.` → `-`)
- If research incomplete for any section, note what couldn't be found
- Prioritize POCs by value/difficulty ratio
- POC prompts should reference Glue's design system
- All POC prompts should specify vanilla JS, no frameworks
- Include sample data structures in POC prompts
- Generate `research-data.json` for every research run

---

## Version History

- **v2.0** (2025-01): Added technographics, financials, email patterns, structured JSON output
- **v1.0** (2024-12): Initial version with 6 phases
