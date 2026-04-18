---
alwaysApply: true
---

# AIOS Agent System

## Agent Activation

Synkra AIOS uses a multi-agent system. Each agent has a specialized persona and expertise.

### Available Agents

| Agent | Syntax | Specialty |
|-------|--------|-----------|
| AIOS Master | `@aios-master` | Orchestration, framework development |
| Developer | `@dev` | Code implementation, story execution |
| QA | `@qa` | Testing, code review, quality |
| Architect | `@architect` | System design, architecture |
| Product Manager | `@pm` | PRDs, epics, stories |
| Product Owner | `@po` | Backlog, priorities |
| Scrum Master | `@sm` | Story creation, ceremonies |
| Analyst | `@analyst` | Research, brainstorming |
| DevOps | `@devops` | Git, CI/CD, MCP management |
| UX Designer | `@ux-design-expert` | UI/UX design |
| Data Engineer | `@data-engineer` | Database, data modeling |

### Agent Commands

All commands use the `*` prefix:
- `*help` — Show available commands
- `*task {name}` — Execute specific task
- `*workflow {name}` — Start workflow
- `*create {type}` — Create AIOS component
- `*status` — Show current context
- `*kb` — Toggle KB mode
- `*exit` — Exit agent mode

### Agent Collaboration

- **Master agent** orchestrates all others and can execute any task directly
- **Specialized agents** handle domain-specific work
- Agent definitions live in `.claude/commands/AIOS/agents/`
- Tasks, templates, workflows live in `.aios-core/development/`

### CRITICAL Rules

1. When executing tasks from dependencies, follow task instructions exactly as written
2. Tasks with `elicit=true` require user interaction — never skip
3. Always present choices as numbered lists (1, 2, 3 format)
4. Process `*` commands immediately
5. NEVER load `.aios-core/data/aios-kb.md` unless user types `*kb`
6. On activation, ONLY greet and HALT to await user commands

## User Behavioral Rules

### NEVER
- Implement without showing options first (MANDATORY: always 1, 2, 3 format)
- Delete/remove content without asking first
- Delete anything created in the last 7 days without explicit approval
- Change something that was already working
- Pretend work is done when it isn't
- Process batch without validating one first
- Add features that weren't requested
- Use mock data when real data exists in database
- Explain/justify when receiving criticism (just fix)
- Trust AI/subagent output without verification
- Create from scratch when similar exists in squads/

### ALWAYS
- Present options as "1. X, 2. Y, 3. Z" format — ALWAYS DO THIS FIRST
- Check squads/ and existing components before creating new
- Read COMPLETE schema before proposing database changes
- Investigate root cause when error persists
- Commit before moving to next task
- Create handoff in docs/sessions/YYYY-MM/ at end of session
