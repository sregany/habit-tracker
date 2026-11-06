#!/usr/bin/env node
/**
 * Prepara las fotografías individuales del pack TERRA FORCE (assets-src/images)
 * para la web: recorta los restos de borde/collage que traen algunos recortes,
 * reescala con Lanczos y exporta en WebP optimizado a public/images/{services,machinery,projects,intro}.
 *
 * Las cajas de recorte se han medido sobre cada original (detección de costuras)
 * para quedarnos sólo con UNA fotografía limpia por imagen: nunca se usa una composición.
 *
 * Uso: npm run prepare:images
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'assets-src/images')
const OUT = join(root, 'public/images')

/** crop: [x, y, w, h] sobre el original. scale: factor de reescalado. */
const JOBS = [
  // Intro (panorámica)
  { src: 'obras_02.jpg', out: 'intro/terraces-aerial.webp', crop: [3, 0, 832, 368], scale: 2 },

  // Servicios
  { src: 'maquinaria_09.jpg', out: 'services/excavaciones-cimentaciones.webp', crop: [5, 0, 407, 281], scale: 2 },
  { src: 'maquinaria_03.jpg', out: 'services/movimiento-tierras.webp', crop: [0, 4, 409, 275], scale: 2 },
  { src: 'maquinaria_05.jpg', out: 'services/demoliciones-roca.webp', crop: [5, 4, 407, 268], scale: 2 },
  { src: 'maquinaria_07.jpg', out: 'services/zanjas-canalizaciones.webp', crop: [0, 6, 409, 275], scale: 2 },
  { src: 'obras_10.jpg', out: 'services/caminos.webp', crop: [8, 0, 411, 281], scale: 2 },
  { src: 'obras_09.jpg', out: 'services/alquiler-operario.webp', crop: [5, 0, 407, 281], scale: 2 },

  // Maquinaria
  { src: 'maquinaria_01.jpg', out: 'machinery/excavadora-cadenas.webp', crop: [0, 0, 824, 368], scale: 2 },
  { src: 'obras_03.jpg', out: 'machinery/pala-cargadora.webp', crop: [0, 9, 409, 247], scale: 2 },
  { src: 'maquinaria_04.jpg', out: 'machinery/bulldozer.webp', crop: [12, 4, 400, 275], scale: 2 },
  { src: 'maquinaria_02.jpg', out: 'machinery/camion-dumper.webp', crop: [3, 0, 832, 368], scale: 2 },
  { src: 'maquinaria_06.jpg', out: 'machinery/compactacion.webp', crop: [14, 4, 405, 275], scale: 2 },

  // Proyectos (galería horizontal) — subregiones limpias de una sola fotografía
  { src: 'proyectos_08.jpg', out: 'projects/terreno-montanoso.webp', crop: [133, 36, 246, 270], scale: 2.5 },
  { src: 'proyectos_10.jpg', out: 'projects/preparacion-terrenos.webp', crop: [0, 34, 385, 272], scale: 2.5 },
  { src: 'proyectos_06.jpg', out: 'projects/caminos-rurales.webp', crop: [0, 107, 385, 197], scale: 2.5 },
  { src: 'obras_04.jpg', out: 'projects/canalizaciones.webp', crop: [4, 9, 410, 247], scale: 2.5 },
  { src: 'maquinaria_08.jpg', out: 'projects/muros-contencion.webp', crop: [11, 6, 403, 275], scale: 2.5 },
]

function run(args) {
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8' })
  if (r.error) throw r.error
  if (r.status !== 0) throw new Error(r.stderr)
}

try {
  spawnSync('ffmpeg', ['-version'])
} catch {
  console.error('✖ FFmpeg no está disponible en el PATH.')
  process.exit(1)
}

for (const job of JOBS) {
  const input = join(SRC, job.src)
  if (!existsSync(input)) {
    console.warn(`⚠ Falta ${job.src}, se omite`)
    continue
  }
  const [x, y, w, h] = job.crop
  const target = join(OUT, job.out)
  mkdirSync(dirname(target), { recursive: true })
  const tw = Math.round((w * job.scale) / 2) * 2
  run([
    '-v', 'error', '-y', '-i', input,
    '-vf', `crop=${w}:${h}:${x}:${y},scale=${tw}:-2:flags=lanczos,unsharp=5:5:0.45:5:5:0`,
    '-c:v', 'libwebp', '-quality', '82', '-compression_level', '6', '-preset', 'photo',
    target,
  ])
  console.log(`✔ ${job.out.padEnd(44)} ${(statSync(target).size / 1024).toFixed(0)} KB`)
}
