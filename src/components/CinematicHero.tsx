import { useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { ScrollSequence, type ScrollSequenceHandle, type SequenceStatus } from './ScrollSequence'
import { ButtonLink } from './ui/Button'
import { heroPhases } from '../data/content'
import { site } from '../config/site'
import { gsap } from '../lib/gsap'
import { useGsap } from '../hooks/useGsap'
import { isLowPowerDevice, prefersReducedMotion } from '../lib/motion'
import { requestQuote } from '../lib/events'

const MANIFEST = '/frames/terra-force/manifest.json'
const POSTER = '/images/hero/poster.webp'
const PLACEHOLDER = '/frames/terra-force/mobile/frame_0001.webp'

const headline = ['La fuerza', 'que transforma', 'el terreno.']

export function CinematicHero() {
  // Modo estático: movimiento reducido o dispositivo de bajo rendimiento.
  const [staticMode] = useState(() => prefersReducedMotion() || isLowPowerDevice())
  const [status, setStatus] = useState<SequenceStatus>('loading')

  const sectionRef = useRef<HTMLElement>(null)
  const seqRef = useRef<ScrollSequenceHandle>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const loadRef = useRef<HTMLSpanElement>(null)

  const fallback = staticMode || status === 'fallback'

  // Entrada inicial del titular
  useGsap(sectionRef, () => {
    if (prefersReducedMotion()) return
    const tl = gsap.timeline({ delay: 0.15 })
    tl.from('[data-hero-line]', { yPercent: 115, duration: 1.4, ease: 'expo.out', stagger: 0.1 })
      .from('[data-hero-fade]', { opacity: 0, y: 24, duration: 1.1, stagger: 0.08 }, 0.5)
      .from('[data-hero-chrome]', { opacity: 0, duration: 1.2, stagger: 0.05 }, 0.7)
  })

  // Timeline controlada por el scroll
  useGsap(
    sectionRef,
    () => {
      if (staticMode) return
      const section = sectionRef.current!
      const proxy = { p: 0 }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      })

      // Fotograma = progreso exacto del scroll (avanza y retrocede)
      tl.to(proxy, { p: 1, duration: 1, onUpdate: () => seqRef.current?.setProgress(proxy.p) }, 0)
      tl.fromTo('[data-hero-progress]', { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0)

      // Imagen de respaldo: ligero acercamiento si no hay canvas
      tl.fromTo('[data-hero-poster]', { scale: 1.12 }, { scale: 1, duration: 1 }, 0)

      // Titular y CTA salen al empezar la secuencia
      tl.to('[data-hero-intro]', { opacity: 0, y: -60, duration: 0.1, ease: 'power1.in' }, 0.09)
      tl.to('[data-hero-scrollcue]', { opacity: 0, duration: 0.04 }, 0.02)
      tl.to('[data-hero-shade]', { opacity: 0.55, duration: 0.15 }, 0.08)

      // Textos sincronizados con las fases del vídeo
      heroPhases.forEach((phase, i) => {
        const el = `[data-phase="${i}"]`
        const tick = `[data-tick="${i}"]`
        tl.fromTo(el, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.05, ease: 'power2.out' }, phase.from)
        tl.fromTo(
          `${el} [data-phase-line]`,
          { scaleX: 0 },
          { scaleX: 1, duration: phase.to - phase.from, transformOrigin: 'left center' },
          phase.from,
        )
        tl.to(tick, { backgroundColor: '#D9A52D', scale: 1.6, duration: 0.02 }, phase.from)
        if (i < heroPhases.length - 1) {
          tl.to(el, { opacity: 0, y: -36, duration: 0.04, ease: 'power1.in' }, phase.to - 0.02)
        }
      })

      // Salida: el escenario se queda atrás mientras entra la siguiente sección
      gsap.fromTo(
        '[data-hero-stage]',
        { yPercent: 0 },
        {
          yPercent: 22,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'bottom bottom', end: 'bottom top', scrub: true },
        },
      )
      gsap.fromTo(
        '[data-hero-exitshade]',
        { opacity: 0 },
        {
          opacity: 0.7,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'bottom bottom', end: 'bottom top', scrub: true },
        },
      )
    },
    [staticMode],
  )

  return (
    <section
      id="inicio"
      ref={sectionRef}
      aria-label="Presentación"
      className={`relative bg-ink text-white ${staticMode ? 'h-svh min-h-[34rem]' : 'h-[420vh] md:h-[520vh]'}`}
    >
      <div className="sticky top-0 h-svh min-h-[34rem] overflow-hidden">
        <div data-hero-stage className="absolute inset-0 will-change-transform">
          {/* Imagen inicial mientras se cargan los fotogramas (primer fotograma) */}
          {!fallback && (
            <img
              src={PLACEHOLDER}
              alt=""
              aria-hidden
              fetchPriority="high"
              className="absolute inset-0 size-full object-cover object-[55%_50%]"
            />
          )}

          {/* Fallback estático accesible (sin Canvas, sin vídeo o con movimiento reducido) */}
          <img
            data-hero-poster
            src={POSTER}
            alt={fallback ? 'Excavadora de cadenas trabajando en un terreno de montaña entre polvo y luz de atardecer' : ''}
            aria-hidden={!fallback}
            loading={fallback ? 'eager' : 'lazy'}
            className={`absolute inset-0 size-full object-cover object-[55%_50%] transition-opacity duration-700 ${
              fallback ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {!staticMode && (
            <ScrollSequence
              ref={seqRef}
              manifestUrl={MANIFEST}
              focalX={0.55}
              priorityFrames={12}
              onStatus={setStatus}
              onFrame={(i, total) => {
                if (counterRef.current)
                  counterRef.current.textContent = `${String(i + 1).padStart(3, '0')} / ${String(total).padStart(3, '0')}`
              }}
              onLoadProgress={(loaded, total) => {
                if (!loadRef.current) return
                const pct = Math.round((loaded / total) * 100)
                loadRef.current.textContent = pct < 100 ? `Cargando ${pct}%` : 'Secuencia lista'
                if (pct >= 100) gsap.to(loadRef.current, { opacity: 0, delay: 1.2, duration: 0.6 })
              }}
              className={`absolute inset-0 size-full transition-opacity duration-700 ${
                status === 'ready' ? 'opacity-100' : 'opacity-0'
              } ${status === 'fallback' ? 'hidden' : ''}`}
            />
          )}

          {/* Sombras para legibilidad */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/70 to-transparent" />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-ink/90 via-ink/45 to-transparent"
          />
          <div aria-hidden data-hero-shade className="absolute inset-0 bg-ink/20 opacity-100" />
        </div>
        <div aria-hidden data-hero-exitshade className="pointer-events-none absolute inset-0 bg-ink opacity-0" />

        {/* ── Contenido ── */}
        <div className="shell relative flex h-full flex-col justify-end pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-24 md:pb-14">
          {/* Titular */}
          <div data-hero-intro className="max-w-full">
            <p data-hero-fade className="eyebrow mb-6 flex items-center gap-3 text-white/70">
              <span aria-hidden className="block size-1.5 bg-amber" />
              {site.tagline}
            </p>
            <h1 className="display text-[clamp(2.75rem,7.8vw,8rem)] text-white">
              {headline.map((line, i) => (
                <span key={i} className="line-mask">
                  <span data-hero-line className={i === 2 ? 'text-amber' : undefined}>
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
              <p data-hero-fade className="max-w-[26rem] text-[1.0625rem] leading-relaxed text-white/80 md:text-lg">
                Soluciones de excavación, movimiento de tierras y obra civil con precisión y maquinaria
                especializada.
              </p>
              <div data-hero-fade className="flex flex-wrap gap-3 md:mr-16">
                <ButtonLink href="#contacto" variant="primary" onClick={() => requestQuote()}>
                  Solicitar presupuesto
                </ButtonLink>
                <ButtonLink href="#servicios" variant="outline-light">
                  Explorar servicios
                </ButtonLink>
              </div>
            </div>
          </div>

          {/* Fases sincronizadas con el vídeo */}
          {!staticMode &&
            heroPhases.map((phase, i) => (
              <div
                key={phase.index}
                data-phase={i}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-[max(2.5rem,env(safe-area-inset-bottom))] opacity-0 md:bottom-14"
              >
                <div className="shell">
                  <div className="max-w-[56rem]">
                    <p className="eyebrow mb-5 flex items-center gap-3 text-white/70">
                      <span className="text-amber">{phase.index}</span>
                      <span className="relative block h-px w-16 bg-white/20">
                        <span data-phase-line className="absolute inset-0 block bg-amber" />
                      </span>
                      <span>Fase {phase.index} / 04</span>
                    </p>
                    <p className="display text-[clamp(2.4rem,7.4vw,7rem)] text-white">{phase.label}</p>
                    <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-white/75 md:text-lg">
                      {phase.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          {/* Texto accesible de las fases para lectores de pantalla */}
          {!staticMode && (
            <ol className="sr-only">
              {heroPhases.map((p) => (
                <li key={p.index}>
                  {p.label}: {p.text}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* ── Cromo: contador, progreso, indicador de scroll ── */}
        {!staticMode && (
          <>
            <div
              data-hero-chrome
              hidden={status === 'fallback'}
              className="eyebrow pointer-events-none absolute right-[clamp(1rem,4vw,3.5rem)] top-24 flex flex-col items-end gap-1 text-white/70"
            >
              <span>
                SEQ <span ref={counterRef} className="tabular-nums text-white">001 / ---</span>
              </span>
              <span ref={loadRef} className="text-white/50" aria-live="polite">
                Cargando…
              </span>
            </div>

            <div
              data-hero-chrome
              aria-hidden
              className="pointer-events-none absolute right-[clamp(1rem,4vw,3.5rem)] top-1/2 hidden h-[38vh] -translate-y-1/2 md:block"
            >
              <div className="relative h-full w-px bg-white/20">
                <div data-hero-progress className="absolute inset-0 origin-top bg-amber" />
                {heroPhases.map((p, i) => (
                  <span
                    key={p.index}
                    data-tick={i}
                    className="absolute left-1/2 block size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
                    style={{ top: `${p.from * 100}%` }}
                  />
                ))}
              </div>
              <span className="eyebrow absolute -left-2 top-0 -translate-x-full -translate-y-1/2 text-white/50">00</span>
              <span className="eyebrow absolute -left-2 bottom-0 -translate-x-full translate-y-1/2 text-white/50">04</span>
            </div>

            <div
              data-hero-chrome
              className="pointer-events-none absolute bottom-[max(2.5rem,env(safe-area-inset-bottom))] right-[clamp(1rem,4vw,3.5rem)] hidden md:bottom-14 lg:block"
            >
              <div data-hero-scrollcue className="flex flex-col items-center gap-3 text-white/70">
                <span className="eyebrow [writing-mode:vertical-rl]">Scroll</span>
                <span className="relative block h-14 w-px overflow-hidden bg-white/20">
                  <span className="absolute inset-x-0 top-0 block h-1/2 animate-[scrollcue_2.2s_cubic-bezier(0.76,0,0.24,1)_infinite] bg-amber" />
                </span>
                <ArrowDown size={14} strokeWidth={1.5} />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
