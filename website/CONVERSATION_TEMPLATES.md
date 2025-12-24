# AI Assistant Conversation Templates & Workflows

This document provides structured templates and workflows for productive conversations with Claude Code about optimization, new features, and platform development for the Glue project.

## How to Use This Document

Each template includes:
- **Context Setup**: Information to provide the AI assistant
- **Question Frameworks**: Structured ways to ask for help
- **Expected Outcomes**: What you should get from the conversation
- **Follow-up Actions**: Next steps after the conversation

## Template Categories

### 1. New Feature Development

#### Initial Feature Exploration
```
Context Setup:
"I'm thinking about adding [FEATURE NAME] to the Glue platform. Here's what I have in mind:
- Target user persona: [CSM/VP/RevOps]
- Problem it solves: [specific pain point]
- Success criteria: [measurable outcomes]

Please review our existing USER_PERSONAS.md and PRODUCT_ROADMAP.md to understand the context."

Key Questions:
1. "How does this align with our current roadmap priorities?"
2. "Which user persona would benefit most from this feature?"
3. "What's the estimated complexity based on our DEVELOPMENT_PATTERNS.md?"
4. "Are there existing tools or patterns we can leverage?"
5. "What performance considerations should we plan for?"

Expected Outcome:
- Feature feasibility assessment
- Implementation approach recommendations
- Resource and timeline estimates
- Risk identification and mitigation strategies
```

#### Feature Implementation Planning
```
Context Setup:
"I want to implement [FEATURE NAME]. Based on our previous discussion, here are the requirements:
[List specific requirements and acceptance criteria]

Please reference our BUSINESS_CONTEXT.md for domain knowledge and DEVELOPMENT_PATTERNS.md for technical approach."

Planning Questions:
1. "Break this down into specific implementation tasks"
2. "What architectural patterns from DEVELOPMENT_PATTERNS.md should I follow?"
3. "How can I ensure this integrates well with existing tools?"
4. "What testing approach should I take?"
5. "Are there performance optimizations I should consider upfront?"

Expected Outcome:
- Detailed task breakdown
- Technical implementation plan
- Code structure recommendations
- Testing strategy
- Performance considerations
```

### 2. Performance Optimization

#### Performance Issue Investigation
```
Context Setup:
"I'm experiencing [SPECIFIC PERFORMANCE ISSUE] in [TOOL/COMPONENT]. Here are the symptoms:
- What happens: [detailed description]
- When it happens: [frequency, conditions]
- Impact: [user experience, metrics]

Please review OPTIMIZATION_TARGETS.md to understand our performance goals."

Investigation Questions:
1. "What are the most likely root causes based on our architecture?"
2. "How can I measure and profile this specific issue?"
3. "What optimization patterns from DEVELOPMENT_PATTERNS.md apply here?"
4. "Are there quick wins vs. longer-term solutions?"
5. "How does this relate to our targets in OPTIMIZATION_TARGETS.md?"

Expected Outcome:
- Root cause analysis
- Profiling and measurement strategy
- Prioritized optimization recommendations
- Implementation guidance
- Success criteria definition
```

#### Proactive Performance Optimization
```
Context Setup:
"I want to optimize [SPECIFIC COMPONENT/TOOL] before we hit performance issues. Current metrics:
- Load time: [current measurement]
- User feedback: [qualitative data]
- Usage patterns: [how users interact with it]

Reference our OPTIMIZATION_TARGETS.md for performance goals."

Optimization Questions:
1. "What optimization opportunities do you see based on our current code?"
2. "Which optimizations would have the highest impact for our users?"
3. "How can I implement these changes incrementally?"
4. "What metrics should I track to measure improvement?"
5. "Are there any optimization patterns I'm missing?"

Expected Outcome:
- Optimization strategy prioritization
- Implementation approach
- Measurement and monitoring plan
- Resource requirements assessment
- Timeline recommendations
```

### 3. User Experience Improvement

