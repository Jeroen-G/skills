# Skills

My collection of [agent skills](https://agentskills.io).

## Installation

Pick any or all skills to install:

```bash
npx skills add jeroen-g/skills
```

Install a single (experimental) skill:

```bash
npx skills add jeroen-g/skills@entity-diff
```

## List of skills

### Curated

**agent-docs**

: generate or maintain a repo's agent docs (context map, glossary, ADRs).

**atlassian**

: look up or search Jira issues and Confluence pages via `atlassian-cli`.

**caveman**

: ultra-compressed communication mode.

**codebase-design**

: shared vocabulary for designing deep modules.

**dex**

: task management via the `dex` CLI.

**domain-modeling**

: build and sharpen a project's domain model (glossary, ubiquitous language, ADRs).

**feature-ticket-to-tasks**

: break a feature ticket into Dex tasks.

**gitlab**

: GitLab CLI (`glab`) for working with GitLab from the command line (merge requests, issues, discussions, CI/CD, API).

**grill-me**

: stress-test a plan or design.

**request-refactor-plan**

: create a refactor plan.

**retro**

: retrospective on a coding session.

**write-feature-ticket**

: turn a JIRA ticket into a feature ticket.

**writing-for-agents**

: writing docs agents consume (skills, `AGENTS.md`, `CLAUDE.md`).

### Experimental

**entity-diff**

: entity-level view of code changes via the `sem` CLI.

**show-me**

: explain a topic visually with diagrams, sketches, and HTML artifacts.

**to-spec**

: turn a conversation into a spec.

## OpenCode auto-update plugin

`plugins/skills-update.ts` is a small OpenCode V2 plugin that keeps your installed skills up to date.
OpenCode has no built-in updater for skills installed with `npx skills`, so this fills the gap.
On load (and on each new session) it runs `npx -y skills update -g -y`, at most once a day, then reloads OpenCode's skill registry so updated skills are picked up without a restart.
It updates **global** installs only; project-scoped installs are left alone.
To install, copy the file to your OpenCode plugins directory, then restart the OpenCode service.

## Credits

The majority of the skills are (slightly) adapted versions of skills created by others such as [Matt Pocock](https://github.com/mattpocock/skills).
All the adapted skills carry the original author and URL to the original version. 
