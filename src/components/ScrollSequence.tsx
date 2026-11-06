import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { isCoarsePointer } from '../lib/motion'

/**
 * Renderiza una secuencia de fotogramas WebP en un <canvas>.
 *
 * - No reproduce nada por sí mismo: el componente padre llama a `setProgress(0–1)`
 *   (desde GSAP ScrollTrigger) y se dibuja exactamente el fotograma correspondiente.
 * - Precarga los primeros fotogramas y carga el resto progresivamente en orden
 *   "grueso → fino" (cada 16, 8, 4, 2, 1) para que cualquier posición del scroll
 *   tenga pronto un fotograma cercano disponible.
 * - Dibuja en modo "cover" respetando la proporción (sin deformar) con punto focal.
 * - Si el manifest, el primer fotograma o el contexto 2D fallan → `onStatus('fallback')`.
 */

export type SequenceStatus = 'loading' | 'ready' | 'fallback'

export type ScrollSequenceHandle = {
  setProgress: (p: number) => void
}

type Profile = { path: string; pad: number; count: number; width: number; height: number }
type Manifest = { profiles: Record<'desktop' | 'mobile', Profile> }

type Props = {
  manifestUrl: string
  /** Punto focal horizontal/vertical (0–1) para el recorte "cover". */
  focalX?: number
  focalY?: number
  /** Fotogramas que se cargan con prioridad antes de mostrar la secuencia. */
  priorityFrames?: number
  onStatus?: (status: SequenceStatus) => void
  onFrame?: (index: number, total: number) => void
  onLoadProgress?: (loaded: number, total: number) => void
  className?: string
}

const CONCURRENCY = 6

function pickProfile(m: Manifest): Profile {
  const w = window.innerWidth
  const h = window.innerHeight
  const small = Math.max(w, h) < 1000 || (isCoarsePointer() && Math.min(w, h) < 820)
  return small && m.profiles.mobile ? m.profiles.mobile : m.profiles.desktop
}

function frameUrl(p: Profile, i: number) {
  return '/' + p.path.replace('{index}', String(i + 1).padStart(p.pad, '0'))
}

/** Orden de carga: primero los prioritarios, luego de grueso a fino. */
function loadOrder(count: number, priority: number): number[] {
  const seen = new Set<number>()
  const order: number[] = []
  const push = (i: number) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i)
      order.push(i)
    }
  }
  for (let i = 0; i < Math.min(priority, count); i++) push(i)
  push(count - 1)
  for (const stride of [16, 8, 4, 2, 1]) for (let i = 0; i < count; i += stride) push(i)
  return order
}

export const ScrollSequence = forwardRef<ScrollSequenceHandle, Props>(function ScrollSequence(
  { manifestUrl, focalX = 0.5, focalY = 0.5, priorityFrames = 10, onStatus, onFrame, onLoadProgress, className },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Estado mutable fuera de React: se actualiza en cada tick de scroll.
  const state = useRef({
    images: [] as (HTMLImageElement | null)[],
    count: 0,
    progress: 0,
    target: 0,
    drawn: -1,
    ctx: null as CanvasRenderingContext2D | null,
    ready: false,
  })

  // Mantener callbacks estables sin reiniciar la carga.
  const cb = useRef({ onStatus, onFrame, onLoadProgress })
  cb.current = { onStatus, onFrame, onLoadProgress }

  const draw = (force = false) => {
    const s = state.current
    const canvas = canvasRef.current
    if (!s.ctx || !canvas || !s.count) return
    const target = s.target

    // Fotograma cargado más cercano al objetivo
    let idx = -1
    for (let d = 0; d < s.count; d++) {
      if (s.images[target - d]) { idx = target - d; break }
      if (s.images[target + d]) { idx = target + d; break }
    }
    if (idx < 0 || (!force && idx === s.drawn)) return
    const img = s.images[idx]!

    const cw = canvas.width
    const ch = canvas.height
    const ir = img.naturalWidth / img.naturalHeight
    const cr = cw / ch
    let dw: number, dh: number
    if (cr > ir) { dw = cw; dh = cw / ir } else { dh = ch; dw = ch * ir }
    const dx = (cw - dw) * focalX
    const dy = (ch - dh) * focalY

    s.ctx.drawImage(img, dx, dy, dw, dh)
    s.drawn = idx
    cb.current.onFrame?.(target, s.count)
  }

  useImperativeHandle(ref, () => ({
    setProgress(p: number) {
      const s = state.current
      s.progress = Math.min(1, Math.max(0, p))
      if (!s.count) return
      const t = Math.round(s.progress * (s.count - 1))
      if (t !== s.target || s.drawn === -1) {
        s.target = t
        draw()
      }
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const s = state.current
    let cancelled = false
    let fellBack = false

    const fallback = (reason: unknown) => {
      if (fellBack || cancelled) return
      fellBack = true
      console.warn('[ScrollSequence] usando imagen estática de respaldo:', reason)
      cb.current.onStatus?.('fallback')
    }

    let ctx: CanvasRenderingContext2D | null = null
    try {
      ctx = canvas.getContext('2d', { alpha: false })
    } catch (e) {
      ctx = null
    }
    if (!ctx) {
      fallback('Canvas 2D no disponible')
      return
    }
    s.ctx = ctx

    // Ajuste de tamaño respetando devicePixelRatio (limitado para rendimiento)
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, rect.width < 768 ? 2 : 1.75)
      const w = Math.max(1, Math.round(rect.width * dpr))
      const h = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        ctx!.imageSmoothingEnabled = true
        ctx!.imageSmoothingQuality = 'high'
        draw(true)
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    cb.current.onStatus?.('loading')

    const run = async () => {
      let manifest: Manifest
      try {
        const res = await fetch(manifestUrl)
        if (!res.ok) throw new Error(`manifest ${res.status}`)
        manifest = await res.json()
      } catch (e) {
        fallback(e)
        return
      }
      if (cancelled) return

      const profile = pickProfile(manifest)
      s.count = profile.count
      s.images = new Array(profile.count).fill(null)
      s.target = Math.round(s.progress * (s.count - 1))

      const order = loadOrder(profile.count, priorityFrames)
      let loaded = 0
      let cursor = 0
      let priorityLeft = Math.min(priorityFrames, profile.count)

      const loadOne = (i: number) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.decoding = 'async'
          img.src = frameUrl(profile, i)
          const done = () => {
            if (cancelled) return resolve()
            s.images[i] = img
            loaded++
            cb.current.onLoadProgress?.(loaded, profile.count)
            if (i < priorityFrames) priorityLeft--
            if (!s.ready && (i === 0 || priorityLeft <= 0) && s.images[0]) {
              s.ready = true
              draw(true)
              cb.current.onStatus?.('ready')
            } else if (Math.abs(i - s.target) <= Math.abs(s.drawn - s.target)) {
              draw()
            }
            resolve()
          }
          img
            .decode()
            .then(done)
            .catch(() => {
              if (img.complete && img.naturalWidth) return done()
              if (i === 0) fallback(`no se pudo cargar ${img.src}`)
              resolve()
            })
        })

      const worker = async () => {
        while (!cancelled && !fellBack && cursor < order.length) {
          const i = order[cursor++]
          await loadOne(i)
        }
      }
      await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    }

    run()

    return () => {
      cancelled = true
      ro.disconnect()
      s.images = []
      s.count = 0
      s.drawn = -1
      s.ready = false
      s.ctx = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifestUrl, priorityFrames])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="Secuencia de una excavadora trabajando el terreno, controlada por el desplazamiento"
    />
  )
})
