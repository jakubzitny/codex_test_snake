import './style.css'
import { createGameApp } from './app'

type ParsedEnemy = { x: number; y: number }

function parsePositiveIntParam(value: string | null, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback
  }

  return parsed
}

function parseBooleanParam(value: string | null, fallback: boolean): boolean {
  if (!value) {
    return fallback
  }

  const normalized = value.toLowerCase()
  if (normalized === '1' || normalized === 'true' || normalized === 'yes') {
    return true
  }

  if (normalized === '0' || normalized === 'false' || normalized === 'no') {
    return false
  }

  return fallback
}

function parseEnemiesParam(value: string | null): ParsedEnemy[] | undefined {
  if (!value) {
    return undefined
  }

  const parsedEnemies = value
    .split(';')
    .map((pair) => pair.trim())
    .filter((pair) => pair.length > 0)
    .map((pair) => {
      const [xRaw, yRaw] = pair.split(',')
      const x = Number.parseInt(xRaw, 10)
      const y = Number.parseInt(yRaw, 10)

      if (Number.isNaN(x) || Number.isNaN(y)) {
        return null
      }

      return { x, y }
    })
    .filter((enemy): enemy is ParsedEnemy => enemy !== null)

  return parsedEnemies.length > 0 ? parsedEnemies : undefined
}

const root = document.querySelector('#app')

if (!root || !(root instanceof HTMLElement)) {
  throw new Error('Root #app container is missing.')
}

const params = new URLSearchParams(window.location.search)
const width = parsePositiveIntParam(params.get('width'), 20)
const height = parsePositiveIntParam(params.get('height'), 20)
const tickMs = parsePositiveIntParam(params.get('tick'), 120)
const enemyCount = parsePositiveIntParam(params.get('enemies'), 3)
const wrapWalls = parseBooleanParam(params.get('wrap'), false)
const initialEnemies = parseEnemiesParam(params.get('enemyPositions'))

const seedParam = params.get('seed')
const seed = seedParam ? Number.parseInt(seedParam, 10) : undefined

createGameApp(root, {
  width,
  height,
  tickMs,
  enemyCount,
  wrapWalls,
  initialEnemies,
  seed: Number.isNaN(seed) ? undefined : seed,
})
