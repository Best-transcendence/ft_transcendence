# 🤝 Team Coordination Quick Reference

## 📅 Daily Standup Format (5 min max)

### Template for each team member:

**[Your Name] - [Date]**

**✅ Completed yesterday:**
- [Task 1] - Brief description
- [Task 2] - Brief description

**🎯 Working on today:**  
- [Current task] - Expected completion: [time/date]
- [Secondary task] - If time permits

**🚧 Blockers/Help needed:**
- [Blocker 1] - Waiting on: [dependency/person]
- [Help needed] - Need assistance with: [specific area]

**📊 Status update:**
- Overall progress: [On track/Behind/Ahead]
- Confidence level: [High/Medium/Low]

---

## 🔄 Weekly Sprint Review

### End of Week Summary (Fridays)

**Week [X] - [Start Date] to [End Date]**

**🎯 Week Goals:**
- [ ] Primary goal 1
- [ ] Primary goal 2  
- [ ] Primary goal 3

**✅ Completed:**
- [x] Task 1 - Who: [Name] - Time: [X hours]
- [x] Task 2 - Who: [Name] - Time: [Y hours]

**🔄 In Progress (carried over):**
- [ ] Task 3 - Who: [Name] - Status: [% complete]
- [ ] Task 4 - Who: [Name] - Expected: [next week]

**❌ Not Started/Deferred:**
- [ ] Task 5 - Reason: [dependency/deprioritized]
- [ ] Task 6 - Moved to: [Week X+1]

**📈 Wins:**
- [Success 1] - What went well
- [Success 2] - Positive outcome

**📉 Challenges:**
- [Challenge 1] - What was difficult and why
- [Challenge 2] - How we addressed it

**🔮 Next Week Focus:**
- Priority 1: [Most important for next week]
- Priority 2: [Secondary focus]
- Team coordination needed: [Cross-team dependencies]

---

## 🚨 Escalation Process

### When to escalate issues:

**🔴 Immediate escalation (same day):**
- Blocker affecting multiple team members
- Security vulnerability discovered
- Infrastructure completely down
- Evaluation requirement at risk

**🟡 Next standup escalation:**
- Task taking 50% longer than estimated
- Need help from team member with different expertise
- Unclear requirements or acceptance criteria
- External dependency causing delay

**🟢 Weekly review escalation:**
- Task scope seems larger than originally planned
- Quality concerns with current approach
- Process improvement suggestions

### How to escalate:
1. **Document the issue clearly** in task comments
2. **Tag relevant team members** in task or PR
3. **Propose solutions** if possible, not just problems
4. **Estimate impact** on timeline and other tasks

---

## 📋 Task Management Shortcuts

### Quick status updates:
```bash
# Update your section in TASKS.md
vim TASKS.md
# Find your name, update checkboxes and status

# Commit and push
git add TASKS.md  
git commit -m "Task update - [YourInitials] - [Date]"
git push
```

### Creating new tasks:
```bash
# Copy template
cp docs/task-templates.md /tmp/new-task.md
# Fill in your specific task details
# Add to TASKS.md under appropriate week/section
```

### Task status symbols:
- 🔴 Not Started
- 🟡 In Progress  
- 🟢 Completed
- ⏸️ Blocked/Waiting
- ❌ Cancelled/Won't Do

---

## 🎯 Focus Time Guidelines

### Deep work blocks:
- **Morning (9am-12pm)**: Complex development tasks
- **Afternoon (2pm-5pm)**: Integration and testing
- **End of day (5pm-6pm)**: Documentation and planning

### Communication windows:
- **Daily standup**: 10am (15 min max)
- **Quick questions**: Slack/Discord throughout day
- **Code reviews**: Check PRs twice daily (morning/afternoon)
- **Weekly planning**: Friday 4pm (45 min max)

### Minimize interruptions:
- Use "Do Not Disturb" status during focus blocks
- Batch non-urgent communications
- Document decisions in tasks/PRs for future reference

---

## 🛠️ Development Environment Reminders

### Before starting work:
```bash
git pull origin main              # Get latest changes
docker-compose up --build         # Start services
docker-compose logs -f            # Check for errors
```

### Before committing:
```bash
# Run any existing lints/tests
docker-compose exec backend npm run lint
docker-compose exec frontend npm run lint

# Test the full stack
docker-compose up --build
# Verify in browser: https://localhost
```

### Before creating PR:
- [ ] All acceptance criteria met
- [ ] Code follows project conventions  
- [ ] No console errors in browser
- [ ] Task status updated to "Ready for Review"
- [ ] PR description references task/issue

---

*Keep this file handy for daily reference during development sprints!*