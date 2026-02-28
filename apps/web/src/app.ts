import { type Direction, SnakeEngine, createSeededRng } from '@snake/core'

export type AppOptions = {
  width?: number
  height?: number
  cellSize?: number
  tickMs?: number
  seed?: number
  rng?: () => number
  doc?: Document
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

  const engine = new SnakeEngine({ width, height }, rng)

  root.innerHTML = `
    <section class="game-shell">
      <header class="game-header">
        <h1 class="game-title">Classic Snake</h1>
        <div class="score" data-testid="score">Score: 0</div>
      </header>
      <div class="game-board">
        <canvas data-testid="board"></canvas>
      </div>
      <p class="game-over" data-testid="game-over">Game Over - Press Restart or R</p>
      <div class="controls">
        <p class="help">Use Arrow keys or WASD</p>
        <button type="button" data-testid="restart-button">Restart</button>
      </div>
    </section>
  `

  const scoreLabel = root.querySelector('[data-testid="score"]')
  const board = root.querySelector('[data-testid="board"]') as HTMLCanvasElement | null
  const gameOver = root.querySelector('[data-testid="game-over"]')
  const restartButton = root.querySelector('[data-testid="restart-button"]')

  if (!scoreLabel || !board || !gameOver || !restartButton) {
    throw new Error('Could not initialize game UI.')
  }

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
    state.snake.forEach((segment, index) => {
      drawCell(context, segment.x, segment.y, cellSize, index === 0 ? '#ff9f1a' : '#ff7a00')
    })

    scoreLabel.textContent = `Score: ${state.score}`
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

  const handleKeydown = (event: KeyboardEvent): void => {
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
      restartButton.removeEventListener('click', restart)
    },
  }
}
