import { defineConfig } from '@playwright/test'

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? 'https://jakubzitny.github.io/codex_test_snake/'

export default defineConfig({
  testDir: './apps/web/tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL,
    headless: true,
  },
})
