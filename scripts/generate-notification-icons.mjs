/**
 * Generate Android notification icons from a source logo.
 *
 * Android (Lollipop+) renders status-bar icons as a white silhouette:
 * every non-transparent pixel becomes white, transparent stays transparent.
 * This script trims, whitens, and resizes the source logo into the five
 * required densities and drops them into res/drawable-*.
 *
 * Run:  node scripts/generate-notification-icons.mjs
 *
 * Requires jimp — installed separately in /tmp/icongen because the
 * Windows-mounted node_modules can't hold a Linux native binary.
 */

import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Jimp is installed outside the project (WSL can't build native deps on
// the /mnt/c/ Windows filesystem). We load it from /tmp/icongen.
const externalRequire = createRequire('/tmp/icongen/package.json')
const { Jimp, intToRGBA } = externalRequire('jimp')

const SOURCE = join(ROOT, 'public/images/logo-beyaz.png')
const RES_DIR = join(ROOT, 'android/app/src/main/res')

// Android status-bar icon target sizes (square, in px).
const DENSITIES = [
  { folder: 'drawable-mdpi', size: 24 },
  { folder: 'drawable-hdpi', size: 36 },
  { folder: 'drawable-xhdpi', size: 48 },
  { folder: 'drawable-xxhdpi', size: 72 },
  { folder: 'drawable-xxxhdpi', size: 96 },
]

const ICON_NAME = 'ic_stat_icon.png'
// Inner padding as a fraction of the icon's side — gives the silhouette
// breathing room inside the status-bar slot.
const PADDING = 0.12

function trimTransparent(img) {
  // Find the tight bounding box of pixels with alpha > ALPHA_THRESHOLD.
  const ALPHA_THRESHOLD = 10
  let minX = img.bitmap.width, minY = img.bitmap.height, maxX = 0, maxY = 0
  let found = false

  for (let y = 0; y < img.bitmap.height; y++) {
    for (let x = 0; x < img.bitmap.width; x++) {
      const a = img.bitmap.data[(y * img.bitmap.width + x) * 4 + 3]
      if (a > ALPHA_THRESHOLD) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
        found = true
      }
    }
  }
  if (!found) return img
  return img.clone().crop({
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
  })
}

function whiten(img) {
  // Force every opaque pixel to white, preserve alpha.
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
    img.bitmap.data[idx] = 255       // R
    img.bitmap.data[idx + 1] = 255   // G
    img.bitmap.data[idx + 2] = 255   // B
    // alpha untouched
  })
  return img
}

async function main() {
  console.log(`→ source:      ${SOURCE}`)
  console.log(`→ target root: ${RES_DIR}`)

  const src = await Jimp.read(SOURCE)
  const trimmed = trimTransparent(src)
  const silhouette = whiten(trimmed.clone())

  for (const { folder, size } of DENSITIES) {
    const outDir = join(RES_DIR, folder)
    mkdirSync(outDir, { recursive: true })
    const outPath = join(outDir, ICON_NAME)

    const innerSize = Math.round(size * (1 - PADDING * 2))

    // Resize silhouette into innerSize, preserving aspect ratio.
    const resized = silhouette.clone()
    const srcAspect = resized.bitmap.width / resized.bitmap.height
    let targetW, targetH
    if (srcAspect >= 1) {
      targetW = innerSize
      targetH = Math.round(innerSize / srcAspect)
    } else {
      targetH = innerSize
      targetW = Math.round(innerSize * srcAspect)
    }
    resized.resize({ w: targetW, h: targetH })

    // Compose onto a transparent size×size canvas, centered.
    const canvas = new Jimp({ width: size, height: size, color: 0x00000000 })
    canvas.composite(
      resized,
      Math.floor((size - targetW) / 2),
      Math.floor((size - targetH) / 2),
    )

    await canvas.write(outPath)
    console.log(`  ✓ ${folder}/${ICON_NAME}  (${size}×${size})`)
  }

  console.log('\nDone. Rebuild the Android app to pick up the new icons.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
