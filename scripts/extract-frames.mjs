#!/usr/bin/env node
/**
 * Extrae la secuencia de fotogramas del vídeo del hero con FFmpeg.
 *
 *   public/videos/terra-force-hero.mp4  →  public/frames/terra-force/{desktop,mobile}/frame_0001.webp
 *
 * Genera además:
 *   - public/frames/terra-force/manifest.json  (lo lee el componente ScrollSequence)
 *   - public/images/hero/poster.webp           (fallback estático del hero)
 *   - public/images/cta/excavator-panorama.webp (fotografía del bloque CTA)
 *
 * Uso: npm run prepare:frames
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const VIDEO = join(root, 'public/videos/terra-force-hero.mp4')
const OUT = join(root, 'public/frames/terra-force')

/** Perfiles: escritorio con todos los fotogramas; móvil con la mitad y menor resolución. */
const PROFILES = [
  { name: 'desktop', width: 1280, everyNth: 1, quality: 62 },
  { name: 'mobile', width: 854, everyNth: 2, quality: 66 },
]

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' })
  if (r.error) throw r.error
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')}\n${r.stderr}`)
  return r.stdout
}

function ensureFfmpeg() {
  try {
    run('ffmpeg', ['-version'])
    run('ffprobe', ['-version'])
  } catch {
    console.error('✖ FFmpeg no está instalado o no está en el PATH. Instálalo para generar la secuencia.')
    process.exit(1)
  }
}

function probe() {
  const json = run('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,nb_frames,duration',
    '-of', 'json', VIDEO,
  ])
  const s = JSON.parse(json).streams[0]
  const [n, d] = s.r_frame_rate.split('/').map(Number)
  return { width: s.width, height: s.height, fps: n / d, frames: Number(s.nb_frames), duration: Number(s.duration) }
}

function dirSize(dir) {
  return readdirSync(dir).reduce((acc, f) => acc + statSync(join(dir, f)).size, 0)
}

ensureFfmpeg()

if (!existsSync(VIDEO)) {
  console.error(`✖ No se encuentra el vídeo del hero en ${VIDEO}`)
  console.error('  Copia tu vídeo a public/videos/terra-force-hero.mp4 y vuelve a ejecutar el script.')
  process.exit(1)
}

const info = probe()
console.log(`▸ Vídeo: ${info.width}×${info.height} · ${info.fps} fps · ${info.frames} fotogramas · ${info.duration}s`)

const manifest = {
  source: 'videos/terra-force-hero.mp4',
  sourceWidth: info.width,
  sourceHeight: info.height,
  fps: info.fps,
  generatedAt: new Date().toISOString(),
  profiles: {},
}

for (const p of PROFILES) {
  const dir = join(OUT, p.name)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })

  const filters = []
  if (p.everyNth > 1) filters.push(`select='not(mod(n\\,${p.everyNth}))'`)
  filters.push(`scale=${p.width}:-2:flags=lanczos`)

  run('ffmpeg', [
    '-v', 'error', '-y', '-i', VIDEO,
    '-vf', filters.join(','),
    '-fps_mode', 'vfr',
    '-c:v', 'libwebp', '-quality', String(p.quality), '-compression_level', '6', '-preset', 'photo',
    join(dir, 'frame_%04d.webp'),
  ])

  const count = readdirSync(dir).filter((f) => f.endsWith('.webp')).length
  const height = Math.round((info.height / info.width) * p.width / 2) * 2
  manifest.profiles[p.name] = {
    path: `frames/terra-force/${p.name}/frame_{index}.webp`,
    pad: 4,
    count,
    width: p.width,
    height,
  }
  console.log(`✔ ${p.name}: ${count} fotogramas · ${(dirSize(dir) / 1024 / 1024).toFixed(1)} MB`)
}

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

// Fotografías estáticas derivadas del vídeo (fallback del hero y bloque CTA).
const stills = [
  { t: info.duration * 0.93, out: 'public/images/hero/poster.webp', width: 1280, quality: 80 },
  { t: info.duration * 0.72, out: 'public/images/cta/excavator-panorama.webp', width: 1280, quality: 80 },
]
for (const s of stills) {
  const target = join(root, s.out)
  mkdirSync(dirname(target), { recursive: true })
  run('ffmpeg', [
    '-v', 'error', '-y', '-ss', s.t.toFixed(2), '-i', VIDEO, '-frames:v', '1',
    '-vf', `scale=${s.width}:-2:flags=lanczos`,
    '-c:v', 'libwebp', '-quality', String(s.quality), target,
  ])
  console.log(`✔ ${s.out}`)
}

console.log('✔ manifest.json generado')
