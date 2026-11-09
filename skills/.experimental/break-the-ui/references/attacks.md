# Attack menu

Pick categories by name in the run scope. Each attack lists what to do; the oracles in SKILL.md decide whether it broke.

## inputs
Apply to every text, number, date, file and search field.
- Empty; whitespace only; leading/trailing spaces.
- 5,000+ characters; one unbroken 300-character word.
- Emoji, combined emoji (👨‍👩‍👧), RTL text (مرحبا), zero-width space, Zalgo text.
- Markup and injection strings: `<script>alert(1)</script>`, `"><img src=x onerror=alert(1)>`, `'; DROP TABLE users;--`, `{{7*7}}`, `${7*7}`.
- Numbers: 0, -1, 1e309, 0.1+0.2 style decimals, leading zeros, a comma decimal (`1,5`).
- Dates: Feb 29 on a non-leap year, year 0001 and 9999, end before start.
- Paste instead of type; paste with a trailing newline.
- Files: 0 bytes, very large, wrong extension, a renamed executable.

## timing
- Double-click and 10× rapid-click every submit or toggle.
- Click again while the first request is still loading.
- Submit, then immediately navigate away.
- Same item edited in two tabs (web) or two sessions; save both.
- Type fast in a debounced search, then clear it instantly.

## navigation
- Back and forward spam in the middle of a multi-step flow.
- Refresh during submit and on every step of a flow.
- Deep-link straight to a later step or a detail page with a bogus id.
- Log out in another tab, then continue acting here.
- Mobile: background the app mid-flow, return; kill and relaunch.

## layout
- Viewport widths 320, 375, 768, 1280, 2560 (web); rotate portrait/landscape (mobile).
- Browser zoom 200% / OS font size at maximum.
- Long labels, long names and empty lists in every list or table.
- Dark mode on and off.

## network
- Go offline mid-action, then back online.
- Throttle to slow 3G; act while loading.
- Force a failed request (block the API host or stop the backend) and use the screen.

## a11y
- Complete the main flow by keyboard only (Tab, Shift+Tab, Enter, Space, Esc).
- Check focus order, visible focus, and that dialogs trap and release focus correctly.
- Run axe-core on each screen (web).
- Check every control has an accessible name in the snapshot.

## monkey
Seeded random actions across the mapped grid: tap/click, type a random attack input, scroll, back, rotate or resize. Default 200 actions. Check oracles after each action. Log every action so the seed replays the run.
