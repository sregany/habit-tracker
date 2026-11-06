import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, MoveHorizontal } from 'lucide-react'
import { PROJECTS_DISCLAIMER, projects, type Project } from '../data/content'
import { ButtonLink } from './ui/Button'
import { useGsap } from '../hooks/useGsap'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { getLenis } from '../lib/scroll'
import { requestQuote } from '../lib/events'

/**
 * Galería horizontal.
 * - Escritorio (≥1024px, sin movimiento reducido): sección fijada; el scroll vertical desplaza la pista.
 *   Arrastrar con el ratón convierte el gesto en scroll de página (avanza y retrocede).
 * - Móvil/tablet o movimiento reducido: scroll horizontal nativo con snap (touch nativo + drag con ratón).
 */

const PIN_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

const shapeClass: Record<Project['shape'], string> = {
  portrait: 'w-[78vw] sm:w-[52vw] lg:w-auto lg:h-full lg:aspect-[4/5]',
  landscape: 'w-[86vw] sm:w-[64vw] lg:w-auto lg:h-full lg:aspect-[7/5]',
  wide: 'w-[90vw] sm:w-[76vw] lg:w-auto lg:h-full lg:aspect-[16/9]',
}
const mobileAspect: Record<Project['shape'], string> = {
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[7/5]',
  wide: 'aspect-[16/9]',
}

