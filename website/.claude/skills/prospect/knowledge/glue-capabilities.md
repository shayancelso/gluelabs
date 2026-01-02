# Glue Tool Capabilities

This knowledge base maps Glue's tools to business problems for POC recommendations.

## Strategic Matrix Framework

Each tool is classified in a 2x2 matrix based on **Impact** (value to prospect) and **Effort** (complexity to build/demo):

```
                    QUICK WIN                    STRATEGIC
                    (Low Effort)                 (High Effort)
    ┌────────────────────────────┬────────────────────────────┐
    │                            │                            │
    │  EASY WINS                 │  MAJOR INITIATIVES         │
H   │  High impact, fast to demo │  High impact, complex      │
I   │  Lead with these           │  For strategic deals       │
G   │                            │                            │
H   ├────────────────────────────┼────────────────────────────┤
    │                            │                            │
L   │  FILL-INS                  │  CONSIDER CAREFULLY        │
O   │  Quick add-ons after       │  Niche use cases with      │
W   │  primary tool adopted      │  specific requirements     │
    │                            │                            │
    └────────────────────────────┴────────────────────────────┘
```

### Scoring Dimensions

**Impact Score (1-5)**:
- 5: Directly drives measurable revenue or prevents significant churn
- 4: High executive visibility, strategic importance
- 3: Solves meaningful operational pain
- 2: Nice-to-have efficiency improvement
- 1: Limited business impact

**Effort Score (1-5)**:
- 5: Complex data requirements, 4+ hours to build, technical integration needed
- 4: Moderate complexity, 3-4 hours, some data preparation
- 3: Standard build, 2-3 hours, typical data requirements
- 2: Simple implementation, 1-2 hours, basic data
- 1: Very quick build, <1 hour, minimal data

---

## Existing Tools (Production Ready)

### 1. Whitespace Visualizer
**Problem Solved**: Identifying expansion opportunities in existing accounts
**Pain Point Indicators**:
- Multiple product lines
- Land-and-expand sales model
- Cross-sell/upsell initiatives
- Account tiering programs
- "Expand" or "grow" in job descriptions

**Best For**:
- Multi-product SaaS companies
- Companies with tiered pricing
- Businesses focused on NRR (Net Revenue Retention)

**Data Requirements**:
- Account list with current ARR
- Product catalog
- Current product adoption per account

**Difficulty**: 3/5
**Build Time**: 2-3 hours
**Key Value Prop**: "See exactly which products each account doesn't have yet and the revenue potential"

#### Strategic Dimensions
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Impact** | 5/5 | Directly surfaces expansion revenue opportunities |
| **Effort** | 3/5 | Standard build, requires account/product data |
| **Matrix Quadrant** | **EASY WIN** | High impact, moderate effort |

**Executive Interest Pattern**:
| Role | Interest | Why |
|------|----------|-----|
| VP Sales / CRO | High | Directly drives expansion ARR |
| VP Customer Success | Medium | Supports strategic account planning |
| VP Revenue Operations | Medium | Provides pipeline visibility |
| CFO | Low | Operational tool, not financial reporting |

**Recommended Sponsors**: VP Sales, CRO, VP Account Management

---

### 2. Account Health Dashboard
**Problem Solved**: Proactive churn prevention and customer health monitoring
**Pain Point Indicators**:
- Customer success team hiring
- Mentions of churn or retention challenges
- NPS or CSAT programs
- Health score discussions
- "Proactive" customer success mentioned

**Best For**:
- Subscription SaaS businesses
- High-touch customer success models
- Companies with dedicated CSMs

**Data Requirements**:
- Account usage/engagement data
- Support ticket history
- NPS/CSAT scores
- Contract dates

**Difficulty**: 3/5
**Build Time**: 3-4 hours
**Key Value Prop**: "Know which accounts need attention before they churn"

#### Strategic Dimensions
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Impact** | 5/5 | Prevents churn, protects existing revenue |
| **Effort** | 4/5 | Requires multiple data sources, health scoring logic |
| **Matrix Quadrant** | **MAJOR INITIATIVE** | High impact, higher complexity |

**Executive Interest Pattern**:
| Role | Interest | Why |
|------|----------|-----|
| VP Customer Success | High | Core CS function, owns retention |
| VP Sales / CRO | High | Protects revenue, reduces churn |
| CEO | Medium | Strategic initiative visibility |
| CFO | Medium | Revenue protection metrics |

**Recommended Sponsors**: VP Customer Success, CRO

---

## Buildable Tools (POC Candidates)

### 3. Renewal Tracker
**Problem Solved**: Pipeline visibility for upcoming renewals
**Pain Point Indicators**:
- Renewal manager roles
- Annual or multi-year contracts
- "Renewal pipeline" mentioned
- Contract management needs
- Revenue predictability focus

**Best For**:
- Annual contract businesses
- Companies with renewal teams
- Businesses with complex contract terms

