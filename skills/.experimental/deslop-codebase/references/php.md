# PHP (Laravel, Symfony)

Tells per rule, analyzers, lock-in tooling and greps for PHP. Rules themselves are in `rules.md`.

## Tells per rule

- **`narrating-comment`:** `@param string $name The name` on a typed `string $name`, `@return void`. Keep docblocks that add what native types can't: `array<int, User>`, `list<string>`, `@template`, `@throws` where the project uses it.
- **`impossible-guard` enforced types:** native param, return and property types. *Not* enforced: PHPDoc-only types and array shapes, Eloquent `@property` magic, request input, decoded JSON. `isset` on a typed property can be a legitimate uninitialized-state check.
- **`defensive-wrapper`:** empty `catch (\Exception $e) {}`, `catch (\Throwable)` that logs and returns `null`, the `@` error-suppression operator.
- **`repeated-validation`:** a Laravel FormRequest or Symfony constraint, followed by the same checks by hand in the service.
- **`silent-fallback`:** `?: []`, `?: ''`, `?? null` chains, `return null` on "not found" where the caller can't handle it.
- **`type-silencer`:** `/** @var Foo $x */` to silence the analyzer, `@phpstan-ignore`, `@psalm-suppress`, `mixed` where the type is known, new PHPStan baseline entries.
- **`debug-residue`:** `dump()`, `dd()`, `var_dump`, `print_r`, `ray()`, debug `error_log`.
- **`ceremony` traps:** `=== true` only on plain `bool`, not `?bool`; `(string)`, `(int)` or `strval` only when the native type already guarantees it.
- **`one-caller-wrapper`:** `UserService::find($id) { return $this->repo->find($id); }` used once. If the whole service layer looks like that, it is a Phase 4 flag.
- **`speculative-generality`:** `FooInterface` + `Foo` with no container binding to anything else and no test double.
- **`reimplemented-helper`:** hand-written versions of Laravel `Str`, `Arr`, collection methods, Symfony components, or `array_column`, `array_key_first`, `str_contains`.
- **`unused-code` signature exceptions:** middleware `handle`, listeners, controller actions, console command `handle`, job `handle`, Eloquent hooks.
- **Suspected bugs (report):** `env()` outside `config/` returns `null` once config is cached; move to a config key and read it with `config()`.
- **Phase 4:** `app()` / `resolve()` service location inside classes instead of constructor injection; associative arrays passed between layers instead of a typed object.

## Analyze

PHPStan is the hub; most slop checks are PHPStan extensions. On Laravel, run it through Larastan or it won't understand Eloquent and facades. Run auto-fixes as a dry run first, then as their own commit per rule family.

| Tool | Finds | Rules |
|---|---|---|
| `phpstan/phpstan-strict-rules` | always-true `instanceof`, `is_*` and `===` checks, useless casts, `empty()`, short ternary `?:` | `impossible-guard`, `silent-fallback`, `ceremony` |
| `shipmonk/dead-code-detector` | unused methods, properties, constants, enum cases; dead cycles; code only tests use. Knows Symfony, Laravel, Doctrine and Eloquent entry points. `phpstan analyse --error-format removeDeadCode` deletes the findings | `unused-code`, `dead-compat-path` |
| `spaze/phpstan-disallowed-calls` | forbidden calls; include `disallowed-dangerous-calls.neon` (`var_dump`, `print_r`, ...) and add `dd`, `dump`, `ray` yourself | `debug-residue` |
| `ergebnis/phpstan-rules` (pick rules) | `NoErrorSuppressionRule` (`@`), `NoPhpstanIgnoreRule`, `NoIssetRule` | `defensive-wrapper`, `type-silencer`, `impossible-guard` |
| `shipmonk/phpstan-rules` (pick rules) | e.g. `forbidUselessNullableReturn`, `forbidCast`, `enforceNativeReturnTypehint` | `impossible-guard`, `type-silencer` |
| `tomasvotruba/type-coverage` | % of params, returns and properties with a native type; raise the minimum step by step | `type-silencer` |
| `tomasvotruba/cognitive-complexity` | methods and classes too complex to read | `deep-nesting`, module order |
| Rector `withPreparedSets(deadCode: true, codeQuality: true)`, plus `driftingly/rector-laravel` on Laravel; `--dry-run` first | dead code, early returns, needless `instanceof` and conditions | `unused-code`, `deep-nesting`, `ceremony` |
| `rector/swiss-knife` | `check-commented-code`, `duplicated-code` (phpcpd successor) | `dead-comment`, `reimplemented-helper`, `copy-paste` |
| `jscpd` | duplication across PHP and JS in one run | `reimplemented-helper`, `copy-paste` |
| `deptrac` or PHPArkitect | layer rules and violations (deptrac: YAML layers; PHPArkitect: rules as PHP code) | Phase 4 |
| `phpmetrics` (HTML report), `phpmd` | coupling, complexity, unused private code | module order, Phase 4 |
| Infection | mutations no test detects | Phase 2 gaps, `test-slop` |
| `shipmonk/composer-dependency-analyser` | unused, shadow and misplaced Composer dependencies, in one fast tool | `unused-code` |
| php-cs-fixer (or pint) | `no_superfluous_phpdoc_tags`, `no_empty_phpdoc`, `no_empty_comment`, `no_unused_imports`, `no_useless_else`, `no_useless_return`, `simplified_if_return`, `no_useless_nullsafe_operator` | `narrating-comment`, `unused-code`, `deep-nesting`, `ceremony` |

Psalm projects: Psalm reports unused code by default since v6; use that instead of dead-code-detector. Don't use `sebastian/phpcpd` (archived) or `tomasvotruba/unused-public` (deprecated in favor of dead-code-detector). In Rector, skip the deprecated `naming`, `earlyReturn`, `instanceOf` and `if` sets; their rules moved into `codeQuality` and `codingStyle`.

## Lock in (Phase 5)

- PHPStan (Larastan on Laravel) raised one level at a time, with `phpstan-strict-rules`, `shipmonk/dead-code-detector`, `spaze/phpstan-disallowed-calls` and a `type-coverage` minimum. Shrink the baseline, never grow it.
- Rector `deadCode` and `codeQuality` in CI as `--dry-run`.
- php-cs-fixer or pint with the rules from the table above.
- `swiss-knife check-commented-code` and `duplicated-code` in CI; `composer-dependency-analyser` for dependencies.
- Never part of a cleanup pass, always a separate change with the full test suite: `declare_strict_types` (changes scalar coercion), Rector `typeDeclarations` and `privatization` (added types can throw `TypeError`, narrowed visibility breaks callers), swiss-knife `finalize-classes` (breaks mocks and subclasses).

## Greps

Leads with false positives; read every hit. Add the exclusion list as `-g '!path/**'`.

```bash
rg -nP '(?<![:>\w])(var_dump|print_r|dd|dump|ray)\(' -g '*.php' .
rg -n '@phpstan-ignore|@psalm-suppress' -g '*.php' .
rg -nU 'catch \(\\?(Exception|Throwable)|catch\s*\([^)]*\)\s*\{\s*\}' -g '*.php' .
rg -n '(^|=|return|\(|,|!)\s*@\$?\w+' -g '*.php' .
rg -n "\?: (\[\]|null|0|''|false)" -g '*.php' .
rg -n '\benv\(' -g '*.php' -g '!config/**' .
rg -n '\b\w*(Legacy|Deprecated|Old|V2|New)\b|\b(legacy|old|new|deprecated)[A-Z_]\w*' -g '*.php' .
rg -n -i 'TODO: implement|not implemented|mock for now|stub for now' -g '*.php' .
```
