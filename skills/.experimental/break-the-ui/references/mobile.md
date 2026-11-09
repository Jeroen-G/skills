# Mobile driver: agent-device

Start with `agent-device open <app> --foreground` and follow the agent-device skill's act-then-verify loop. For gestures, rotation, logs or app lifecycle, run `agent-device help <topic>`; the help output is the source of truth for exact flags.

- **Oracle checks**: read device logs after each action for crashes, ANRs and exceptions; read the snapshot text for junk values.
- **Evidence**: `agent-device screenshot` on every break; note the snapshot diff.
- **layout**: rotate the device; set the largest OS font size if the help topic supports it.
- **navigation**: use `back --settle`; background and foreground the app; close and relaunch.
- **timing**: repeat `press` on the same ref without `--settle` to simulate rapid taps.
- **network**: toggle airplane mode or the simulator's network conditioning if available; otherwise stop the backend.
- **a11y**: check every interactive element in `snapshot -i` has a label or role.

When the snapshot reports AX unavailable, fall back to screenshots and coordinates, as the agent-device skill describes.