**Data Requirements**:
- Contract start/end dates
- Account contact info
- Historical renewal data

**Difficulty**: 2/5
**Build Time**: 1-2 hours
**Key Value Prop**: "Never miss a renewal with a clear 90/60/30 day pipeline view"

#### Strategic Dimensions
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Impact** | 4/5 | Protects revenue, improves predictability |
| **Effort** | 2/5 | Simple build, basic date-driven logic |
| **Matrix Quadrant** | **EASY WIN** | High impact, low effort |

**Executive Interest Pattern**:
| Role | Interest | Why |
|------|----------|-----|
| VP Customer Success | High | Owns renewal process |
| VP Sales / CRO | High | Revenue predictability |
| VP Revenue Operations | High | Pipeline management |
| CFO | Medium | Revenue forecasting |

**Recommended Sponsors**: VP Customer Success, VP Revenue Operations

---

### 4. Churn Predictor
**Problem Solved**: Early warning system for at-risk accounts
**Pain Point Indicators**:
- Customer success hiring surge
- Churn mentioned in company reviews
- Retention initiatives
- ML/AI interest for predictions
- "At-risk" account processes

**Best For**:
- High-volume SaaS
- Companies with churn problems
- Businesses with usage data available

**Data Requirements**:
- Historical churn data
- Usage metrics
- Engagement signals
- Support data

**Difficulty**: 4/5
**Build Time**: 4-5 hours
**Key Value Prop**: "Predict which accounts will churn 90 days before it happens"

#### Strategic Dimensions
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Impact** | 5/5 | Directly prevents revenue loss |
| **Effort** | 5/5 | Complex scoring, multiple data sources, ML concepts |
| **Matrix Quadrant** | **MAJOR INITIATIVE** | High impact, high complexity |

**Executive Interest Pattern**:
| Role | Interest | Why |
|------|----------|-----|
| VP Customer Success | High | Core retention function |
| CEO | High | Strategic revenue protection |
| CFO | High | Revenue impact visibility |
| VP Sales / CRO | Medium | Supports retention goals |

**Recommended Sponsors**: CEO, VP Customer Success (for strategic deals)

---

### 5. QBR Builder
**Problem Solved**: Automated quarterly business review generation
**Pain Point Indicators**:
- Enterprise customers
- Strategic account managers
- QBR or business review mentions
- Executive engagement programs
- White-glove service model

**Best For**:
- Enterprise SaaS
- High-touch strategic accounts
- Companies with dedicated executive sponsors

**Data Requirements**:
- Usage metrics
- ROI/value delivered
- Goals and outcomes
- Upcoming initiatives

**Difficulty**: 3/5
**Build Time**: 3-4 hours
**Key Value Prop**: "Generate beautiful QBR decks in minutes, not hours"

#### Strategic Dimensions
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Impact** | 3/5 | Efficiency improvement, not direct revenue driver |
| **Effort** | 4/5 | Requires template design, data aggregation |
| **Matrix Quadrant** | **CONSIDER CAREFULLY** | Moderate impact, higher effort |

**Executive Interest Pattern**:
| Role | Interest | Why |
|------|----------|-----|
| VP Customer Success | High | Owns QBR process |
| Strategic Account Managers | High | Daily workflow impact |
| VP Sales | Low | Not directly sales-focused |
| CEO | Low | Too operational |

**Recommended Sponsors**: VP Customer Success, Head of Strategic Accounts

---

### 6. ROI Calculator
**Problem Solved**: Value demonstration for renewals and upsells
**Pain Point Indicators**:
- Value engineering roles
- ROI in marketing materials
- TCO discussions
- Business case requirements
- Procurement processes

**Best For**:
- ROI-driven sales
- Value-based pricing
- Complex enterprise deals

**Data Requirements**:
- Baseline metrics
- Value delivered metrics
- Industry benchmarks

**Difficulty**: 2/5
**Build Time**: 1-2 hours
**Key Value Prop**: "Show customers exactly how much value they're getting"

#### Strategic Dimensions
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Impact** | 3/5 | Supports renewals, not direct revenue driver |
| **Effort** | 2/5 | Simple calculations, minimal data needs |
| **Matrix Quadrant** | **FILL-IN** | Moderate impact, low effort |

**Executive Interest Pattern**:
| Role | Interest | Why |
|------|----------|-----|
| VP Customer Success | Medium | Supports retention conversations |
| VP Sales | Medium | Useful for upsell justification |
| Value Engineering | High | Core function |
| CFO | Low | Customer-facing, not internal |

**Recommended Sponsors**: VP Customer Success, Value Engineering Lead

---

### 7. Stakeholder Map
**Problem Solved**: Account relationship visualization
**Pain Point Indicators**:
- Complex enterprise deals
- Multi-threaded relationships
- Multiple stakeholders mentioned
- Org chart requirements
- Champion/detractor tracking

**Best For**:
- Large enterprise deals
- Long sales cycles
- Companies with buying committees

