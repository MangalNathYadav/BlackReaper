# BlackReaper

Kaneki-inspired productivity + psychology dashboard (vanilla JS + Firebase Auth + RTDB). Mobile‑first, no frameworks.

## Progress

### Task 1 — Boot & Firebase (Done)
Delivered core auth (email + anonymous), basic index page, Firebase modular initialization, RTDB helpers, security rules.

### Task 2 — Themes & Layout (Done)
Added CSS token themes (`theme.css`), base layout & resets (`base.css`), component styling (`components.css`), and mode system (`mode.js`) with persistent toggle via localStorage.

### Task 3 — Transformation Overlay + Sprites (Progress)
Placeholder sprite sheets (`sprites.js`), transformation controller (`transform.js`), overlay CSS (in `base.css`), animated mode switching via `playTransformation(nextMode)`, plus inactivity auto-switch: 5 min idle in Human triggers a 10s cancelable countdown overlay before auto-transforming to Ghoul.

### Task 4 — Dashboard Tasks & RC Meter (Partial)
Added `dashboard.html` with tasks panel, RC meter, logout, and `tasks.js` implementing CRUD, inline editing, completion awarding RC (1–5) using transactions + stat increment.

### Task 5 — Pomodoro (Done)
Enhanced `pomodoro.js`: adjustable work/break lengths, pause/resume, session counter, local persistence, audio cue, ARIA live updates, +3 RC per completed work session (single award) with stat increment.

### Task 6 — Quotes + Corrupted Thought (Done)
`quotes.js` now serves clean quotes in Human mode, injects corrupted thoughts or corrupted variants in Ghoul mode (35% probability), with layered glyph glitches.

### Task 7 — Journal (Partial → Enhanced)
Added `journal.html` + `journal.js`: Ghoul-only access gate, mood select, glitch typing effect, save entries to `/journals/{uid}` with visibility 'ghoul', live list rendering, plus entry edit & delete actions (client-side) with `editedAt` timestamp.

### Task 8 — Ghoul Chat + Presence (Partial → Enhanced)
Added `chat.js` integrated into `journal.html` with ghoul-gated global chat, realtime messages (last ~80 shown) with timestamps, simple profanity masking placeholder, presence list using `/presence`, basic online user display. (Future: server-side pruning & moderation.)

### Task 9 — AI Battle (Partial → Enhanced)
Added `battle.html` + `battle.js`: stat generation, turn order by SPD, damage formula, victory handling with +5 RC (60s cooldown persisted via `stats.lastBattleWinTs`), battle outcome saved to `lastAI` plus rolling history (`/battles/{uid}/history/{timestamp}`) capped client-side (shows 20), win/loss stats increment.

### Task 10 — Profile & Polishing (Partial)
Added `profile.html` + `profile.js`: view & edit display name, avatar (Base64, 25KB cap), preferred mode (applies instantly), stats overview (RC, tasks, pomodoros, wins, losses). Navigation links integrated across pages.

#### Recent Polishing Additions
- Journal: entry edit & delete, edited timestamp.
- Chat: timestamps, basic profanity masking, expanded recent message window.
- Battle: persisted reward cooldown + rolling history list.
- Accessibility: skip links, improved RC meter ARIA (`aria-valuetext`), reduced outline noise.

Upcoming tasks will layer transformation overlay, dashboard features, journal, chat, battle, profile polishing.

## Current Files
- `index.html` – auth (login/signup/guest) + mode toggle.
- `firebase/config.js` – Firebase configuration.
- `firebase/rules.json` – RTDB security rules.
- `assets/js/app.js` – bootstrap + page routing logic.
- `assets/js/auth.js` – auth helpers & presence init.
- `assets/js/db.js` – RTDB helpers & RC award placeholder.
- `assets/js/mode.js` – mode persistence + toggle + event dispatch.
- `assets/css/theme.css` – mode token variables.
- `assets/css/base.css` – resets & layout utilities.
- `assets/css/components.css` – form/card/button styling.

## Mode API
`applyMode(mode)` sets `<html data-mode>` and persists; dispatches `modechange` event with `{ detail:{ mode } }`.

## Running Locally / Deploy
Host statically (e.g., Firebase Hosting). Enable Email/Password + Anonymous auth in Firebase Console. Deploy rules:

```
firebase deploy --only hosting,database
```

## Next
Finish Task 3 polish (real sprites) & extend Task 4 (add Pomodoro + quotes panels) before moving to Task 5.