export function ProjectsGallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState(false)
  const [current, setCurrent] = useState(0)
  const pinRef = useRef<ScrollTrigger | null>(null)

  useGsap(sectionRef, () => {
    const mm = gsap.matchMedia()

    mm.add(PIN_QUERY, () => {
      setPinned(true)
      const track = trackRef.current!
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (fillRef.current) fillRef.current.style.transform = `scaleX(${self.progress})`
            setCurrent(Math.min(projects.length - 1, Math.round(self.progress * (projects.length - 1))))
          },
        },
      })
      pinRef.current = tween.scrollTrigger ?? null

      // Parallax interior de cada fotografía mientras cruza la pantalla
      track.querySelectorAll<HTMLElement>('[data-project-img]').forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -7 },
          {
            xPercent: 7,
            ease: 'none',
            scrollTrigger: {
              trigger: img.parentElement,
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        )
      })

      // Entrada de los textos de cada tarjeta
      track.querySelectorAll<HTMLElement>('[data-project-meta]').forEach((meta) => {
        gsap.from(meta.children, {
          opacity: 0,
          y: 24,
          stagger: 0.06,
          duration: 0.9,
          scrollTrigger: { trigger: meta, containerAnimation: tween, start: 'left 85%', once: true },
        })
      })

      return () => {
        setPinned(false)
        pinRef.current = null
      }
    })

    mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
      const viewport = viewportRef.current!
      const onScroll = () => {
        const max = viewport.scrollWidth - viewport.clientWidth
        const p = max > 0 ? viewport.scrollLeft / max : 0
        if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`
        setCurrent(Math.min(projects.length - 1, Math.round(p * (projects.length - 1))))
      }
      viewport.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
      return () => viewport.removeEventListener('scroll', onScroll)
    })

    return () => mm.revert()
  })

  // Arrastre con ratón (touch usa el scroll nativo)
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    let dragging = false
    let moved = 0
    let lastX = 0
    let velocity = 0
    let lastT = 0

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      dragging = true
      moved = 0
      lastX = e.clientX
      lastT = performance.now()
      velocity = 0
      viewport.setPointerCapture(e.pointerId)
      viewport.dataset.dragging = 'true'
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      const now = performance.now()
      velocity = dx / Math.max(1, now - lastT)
      lastX = e.clientX
      lastT = now
      moved += Math.abs(dx)
      const st = pinRef.current
      if (st) {
        const lenis = getLenis()
        const y = (lenis ? lenis.targetScroll : window.scrollY) - dx * 1.4
        const clamped = Math.min(st.end, Math.max(st.start, y))
        if (lenis) lenis.scrollTo(clamped, { immediate: true })
        else window.scrollTo(0, clamped)
      } else {
        viewport.scrollLeft -= dx
      }
    }
    const up = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      delete viewport.dataset.dragging
      if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId)
      // Inercia suave al soltar
      const st = pinRef.current
      const lenis = getLenis()
      if (st && lenis && Math.abs(velocity) > 0.2) {
        const target = Math.min(st.end, Math.max(st.start, lenis.targetScroll - velocity * 380))
        lenis.scrollTo(target, { duration: 1.1 })
      }
    }
    // Evitar clics accidentales tras arrastrar
    const click = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    viewport.addEventListener('pointerdown', down)
    viewport.addEventListener('pointermove', move)
    viewport.addEventListener('pointerup', up)
    viewport.addEventListener('pointercancel', up)
    viewport.addEventListener('click', click, true)
    return () => {
      viewport.removeEventListener('pointerdown', down)
      viewport.removeEventListener('pointermove', move)
      viewport.removeEventListener('pointerup', up)
      viewport.removeEventListener('pointercancel', up)
      viewport.removeEventListener('click', click, true)
    }
  }, [])

  const step = (dir: 1 | -1) => {
    const next = Math.min(projects.length - 1, Math.max(0, current + dir))
    const card = trackRef.current?.querySelector<HTMLElement>(`[data-project-index="${next}"]`)
    if (!card) return
    const st = pinRef.current
    if (st) {
      const p = projects.length > 1 ? next / (projects.length - 1) : 0
      const y = st.start + (st.end - st.start) * p
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(y, { duration: 1.2 })
      else window.scrollTo({ top: y })
    } else {
      const viewport = viewportRef.current!
      viewport.scrollTo({ left: card.offsetLeft - parseFloat(getComputedStyle(trackRef.current!).paddingLeft), behavior: 'smooth' })
    }
  }

  return (
    <section
      id="proyectos"
      ref={sectionRef}
      aria-labelledby="projects-title"
      className="relative overflow-hidden border-t border-ink/10 bg-bone lg:h-svh"
    >
      <div className="flex h-full flex-col pb-10 pt-[clamp(5rem,10vw,7rem)] lg:pb-8 lg:pt-28">
        {/* Pista */}
        <div
          ref={viewportRef}
          role="region"
          aria-roledescription="carrusel"
          aria-label="Proyectos demostrativos"
          tabIndex={0}
          className={`relative min-h-0 flex-1 scroll-px-[clamp(1rem,4vw,3.5rem)] cursor-grab select-none data-[dragging=true]:cursor-grabbing ${
            pinned
              ? 'overflow-hidden'
              : 'snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          }`}
        >
          <div
            ref={trackRef}
            className="flex h-full items-start gap-[clamp(1rem,2.5vw,2.5rem)] px-[clamp(1rem,4vw,3.5rem)] will-change-transform lg:items-stretch"
          >
            {/* Panel de introducción */}
            <div className="flex w-[86vw] shrink-0 snap-start flex-col justify-between sm:w-[60vw] lg:w-[34vw] lg:min-w-[26rem] lg:pr-8">
              <div>
                <p className="eyebrow flex items-center gap-3 text-stone">
                  <span className="text-ink">04</span>
                  <span aria-hidden className="h-px w-8 bg-current opacity-40" />
                  Proyectos
                </p>
                <h2 id="projects-title" className="display mt-8 text-[clamp(2.4rem,5vw,5.25rem)]">
                  El trabajo
                  <br />
                  habla por
                  <br />
                  <span className="text-stone">nosotros.</span>
                </h2>
              </div>
              <div className="mt-10 space-y-6">
                <p className="max-w-[24rem] text-[0.9375rem] leading-relaxed text-stone">
                  Una selección de trabajos tipo que muestran cómo abordamos cada fase del terreno.
                </p>
                <p className="flex max-w-[24rem] gap-3 border-l-2 border-amber pl-4 text-[0.8125rem] leading-relaxed text-ink/70">
                  {PROJECTS_DISCLAIMER}
                </p>
                <p className="eyebrow hidden items-center gap-2 text-stone lg:flex">
                  <MoveHorizontal size={14} strokeWidth={1.5} /> Desliza o arrastra
                </p>
              </div>
            </div>

            {projects.map((p, i) => (
              <article
                key={p.id}
                data-project-index={i}
                aria-label={`${p.title} — proyecto demostrativo`}
                className={`group flex shrink-0 snap-start flex-col lg:h-full ${shapeClass[p.shape]}`}
              >
                <div
                  className={`relative w-full overflow-hidden bg-mist lg:aspect-auto lg:min-h-0 lg:flex-1 ${mobileAspect[p.shape]}`}
                >
                  <img
                    data-project-img
                    src={p.image}
                    alt={p.alt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="absolute inset-0 size-full object-cover transition-[filter] lg:scale-[1.18] duration-700 group-hover:brightness-90"
                  />
                  <span className="eyebrow absolute left-4 top-4 rounded-full bg-bone/90 px-2.5 py-1 text-ink backdrop-blur">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="eyebrow absolute right-4 top-4 rounded-full bg-ink/70 px-2.5 py-1 text-white backdrop-blur">
                    Demo
                  </span>
                </div>
                <div data-project-meta className="pt-5">
                  <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-stone">
                    <span className="text-amber-deep">{p.category}</span>
                    <span aria-hidden>·</span>
                    <span>Proyecto demostrativo</span>
                  </p>
                  <h3 className="mt-3 text-[clamp(1.35rem,1.8vw,1.75rem)] font-medium leading-[1.1] tracking-[-0.02em] [font-variation-settings:'wdth'_106]">
                    {p.title}
                  </h3>
                  <p className="mt-2 max-w-[30rem] text-[0.9375rem] leading-relaxed text-stone">{p.description}</p>
                </div>
              </article>
            ))}

            {/* Panel final */}
            <div className="flex w-[80vw] shrink-0 snap-start flex-col justify-center gap-8 bg-ink p-8 text-white sm:w-[50vw] lg:w-[30vw] lg:min-w-[24rem] lg:p-12">
              <p className="eyebrow text-white/60">Tu proyecto</p>
              <p className="display text-[clamp(2rem,3.4vw,3.5rem)]">
                ¿El siguiente
                <br />
                <span className="text-amber">es el tuyo?</span>
              </p>
              <ButtonLink href="#contacto" variant="primary" onClick={() => requestQuote()} className="self-start">
                Solicitar presupuesto
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Controles y progreso */}
        <div className="shell mt-8 flex items-center gap-6 lg:mt-6 lg:pr-[calc(clamp(1rem,4vw,3.5rem)+4.5rem)]">
          <span className="eyebrow tabular-nums text-ink">
            {String(current + 1).padStart(2, '0')}
            <span className="text-stone"> / {String(projects.length).padStart(2, '0')}</span>
          </span>
          <div className="relative h-px flex-1 bg-ink/15">
            <div ref={fillRef} className="absolute inset-0 origin-left scale-x-0 bg-ink" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Proyecto anterior"
              className="grid size-11 place-items-center rounded-full border border-ink/20 transition-colors hover:border-ink hover:bg-ink hover:text-bone"
            >
              <ArrowLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Proyecto siguiente"
              className="grid size-11 place-items-center rounded-full border border-ink/20 transition-colors hover:border-ink hover:bg-ink hover:text-bone"
            >
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
