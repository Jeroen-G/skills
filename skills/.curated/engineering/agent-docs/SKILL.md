---
name: agent-docs
description: Generate or maintain a repo's agent docs with the domain model and module design in /.agents/docs/ (context map, glossary, ADRs). Use when the team wants to (re)generate or update the domain design, pin down ubiquitous language, or record an architectural decision.
---

# Agent Docs

Load these skills and follow them:

1. `writing-for-agents`: how to write documents an agent consumes.
2. `codebase-design`: the deep-module vocabulary for describing module design.
3. `domain-modeling`: how to build and sharpen the domain model in `/.agents/docs/`.

Then write the domain design of this codebase.

## Steps

1. Load the three skills above.
2. Survey the codebase: locate the domain layer, split bounded contexts from technical support modules, spot the seams to external partners.
3. Write the domain design - context map, glossary, ADRs - following the loaded skills.
4. Wire the `AGENTS.md` pointer to the produced docs.
