# F1 2026 Race Strategy Simulator

A playful React + Vite race strategy simulator for the 2026 Formula 1 season.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jwilliams223/f1-2026-strategy-simulator&project-name=f1-2026-strategy-simulator&repository-name=f1-2026-strategy-simulator)

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints, usually `http://localhost:5173`.

## Build

```bash
npm run build
```

## Deploy to Vercel

This project is ready for Vercel as a Vite app. Vercel should auto-detect the same settings, and `vercel.json` pins them explicitly:

- Framework: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Click-only path:

1. Click the **Deploy with Vercel** button above.
2. Choose your Vercel account/team.
3. Keep the detected Vite settings.
4. Click **Deploy**.

## Project structure

```text
src/
  data/
    circuits.js      24 Grand Prix entries
    teams.js         11 team entries
  utils/
    simulation.js    rule-based simulator
  App.jsx            React UI
  styles.css         F1 broadcast-style dark theme
```
