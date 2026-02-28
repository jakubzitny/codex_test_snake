import { createGameApp } from './app'

type MockContext = {
  fillStyle: string
  strokeStyle: string
  fillRect: jest.Mock
  strokeRect: jest.Mock
}

function mockCanvasContext(): MockContext {
  const context = {
    fillStyle: '#000',
    strokeStyle: '#000',
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
  }

  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
    return context as unknown as CanvasRenderingContext2D
  })

  return context
}

describe('createGameApp', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('initializes UI and allows restarting after game over', () => {
    mockCanvasContext()
    const root = document.querySelector('#app') as HTMLElement
    const app = createGameApp(root, { width: 4, height: 4, tickMs: 1, seed: 5 })

    const score = root.querySelector('[data-testid="score"]')
    const gameOver = root.querySelector('[data-testid="game-over"]')
    const restartButton = root.querySelector('[data-testid="restart-button"]') as HTMLButtonElement

    expect(score?.textContent).toBe('Score: 0')
    expect(gameOver?.classList.contains('visible')).toBe(false)

    for (let step = 0; step < 10; step += 1) {
      app.tick()
    }

    expect(app.engine.getState().gameOver).toBe(true)
    expect(gameOver?.classList.contains('visible')).toBe(true)

    restartButton.click()

    expect(app.engine.getState().gameOver).toBe(false)
    expect(score?.textContent).toBe('Score: 0')

    app.dispose()
  })

  it('updates direction from keyboard input', () => {
    mockCanvasContext()
    const root = document.querySelector('#app') as HTMLElement
    const app = createGameApp(root, { width: 8, height: 8, tickMs: 999 })

    const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' })
    window.dispatchEvent(keyEvent)
    app.tick()

    expect(app.engine.getState().direction).toBe('Up')

    app.dispose()
  })
})
