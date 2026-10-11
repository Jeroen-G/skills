---
name: entity-diff
description: Entity-level view of code changes (functions, classes, methods) via the `sem` CLI. Use INSTEAD of `git diff` / `git log` / `git blame` when the question is about code as entities rather than lines. Triggers on "what changed in this branch", "which functions did this commit touch", "is this just reformatting or real logic", "who last modified this method", "how did this function evolve", "what calls X", "what breaks if I change X", "show the call graph", reviewing a branch or PR, checking a diff before committing, and diffs too noisy to read raw. Load before choosing a command - the flag reference, the JSON schema and graph-accuracy caveats are inside.
metadata:
  internal: true
---

# entity-diff — entity-level change analysis with `sem`

`sem` tracks **functions, classes, methods** instead of lines, using tree-sitter plus structural hashing. It can tell a reformat apart from a real logic change, and it attributes history to whole functions rather than to lines.

## Why not just git

`git diff` is line-based, so a reformat looks identical to a logic change and you have to reconstruct which function a hunk belonged to. `git blame` attributes every line separately, so a function touched by five commits shows five authors with no single answer to "who last changed this function".

`sem` hashes the structure of each entity, so a whitespace-only edit is reported as cosmetic and blame lands on the function as a unit.

## Request → command

| The user asks | Run |
|---|---|
| "What changed in this branch?" | `sem diff --from <base> --to HEAD --json` |
| "What did this commit touch?" | `sem diff --commit <sha> --json` |
| "Is this reformatting or real logic?" | `sem diff --json`, then compare `beforeContent` and `afterContent` |
| "Just show me the real changes" | `sem diff --no-cosmetics --json` |
| "Review my uncommitted work" | `sem diff --json` |
| "What's staged?" | `sem diff --staged --json` |
| "Who last modified this method?" | `sem blame <file> --json`, then match the entity's line range |
| "How did this function evolve?" | `sem log <Entity> -v` |
| "What calls X?" | `sem impact <Entity> --dependents` |
| "What does X depend on?" | `sem impact <Entity> --deps` |
| "What breaks if I change X?" | `sem impact <Entity>` (transitive, depth 2) |
| "Which tests cover X?" | `sem impact <Entity> --tests` |
| "Is this method still defined?" | `sem entities <path> --json` |
| "Show the call graph" | `sem graph <path> --json` |
| "Did I break any callers?" | `sem verify --diff` |
| "Give me this function's neighbourhood" | `sem context <Entity> --budget 6000` |

## Graph accuracy, read this first

`sem diff`, `sem log`, `sem blame`, `sem entities` and `sem context` are exact: they read the file and the git history.

`sem impact`, `sem graph` and `sem verify` are only as good as the parser's resolution of names, which varies by language. **Verify the graph against a plain text search before reporting it.** Never present an impact list as complete on its own.

Known weak spots:

- **Runtime dependency injection defeats static resolution.** In PHP with a service container, Laravel or Spring, an implementation bound in a provider and injected through a constructor type-hint is invisible to the graph. Check that the interface genuinely has no implementers with a search for `implements <Interface>` before believing "No dependents".
- **Interface implementations are separate entities.** Impact on an interface does not enumerate its implementers. Check the concrete class.
- **Methods mixed in from a trait or base class** resolve to the declaring trait or parent, not to the class you are asking about.
- **Dynamic dispatch is invisible.** String-based lookups, `call_user_func`, reflection and event-bus topic names will not appear as edges.

## Caveats

- **The base ref must exist locally.** `sem diff --from <base>` fails with `revspec not found` if `<base>` is not a resolvable ref. Check what branches exist before guessing a remote name.
- **`sem diff` ignores untracked files**, matching `git diff`. A brand-new file never shows up. Confirm it parsed with `sem entities <path>` instead.
- **`sem graph` takes a path, not `--entity`.** Some older docs advertise `sem graph --entity X`; that flag does not exist. To inspect one entity's edges use `sem impact <Entity>`.
- **Bare entity names are often ambiguous.** `sem impact handle` fails outright when several entities share a name. Pass `--file <path>` or the exact `--entity-id` from a previous `--json` result rather than guessing.
- **Prefer `--json` / `--format json`.** The default output is a terminal table that is expensive to read. Every subcommand accepts `--json`.
- **`vendor/`, `node_modules/`, `build/` and generated directories are excluded by default.** If an expected entity is missing, retry with `--no-default-excludes` before concluding it does not exist.
- **`graph`, `impact`, `context` and `verify` share a SQLite entity cache.** The first call is slow, later ones are not. Pass `--no-cache` to force a rebuild. Expect these to take seconds to tens of seconds on a large repository.
- Files the parser cannot break into functions, such as `.env` and YAML config, come back as `chunk` entities named `lines 61-80`. Do not report those as functions.
- `sem setup` replaces `git diff` with `sem diff` globally. Do not run it without asking.

## Reference

Full flag lists, the JSON output schema, the entity types and the change-type vocabulary are in `reference.md`. Read it when you need a flag that is not in the table above.
