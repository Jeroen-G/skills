# Rule catalog

Language-neutral rules for the deslop-codebase skill: what counts as slop, when to cut, and the exceptions. The language files (`typescript.md`, `php.md`, `other-languages.md`) list the concrete tells per rule. Rule names are stable; use them in the plan and the report. Which pass each rule belongs to is in SKILL.md.

## Comments and residue

- **Narrating comments (`narrating-comment`).** Comments that restate the code, step banners (`// Step 1: ...`, `// ===== Helpers =====`), docblocks that repeat the signature. Delete. Keep doc comments that add what the type system can't express.
- **Dead and lying comments (`dead-comment`).** Commented-out code, `// removed`, `// old implementation`, `// TODO: implement` on code that is implemented: delete. A TODO with a ticket reference stays. Check each comment that survives against the code (parameters, return values, edge cases, referenced symbols): correct or delete a wrong one; delete one about a transitional state ("temporary", "for now", "new implementation").
- **Keep list (`keep-comment`).** These comments stay: license headers; non-obvious behavior forced by something we can't change (vendor bug, protocol, platform), ideally with a link; justified formatter or linter directives; doc comments that define a public API contract; issue, ADR or RFC links for a constraint code can't express. A comment explaining a surprise in *our own* code stays until the reshape that makes it unnecessary has landed; flag the symbol in Phase 4.
- **Debug residue (`debug-residue`).** Debug prints and dumps, debugger statements, log noise like "Entering X" or "Successfully did Y". Delete. Structured logs that monitoring or alerts rely on stay; unsure means keep and report.
- **Unused code (`unused-code`).** Pass A: unused imports, local variables, private methods. Pass B: parameters nobody passes, internal exports nobody imports, options with one value, flags with one reachable branch, toggles that are always on, unused dependencies. Keep parameters whose signature is fixed by an interface, parent class, framework or callback contract. Mind ground rule 6.
- **Stray session artifacts (`stray-artifact`).** Files an agent left behind: `*_SUMMARY.md`, `IMPLEMENTATION_NOTES.md`, `PLAN.md`, one-off scripts in the root, `*.bak`, `*.orig`, `foo copy.*`, `old/` folders, package scripts nobody runs. List them and delete only after the user confirms; some may be wanted.

## Guards and error handling

- **Impossible-state guards (`impossible-guard`).** Null checks, null-safe access and defaults on values that can't be null; type checks on values that can only have one type; defaults for arguments every caller passes. Delete only when the type is *enforced* and you traced the value to its source. Each language file says which types count as enforced. Unsure means keep. If the type is wrong and the value really can be null, fix the type, keep the check, and report it.
- **Defensive wrapping on trusted paths (`defensive-wrapper`).** Try/catch around internal calls that can't fail that way; catch, log and return an empty value; catch and rethrow unchanged; empty catch blocks; catch-all handlers that swallow; error suppression. This changes failure behavior: cut only when a test pins the failure path (Pass C), otherwise report. Remove the wrapper and let errors reach the boundary's handler. For each catch you keep, list which unexpected errors it could swallow; narrow a broad catch to the expected type. At the boundary, the handler must log with context (operation, IDs) and surface the error; one that swallows is a suspected bug for the report. A silent fallback that hides an unclear invariant: name the invariant in the report.
- **Repeated validation (`repeated-validation`).** Re-validating what a boundary already validated. Delete the inner copy only if every entry point to that code (HTTP, jobs, console commands, queue listeners, other services) passes through the same validation. Otherwise keep it, or move validation to the shared entry and report.
- **Fallbacks that hide failure (`silent-fallback`).** Empty-value defaults that let a failure travel on, `null` on "not found" so the caller fails somewhere obscure, hardcoded default config "just in case", null-safe access that silently skips an operation that should happen, retry loops that give up without telling anyone, fallback chains that try several approaches without saying why. Outside a boundary and not in the spec: remove and fail loudly, only behind a pin (Pass C); otherwise report.
- **Type-checker silencers (`type-silencer`).** Casts, assertions and suppression comments whose only job is to make the checker pass; widening a known value and asserting it back; "any"-style types where the type is known; new baseline entries. Fix the type and delete the cast. At a real boundary (decoded JSON, request input), narrow with a parser or validator instead.

