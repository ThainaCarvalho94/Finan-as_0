import sharp from "sharp"
import { writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, "..", "public")
const sourcePath = join(publicDir, "icon-1024.png")

async function createMasterFromSvg() {
  const size = 1024
  const svg = buildIconSvg(size)
  await sharp(Buffer.from(svg)).png().toFile(sourcePath)
}

function buildIconSvg(size) {
  const s = size
  const pad = s * 0.08
  const rx = s * 0.22

  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="bar" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#1D4ED8"/>
      <stop offset="100%" stop-color="#22D3EE"/>
    </linearGradient>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22D3EE"/>
      <stop offset="100%" stop-color="#1E40AF"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${s * 0.008}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="${s * 0.012}" stdDeviation="${s * 0.025}" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>

  <rect width="${s}" height="${s}" rx="${rx}" fill="url(#bg)"/>

  <g filter="url(#shadow)" transform="translate(${s * 0.5}, ${s * 0.46})">
    <circle cx="0" cy="0" r="${s * 0.28}" fill="none" stroke="url(#ring)" stroke-width="${s * 0.012}" opacity="0.85"/>

    <g transform="translate(${-s * 0.18}, ${s * 0.08})">
      <rect x="0" y="${-s * 0.14}" width="${s * 0.07}" height="${s * 0.14}" rx="${s * 0.012}" fill="url(#bar)" opacity="0.75"/>
      <rect x="${s * 0.09}" y="${-s * 0.19}" width="${s * 0.07}" height="${s * 0.19}" rx="${s * 0.012}" fill="url(#bar)" opacity="0.85"/>
      <rect x="${s * 0.18}" y="${-s * 0.24}" width="${s * 0.07}" height="${s * 0.24}" rx="${s * 0.012}" fill="url(#bar)" opacity="0.92"/>
      <rect x="${s * 0.27}" y="${-s * 0.30}" width="${s * 0.07}" height="${s * 0.30}" rx="${s * 0.012}" fill="url(#bar)"/>
      <rect x="${s * 0.36}" y="${-s * 0.36}" width="${s * 0.07}" height="${s * 0.36}" rx="${s * 0.012}" fill="url(#bar)"/>
    </g>

    <polyline
      points="${-s * 0.18},${s * 0.02} ${-s * 0.09},${-s * 0.04} 0,${-s * 0.01} ${s * 0.09},${-s * 0.10} ${s * 0.18},${-s * 0.06} ${s * 0.27},${-s * 0.16} ${s * 0.36},${-s * 0.22}"
      fill="none"
      stroke="#34D399"
      stroke-width="${s * 0.022}"
      stroke-linecap="round"
      stroke-linejoin="round"
      filter="url(#glow)"
    />
    <polygon
      points="${s * 0.36},${-s * 0.22} ${s * 0.30},${-s * 0.18} ${s * 0.33},${-s * 0.14}"
      fill="#34D399"
      filter="url(#glow)"
    />
  </g>

  <g transform="translate(${s * 0.72}, ${s * 0.72})">
    <circle cx="0" cy="0" r="${s * 0.085}" fill="#0F172A" stroke="#34D399" stroke-width="${s * 0.012}"/>
    <text
      x="0"
      y="${s * 0.032}"
      text-anchor="middle"
      font-family="system-ui, -apple-system, Segoe UI, sans-serif"
      font-size="${s * 0.11}"
      font-weight="700"
      fill="#34D399"
    >$</text>
  </g>
</svg>`
}

async function generate() {
  const externalSource =
    process.argv[2] ||
    join(
      dirname(__dirname),
      "..",
      ".cursor",
      "projects",
      "c-Users-thain-OneDrive-Aplicativos-Projetos-Finan-as-0",
      "assets",
      "c__Users_thain_AppData_Roaming_Cursor_User_workspaceStorage_b993dae0cb5d5dada150d819412826d3_images_image-6ff7060f-dc58-432e-9d3e-0a28393e65a0.png",
    )

  let sourceBuffer

  if (existsSync(externalSource)) {
    sourceBuffer = await sharp(externalSource).resize(1024, 1024, { fit: "cover" }).png().toBuffer()
    await sharp(sourceBuffer).toFile(sourcePath)
    console.log("Using provided reference image as master")
  } else if (existsSync(sourcePath)) {
    sourceBuffer = await sharp(sourcePath).png().toBuffer()
    console.log("Using existing icon-1024.png as master")
  } else {
    sourceBuffer = await sharp(Buffer.from(buildIconSvg(1024))).png().toBuffer()
    await sharp(sourceBuffer).toFile(sourcePath)
    console.log("Generated master icon from SVG")
  }

  await resizeFromBuffer(sourceBuffer, "icon-512.png", 512)
  await resizeFromBuffer(sourceBuffer, "icon-192.png", 192)
  await resizeFromBuffer(sourceBuffer, "icon-512-maskable.png", 512, { maskable: true })
  await resizeFromBuffer(sourceBuffer, "apple-touch-icon.png", 180)

  const favicon32 = await sharp(sourceBuffer).resize(32, 32).png().toBuffer()
  const favicon16 = await sharp(sourceBuffer).resize(16, 16).png().toBuffer()
  writeFileSync(join(publicDir, "favicon.ico"), buildIco([favicon16, favicon32]))
  console.log("Created icon-1024.png (1024x1024)")
  console.log("Created favicon.ico")
}

function buildIco(images) {
  const headerSize = 6
  const entrySize = 16
  const offset = headerSize + entrySize * images.length
  let dataOffset = offset
  const entries = []

  for (const img of images) {
    const size = img.length <= 400 ? 16 : 32
    entries.push({ size, data: img, offset: dataOffset })
    dataOffset += img.length
  }

  const buffer = Buffer.alloc(dataOffset)
  buffer.writeUInt16LE(0, 0)
  buffer.writeUInt16LE(1, 2)
  buffer.writeUInt16LE(entries.length, 4)

  entries.forEach((entry, i) => {
    const pos = headerSize + i * entrySize
    buffer.writeUInt8(entry.size === 256 ? 0 : entry.size, pos)
    buffer.writeUInt8(entry.size === 256 ? 0 : entry.size, pos + 1)
    buffer.writeUInt8(0, pos + 2)
    buffer.writeUInt8(0, pos + 3)
    buffer.writeUInt16LE(1, pos + 4)
    buffer.writeUInt16LE(32, pos + 6)
    buffer.writeUInt32LE(entry.data.length, pos + 8)
    buffer.writeUInt32LE(entry.offset, pos + 12)
  })

  entries.forEach((entry) => entry.data.copy(buffer, entry.offset))
  return buffer
}

async function resizeFromBuffer(sourceBuffer, name, size, options = {}) {
  let pipeline

  if (options.maskable) {
    pipeline = sharp(sourceBuffer)
      .resize(Math.round(size * 0.82), Math.round(size * 0.82), {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .extend({
        top: Math.round(size * 0.09),
        bottom: Math.round(size * 0.09),
        left: Math.round(size * 0.09),
        right: Math.round(size * 0.09),
        background: "#0F172A",
      })
  } else {
    pipeline = sharp(sourceBuffer).resize(size, size, {
      fit: "contain",
      background: "#0F172A",
    })
  }

  await pipeline.png().toFile(join(publicDir, name))
  console.log(`Created ${name} (${size}x${size})`)
}

generate().catch((err) => {
  console.error(err)
  process.exit(1)
})
