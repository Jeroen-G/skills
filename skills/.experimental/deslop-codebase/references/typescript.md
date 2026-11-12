# TypeScript and JavaScript

Tells per rule, analyzers, lock-in tooling and greps for TS/JS (including React). Rules themselves are in `rules.md`.

## Tells per rule

- **`narrating-comment`:** JSDoc `@param {string}` or `@returns {Foo}` in `.ts` files, where the signature already says it.
- **`impossible-guard` enforced types:** TS types on values produced by typed code. *Not* enforced: values that came through `as`, `any`, `JSON.parse`, an unvalidated API response, or index access without `noUncheckedIndexedAccess`.
- **`defensive-wrapper`:** `.catch(() => {})`, `catch {}`, `catch (e) { console.error(e); return null }`, `try/catch` around pure internal calls.
- **`repeated-validation`:** a zod/valibot parse in the route handler and again in the service.
- **`silent-fallback`:** `?? ''`, `?? []`, `|| 0`, `|| ''`, `|| false`; `?.` on a call that must happen.
- **`type-silencer`:** `as any`, `as unknown as T`, chained assertions, `!` non-null assertions, `@ts-ignore`, `@ts-expect-error`, type-rule `eslint-disable`, `Record<string, any>`.
- **`debug-residue`:** `console.log`, `console.debug`, `debugger`.
- **`ceremony` traps:**
  - `async` without `await`: remove only if the type checker confirms no caller needs a Promise and the body can't throw (removing `async` turns a rejected promise into a synchronous throw).
  - needless `Promise.resolve()` or `.then` wrapping.
  - conditional spreads `...(x ? { a } : {})`: build the object explicitly.
  - `=== true` only when the type is plain `boolean`, not `boolean | undefined`.
  - React: a `useEffect` that only derives state from props or state (compute during render); `useMemo`/`useCallback` on cheap values, unless the project uses them by convention or the React Compiler.
- **`one-caller-wrapper`:** a `formatDate.ts` wrapping one library call used once; a barrel `index.ts` that only re-exports one module.
- **`reimplemented-helper`:** hand-written versions of `Object.groupBy`, `structuredClone`, `Array.prototype.at`, or of lodash/date-fns functions that are already installed.
- **`duplicated-type`:** derive with `Pick`, `Omit`, `z.infer`, `ReturnType` instead of copying a shape.
- **`test-slop`:** `expect(true).toBe(true)`, tests that only check `toHaveBeenCalled` on mocks.

## Analyze: fallow

Run `npx fallow` (no config needed; add `--format json --quiet` for machine output). Use JSON output; run auto-fixes as a dry run first, then as their own commit per rule family.

| Command | Finds | Rules |
|---|---|---|
| `fallow dead-code` | unused files, exports, types, enum and class members, dependencies | `unused-code`, `dead-compat-path` |
| `fallow dead-code --trace <file>:<export>` | proof that an export is unused before deleting it | rule 6 |
| `fallow fix --dry-run`, then `fallow fix --yes` (non-interactive) | auto-removal of unused code | `unused-code` |
| `fallow dupes` | copied code, also in Vue, Svelte and Astro | `reimplemented-helper`, `copy-paste` |
| `fallow similar-code` (opt-in, local model) | functions with the same job and different syntax | `reimplemented-helper` |
| `fallow health` | complexity hot spots with churn, health score | module order, `deep-nesting`, Phase 4 |
| `fallow architecture` | boundary violations, circular dependencies | Phase 4 |
| `fallow guard` | which architecture rules apply to files before you change them | Phase 4 |
| `fallow flags` | feature-flag patterns | `unused-code` (always-on toggles) |
| `fallow mutation` (opt-in, runs tests) | code changes no test detects | Phase 2 gaps, `test-slop` |
| `fallow audit --base <ref>` | only findings a change introduces | per-pass check, Phase 5 gate |

Add `--type-aware` when interfaces, base classes or re-exports cause false positives. Alternatives when fallow is unavailable: `knip` (unused code), `jscpd` (duplication). fallow reads JS/TS only: check config, CI workflows and generated files by hand or with `jscpd`.

## Lock in (Phase 5)

- tsconfig: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`.
- typescript-eslint: `no-explicit-any`, `no-unnecessary-condition` (catches `impossible-guard`), `no-unnecessary-type-assertion`, `no-non-null-assertion`, `ban-ts-comment` (require a description), `require-await`.
- ESLint core: `no-useless-catch`, `no-nested-ternary`, `no-else-return`.
- `fallow audit` as PR gate (only new findings fail), or `knip` for unused files, exports and dependencies.
- `fallow health` as a gate once it passes, so complexity and untested hot spots can't creep back.
- Custom rules worth copying (oxlint/eslint): no chained type assertions, no conditional spreads, no widen-then-assert, max ternary depth 2.

## Greps

Leads with false positives; read every hit. Add the exclusion list as `-g '!path/**'`.

```bash
rg -n '\bas (any|unknown)\b|@ts-ignore|@ts-expect-error|eslint-disable' -g '*.{ts,tsx}' .
rg -n 'console\.(log|debug)|\bdebugger\b' -g '*.{ts,tsx}' .
rg -nU 'catch\s*(\([^)]*\))?\s*\{\s*\}|\.catch\(\s*\(\)\s*=>\s*\{\s*\}\s*\)' -g '*.{ts,tsx}' .
rg -n "\?\? (''|\"\"|\[\]|\{\}|0)|\|\| (''|\"\"|\[\]|\{\}|0|false)" -g '*.{ts,tsx}' .
rg -n '\b\w*(Legacy|Deprecated|Old|V2|New)\b|\b(legacy|old|new|deprecated)[A-Z_]\w*' -g '*.{ts,tsx}' .
rg -n -i 'TODO: implement|not implemented|mock for now|stub for now' -g '*.{ts,tsx}' .
```
