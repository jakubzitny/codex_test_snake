import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const distAssetsDir = join(process.cwd(), 'apps/web/dist/assets')
const parsedMaxBytes = Number.parseInt(process.env.BUNDLE_MAX_BYTES ?? '250000', 10)

if (!Number.isFinite(parsedMaxBytes) || parsedMaxBytes <= 0) {
  console.error('BUNDLE_MAX_BYTES must be a positive integer')
  process.exit(1)
}

if (!existsSync(distAssetsDir)) {
  console.error(`Bundle assets directory not found: ${distAssetsDir}`)
  process.exit(1)
}

const files = readdirSync(distAssetsDir).filter((file) => file.endsWith('.js'))
if (files.length === 0) {
  console.error(`No JS bundle files found in ${distAssetsDir}`)
  process.exit(1)
}

let largest = { name: '', size: 0 }
for (const file of files) {
  const size = statSync(join(distAssetsDir, file)).size
  if (size > largest.size) {
    largest = { name: file, size }
  }
}

console.log(`Largest JS bundle: ${largest.name} (${largest.size} bytes)`)
console.log(`Budget: ${parsedMaxBytes} bytes`)

if (largest.size > parsedMaxBytes) {
  console.error(`Bundle size check failed: ${largest.size} > ${parsedMaxBytes}`)
  process.exit(1)
}

console.log('Bundle size check passed ✅')
