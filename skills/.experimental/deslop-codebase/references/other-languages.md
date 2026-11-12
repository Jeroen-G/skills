# Other languages

Map each rule in `rules.md` to the language's equivalent, and use its type checker and linter as verification.

- **Python:** `# type: ignore`, `cast()`, `Any` (`type-silencer`); `print` (`debug-residue`); `except Exception: pass` (`defensive-wrapper`); `if x is None` on a non-Optional (`impossible-guard`). Lock in with ruff (incl. `ERA001` commented-out code) and mypy `--strict`.
- **Go:** `any` and blind type assertions (`type-silencer`); `fmt.Println` (`debug-residue`); `if err != nil { return nil }` that drops the error (`defensive-wrapper`). Lock in with golangci-lint (`unused`, `unparam`, `nilerr`).
- **Any language:** `jscpd` (duplication, many languages), `lizard` (complexity), Semgrep (custom slop patterns as rules).
