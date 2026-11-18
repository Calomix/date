# AGENTS.md

## What this is

Static vanilla HTML/CSS/JS site ("¿Salimos?") deployed to GitHub Pages at `Calomix/date`. No build step, no bundler, no framework, no package manager. Open `index.html` directly or serve locally with `python -m http.server 8000`.

## Architecture

- `index.html` — Single page, all screens are `<section>` elements toggled by `.active` class
- `script.js` — All app logic (~2000 lines). Config, wizard, Telegram integration, canvas share image, confetti
- `style.css` — Pastel theme, mobile-first. CSS variables in `:root` control the palette
- `emojis.js` — Auto-generated from Unicode CLDR via `generate-emoji-data.mjs`. ~4,200 emojis with English names. Do NOT hand-edit; regenerate with `node generate-emoji-data.mjs`
- `config.js` — Runtime config (versions + `adminPinHash`). Written by the app via GitHub API or downloaded as a file. **Never contains secrets** — Telegram bot token and chat ID live only in browser localStorage (`dateTelegramBotToken`, `dateTelegramChatId`)
- `push.bat` — One-shot git add/commit/push to `main` on GitHub. Always commits as "Update site"

## URL routing (key to understanding screen flow)

| URL pattern | Screen shown |
|---|---|
| `?config=1` | Config editor, behind PIN gate (`config.adminPinHash`; first visit sets the PIN) |
| `?v=<id>` | Invite screen for that version |
| No params | Landing (empty card, no form) |

The app **never shows a form** without a `?v=` param. This is intentional — each person gets their own version link.

## Multi-version system

`config.versions[]` holds independent form configs (title, subtitle, steps, no-messages). The config UI lets users add/duplicate/delete versions. Each version has an `id` and `name`; only `id` is matched via `?v=`.

## Conventions

- Language: UI text is in Spanish (Rioplatense). Keep all user-facing strings in Spanish
- No transpilation — write browser-compatible JS directly (no optional chaining in older code paths, etc.)
- Touch-first: the "No" button uses `touchstart`/`pointerdown` with `e.preventDefault()` — preserve these when editing invite logic
- Emoji handling: `splitEmojiAndText()` separates trailing emojis from option text. Options format is `"Text emoji"` (emoji at end, space-separated)
- The `savedConfig` global in `config.js` is the fallback when localStorage is empty — `script.js` reads it via `loadSavedConfig()`

## Deployment

`push.bat` does `git add . && git commit -m "Update site" && git push -u origin main`. GitHub Pages serves from `main` root. There is no CI, no preview deploys, no branch protection.

## Gotchas

- `config.js` is both source-of-truth and auto-generated — the web UI can overwrite it via GitHub API. Don't hand-edit it while the config UI is open
- Never put `telegramBotToken` / `telegramChatId` (or any secret) in `config.js` or git. They are localStorage-only (`dateTelegramBotToken`, `dateTelegramChatId`)
- `escapeHtml()` escapes `& < > " '`. Use it for any config string that lands in `innerHTML` / attributes. `sanitizeVersion`, `normalizeGridClass`, `normalizeStepKey`, `clampText` are the content allowlists
- `?config=1` is gated by `adminPinHash` (SHA-256 of a PIN, stored in `config.js`). Clear `adminPinHash` to reset the PIN
- The `getEmojiForLabel()` function in `script.js` maps step titles to emojis for the share image. If you add new default step titles, add corresponding entries there
- `drawShareImage()` renders a canvas-based summary card. It depends on the Quicksand Google Font being loaded — the share image will use fallback fonts if offline
- Grid layout classes matter: `options-grid` (2-col), `options-grid-three` (2-col with last item centered), `options-stack` (vertical list). These map to CSS classes in `style.css`
- Emoji picker shows ~160 popular emojis by default; typing searches the full ~4,200 set (capped at 300 results). To edit popular emojis, update `POPULAR_EMOJIS` in `script.js`