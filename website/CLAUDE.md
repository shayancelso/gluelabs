# CLAUDE.md - Glue Platform Development Guide

This file provides comprehensive guidance to Claude Code when working with the Glue platform codebase, enabling intelligent conversations about optimization and feature development.

## Project Vision & Mission

**Glue** is a B2B SaaS consulting company that builds custom business intelligence tools for account management and sales teams. Our mission is to help companies identify millions in hidden ARR within their existing accounts through data-driven insights and actionable recommendations.

### Core Value Proposition
- **Whitespace Analysis**: Identify expansion opportunities in existing accounts
- **Account Health Monitoring**: Proactive churn prevention and health scoring
- **Revenue Optimization**: Data-driven strategies for account growth
- **Sales Intelligence**: Tools that turn data into actionable insights

## Architecture Overview

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), CSS3 with CSS Variables
- **Design System**: Glassmorphism UI with backdrop-filter effects
- **Architecture**: Component-based, no frameworks
- **Deployment**: Static site on Vercel with automatic CI/CD
- **Development**: No build process - direct browser execution

### Project Structure
```
/
├── index.html                 # Landing page
├── styles.css                 # Global styles & CSS variables
├── script.js                  # Global navigation & utilities
├── CLAUDE.md                  # This file - AI context
├── README.md                  # Developer documentation
├── tools/                     # Tool ecosystem
│   ├── tools.css              # Shared tool styles
│   ├── index.html             # Tools overview
│   ├── whitespace-visualizer/ # Revenue expansion analysis (COMPLETE)
│   ├── account-health/        # Customer health monitoring (IN PROGRESS)
│   ├── churn-predictor/       # Churn risk analysis (PLANNED)
│   ├── qbr-builder/          # Quarterly business review automation (PLANNED)
│   ├── renewal-tracker/       # Renewal pipeline management (PLANNED)
│   ├── roi-calculator/        # ROI analysis tool (PLANNED)
│   ├── stakeholder-map/       # Account relationship mapping (PLANNED)
│   └── work-back-planner/     # Revenue goal planning (PLANNED)
```

### Key Design Patterns
1. **Self-Contained Tools**: Each tool is independent with its own styles/logic
2. **Shared CSS Variables**: Consistent theming via `:root` definitions
3. **Progressive Enhancement**: Core functionality works without JS
4. **Mobile-First Responsive**: Breakpoints at 480px, 768px, 1024px
5. **Glassmorphism UI**: Consistent visual language across all tools

## Business Context & Domain Knowledge

### Target Market
- **Primary**: B2B SaaS companies with existing customer bases
- **Secondary**: Professional services firms with recurring clients
- **User Types**: Account managers, sales leaders, customer success teams

### Key Business Metrics
- **ARR Growth**: Annual Recurring Revenue expansion
- **Net Revenue Retention**: Measure of account growth vs churn
- **Account Health Scores**: Predictive metrics for churn risk
- **Whitespace Value**: Untapped revenue potential in accounts

### Competitive Landscape
- **Gainsight**: Complex, expensive ($48K/year + 6-month implementation)
- **ChurnZero**: Limited analytics capabilities
- **ProfitWell**: Focused primarily on subscription metrics
- **Our Advantage**: Simple, affordable, immediate value tools

## Current Tool Ecosystem Status

### 1. Whitespace Visualizer (PRODUCTION READY)
**Purpose**: Identify revenue expansion opportunities in existing accounts
**Status**: Fully functional with advanced features
**Key Features**:
- CSV data import and processing
- Account-Product opportunity matrix
- Revenue projection algorithms
- Expansion playbook generation
- Interactive dashboard with drill-down capabilities

**Technical Implementation**:
- `WhitespaceApp` class manages application state
- `WhitespaceEngine` handles business logic and calculations
- Frozen column matrix design for data visualization
- Mobile-optimized responsive design

### 2. Account Health Dashboard (IN DEVELOPMENT)
**Purpose**: Real-time customer health monitoring and churn prevention
**Status**: UI complete, backend integration needed
**Key Features**:
- Health score algorithms
- Smart alerts and warnings
- Trend analysis and predictions
- Integration with CRM systems

### 3. Remaining Tools (PLANNED)
All following tools are conceptualized with defined purposes:
- **Churn Predictor**: ML-based churn risk scoring
- **QBR Builder**: Automated quarterly business review generation
- **Renewal Tracker**: Pipeline management for renewals
- **ROI Calculator**: Value demonstration tools
- **Stakeholder Map**: Account relationship visualization
- **Work-back Planner**: Reverse goal planning for revenue targets

## Development Principles & Optimization Targets

### Code Quality Standards
1. **Simplicity First**: Avoid unnecessary complexity
2. **Performance**: Prioritize fast loading and responsive interactions
3. **Accessibility**: WCAG 2.1 AA compliance where possible
4. **Mobile Experience**: Touch-friendly interfaces
5. **Data Security**: No sensitive data stored client-side

### Optimization Focus Areas
1. **Loading Performance**: Minimize initial bundle size
2. **User Experience**: Reduce friction in data upload/analysis
3. **Visual Consistency**: Maintain design system across tools
4. **Cross-Tool Integration**: Enable data sharing between tools
5. **Conversion Optimization**: Improve trial-to-paid conversion

### Technical Debt & Known Issues
- Navigation scroll behavior requires manual script inclusion on tool pages
- CSS specificity issues due to multiple file loading
- Matrix table implementation could benefit from virtualization for large datasets
- Mobile touch interactions need enhancement for better UX

## AI Assistant Guidelines

### Conversation Context
When discussing optimizations or new features, always consider:
1. **Business Impact**: How does this affect customer value or business metrics?
2. **User Workflow**: Does this fit naturally into account manager daily tasks?
3. **Technical Consistency**: Does this follow established patterns?
4. **Implementation Effort**: What's the complexity vs. value ratio?
5. **Cross-Tool Impact**: How does this affect the broader ecosystem?

### Optimization Methodology
1. **Analyze Current State**: Understand existing implementation
2. **Identify Bottlenecks**: Performance, UX, or technical issues
3. **Propose Solutions**: Multiple options with tradeoffs
4. **Consider Patterns**: Ensure consistency across tools
5. **Plan Implementation**: Break down into manageable steps

### Feature Development Approach
1. **Business Validation**: Confirm user need and market demand
2. **Technical Design**: Architecture that fits existing patterns
3. **MVP Definition**: Minimum viable implementation
4. **Integration Planning**: How it connects to other tools
5. **Success Metrics**: Define measurable outcomes

## Memory & Context Management

This CLAUDE.md file serves as persistent context for conversations about:
- **Architectural Decisions**: Why certain patterns were chosen
- **Feature Roadmap**: Priority and status of upcoming tools
- **Optimization History**: What's been tried and learned
- **Business Context**: Market position and competitive advantages

For ongoing conversations, reference:
- Previous optimization discussions and outcomes
- Feature development decisions and rationale
- Technical debt items and their business impact
- User feedback and its influence on product direction

---

*This file should be updated as the platform evolves to maintain accurate context for AI-assisted development.*