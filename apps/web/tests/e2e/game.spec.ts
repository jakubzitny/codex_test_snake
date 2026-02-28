import { expect, test } from '@playwright/test'

test('renders with URL params and can restart after game over', async ({ page }) => {
  await page.goto('?width=5&height=5&tick=120&seed=1')

  await expect(page.getByRole('heading', { name: 'Classic Snake' })).toBeVisible()
  await expect(page.getByTestId('score')).toHaveText('Score: 0')
  await expect(page.getByTestId('board')).toBeVisible()

  const board = page.getByTestId('board')
  await expect(board).toHaveJSProperty('width', 100)
  await expect(board).toHaveJSProperty('height', 100)

  await page.keyboard.press('ArrowUp')
  await expect(page.getByTestId('game-over')).toHaveClass(/visible/, { timeout: 5_000 })

  await page.getByTestId('restart-button').click()
  await expect(page.getByTestId('game-over')).not.toHaveClass(/visible/)
  await expect(page.getByTestId('score')).toHaveText('Score: 0')
})

test('supports keyboard restart with R key', async ({ page }) => {
  await page.goto('?width=5&height=5&tick=120&seed=1')

  await page.keyboard.press('ArrowUp')
  await expect(page.getByTestId('game-over')).toHaveClass(/visible/, { timeout: 5_000 })

  await page.keyboard.press('r')
  await expect(page.getByTestId('game-over')).not.toHaveClass(/visible/)
  await expect(page.getByTestId('score')).toHaveText('Score: 0')
})

test('handles repeated restart cycles without breaking UI state', async ({ page }) => {
  await page.goto('?width=5&height=5&tick=120&seed=1')

  const gameOver = page.getByTestId('game-over')
  const restart = page.getByTestId('restart-button')

  for (let i = 0; i < 3; i += 1) {
    await page.keyboard.press('ArrowUp')
    await expect(gameOver).toHaveClass(/visible/, { timeout: 5_000 })
    await restart.click()
    await expect(gameOver).not.toHaveClass(/visible/)
  }

  await expect(page.getByTestId('score')).toHaveText('Score: 0')
})
