# Migrating a codebase into the layers

Reference for `implement-frontend-architecture`. Use it when moving a codebase
that does not yet follow `core` / `features` / `screens` / shared services.

## Completion criterion

The migration is done when:

- every source file in the old layout appears in the mapping table,
- no file remains in a folder that was removed,
- imports respect the layer order: `core` → `features` → `screens`, and any
  layer may import shared services,
- the repo's own checks pass.

## Procedure

Copy this checklist and check off items as you go:

```
Migration progress:
- [ ] Step 1: Inventory every source file and entrypoint
- [ ] Step 2: Write the old-path → new-path table
- [ ] Step 3: Move files mechanically and rewrite imports
- [ ] Step 4: Verify (typecheck per batch, then tests, lint, build, run the app)
- [ ] Step 5: Report the mapping and anything left in place
```

If a step's check fails, return to the step named in the checklist and repeat;
only proceed when it passes.

### 1. Inventory

List every source file with its directory, then count files per directory and
their line counts. Sort by size: the biggest files usually hide the pages and
the misplaced business logic.

Record the entrypoints (routes, app shell, background entries) and any files
outside the main source tree that import it — they are part of the blast radius.

### 2. Decide the mapping

Write an explicit **old path → new path** table before moving anything. For
each file apply the boundary test from the skill:

- generic UI primitive → `core/<category>/`
- speaks the product's vocabulary, or holds its rules and data → `features/<Feature>/`
- a full page → `screens/`
- app-wide and not business-specific → `src/services/`

Decisions to settle in the table, not during the move:

- which feature owns an ambiguous module (one owner; other features import it),
- which feature services move with the feature and which stay shared,
- the route or page wrapper that replaces a page currently living in a route file.

When a repo convention contradicts the layer model (a folder name, an existing
layout), the repo wins on names and the skill wins on intent. Surface the
conflict before moving anything.

### 3. Move and rewrite

Move files mechanically from the mapping table; never re-type them. Then rewrite
imports in one pass, longest prefix first, so nested paths are rewritten before
their parent. Keep the mapping table as the single source of truth and re-run
the rewrite instead of patching individual files.

Delete directories that are now empty. Move tests with the code they cover.

### 4. Verify

Run the repo's own checks: typecheck, tests, lint, and a build or bundle step.
The typecheck is the one that catches broken import paths, so run it after each
batch rather than once at the end.

If the typecheck fails, the imports are wrong: return to the mapping table
(step 2), fix the entry there, and re-run the rewrite — do not patch files by
hand. Repeat until it passes, then run tests, lint, and the build.

Then exercise the app itself: start it, open the pages that were touched, and
confirm the rendered result. A passing typecheck says the modules resolve; only
running the app says the screens still work.

### 5. Report

Report the mapping (what moved where), the checks that passed, and anything
deliberately left in place with the reason. A file left in the old layer is a
finding, not an omission: name it and say why.
