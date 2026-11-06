import { useRef } from 'react'
import { ButtonLink } from './ui/Button'
import { Lines } from './ui/Lines'
import { useGsap } from '../hooks/useGsap'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import { revealFade, revealLines } from '../lib/reveal'
import { requestQuote } from '../lib/events'

export function FinalCta() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, () => {
    if (prefersReducedMotion()) return
    const root = ref.current!
    const panel = root.querySelector('[data-cta-panel]')!

    // El panel se expande hasta ocupar todo el ancho al entrar en pantalla
    gsap.fromTo(
      panel,
      { clipPath: 'inset(8% 6% 8% 6%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'top 15%', scrub: 0.5 },
      },
    )
    gsap.fromTo(
      '[data-cta-img]',
      { yPercent: -8, scale: 1.25 },
      {
        yPercent: 8,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    )
    revealLines(root.querySelector('[data-cta-title]')!, { start: 'top 70%' })
    revealFade(root.querySelectorAll('[data-cta-copy] [data-reveal]'), root.querySelector('[data-cta-copy]')!, {
      start: 'top 85%',
      delay: 0.2,
    })
  })

  return (
    <section ref={ref} aria-labelledby="cta-title" className="relative bg-bone">
      <div
        data-cta-panel
        className="relative flex min-h-[88svh] items-end overflow-hidden bg-ink text-white"
      >
        <img
          data-cta-img
          src="/images/cta/excavator-panorama.webp"
          alt="Excavadora levantando el cazo entre polvo en un terreno de montaña"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover object-[50%_40%]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/10" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent" />

        <div className="shell relative grid grid-cols-12 gap-x-6 gap-y-10 pb-[clamp(3rem,7vw,6rem)] pt-40">
          <h2
            id="cta-title"
            data-cta-title
            className="display col-span-12 text-[clamp(2.1rem,6.2vw,7rem)]"
          >
            <Lines lines={['¿Tienes un terreno', <span className="text-amber">que transformar?</span>]} />
          </h2>
          <div data-cta-copy className="col-span-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p data-reveal className="max-w-[30rem] text-lg leading-relaxed text-white/80">
              Cuéntanos qué necesitas. Estudiaremos tu proyecto y prepararemos una propuesta adaptada a tus
              necesidades.
            </p>
            <div data-reveal>
              <ButtonLink href="#contacto" variant="primary" onClick={() => requestQuote()}>
                Solicitar presupuesto
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
