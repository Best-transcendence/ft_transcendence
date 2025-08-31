# 📋 Task Templates for ft_transcendence

This directory contains task templates to help standardize task creation and tracking across the team.

## 🎯 Feature Development Template

### Feature: [Feature Name]
**Owner**: `[Team Member]`  
**Epic**: `[Week X - Epic Name]`  
**Priority**: `[HIGH/MEDIUM/LOW]`  
**Estimated Time**: `[X hours/days]`

#### Description
Brief description of what this feature accomplishes and why it's needed.

#### Acceptance Criteria
- [ ] Criterion 1: Specific measurable outcome
- [ ] Criterion 2: Another measurable outcome  
- [ ] Criterion 3: Edge case or error handling
- [ ] Criterion 4: Integration/testing requirement

#### Technical Tasks
- [ ] **Setup**: Initial scaffolding/configuration
- [ ] **Core Logic**: Main feature implementation
- [ ] **UI/UX**: User interface components (if applicable)
- [ ] **Integration**: Connect with other services/components
- [ ] **Testing**: Unit tests and integration tests
- [ ] **Documentation**: Code comments and API docs

#### Dependencies
- **Depends on**: `[Other tasks that must be completed first]`
- **Blocks**: `[Tasks that are waiting for this one]`
- **Team coordination needed with**: `[Other team members]`

#### Definition of Done
- [ ] Code is written and follows project standards
- [ ] Code is reviewed and approved by at least one team member
- [ ] All tests pass (unit, integration, e2e as applicable)
- [ ] Feature is integrated and tested in docker environment
- [ ] Documentation is updated
- [ ] Feature is deployed and verified in development environment

---

## 🐛 Bug Fix Template  

### Bug: [Bug Title]
**Reporter**: `[Team Member]`  
**Assignee**: `[Team Member]`  
**Priority**: `[CRITICAL/HIGH/MEDIUM/LOW]`
**Severity**: `[BLOCKER/MAJOR/MINOR]`

#### Bug Description
Clear description of what is wrong and the expected vs actual behavior.

#### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3
4. **Expected**: What should happen
5. **Actual**: What actually happens

#### Environment
- **Browser**: `[Firefox/Chrome/Safari/etc]`
- **OS**: `[Ubuntu/macOS/Windows]`
- **Docker**: `[Yes/No]`
- **Branch**: `[branch-name]`

#### Root Cause Analysis
- **Investigation findings**: What caused the bug
- **Affected components**: Which parts of the system are impacted

#### Solution Tasks
- [ ] **Identify**: Confirm bug reproduction and root cause
- [ ] **Fix**: Implement the solution
- [ ] **Test**: Verify fix works and doesn't break other features
- [ ] **Regression Test**: Ensure similar bugs don't exist elsewhere
- [ ] **Documentation**: Update any relevant docs

#### Verification Steps
- [ ] Original reproduction steps now work correctly
- [ ] No regression in related functionality
- [ ] Edge cases are handled properly

---

## 🏗️ Infrastructure/DevOps Template

### Infrastructure Task: [Task Name]
**Owner**: `[Team Member]`
**Environment**: `[Development/Staging/Production]`
**Priority**: `[HIGH/MEDIUM/LOW]`

#### Objective
What infrastructure capability or improvement is being implemented.

#### Technical Requirements
- **Services affected**: `[frontend/backend/database/proxy/etc]`
- **Configuration changes**: What configs need to be modified
- **Dependencies**: External services or tools required
- **Security considerations**: Any security implications

#### Implementation Tasks
- [ ] **Research**: Investigate best practices and options
- [ ] **Design**: Create configuration/architecture plan
- [ ] **Implementation**: Make the actual changes
- [ ] **Testing**: Verify in development environment
- [ ] **Documentation**: Update deployment guides and runbooks

#### Rollback Plan
- **Rollback steps**: How to undo changes if needed
- **Monitoring**: What to watch for potential issues
- **Recovery time**: Expected time to rollback if needed

#### Success Metrics
- [ ] Infrastructure change works as intended
- [ ] No performance degradation
- [ ] All services remain healthy
- [ ] Team can continue development without issues

---

## 🧪 Research/Investigation Template

### Research: [Research Topic]
**Lead**: `[Team Member]`
**Supporting**: `[Other team members if applicable]`
**Timeline**: `[X days/weeks]`
**Decision Deadline**: `[Date when decision must be made]`

#### Research Question
What specific question or problem are we investigating?

#### Context
Why is this research needed? What decision will it inform?

#### Research Tasks
- [ ] **Literature Review**: Research existing solutions and best practices
- [ ] **Technical Evaluation**: Test/prototype key options
- [ ] **Risk Assessment**: Identify potential risks and mitigations
- [ ] **Cost-Benefit Analysis**: Time investment vs. benefit
- [ ] **Team Input**: Gather input from relevant team members

#### Options Considered
1. **Option 1**: Brief description, pros/cons
2. **Option 2**: Brief description, pros/cons  
3. **Option 3**: Brief description, pros/cons

#### Recommendation
**Chosen Option**: `[Final recommendation]`
**Reasoning**: Why this option was selected
**Implementation Plan**: High-level steps to implement
**Risks**: Known risks and mitigation strategies

#### Follow-up Tasks
- [ ] Create implementation tasks based on recommendation
- [ ] Share findings with team
- [ ] Update project documentation with decision rationale

---

## 📊 Week Planning Template

### Week [X] Planning: [Week Theme]
**Week Dates**: `[Start Date] - [End Date]`
**Team Members**: `[All active team members]`
**Primary Goal**: `[Main objective for the week]`

#### Week Objectives
1. **Primary Goal**: Most important outcome
2. **Secondary Goals**: Additional objectives
3. **Stretch Goals**: Nice-to-have if time permits

#### Task Distribution
- **[Team Member 1]**:
  - [ ] Task 1 (X hours)
  - [ ] Task 2 (Y hours)
- **[Team Member 2]**:
  - [ ] Task 3 (Z hours)
  - [ ] Task 4 (W hours)

#### Dependencies & Coordination
- **Cross-team dependencies**: What requires coordination
- **Shared resources**: Services or components multiple people need
- **Integration points**: When different work streams need to merge

#### Risk Assessment  
- **High Risk Items**: Tasks with significant uncertainty
- **Mitigation Plans**: How to handle if high-risk items become issues
- **Contingency**: What to cut if week goes over schedule

#### Success Metrics
- [ ] All primary goals completed
- [ ] No major blockers for next week
- [ ] Team coordination was effective
- [ ] Code quality maintained

#### End of Week Review Questions
- What went better than expected?
- What took longer than expected?
- What should we do differently next week?
- What help does the team need?

---

*Use these templates by copying the relevant template and filling in the details for your specific task or situation.*