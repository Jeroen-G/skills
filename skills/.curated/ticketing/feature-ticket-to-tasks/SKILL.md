---
name: feature-ticket-to-tasks
description: This skill will be invoked when the user wants to break a Feature Ticket into independently-grabbable Dex tasks.
---

# Feature Ticket to Issues

Break a Feature Ticket into independently-grabbable Dex tasks using vertical slices (tracer bullets).
For working with Dex, load the `dex` skill.

## Process

### 1. Locate the Feature Ticket

Ask the user for the Feature Ticket if not already given. Read and internalize the full Feature Ticket content (with all comments).

### 2. Explore the codebase

Read the key modules and integration layers referenced in the Feature Ticket. Identify:

- The distinct integration layers the feature touches (e.g. DB/schema, API/backend, UI, tests, config)
- Existing patterns for similar features
- Natural seams where work can be parallelized

### 3. Draft vertical slices

Break the Feature Ticket into **tracer bullet** tasks. Each task is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
- The first slice should be the simplest possible end-to-end path (the "hello world" tracer bullet)
- Later slices add breadth: edge cases, additional user stories, polish
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Layers touched**: which integration layers this slice cuts through
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories from the Feature Ticket this addresses

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Is the ordering right for the first tracer bullet?
- Are there any slices missing?

Iterate until the user approves the breakdown.

### 5. Create the tasks

For each approved slice, create a task. Use the task body template below.

Create tasks in dependency order (blockers first) so you can reference real task numbers in the "Blocked by" field.

<task-template>
## Parent Feature Ticket

#<prd-task-number>

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation. Reference specific sections of the parent Feature Ticket rather than duplicating content.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- Blocked by <task-number> (if any, then use Dex' `--blocked-by` flag when creating this task)

Or "None - can start immediately" if no blockers.

</task-template>

After creating all tasks, print a summary table:

```
| # | Title | Blocked by | Status |
|---|-------|-----------|--------|
| 42 | Basic widget creation | None | Ready |
| 43 | Widget listing | #42 | Blocked |
```

Do NOT modify the parent Feature Ticket task.
