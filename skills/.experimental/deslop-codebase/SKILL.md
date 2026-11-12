---
name: deslop-codebase
description: Clean AI slop out of a whole codebase or module (TypeScript, PHP and other languages) without changing behavior. Use for deslop, de-AI the code, or cleaning up an AI-generated repo.
---

# Deslop codebase

Remove AI slop from an existing codebase, module by module, without changing behavior. Built for repos largely written by AI, where there is no clean baseline to diff against. Code only: slop in prose (README, docs, UI copy) goes in the report.

References, read when the step needs them:

- [references/rules.md](references/rules.md): the full, language-neutral rule catalog with exceptions. Read the rules of a pass before running it.
- One file per detected language, read in Phase 0 (a Laravel app with a TS front end reads both): [references/typescript.md](references/typescript.md), [references/php.md](references/php.md), [references/other-languages.md](references/other-languages.md). Each holds the tells per rule, which types count as enforced (`impossible-guard`), the analyzers, lock-in tooling and greps.

**Diff mode.** If the user asks to deslop a branch or PR, scope to the hunks of `git diff <base>...HEAD` plus the working tree. Apply Pass A and B rules. Apply Pass C rules only to code the branch itself added and only where a test covers it; everything else in Pass C becomes a report item. Skip Phases 1, 2 and 5. After a full deslop, run diff mode after every AI-written change so the slop doesn't come back.

## Ground rules

1. **Behavior stays the same.** Structure changes, the contract does not. A real bug found along the way goes in the report and gets its own commit only if the user agrees.
2. **Proof, not confidence.** Tests, type check, static analysis and smoke checks stay green after every pass. If a test's assertions must change for a cut to pass, behavior changed: revert that cut. Exception: mechanical test updates where only a symbol moved (renamed, inlined or relocated, a mock of a wrapper you inlined) and the assertions stay the same; make those in their own commit and list them in the report.
3. **Delete before you rewrite.** A cleanup never adds an abstraction to remove slop. A cut that needs a new shape becomes a Phase 4 flag.
4. **Converge on the dominant convention, not your taste.** Pick what the majority of the code, the linter config and the project docs (CLAUDE.md, AGENTS.md, CONTRIBUTING, ADRs) use, state it once in the plan, and converge on it.
5. **Guard the edges, trust the inside.** Validation and error handling belong at system boundaries: HTTP requests, CLI args, env and config, database rows, files, queues, external APIs. Inside, trust types that are actually enforced (`impossible-guard`).
6. **Public surface stays.** Entry-point exports, documented APIs, HTTP routes, CLI commands, event names, DB schema, serialized formats. "No caller in the repo" is not proof of dead code when callers live outside it or the framework calls it by name: container bindings, routes, event listeners, autowiring, `config/*.php`, Blade/Twig templates, decorators, dynamic imports, reflection, class names in strings. Unsure means keep and report.
7. **Small commits.** At most one pass per module per commit; split a large pass by rule. Never mix with behavior changes or formatter churn.
8. **Don't over-simplify.** Fewer lines is not the goal; clarity is. No dense one-liners, clever tricks or nested ternaries. Don't merge separate concerns to cut a wrapper. Keep an abstraction that organizes real complexity.

## Phase 0: Recon and safety

- Require a clean working tree and a dedicated branch (`deslop/<scope>`), never the default branch.
- Detect languages and frameworks (`package.json`, `tsconfig.json`, `composer.json`, `artisan`, `symfony.lock`, ...). Read the matching language reference.
- Write an exclusion list kept out of every pass: `vendor/`, `node_modules/`, build output, generated code, migrations that already ran, test snapshots and fixtures, vendored third-party code.
- Run the verification commands for a baseline: tests, type check, lint, plus framework smoke checks (`php artisan route:list`, `php artisan config:cache`, `bin/console lint:container`, the production build). Pre-existing failures are baseline; don't fix them silently.
- No tests or no type checker? Say so, and propose adding one at the level that passes today before Pass C.
- Check which analyzers are available. Propose missing ones; don't add dev dependencies without the user's go.

## Phase 1: Survey and plan

