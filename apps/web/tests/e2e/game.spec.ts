import { expect, test, type Page } from '@playwright/test'

async function getBoardCellColor(page: Page, x: number, y: number): Promise<string> {
  return page.evaluate(
    ([cellX, cellY]) => {
      const board = document.querySelector('[data-testid="board"]') as HTMLCanvasElement | null

      if (!board) {
        throw new Error('Board canvas not found.')
      }

      const context = board.getContext('2d')

      if (!context) {
        throw new Error('2D canvas context not available.')
      }

      const params = new URLSearchParams(window.location.search)
      const width = Number(params.get('width') ?? '20')
      const height = Number(params.get('height') ?? '20')
      const cellWidth = board.width / width
      const cellHeight = board.height / height
      const pixelX = Math.floor(cellX * cellWidth + cellWidth / 2)
      const pixelY = Math.floor(cellY * cellHeight + cellHeight / 2)
      const [red, green, blue] = context.getImageData(pixelX, pixelY, 1, 1).data
      return `${red},${green},${blue}`
    },
    [x, y] as const,
  )
}

test('renders with URL params and can restart after game over', async ({ page }) => {
  await page.goto('?width=5&height=5&tick=120&seed=1&enemies=0')

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
  await page.goto('?width=5&height=5&tick=120&seed=1&enemies=0')

  await page.keyboard.press('ArrowUp')
  await expect(page.getByTestId('game-over')).toHaveClass(/visible/, { timeout: 5_000 })

  await page.keyboard.press('r')
  await expect(page.getByTestId('game-over')).not.toHaveClass(/visible/)
  await expect(page.getByTestId('score')).toHaveText('Score: 0')
})

test('handles repeated restart cycles without breaking UI state', async ({ page }) => {
  await page.goto('?width=5&height=5&tick=120&seed=1&enemies=0')

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

test('wrap mode allows crossing walls without game over', async ({ page }) => {
  await page.goto('?width=5&height=5&tick=70&seed=1&enemies=0&wrap=1')

  await expect(page.getByTestId('wall-mode')).toHaveText('Walls: Wrap')
  await page.waitForTimeout(1500)
  await expect(page.getByTestId('game-over')).not.toHaveClass(/visible/)
})

test('enemy collision ends the game', async ({ page }) => {
  await page.goto('?width=5&height=5&tick=120&enemies=0&enemyPositions=3,2')

  await expect(page.getByTestId('enemy-count')).toHaveText('Enemies: 1')
  await expect(page.getByTestId('game-over')).toHaveClass(/visible/, { timeout: 2_000 })
})

test('can toggle walls mode from UI', async ({ page }) => {
  await page.goto('?width=5&height=5&tick=120&seed=1&enemies=0&wrap=0')

  const wallMode = page.getByTestId('wall-mode')
  const toggleButton = page.getByTestId('toggle-walls-button')

  await expect(wallMode).toHaveText('Walls: Solid')
  await toggleButton.click()
  await expect(wallMode).toHaveText('Walls: Wrap')
  await toggleButton.click()
  await expect(wallMode).toHaveText('Walls: Solid')
})

test('can change snake color from UI', async ({ page }) => {
  await page.goto('?width=5&height=5&tick=120&seed=1&enemies=0')

  const snakeColorSelect = page.getByTestId('snake-color-select')

  await expect(snakeColorSelect).toHaveValue('yellow')
  await expect.poll(async () => getBoardCellColor(page, 1, 2)).toBe('255,212,59')

  await snakeColorSelect.selectOption('green')
  await expect.poll(async () => getBoardCellColor(page, 1, 2)).toBe('90,201,95')

  await snakeColorSelect.selectOption('blue')
  await expect.poll(async () => getBoardCellColor(page, 1, 2)).toBe('63,169,245')
})
