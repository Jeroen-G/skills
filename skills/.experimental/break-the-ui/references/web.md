# Web driver: agent-browser

The CLI is the source of truth for exact commands: `agent-browser skills get core --full`. This file only maps attacks to capabilities.

- **Oracle checks**: read console messages and page errors after every action; take a snapshot to read rendered text for junk values.
- **Evidence**: screenshot on every break; record video for timing and monkey runs.
- **layout**: set the viewport size per width in the attack list; use a full-page screenshot to spot horizontal scroll.
- **timing / two tabs**: open a second tab or session on the same item.
- **network**: use the CLI's offline / throttling / request-blocking options if present; otherwise stop the backend and say so in the report.
- **a11y**: inject axe-core with an eval of `https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js` and run `axe.run()`; read the result. Use keyboard press commands for the keyboard-only pass.
- **inputs**: fill fields with the CLI fill command; for paste, set the value through the clipboard if the CLI supports it, else note "typed, not pasted".

If a capability is missing in the installed version, mark that attack `n/a: driver lacks X` rather than faking it.