- Map modules and rank them by churn (`git log --since=1.year --format= --name-only | sort | uniq -c | sort -rn | head -50`), size and slop density.
- Run the analyzers first, then the greps, then read the hits. Count hits per rule. A tool finding is a lead, not a verdict: check it against ground rule 6.
- Present the plan: exclusion list, chosen conventions, module order, counts per module, modules without a behavior pin, early Phase 4 flags.
- Interactive: get the user's go before Phase 3. Unattended: run Pass A and B only.

## Phase 2: Pin behavior

Before Pass C and D in a module, cover the code you will touch through its public interface (endpoint, command, public method), not through helpers you may inline. Missing coverage: write characterization tests that capture current behavior, odd behavior included. Pin by risk: data loss, money, security and user-facing errors first, then the failure paths that `defensive-wrapper`, `repeated-validation` and `silent-fallback` will change. Test behavior, not implementation. Type check and lint are not a pin.

## Phase 3: Clean, module by module, in passes

After each pass: run verification and smoke checks, revert any cut that turned something red, commit.

| Pass                              | Needs      | Rules                                                                                                                                                                                                                           |
|-----------------------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A, mechanical                     | nothing    | `narrating-comment`, `dead-comment`, `debug-residue`, `deep-nesting`, `stray-artifact`, and `unused-code` for imports, locals and private methods                                                                               |
| B, local                          | type proof | `impossible-guard`, `type-silencer`, `ceremony`, the rest of `unused-code`                                                                                                                                                      |
| C, failure behavior and structure | pin        | `defensive-wrapper`, `repeated-validation`, `silent-fallback`, `one-caller-wrapper`, `speculative-generality`, `reimplemented-helper`, `duplicated-type`, `copy-paste`, `dead-compat-path`, `fake-implementation` (report only) |
| D, naming and tests               | pin        | `naming-slop`, `test-slop`                                                                                                                                                                                                      |

Always: `keep-comment`, `unrelated-churn`, `hidden-behavior-change`. `competing-conventions` is always a Phase 4 flag.

Large repos: one subagent per module with an explicit file scope, this skill, the exclusion list and the verification commands. Never two agents on the same files. Before committing, a fresh-context subagent reviews the diff only for behavior changes.

## Phase 4: Structural flags

Don't fix these inside a pass; present them as candidates:

- a whole forwarding layer (every `XService` forwarding to an `XRepository`), shallow modules
- a boolean mode bolted onto an unrelated flow; the same conditional on one type repeated across files
- a surprise in our own code that needed a comment to explain
- types that allow invalid states: fields that must change together but can be set apart, invariants checked by callers, associative arrays passed around instead of a typed object
- `competing-conventions`; Laravel `app()` / `resolve()` service location instead of constructor injection

Per candidate: files, problem, proposed shape, deletion-test result, strength (`Strong`, `Worth exploring`, `Speculative`).

- **Deletion test.** If removing it would only move its code into the callers unchanged, it is a pass-through. If every caller would have to re-implement its logic, it pays its way.
- **Seams need two adapters.** An interface pays only when at least two implementations plug into it (production plus a test fake counts).

Do accepted ones one at a time with the user, behind a pin. Migrate every caller and delete the old path in the same change; no shims, no parallel paths.

## Phase 5: Lock it in

Turn recurring rule hits into tooling in CI, from the language reference. Save a baseline and gate only on new findings, so the gate goes in before the backlog is gone. Auto-fixers run as their own reviewed commits after a dry run; fixers that change runtime contracts are separate changes, never part of a pass. Write conventions tooling can't enforce into CLAUDE.md or AGENTS.md, briefly.

## Report

Start with one to three sentences. Then, per module:

- hits fixed per rule, files touched, commits
- behavior pins added
- tests changed or removed, each with the reason (rule 2 exception, `test-slop`)
- Phase 4 flags with strength
- public-surface items left in place (rule 6)
- `defensive-wrapper` and `silent-fallback` items reported instead of cut, `fake-implementation` items, `stray-artifact` files awaiting confirmation, suspected bugs
- a "did not touch" list
- verification and smoke-check commands with results, baseline vs after
