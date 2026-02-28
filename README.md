# Classic Snake Monorepo

TypeScript monorepo containing a classic Snake game frontend and a shared game engine.

## Stack

- pnpm workspaces
- TypeScript
- Vite (frontend)
- Biome (lint + formatting)
- Jest (unit tests)
- Playwright (end-to-end tests)
- GitHub Actions (CI + Pages deploy)

## Monorepo Layout

- `apps/web`: browser game UI
- `packages/snake-core`: reusable game engine logic

## Quick Start

```bash
make install
make dev
```

The app runs at `http://localhost:5173`.

## Commands

```bash
make lint
make format
make format-check
make test-unit
make test-e2e
make build
make check
```

## GitHub Setup

1. Initialize git and commit if needed:

```bash
git init
git add .
git commit -m "feat: scaffold snake monorepo"
```

2. Create a GitHub repository and add it as remote:

```bash
git remote add origin git@github.com:<your-user>/<your-repo>.git
```

3. Push:

```bash
git branch -M main
git push -u origin main
```

4. Enable GitHub Pages from Actions:
- Repo Settings -> Pages -> Build and deployment -> Source: `GitHub Actions`

After pushing to `main` (or `master`), `.github/workflows/pages.yml` deploys the built app.
