import './style.css'
import { createGameApp } from './app'

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

const root = document.querySelector('#app')

if (!root || !(root instanceof HTMLElement)) {
  throw new Error('Root #app container is missing.')
}

const params = new URLSearchParams(window.location.search)
const width = parsePositiveIntParam(params.get('width'), 20)
const height = parsePositiveIntParam(params.get('height'), 20)
const tickMs = parsePositiveIntParam(params.get('tick'), 120)
const seedParam = params.get('seed')
const seed = seedParam ? Number.parseInt(seedParam, 10) : undefined

createGameApp(root, {
  width,
  height,
  tickMs,
  seed: Number.isNaN(seed) ? undefined : seed,
})