#### UX Issue Analysis
```
Context Setup:
"Users are struggling with [SPECIFIC UX ISSUE] in [TOOL/WORKFLOW]. Here's what I've observed:
- User feedback: [direct quotes or summary]
- Behavior data: [analytics, patterns]
- Impact: [how it affects their workflow]

Please consider our USER_PERSONAS.md when analyzing this issue."

UX Analysis Questions:
1. "Which user persona is most affected by this issue?"
2. "How does this impact their daily workflow from USER_PERSONAS.md?"
3. "What are alternative approaches that would better serve their needs?"
4. "Are there industry best practices we should consider?"
5. "How can we validate improvements before full implementation?"

Expected Outcome:
- User impact assessment
- Alternative design approaches
- Validation and testing strategy
- Implementation recommendations
- Success metrics definition
```

#### Workflow Optimization
```
Context Setup:
"I want to improve the [SPECIFIC WORKFLOW] for [USER PERSONA]. Current process:
1. [Step 1 - with time/friction]
2. [Step 2 - with time/friction]
3. [Step 3 - with time/friction]

Please reference USER_PERSONAS.md for context on this user's needs and pain points."

Optimization Questions:
1. "Where are the biggest friction points in this workflow?"
2. "How can we reduce the number of steps or cognitive load?"
3. "What automation opportunities exist based on DEVELOPMENT_PATTERNS.md?"
4. "Are there integration opportunities with their existing tools?"
5. "How would this improvement impact their KPIs from USER_PERSONAS.md?"

Expected Outcome:
- Workflow friction analysis
- Streamlining recommendations
- Automation opportunities
- Integration possibilities
- Impact assessment on user success metrics
```

### 4. Strategic Planning

#### Roadmap Planning Session
```
Context Setup:
"I'm planning the next quarter's development priorities. Current considerations:
- Available development time: [hours/sprints]
- User feedback themes: [common requests]
- Business priorities: [revenue/retention goals]
- Technical debt: [known issues]

Please review PRODUCT_ROADMAP.md and BUSINESS_CONTEXT.md for strategic context."

Planning Questions:
1. "How should I prioritize features based on business impact?"
2. "What's the optimal balance of new features vs. optimization work?"
3. "Are there dependencies between roadmap items I should consider?"
4. "How do these priorities align with our target user personas?"
5. "What risks should I plan for in this timeline?"

Expected Outcome:
- Prioritized feature list
- Timeline and resource allocation
- Risk assessment and mitigation
- Success metrics definition
- Milestone planning
```

#### Competitive Analysis and Positioning
```
Context Setup:
"I'm analyzing how [COMPETITOR/FEATURE] compares to our approach. Here's what I've found:
- Their approach: [description of competitor feature]
- Our current approach: [description of our solution]
- Market feedback: [user/prospect feedback]

Reference BUSINESS_CONTEXT.md for market positioning context."

Analysis Questions:
1. "What are the strategic implications of this competitive development?"
2. "Should we match their approach or differentiate differently?"
3. "How does this affect our positioning in BUSINESS_CONTEXT.md?"
4. "What would our target personas prefer based on USER_PERSONAS.md?"
5. "What's the implementation effort vs. business impact?"

Expected Outcome:
- Competitive assessment
- Strategic recommendations
- Implementation options
- Resource requirements
- Positioning strategy
```

### 5. Technical Architecture

#### Architecture Decision Making
```
Context Setup:
"I need to make an architectural decision about [SPECIFIC TECHNICAL CHOICE]. The options are:
1. [Option A - with pros/cons]
2. [Option B - with pros/cons]
3. [Option C - with pros/cons]

Please consider our patterns in DEVELOPMENT_PATTERNS.md and constraints in OPTIMIZATION_TARGETS.md."

Decision Questions:
1. "Which option best aligns with our development patterns?"
2. "How do these choices impact our performance targets?"
3. "What are the long-term maintenance implications?"
4. "How would each option affect scalability?"
5. "Are there hybrid approaches that combine benefits?"

Expected Outcome:
- Detailed pros/cons analysis
- Recommendation with rationale
- Implementation guidance
- Risk assessment
- Migration strategy if needed
```

