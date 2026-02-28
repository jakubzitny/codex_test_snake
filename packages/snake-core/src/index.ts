export type Direction = 'Up' | 'Down' | 'Left' | 'Right'

export type Position = {
  x: number
  y: number
}

export type GameConfig = {
  width: number
  height: number
  initialDirection?: Direction
  initialSnake?: Position[]
  initialFood?: Position
}

export type GameState = {
  snake: Position[]
  direction: Direction
  nextDirection: Direction
  food: Position
  score: number
  gameOver: boolean
}

const DEFAULT_WIDTH = 20
const DEFAULT_HEIGHT = 20
const DEFAULT_DIRECTION: Direction = 'Right'

const directionVectors: Record<Direction, Position> = {
  Up: { x: 0, y: -1 },
  Down: { x: 0, y: 1 },
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
}

const oppositeDirection: Record<Direction, Direction> = {
  Up: 'Down',
  Down: 'Up',
  Left: 'Right',
  Right: 'Left',
}

function clonePosition(position: Position): Position {
  return { x: position.x, y: position.y }
}

function positionsEqual(first: Position, second: Position): boolean {
  return first.x === second.x && first.y === second.y
}

function positionInSnake(position: Position, snake: Position[]): boolean {
  return snake.some((segment) => positionsEqual(segment, position))
}

function randomInt(maxExclusive: number, rng: () => number): number {
  return Math.floor(rng() * maxExclusive)
}

function createInitialSnake(width: number, height: number): Position[] {
  const head = { x: Math.floor(width / 2), y: Math.floor(height / 2) }
  return [head, { x: head.x - 1, y: head.y }, { x: head.x - 2, y: head.y }]
}

function spawnFood(width: number, height: number, snake: Position[], rng: () => number): Position {
  const availableCells: Position[] = []

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const candidate = { x, y }
      if (!positionInSnake(candidate, snake)) {
        availableCells.push(candidate)
      }
    }
  }

  if (availableCells.length === 0) {
    return { x: -1, y: -1 }
  }

  return availableCells[randomInt(availableCells.length, rng)]
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    snake: state.snake.map(clonePosition),
    food: clonePosition(state.food),
  }
}

export class SnakeEngine {
  private readonly width: number
  private readonly height: number
  private readonly rng: () => number
  private readonly initialDirection: Direction
  private readonly initialSnake?: Position[]
  private readonly initialFood?: Position
  private state: GameState

  constructor(config: Partial<GameConfig> = {}, rng: () => number = Math.random) {
    this.width = config.width ?? DEFAULT_WIDTH
    this.height = config.height ?? DEFAULT_HEIGHT
    this.rng = rng
    this.initialDirection = config.initialDirection ?? DEFAULT_DIRECTION
    this.initialSnake = config.initialSnake?.map(clonePosition)
    this.initialFood = config.initialFood ? clonePosition(config.initialFood) : undefined
    this.state = this.createInitialState()
  }

  getState(): GameState {
    return cloneState(this.state)
  }

  setDirection(direction: Direction): void {
    if (this.state.gameOver) {
      return
    }

    if (oppositeDirection[this.state.direction] === direction) {
      return
    }

    this.state.nextDirection = direction
  }

  tick(): GameState {
    if (this.state.gameOver) {
      return this.getState()
    }

    if (oppositeDirection[this.state.direction] !== this.state.nextDirection) {
      this.state.direction = this.state.nextDirection
    }

    const vector = directionVectors[this.state.direction]
    const nextHead = {
      x: this.state.snake[0].x + vector.x,
      y: this.state.snake[0].y + vector.y,
    }

    const outsideBoard =
      nextHead.x < 0 || nextHead.x >= this.width || nextHead.y < 0 || nextHead.y >= this.height

    if (outsideBoard || positionInSnake(nextHead, this.state.snake)) {
      this.state.gameOver = true
      return this.getState()
    }

    const nextSnake = [nextHead, ...this.state.snake]
    const ateFood = positionsEqual(nextHead, this.state.food)

    if (!ateFood) {
      nextSnake.pop()
    }

    this.state.snake = nextSnake

    if (ateFood) {
      this.state.score += 1
      this.state.food = spawnFood(this.width, this.height, this.state.snake, this.rng)

      if (this.state.food.x === -1) {
        this.state.gameOver = true
      }
    }

    return this.getState()
  }

  reset(): GameState {
    this.state = this.createInitialState()
    return this.getState()
  }

  private createInitialState(): GameState {
    const snake = this.initialSnake
      ? this.initialSnake.map(clonePosition)
      : createInitialSnake(this.width, this.height)
    const food = this.initialFood
      ? clonePosition(this.initialFood)
      : spawnFood(this.width, this.height, snake, this.rng)

    return {
      snake,
      direction: this.initialDirection,
      nextDirection: this.initialDirection,
      food,
      score: 0,
      gameOver: false,
    }
  }
}

export function createSeededRng(seed: number): () => number {
  let internal = seed >>> 0

  return () => {
    internal += 0x6d2b79f5
    let value = internal
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}
