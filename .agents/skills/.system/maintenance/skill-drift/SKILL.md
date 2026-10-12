---
name: skill-drift
description: Compare adapted skills against the upstream originals they credit, keep your adaptations, and fold in upstream changes one at a time.
disable-model-invocation: true
---

# Skill Drift

Bring adapted skills back in line with the upstream originals they credit, without losing your adaptations.

Each credited skill records where it came from: `metadata.credits.url` (the upstream file). Drift is whatever upstream changed since you forked. No fork point is stored — you find the **base** by matching your file against upstream history each run, so a moved or rewritten upstream cannot leave a stale marker behind.

## Why this is judgement, not just a merge

A three-way merge applies upstream's changes onto your file mechanically and marks only textual collisions. It cannot see that upstream *reworded* a rule your adaptation depends on, renamed a concept you kept the old name for, or reversed an example your addition assumes. Those merge cleanly and are still wrong. So the merge is the first step and reading it is the second. Do both.

## Steps

For each skill whose `SKILL.md` carries `metadata.credits.url`:

1. Read `url`. It names the upstream file and the branch (usually `main`).
2. Find the **base** — the upstream revision you forked from — for every file in the skill directory. See [Finding the base](#finding-the-base). Match files by name; when a local file has no counterpart, check for a renamed one.
3. Fetch **upstream**: the current file at the branch in `url`, via `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>`.
4. If base equals upstream for every file, the skill is current. Move on.
5. Otherwise merge each changed file: `diff3 -m <local> <base> <upstream>`. This applies upstream's changes onto your file and marks conflicts.
6. **Turn the merge and the `base -> upstream` diff into a change inventory.** A clean merge only proves no textual collision. Classify every change by what it moves:
   - **wording** — cosmetic: punctuation, phrasing, description quoting.
   - **intent** — a rule or recommendation changed meaning.
   - **concept** — a renamed term, a new or removed section, a changed default or example.
   Number the changes per skill, one line each as `before -> after`, so each is addressable.
7. **Present the inventory, then decide per change rather than per skill.** Show every skill's numbered list and ask which changes to take (`all`, `1,3`, `skip 2`); recommend taking all wording changes and give a reading on each intent and concept change. A conflict or a meaning shift is a decision to surface, not an error to hide.
8. Apply the selected changes. Nothing to record — the next run re-derives the base.

## Finding the base

The base is the upstream revision your file was adapted from. Derive it by content: the fork point is the upstream revision most similar to your local file, because upstream edits after the fork only add distance.

- List the commits touching the path, newest first: `GET https://api.github.com/repos/<owner>/<repo>/commits?path=<path>&sha=<branch>&per_page=20`.
- Fetch the file at each candidate and diff it against your local file. The smallest diff is the base.
- When two candidates are near-equal, prefer the older: a base older than your true fork replays changes you already took (they merge back to no-ops), while a base newer than it can hide a change you missed.

Fetch candidates over HTTP. Where a config denies `git *`, use `diff3 -m` for the merge and the commits API for history rather than a clone.

## Reference

- [reference.md](reference.md): worked commands, sibling files and renames, and the cases where the base is hard to pin.
