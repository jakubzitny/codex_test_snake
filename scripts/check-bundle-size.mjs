import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const distAssetsDir = join(process.cwd(), 'apps/web/dist/assets')
const maxBytes = Number.parseInt(process.env.BUNDLE_MAX_BYTES ?? '250000', 10)

const files = readdirSync(distAssetsDir).filter((file) => file.endsWith('.js'))
if (files.length === 0) {
  console.error('No JS bundle files found in apps/web/dist/assets')
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
console.log(`Budget: ${maxBytes} bytes`)

if (largest.size > maxBytes) {
  console.error(`Bundle size check failed: ${largest.size} > ${maxBytes}`)
  process.exit(1)
}

console.log('Bundle size check passed ✅')
