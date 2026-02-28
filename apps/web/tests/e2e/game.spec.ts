import { expect, test } from '@playwright/test'

test('renders and can restart after game over', async ({ page }) => {
  await page.goto('/?width=5&height=5&tick=30&seed=1')

  await expect(page.getByRole('heading', { name: 'Classic Snake' })).toBeVisible()
  await expect(page.getByTestId('score')).toHaveText('Score: 0')
  await expect(page.getByTestId('board')).toBeVisible()

  await page.keyboard.press('ArrowUp')
  await expect(page.getByTestId('game-over')).toHaveClass(/visible/, { timeout: 5_000 })

  await page.getByTestId('restart-button').click()
  await expect(page.getByTestId('game-over')).not.toHaveClass(/visible/)
  await expect(page.getByTestId('score')).toHaveText('Score: 0')
})
