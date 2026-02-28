import { SnakeEngine, createSeededRng } from './index'

describe('SnakeEngine', () => {
  it('starts with a centered snake and score at zero', () => {
    const engine = new SnakeEngine({ width: 10, height: 10 }, createSeededRng(1))
    const state = engine.getState()

    expect(state.score).toBe(0)
    expect(state.gameOver).toBe(false)
    expect(state.snake).toHaveLength(3)
    expect(state.snake[0]).toEqual({ x: 5, y: 5 })
  })

  it('moves snake one cell per tick in current direction', () => {
    const engine = new SnakeEngine({ width: 10, height: 10 }, createSeededRng(2))
    const before = engine.getState()
    const after = engine.tick()

    expect(after.snake[0].x).toBe(before.snake[0].x + 1)
    expect(after.snake[0].y).toBe(before.snake[0].y)
  })

  it('ignores immediate reverse direction input', () => {
    const engine = new SnakeEngine({ width: 10, height: 10 }, createSeededRng(3))
    engine.setDirection('Left')
    const state = engine.tick()

    expect(state.direction).toBe('Right')
  })

  it('increments score and length when eating food', () => {
    const engine = new SnakeEngine({
      width: 6,
      height: 6,
      initialSnake: [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
      ],
      initialDirection: 'Right',
      initialFood: { x: 3, y: 2 },
    })

    const state = engine.tick()

    expect(state.score).toBe(1)
    expect(state.snake).toHaveLength(4)
    expect(state.snake[0]).toEqual({ x: 3, y: 2 })
  })

  it('ends game on wall collision', () => {
    const engine = new SnakeEngine({
      width: 4,
      height: 4,
      initialSnake: [
        { x: 3, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
      ],
      initialDirection: 'Right',
    })

    const state = engine.tick()

    expect(state.gameOver).toBe(true)
  })
})
