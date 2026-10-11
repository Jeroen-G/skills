# GLOSSARY.md Format

`GLOSSARY.md` lives in `/.agents/docs/` next to `CONTEXT-MAP.md` and holds the project-wide ubiquitous language: terms used across more than one context. Context-specific terms belong in the owning context's `CONTEXT.md` instead. Each term has exactly one home — never define a cross-context term in a `CONTEXT.md`.

## Structure

```md
# {Project} Glossary

{One or two sentence description of what this glossary covers and why it exists.}

## Terms

**Order**:
A request to start a product subscription, owned by the product line that sells it; each product line has its own order and there is no shared order aggregate.
_Avoid_: contract, subscription, policy

**Contract**:
A formal agreement created after an order is accepted or fulfilled; the term has a different sense per product line.
```

## Rules

- **Cross-context only.** Add a term only when it is used in more than one context (shared kernel, shared handle, or ambiguous across contexts). If a term belongs to a single context, it lives in that context's `CONTEXT.md` instead.
- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences. Define what the term IS, not what it does.
- **Use the glossary's own terms inside definitions.** Once a term is in the glossary, prefer it everywhere — including inside other definitions and in `CONTEXT.md` files.
- **Group under subheadings** when natural clusters emerge (e.g. `## Shared catalog`, `## Identity`). A flat list is fine when terms cohere.
- **Flag ambiguities explicitly.** If a term is used with different senses across contexts, note the resolution: "In this codebase, 'Contract' means a mobile subscription contract, an energy supply contract, or a home travel contract, depending on the owning product line."
- **Revise as understanding deepens.** Update definitions in place; do not leave stale entries.
