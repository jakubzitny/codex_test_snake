# Classic Snake Monorepo

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2ea44f?logo=githubpages)](https://jakubzitny.github.io/codex_test_snake/)
[![CI (main)](https://github.com/jakubzitny/codex_test_snake/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/jakubzitny/codex_test_snake/actions/workflows/ci.yml?query=branch%3Amain)
[![Pages Deploy](https://github.com/jakubzitny/codex_test_snake/actions/workflows/pages.yml/badge.svg)](https://github.com/jakubzitny/codex_test_snake/actions/workflows/pages.yml)
[![Pages Smoke](https://github.com/jakubzitny/codex_test_snake/actions/workflows/playwright-pages.yml/badge.svg)](https://github.com/jakubzitny/codex_test_snake/actions/workflows/playwright-pages.yml)
[![Quality Guardrails](https://github.com/jakubzitny/codex_test_snake/actions/workflows/quality-guardrails.yml/badge.svg)](https://github.com/jakubzitny/codex_test_snake/actions/workflows/quality-guardrails.yml)

TypeScript monorepo containing a classic Snake game frontend and a shared game engine.

🌐 Live app: https://jakubzitny.github.io/codex_test_snake/

## Automation policy

- Dependabot PRs can auto-merge after required checks pass.
- PRs that touch `.github/workflows/*` are intentionally excluded from auto-merge and stay manual.

## Stack

- pnpm workspaces
- TypeScript
- Vite (frontend)
- Biome (lint + formatting)
- Jest (unit tests)
- Playwright (end-to-end tests)
- GitHub Actions (CI + Pages deploy)

## Quality Guardrails

- Bundle-size budget check on CI (`BUNDLE_MAX_BYTES=250000` for largest JS asset)
- Lighthouse smoke against deployed GitHub Pages URL on non-PR workflow runs

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
make test-e2e-ui
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

4. Enable GitHub Pages from branch:
- Repo Settings -> Pages -> Build and deployment -> Source: `Deploy from a branch`
- Branch: `gh-pages` and folder: `/(root)`

5. Allow workflows to push to `gh-pages`:
- Repo Settings -> Actions -> General -> Workflow permissions -> `Read and write permissions`

After pushing to `main` (or `master`), `.github/workflows/pages.yml` deploys the built app.

## PR Review App (GitHub Pages)

- Workflow: `.github/workflows/pages-preview.yml`
- Preview URL format: `https://<user>.github.io/<repo>/pr-preview/pr-<number>/`
- A sticky PR comment is posted automatically with the preview link and updated on each push.
