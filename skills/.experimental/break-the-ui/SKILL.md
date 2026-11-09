---
name: break-the-ui
description: Adversarial UI stress test that drives a real web page or mobile app and tries to break it. Use when the user asks to break, stress test, monkey test, chaos test, abuse or torture a UI, screen, form or flow, or to find edge-case bugs by hand rather than by writing test code. Covers web (agent-browser) and iOS/Android (agent-device).
---

# Break the UI

You are a hostile user. The run succeeds when you find **breaks**, not when the UI survives. A break is any failed oracle (below), seen with your own eyes in the running app.

## 1. Scope the run

Settle these before acting. Take them from the prompt; ask only for the target if it is missing.

- **Target**: a URL (web) or an app id / name (mobile). Localhost and staging are the default; for production, get explicit confirmation first, because attacks submit real data.
- **Surface**: the screens or flows to attack. Default: whatever the user named, else the main flow from the landing screen.
- **Attacks**: categories from [references/attacks.md](references/attacks.md). Default: all. The user can pick (`inputs, timing`) or exclude (`-network`).
- **Seed**: an integer for monkey runs. Default: current unix time. Print it so the run can be replayed.

Done when target, surface, attack list and seed are written at the top of your working notes.

## 2. Load the driver

- Web: run `agent-browser skills get core`, then follow [references/web.md](references/web.md).
- Mobile: follow the agent-device skill, then [references/mobile.md](references/mobile.md).

Done when the target is open and you have a snapshot with element refs.

## 3. Map the surface

Walk the surface once on the happy path. List every interactive element and every state change (submit, navigation, async load). This list is your attack grid.

Done when each element in scope has a row in the grid.

## 4. Attack

For each row in the grid, apply every selected attack that fits the element. After **every** action, check the oracles. Keep an action log: step number, action, element, result.

For monkey attacks, generate the action order from the seed so the same seed replays the same run.

On a break: screenshot, capture console/log output, record minimal repro steps, then reset to a clean state and continue. Never stop at the first break.

Done when every grid row × selected attack is marked `break`, `held`, or `n/a` with a reason.

## Oracles

A break is any of these:

- Crash, blank screen, frozen UI, or an unrecoverable state.
- Unhandled console error or exception (web), or a crash/ANR log line (mobile).
- Duplicate side effect: two records, two charges, two messages from one intent.
- Rendered junk: `undefined`, `null`, `NaN`, `[object Object]`, raw template tags, or escaped markup shown as HTML.
- Layout failure: overlapping, clipped or off-screen controls; horizontal page scroll; text overflowing its box.
- Lost state: input or progress gone after back, refresh, rotate or app-switch when the user would expect it kept.
- Silent failure: an action fails with no visible message, or the message gives the user no way forward.
- Validation gap: invalid input accepted, or valid input rejected.
- Accessibility failure: unreachable by keyboard, focus trap, missing label, axe-core violation (serious or critical).

## 5. Report

Write the report with [references/report.md](references/report.md). Sort breaks by severity. Include the seed and the held/n-a counts so the user sees coverage, not just failures.

Done when every break has repro steps and evidence, and the report is saved where the user can open it.
