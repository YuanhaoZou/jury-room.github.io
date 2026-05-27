# Jury Room

Split-screen product copy tester with a live jury of personas. Jurors react in real time when your landing page includes their trigger phrases (for example, **agentic harnesses** upsets the old-school PM).

## Run locally

```bash
cd jury-room-web
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

## Features

- **Left pane** — Product site preview with color-coded phrase highlights
- **Right pane** — Overcooked-style jurors that panic or calm based on your copy
- **Customize jury** — Add demographics, trigger phrases, colors, and dialogue
- **Persistence** — Settings saved in `localStorage`
