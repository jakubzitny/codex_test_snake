import { type Direction, SnakeEngine, createSeededRng } from '@snake/core'

export type AppOptions = {
  width?: number
  height?: number
  cellSize?: number
  tickMs?: number
  seed?: number
  rng?: () => number
  doc?: Document
  wrapWalls?: boolean
  enemyCount?: number
  initialEnemies?: { x: number; y: number }[]
}

export type AppController = {
  engine: SnakeEngine
  tick: () => void
  restart: () => void
  dispose: () => void
}

const defaultOptions = {
  width: 20,
  height: 20,
  cellSize: 20,
  tickMs: 120,
}

const keyToDirection: Record<string, Direction> = {
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  w: 'Up',
  s: 'Down',
  a: 'Left',
  d: 'Right',
}

const snakeColorPalettes = {
  yellow: { head: '#ffe066', body: '#ffd43b' },
  green: { head: '#9bf6a0', body: '#5ac95f' },
  blue: { head: '#8ed6ff', body: '#3fa9f5' },
} as const

function drawCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  color: string,
): void {
  context.fillStyle = color
  context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
}

export function createGameApp(root: HTMLElement, options: AppOptions = {}): AppController {
  const doc = options.doc ?? globalThis.document
  const win = doc.defaultView

  if (!win) {
    throw new Error('Window is not available for this document.')
  }

  const width = options.width ?? defaultOptions.width
  const height = options.height ?? defaultOptions.height
  const cellSize = options.cellSize ?? defaultOptions.cellSize
  const tickMs = options.tickMs ?? defaultOptions.tickMs
  const rng =
    options.rng ?? (options.seed !== undefined ? createSeededRng(options.seed) : Math.random)

  const engine = new SnakeEngine(
    {
      width,
      height,
      wrapWalls: options.wrapWalls,
      enemyCount: options.enemyCount,
      initialEnemies: options.initialEnemies,
    },
    rng,
  )

  root.innerHTML = `
    <section class="game-shell">
      <header class="game-header">
        <h1 class="game-title">Classic Snake</h1>
        <div class="score" data-testid="score">Score: 0</div>
        <div class="mode" data-testid="wall-mode"></div>
        <div class="mode" data-testid="enemy-count"></div>
      </header>
      <div class="game-board">
        <canvas data-testid="board"></canvas>
      </div>
      <p class="game-over" data-testid="game-over">Game Over - Press Restart or R</p>
      <div class="controls">
        <p class="help">Use Arrow keys or WASD</p>
        <label>
          Snake color:
          <select data-testid="snake-color-select">
            <option value="yellow">Yellow</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
          </select>
        </label>
        <button type="button" data-testid="toggle-walls-button">Toggle Walls</button>
        <button type="button" data-testid="restart-button">Restart</button>
      </div>
    </section>
  `

  const scoreLabel = root.querySelector('[data-testid="score"]')
  const board = root.querySelector('[data-testid="board"]') as HTMLCanvasElement | null
  const gameOver = root.querySelector('[data-testid="game-over"]')
  const restartButton = root.querySelector('[data-testid="restart-button"]')
  const toggleWallsButton = root.querySelector('[data-testid="toggle-walls-button"]')
  const wallMode = root.querySelector('[data-testid="wall-mode"]')
  const enemyCount = root.querySelector('[data-testid="enemy-count"]')
  const snakeColorSelect = root.querySelector(
    '[data-testid="snake-color-select"]',
  ) as HTMLSelectElement | null

  if (
    !scoreLabel ||
    !board ||
    !gameOver ||
    !restartButton ||
    !toggleWallsButton ||
    !wallMode ||
    !enemyCount ||
    !snakeColorSelect
  ) {
    throw new Error('Could not initialize game UI.')
  }

  let snakePalette = snakeColorPalettes[snakeColorSelect.value as keyof typeof snakeColorPalettes]

  board.width = width * cellSize
  board.height = height * cellSize
  const context = board.getContext('2d')

  if (!context) {
    throw new Error('2D canvas context is not available.')
  }

  const render = (): void => {
    const state = engine.getState()

    context.fillStyle = '#0f1a0f'
    context.fillRect(0, 0, board.width, board.height)

    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        context.strokeStyle = '#162716'
        context.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }

    drawCell(context, state.food.x, state.food.y, cellSize, '#ff4d5a')
    state.enemies.forEach((enemy) => {
      drawCell(context, enemy.x, enemy.y, cellSize, '#8c52ff')
    })
    state.snake.forEach((segment, index) => {
      drawCell(
        context,
        segment.x,
        segment.y,
        cellSize,
        index === 0 ? snakePalette.head : snakePalette.body,
      )
    })

    scoreLabel.textContent = `Score: ${state.score}`
    wallMode.textContent = `Walls: ${engine.getWrapWalls() ? 'Wrap' : 'Solid'}`
    enemyCount.textContent = `Enemies: ${state.enemies.length}`
    gameOver.classList.toggle('visible', state.gameOver)
  }

  const tick = (): void => {
    engine.tick()
    render()
  }

  const restart = (): void => {
    engine.reset()
    render()
  }

  const toggleWalls = (): void => {
    engine.setWrapWalls(!engine.getWrapWalls())
    render()
  }

  const setSnakeColor = (): void => {
    snakePalette = snakeColorPalettes[snakeColorSelect.value as keyof typeof snakeColorPalettes]
    render()
  }

  const handleKeydown = (event: KeyboardEvent): void => {
    if (
      event.target instanceof win.Element &&
      event.target.closest('input, select, textarea, [contenteditable=""], [contenteditable="true"]')
    ) {
      return
    }

    const direction = keyToDirection[event.key]

    if (direction) {
      event.preventDefault()
      engine.setDirection(direction)
      return
    }

    if (event.key.toLowerCase() === 'r') {
      event.preventDefault()
      restart()
    }
  }

  win.addEventListener('keydown', handleKeydown)
  snakeColorSelect.addEventListener('change', setSnakeColor)
  toggleWallsButton.addEventListener('click', toggleWalls)
  restartButton.addEventListener('click', restart)

  const timer = win.setInterval(tick, tickMs)
  render()

  return {
    engine,
    tick,
    restart,
    dispose: () => {
      win.clearInterval(timer)
      win.removeEventListener('keydown', handleKeydown)
      snakeColorSelect.removeEventListener('change', setSnakeColor)
      toggleWallsButton.removeEventListener('click', toggleWalls)
      restartButton.removeEventListener('click', restart)
    },
  }
}