**Data Requirements**:
- Contact information
- Role/influence data
- Relationship history

**Difficulty**: 3/5
**Build Time**: 2-3 hours
**Key Value Prop**: "Visualize every relationship in your strategic accounts"

#### Strategic Dimensions
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Impact** | 4/5 | Improves deal win rates, strategic account management |
| **Effort** | 3/5 | Moderate complexity, visual design required |
| **Matrix Quadrant** | **EASY WIN** | High impact, moderate effort |

**Executive Interest Pattern**:
| Role | Interest | Why |
|------|----------|-----|
| VP Sales / CRO | High | Improves enterprise deal execution |
| Strategic Account Managers | High | Core workflow tool |
| VP Customer Success | Medium | Supports account planning |
| CEO | Low | Too tactical |

**Recommended Sponsors**: VP Sales, Head of Enterprise Sales

---

### 8. Work-back Planner
**Problem Solved**: Reverse goal planning for revenue targets
**Pain Point Indicators**:
- Quota management
- Territory planning
- Revenue targets
- Sales ops focus
- Goal-driven sales culture

**Best For**:
- Goal-driven sales orgs
- Companies with revenue targets
- Businesses with territory models

**Data Requirements**:
- Revenue targets
- Current pipeline
- Historical conversion rates

**Difficulty**: 2/5
**Build Time**: 1-2 hours
**Key Value Prop**: "Work backwards from your target to know exactly what activities you need"

#### Strategic Dimensions
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Impact** | 3/5 | Planning efficiency, not direct revenue |
| **Effort** | 2/5 | Simple reverse calculations |
| **Matrix Quadrant** | **FILL-IN** | Moderate impact, low effort |

**Executive Interest Pattern**:
| Role | Interest | Why |
|------|----------|-----|
| VP Sales | Medium | Territory planning support |
| VP Revenue Operations | High | Core planning function |
| Sales Managers | High | Direct workflow impact |
| CEO | Low | Too tactical |

**Recommended Sponsors**: VP Revenue Operations, VP Sales

---

### 9. Contract Intelligence Dashboard
**Problem Solved**: Contract term tracking, auto-renewal management
**Pain Point Indicators**:
- Legal ops roles
- Contract management mentions
- Auto-renewal concerns
- Complex terms and conditions
- Multi-year agreements

**Best For**:
- Legal-heavy industries
- Complex contracts
- Multi-year deals

**Data Requirements**:
- Contract terms
- Key dates
- Renewal clauses

**Difficulty**: 3/5
**Build Time**: 2-3 hours
**Key Value Prop**: "Never be surprised by contract terms again"

#### Strategic Dimensions
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Impact** | 3/5 | Risk mitigation, not revenue driver |
| **Effort** | 4/5 | Complex contract parsing, legal nuance |
| **Matrix Quadrant** | **CONSIDER CAREFULLY** | Moderate impact, higher effort |

**Executive Interest Pattern**:
| Role | Interest | Why |
|------|----------|-----|
| VP Legal / General Counsel | High | Core legal ops function |
| VP Customer Success | Medium | Renewal awareness |
| CFO | Medium | Financial risk visibility |
| VP Sales | Low | Not sales-focused |

**Recommended Sponsors**: VP Legal, VP Customer Success

---

### 10. NPS Action Tracker
**Problem Solved**: Closing the loop on customer feedback
**Pain Point Indicators**:
- NPS programs mentioned
- Customer feedback initiatives
- Voice of customer programs
- Feedback loop processes
- Survey tools in tech stack

**Best For**:
- Companies running NPS programs
- Feedback-driven organizations
- Customer-centric cultures

**Data Requirements**:
- NPS survey responses
- Follow-up actions
- Resolution tracking

**Difficulty**: 2/5
**Build Time**: 1-2 hours
**Key Value Prop**: "Turn every piece of feedback into action"

---

## POC Selection Guidelines

### Scoring Matrix

| Factor | Weight | How to Assess |
|--------|--------|---------------|
| Pain Point Evidence | 40% | Direct mentions in job posts, news, reviews |
| Industry Fit | 20% | Standard practice in their industry |
| Company Size Fit | 20% | Appropriate for their scale |
| Quick Win Potential | 20% | Can demo value in under 30 minutes |

### Recommended POC Combinations

**For SaaS Companies (< 500 employees)**:
1. Whitespace Visualizer
2. Account Health Dashboard
3. Renewal Tracker
4. ROI Calculator
5. Churn Predictor

**For Enterprise SaaS (500+ employees)**:
1. Account Health Dashboard
2. QBR Builder
3. Stakeholder Map
4. Churn Predictor
5. Contract Intelligence

**For Services Companies**:
1. Stakeholder Map
2. QBR Builder
3. Renewal Tracker
4. ROI Calculator
5. Work-back Planner

**For High-Growth Startups**:
1. Whitespace Visualizer
2. Churn Predictor
3. Work-back Planner
4. Account Health Dashboard
5. Renewal Tracker
