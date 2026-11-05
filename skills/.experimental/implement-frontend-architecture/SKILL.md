---
name: implement-frontend-architecture
description: Places frontend code (React / React Native) into layered folders — core, features, screens, shared services — so each file lands in the home that matches its intent. Use when creating or moving a component, screen, hook, or feature service, when deciding which layer a piece of frontend code belongs to (even if the user never says "architecture" or "layers"), or when migrating an existing frontend into these layers.
metadata:
  credits:
    author: Rick
    url: "https://rick.nu"
---

# Frontend Architecture

Place code by intent, not convenience. A small number of **layers**, each with
one job, ordered from most reusable to most specific, keeps the codebase
navigable as it grows.

```
core        →  features      →  screens
(primitive)    (business)       (page)
most reusable ─────────────────────► most specific

shared services: app-wide, `src/services/`
```

This document describes the layers and how to choose one for a new piece of
code. To move an existing codebase into these layers, follow
[`references/migration.md`](references/migration.md).

## Choosing a layer

Start with the simplest question: **what job does this code do?** The answer
picks the layer. When in doubt, prefer the more specific layer and promote it
later: it is cheaper to promote code towards `core` than to untangle something
wrongly made generic.

1. **A generic, stateless, styled UI primitive** (button, icon, input, text,
   list) that carries no business meaning → **core**.
2. **Business-specific functionality**: anything that knows what the app *does*
   (an order step, a profile card, a chat bubble, the rules and data behind
   them) → **features**.
3. **A full page** that composes feature components to display on a route →
   **screens**.
4. **App-wide code that is not business-specific** (API client, auth/session,
   audio engine, storage, theme, config) → **shared services**.

The boundary test: *would this code make sense in a different app?* Yes →
shared services. It speaks the product's vocabulary → feature services.

Throughout this skill, **promote** means moving code towards `core` (more
reusable) and **demote** means moving it towards `screens` (more specific).

## Core components

The reusable foundation. A core component is **stand-alone**: it renders well
with no knowledge of the app's business, and its behaviour changes only through
props and styling hooks. There is no shared UI kit to fall back on (web and
native must share the same primitives), so the project builds its own.

A core component is **generic** and **stateless** — no business logic, no API
calls, no app context — **styled by default**, configured through props
(`variant`, `size`), and accepting `className` overrides for positioning at the
call site.

Organise the `src/core/` folder by component category, following the Chakra UI
split (layout, typography, button, form, display, feedback, …):

```
src/core/
├── layout/
├── typography/
│   ├── Heading.tsx
│   ├── Link.tsx
│   ├── List.tsx
│   └── Text.tsx
├── button/
├── form/
├── display/
│   └── Icon.tsx
└── …
```

Build a core component only when it is needed: do not pre-build a full kit.
When an existing component is already generic, move it into `src/core/`.

Not every core component is an atom. Larger, self-contained primitives (a
markdown renderer, a data table) are still core (generic, stateless, no
business logic), but they warrant their own folder beside the category folders
rather than being forced into `display/`.

> A core component that starts to know about the business (it renders a specific
> product, it reads a specific context) has outgrown the layer. Demote it to
> `src/features/`.

## Feature components

Business-specific functionality, grouped by **feature**: the areas the app
actually deals with (e.g. an account area, an ordering flow, a chat). The rule
of thumb: a component belongs to the feature whose vocabulary it speaks.

A feature is more than a single file. It is a small cluster of the moving parts
that implement one piece of the feature's functionality:

- the **component** itself,
- its **sub-components** (smaller pieces only this component uses),
- a **context** and its **hooks** where shared state is needed,
- its **services**: the feature's business rules, repositories and persistence,
- **tests**.

Cluster these together instead of scattering them across global folders:

```
src/features/Account/
├── hooks/
│   └── useAccountContext.tsx
├── services/
│   └── formatFullName.ts
├── Profile/
│   ├── Card.tsx      (exports AccountProfileCard)
│   └── Header.tsx    (exports AccountProfileHeader)
└── Context.tsx       (exports AccountContext)
```

Sub-components live in a folder named after what they build (`Profile/`), and
export names prefixed with the feature name (`AccountProfileCard`). Never create
a new `components/` folder inside a feature: the feature folder itself already
groups the components.

### Feature services

A feature's services live in `features/<Feature>/services/` and hold everything
non-React it needs: business rules, repositories, persistence, formatters that
speak the feature's vocabulary. One exported function per file.

A feature may import another feature's `services/` and `hooks/`: one bounded
context depending on another. A feature never imports another feature's
components; promote the component to `src/core/`, or move the shared part out
to the feature root.

### Sub-features

A feature that grows too large splits into sub-features, each getting its own
folder (with its own `hooks/` and `services/`):

```
src/features/OrderFlow/
├── Step/          (a sub-feature)
├── hooks/
└── services/
```

Splitting is a judgement call the whole team owns. Two signals to act on:

- a feature folder becomes too large or unclear → split into sub-features;
- a component is also used by other components → move it out to the feature
  root, and once it becomes fully generic, promote it to `src/core/`.

## Shared services

Shared services live in `src/services/`, beside `src/core/`, `src/features/` and
`src/screens/`. This location holds app-wide code that is not business-specific:
the API client, auth/session, an audio engine, storage, theme, config, general
formatters. Keep it in one place rather than forcing it into a feature.

Both locations are called `services/`. Qualify them: **shared services**
(app-wide) versus **feature services** (owned by one feature).

## Screens

The middle layer between routing and the feature components. A screen
**composes** the components it needs to display and handles data-fetching; it
owns no business logic and no styling of its own beyond positioning the blocks
it composes in a grid or page layout.

A screen:

- imports and arranges **feature** components,
- owns **data-fetching** for the page,
- adds **no styling** except layout/positioning of the blocks it arranges.

Route files (e.g. an Expo Router `src/app/` file) stay thin wrappers that import
a screen and render it: no logic, no styling, no hooks.

## Conventions that cut across layers

These follow from the layer model and apply wherever the relevant code sits:

- **Forms belong to a feature**, not to `src/components/`. A screen that shows a
  form fetches data and composes the feature's form component; it does not
  inline the form fields.
- **Screens own data-fetching; feature components own presentation and feature
  state.** A feature component may fetch, but it does so for itself, not for a
  page.
- **Promote, don't duplicate.** A component used in two features should be moved
  up, not copied. A component that becomes fully generic should move to
  `src/core/`.
- **Prefer `src/features/` over a new global folder.** The shared services
  location is for app-wide infrastructure, not a home for feature logic.
- **Repo conventions win on names, the skill wins on intent.** Folder names and
  existing layout come from the repo's own docs; where a repo convention
  contradicts the layer model, surface the conflict before moving anything.
- **Apply the Boy Scout Principle.** When you touch code that lives in the wrong
  place, move it as part of the same change; don't block new work on a full
  cleanup.
