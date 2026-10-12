# Skill Drift reference

## The credits block

```yaml
metadata:
  credits:
    skill: domain-modeling
    author: Matt Pocock
    url: "https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md"
```

`url` locates the upstream file and names its branch. No fork point is stored: the base is derived by content each run, so a moved or rewritten file cannot leave a stale SHA behind.

## Worked example

```bash
# variables from the credits block
REPO=mattpocock/skills
PATH_=skills/engineering/domain-modeling/SKILL.md
BRANCH=main
LOCAL=skills/.curated/engineering/domain-modeling/SKILL.md

# 1. list commits touching the path, newest first
curl -s "https://api.github.com/repos/$REPO/commits?path=$PATH_&sha=$BRANCH&per_page=20" \
  | python3 -c "import sys,json;[print(c['sha']) for c in json.load(sys.stdin)]"

# 2. fetch the file at each candidate and diff it against local;
#    the candidate with the smallest diff is the base
curl -s "https://raw.githubusercontent.com/$REPO/<candidate-sha>/$PATH_" > /tmp/base.md
diff /tmp/base.md "$LOCAL"

# 3. current upstream
curl -s "https://raw.githubusercontent.com/$REPO/$BRANCH/$PATH_" > /tmp/upstream.md

# apply upstream's changes onto your file; conflicts get standard markers
# diff3 is POSIX and works where configs deny `git *`
diff3 -m "$LOCAL" /tmp/base.md /tmp/upstream.md > /tmp/merged.md

# what upstream did since your fork, to read alongside the merge
diff /tmp/base.md /tmp/upstream.md
```

If `base` and `upstream` are identical there is nothing to do. If `merged` equals `LOCAL`, upstream changed nothing you did not already have.

## Sibling files

A skill is more than `SKILL.md`: `DEEPENING.md`, `CONTEXT-FORMAT.md`, `SKILL-MECHANICS.md`, and so on. Run the same find-base/merge for each file in the skill directory, deriving the base per file.

Match files by name. When a local file has no upstream file of that name, check whether upstream renamed it: compare the upstream directory listing across the candidate commits. A concrete case: the local `CONTEXT-FORMAT.md` corresponds to upstream's `GLOSSARY-FORMAT.md` after upstream's CONTEXT → GLOSSARY rename. Derive the base against the renamed counterpart, not against the wrong file.

## Reading for meaning drift

The merge cannot catch these, so classify every change by hand after the merge. Wording is cosmetic; intent and concept need your reading:

- **Wording.** Punctuation, phrasing, quoting. Take freely; no adaptation depends on it.
- **Intent — reworded rule.** Upstream tightened or loosened a rule your adaptation sits beside. Your added caveat may now be redundant or contradictory.
- **Concept — renamed term.** Upstream renamed a term; your adaptation still uses the old name, so the file now mixes two vocabularies.
- **Concept — changed example or default.** Upstream altered an example, threshold, or default your addition assumed.
- **Concept — removed section.** Upstream deleted the section you appended to; your addition may now dangle.

When an intent or concept change applies, do not silently accept the merge. Surface the change and the reason, and let the user decide per change.

## When the base is hard to pin

- **File moved.** A path changes when upstream relocates a file (for example `retro` moved from `skills/in-progress/` to `skills/engineering/`). Scan the current path; when nothing close, diff the old path or the directory listings across the candidate commits.
- **Rewritten, not adapted.** If upstream replaced the skill wholesale (a thin router where you keep a full skill, or vice versa), no revision is close and the smallest diff is meaningless. Treat it as a decision to keep your version or adopt theirs, not a merge.
- **Ambiguous fork point.** When several candidates are near-equal, prefer the older; a base older than your true fork replays changes you already took (they merge to no-ops), while a newer one can hide a change you missed.

## Non-GitHub URLs

`url` may point anywhere. Fetch the current upstream as raw text and diff it against your local file; where you can list revisions, scan them for the base as above. Without history, use the closest available revision as the base and accept the uncertainty.

## After syncing

Nothing to record: the next run re-derives the base from content. A base older than your true fork is harmless — already-taken changes merge back to no-ops — so syncing leaves no marker to maintain.
