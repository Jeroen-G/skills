# `sem` CLI reference

Full flag reference for the `sem` binary (`sem 0.8.0`). Every subcommand accepts `--format json`, and most accept `--json` as shorthand.

Shared options on `graph`, `impact`, `context`, `verify`:

| Option | Effect |
|---|---|
| `--file-exts <EXT>...` | Restrict to these extensions, e.g. `--file-exts .php` |
| `--no-default-excludes` | Include `vendor/`, `node_modules/` and generated dirs |
| `--no-cache` | Skip the SQLite entity cache and rebuild from scratch |
| `--format <FORMAT>` | `terminal` or `json` |

## `sem diff`

Entity-level diff. Accepts git refs, files, pathspecs, `ref1..ref2`, `ref1...ref2`, and `-- <pathspec>`.

| Option | Effect |
|---|---|
| `--staged` / `--cached` | Only staged changes |
| `--commit <SHA>` | Changes in one commit |
| `--from <REF> --to <REF>` | Commit range. Both refs must resolve locally |
| `--stdin` | Read `FileChange[]` JSON from stdin |
| `--patch` | Read a unified diff from stdin, e.g. `git diff \| sem diff --patch` |
| `--format <FORMAT>` | `terminal` (default), `plain`, `json`, `markdown` |
| `--json` | Shorthand for `--format json` |
| `-v, --verbose` | Inline content diffs per entity |
| `--no-cosmetics` | Hide formatting, whitespace and comment-only changes |
| `--color <WHEN>` | `always`, `auto` (default), `never` |
| `-C, --cwd <DIR>` | Run as if started in that directory |

Untracked files are excluded, matching `git diff`.

## `sem impact [ENTITY]`

Entity may be a bare name or `"type name"`. Use `--entity-id <ID>` to be exact, or `--file <PATH>` to disambiguate a duplicate name.

| Option | Effect |
|---|---|
| `--deps` | Direct dependencies only |
| `--dependents` | Direct dependents only |
| `--tests` | Affected test entities only |
| `--depth <N>` | Transitive traversal depth, default `2`, `0` for unlimited |

## `sem log <ENTITY>`

Evolution of one entity through git history.

| Option | Effect |
|---|---|
| `--file <FILE>` | Disambiguate the entity's file |
| `--limit <N>` | Commits to scan, `0` for unlimited. Default `50` |
| `-v, --verbose` | Show the content diff between versions |

## `sem blame <FILE>`

Who last modified each entity in a file. Accepts a file path only, not a directory.

## `sem graph [PATH]`

Full entity dependency graph for a repository or subdirectory. There is **no** `--entity` flag; use `sem impact <ENTITY>` for a single entity's edges.

## `sem entities [PATH]`

Lists entities under a file or directory, defaulting to `.`. Useful for discovering the exact entity names before running `impact`, `log` or `context`. Honours `--no-default-excludes`.

## `sem context [ENTITY]`

Token-budgeted context around an entity.

| Option | Effect |
|---|---|
| `--entity-id <ID>` | Look up by id from `sem diff --json` |
| `--file <FILE>` | Disambiguate |
| `--budget <N>` | Token budget, default `8000` |

## `sem verify`

Checks function call arity across the codebase. `--diff` compares the working tree against `HEAD` and reports broken callers caused by signature changes. Scans the whole repository, so expect it to take seconds to tens of seconds on a large codebase.

## `sem stats`

Lifetime diff statistics. Takes no options.

## `sem setup` / `sem unsetup`

`setup` replaces `git diff` with `sem diff` globally by writing a shell alias or function. `unsetup` restores the default. Do not run `setup` without asking.

## JSON output

`sem diff --json`, verified against `sem 0.8.0`:

```json
{
  "summary": {
    "fileCount": 2,
    "added": 1,
    "modified": 1,
    "deleted": 1,
    "moved": 0,
    "renamed": 0,
    "reordered": 0,
    "binary": 0,
    "orphan": 0,
    "total": 3
  },
  "changes": [
    {
      "entityId": "src/queue/handler.ts::function::handle",
      "changeType": "modified",
      "entityType": "function",
      "entityName": "handle",
      "startLine": 44,
      "endLine": 61,
      "oldStartLine": 44,
      "oldEndLine": 63,
      "oldEntityName": null,
      "filePath": "src/queue/handler.ts",
      "oldFilePath": null,
      "oldParentId": null,
      "beforeContent": "export function handle(job: Job) {\n  return process(job)\n}",
      "afterContent": "export function handle(job: Job) {\n  return process(job)\n}",
      "commitSha": null,
      "author": null,
      "structuralChange": null
    }
  ]
}
```

Change types: `added`, `modified`, `deleted`, `moved`, `renamed`, `reordered`.

Notes on the fields:

- **`structuralChange` is the cosmetic/structural signal.** It is `null` on a working-tree diff. Read `beforeContent` and `afterContent` and compare them yourself to decide whether a `modified` entry is real logic or just reformatting. `--no-cosmetics` filters the cosmetic ones out for you.
- `commitSha` and `author` are also `null` on a working-tree diff; they populate for `--commit` and for ranges.
- `entityType` is not only code. Files the parser cannot break into functions come back as `"chunk"` entities named `lines 61-80`, which is what you get for `.env`, `.yml` and other config. Do not report those as functions.
- `orphan` in the summary counts entities that no longer resolve to a parent.

`sem entities <path> --json` returns a flat array with `type`, `name`, `start_line`, `end_line`, `file` and `parent_id`, where `parent_id` is the parent's entity id. `type` is one of `module`, `class`, `interface`, `method`, `function`, `chunk`.

`sem impact` resolves an entity from a bare name, `"type name"`, or an exact `--entity-id`. A bare name that matches more than one entity is an error, not a guess:

```
error: Entity name 'handle' is ambiguous (N matches). Specify --file or --entity-id
```

## Language coverage

27 languages via tree-sitter: TypeScript, JavaScript, Python, Go, Rust, Java, C, C++, C#, Ruby, PHP, Swift, Elixir, Bash, HCL/Terraform, Kotlin, Fortran, Vue, XML, ERB, Svelte, Dart, Perl, OCaml, Scala, Nix, Zig. Plus structured formats: JSON, YAML, TOML, CSV, Markdown.