## Local shape

- **Nesting (`deep-nesting`).** An `if` wrapping the rest of the function becomes an early return; `else` after `return` goes; nested ternaries become `if`, `switch` or `match` (max one level of ternary).
- **Ceremony (`ceremony`).** Code that adds steps without adding meaning: a boolean returned through `if/else`, a temp variable returned on the next line, a comparison to `true`, a cast to the type the value already has, wrapping a value just to unwrap it. Cut each only when it is provably equivalent; the language files list the traps.

## Structure

- **One-caller wrappers (`one-caller-wrapper`).** A single function, method or class whose body forwards its arguments and has one caller. Inline it. A whole forwarding layer across modules is a Phase 4 flag, not `one-caller-wrapper`.
- **Speculative generality (`speculative-generality`).** An interface with one implementation, an abstract base with one child, a factory with one product, a strategy with one strategy, a generic used once, an options object whose options nobody sets, a plugin system with one plugin. Inline back until a real second use exists. Exception: a seam with two implementations in use, or an interface the framework requires.
- **Re-implemented helpers (`reimplemented-helper`).** Code that duplicates a helper in the repo, the framework, the standard library or an installed dependency. Call the existing one and delete the copy, after checking edge cases match (null handling, encoding, key preservation). Typical AI tell: the same util in three files under three names.
- **Duplicated types and DTOs (`duplicated-type`).** The same shape declared several times (`User`, `UserData`, `UserDTO`, `IUser`), or array → object → array round trips. Keep one, at the boundary or in the domain, and derive the rest instead of copying.
- **Copy-paste with variation (`copy-paste`).** Extract only when the codebase already names that shape, or with three or more copies that mean the same thing. Two similar blocks may stay.
- **Dead compatibility paths (`dead-compat-path`).** Old code kept beside new, `legacy`/`V2`/`New`/`Old` names, re-exports "for backwards compatibility" with no caller, deprecation notices on internal code. Migrate every caller inside the repo and delete the old path in the same change. On the public surface: report only.
- **Fake implementations (`fake-implementation`).** Hardcoded return data, "mock for now", not-implemented exceptions or empty methods on reachable paths, endpoints scaffolded "for the future", production code that falls back to a mock or stub. Don't delete when reachable: these are behavior questions for the user. Report them prominently.

## Consistency and naming

- **Competing conventions (`competing-conventions`).** Several HTTP clients, date libraries or error styles (exceptions vs result objects vs `null`), `getX`/`fetchX`/`retrieveX` for the same thing, different folder layouts per module. Converging changes behavior (error semantics, defaults, time zones), so this is a Phase 4 flag: propose the target convention, converge only after the user accepts, one module at a time behind pins.
- **Naming slop (`naming-slop`).** Names without domain meaning (`data`, `result`, `item`, `handleData`, `processItem`, `Manager`, `Helper`, `Utils`, a bare `Service`), an `I` prefix the project doesn't use, names that lie about what the code does. Rename to domain terms. Check every reference, including strings, config, templates, DI and route files.
- **Test slop (`test-slop`).** Tests that only assert on mocks, duplicate tests, always-true assertions, snapshot-everything tests, tests of private helpers you are inlining. Change or remove them only in a separate commit, and list each one in the report with the reason.

## Scope (every pass)

- **Unrelated churn (`unrelated-churn`).** Formatting, import reordering, or syntax modernization outside the rule being applied. Leave it for a formatter commit of its own.
- **Behavior change disguised as cleanup (`hidden-behavior-change`).** Split it out and name it in the report.