#### Code Review and Refactoring
```
Context Setup:
"I've implemented [FEATURE/COMPONENT] and want feedback on the approach. Here's what I built:
[Code description or link to specific files]

Please review against our DEVELOPMENT_PATTERNS.md standards."

Review Questions:
1. "How well does this follow our established patterns?"
2. "Are there performance optimizations I should consider?"
3. "What edge cases or error scenarios might I have missed?"
4. "How can I make this more maintainable or scalable?"
5. "Are there testing gaps I should address?"

Expected Outcome:
- Code quality assessment
- Improvement recommendations
- Performance optimization suggestions
- Testing strategy guidance
- Maintenance considerations
```

### 6. Bug Investigation and Resolution

#### Bug Triage and Analysis
```
Context Setup:
"I've discovered a bug with these characteristics:
- Symptoms: [what users experience]
- Reproduction steps: [how to trigger it]
- Frequency: [how often it occurs]
- User impact: [severity and scope]
- Environment: [browser, device, data size]"

Investigation Questions:
1. "What are the most likely root causes based on our codebase?"
2. "How should I prioritize this relative to other work?"
3. "What debugging approach would be most effective?"
4. "Are there workarounds I can provide immediately?"
5. "How can I prevent similar issues in the future?"

Expected Outcome:
- Root cause hypothesis
- Priority and severity assessment
- Debugging strategy
- Immediate mitigation options
- Prevention recommendations
```

### 7. Success Measurement and Analytics

#### Metrics and KPI Review
```
Context Setup:
"I want to evaluate how well we're meeting our goals. Current metrics:
[List specific measurements from tools/analytics]

Please reference OPTIMIZATION_TARGETS.md for our stated goals."

Analysis Questions:
1. "How are we tracking against our targets in OPTIMIZATION_TARGETS.md?"
2. "Which metrics show the biggest gaps vs. goals?"
3. "Are there leading indicators I should focus on?"
4. "What additional data would help improve decision-making?"
5. "How can I better tie metrics to user success?"

Expected Outcome:
- Performance assessment vs. targets
- Priority areas for improvement
- Metric refinement recommendations
- Additional measurement needs
- Action plan for improvements
```

## Conversation Best Practices

### Before Starting a Conversation

1. **Review Relevant Documentation**
   - Check CLAUDE.md for project overview
   - Reference specific context documents (USER_PERSONAS.md, etc.)
   - Gather specific data/examples

2. **Define Clear Objectives**
   - What decisions need to be made?
   - What outcomes are you seeking?
   - What constraints or requirements exist?

3. **Prepare Specific Information**
   - Current metrics or measurements
   - User feedback or examples
   - Technical details or error messages

### During the Conversation

1. **Provide Context Early**
   - Reference the relevant documentation files
   - Share specific examples or data
   - Clarify scope and priorities

2. **Ask Follow-up Questions**
   - Dig deeper into recommendations
   - Understand the reasoning behind suggestions
   - Explore alternative approaches

3. **Validate Understanding**
   - Summarize key recommendations
   - Confirm implementation approaches
   - Clarify success criteria

### After the Conversation

1. **Document Decisions**
   - Update relevant documentation files
   - Create action items with timelines
   - Note any assumptions or dependencies

2. **Plan Implementation**
   - Break down recommendations into tasks
   - Schedule work appropriately
   - Identify needed resources or expertise

3. **Establish Follow-up**
   - Plan check-ins for complex implementations
   - Set measurement points for success
   - Schedule reviews of outcomes

## Example Conversation Starters

### Quick Decision Support
> "I need to decide between two approaches for [SPECIFIC ISSUE]. Here are the options... What would you recommend based on our USER_PERSONAS.md and DEVELOPMENT_PATTERNS.md?"

### Comprehensive Planning
> "I'm planning our next major feature development. Can you review our PRODUCT_ROADMAP.md and help me prioritize based on user impact and technical complexity?"

### Performance Investigation  
> "Users are reporting slow performance in [SPECIFIC AREA]. Can you help me investigate based on our OPTIMIZATION_TARGETS.md and current architecture?"

### Strategic Consultation
> "A competitor just launched [FEATURE]. How should this influence our roadmap given our positioning in BUSINESS_CONTEXT.md?"

---

*These templates ensure consistent, productive conversations that leverage the full context of the Glue platform documentation and strategic objectives.*