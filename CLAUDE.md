# LaylaWorld

Fun educational games for Layla — a collection of kid-friendly web games for a 2nd grader.

## Games
- **Hangman** — Word guessing with difficulty levels, categories, achievements
- **MathQuest** — Math practice
- **Spelling Bee** — Spelling practice
- **Map Explorer** — Geography game, click SVG maps to find states/countries

## Stack
- TypeScript, Vite
- Web Audio API (sound effects)
- LocalStorage (progress tracking)

## Deployment
- Hosted on **Vercel** at **laylaworld.com**
- **Auto-deploys** from `main` branch — just push to main
- No manual deploy commands needed (no wrangler, netlify, etc.)
- Build command: `npm run build` (Vite)

## New Game Notifications
When a new game is deployed to prod, send Layla an iMessage:
- Recipient: layla.akilas@gmail.com
- Use a heredoc to avoid quoting issues:
  ```
  osascript <<'APPLESCRIPT'
  tell application "Messages"
    send "<message>" to buddy "layla.akilas@gmail.com" of (service 1 whose service type is iMessage)
  end tell
  APPLESCRIPT
  ```
- Keep the message short, fun, and kid-friendly (e.g. "Hey Layla! A new game just dropped on laylaworld.com — Map Explorer! Can you find all 50 states? 🗺️")
