import { useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { processSteps } from '../data/content'
import { Lines } from './ui/Lines'
import { Eyebrow } from './ui/Eyebrow'
import { useGsap } from '../hooks/useGsap'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import { revealFade, revealLines } from '../lib/reveal'

export function ProcessSection() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGsap(ref, () => {
    const root = ref.current!
    const steps = root.querySelectorAll<HTMLElement>('[data-step]')

    steps.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        end: 'bottom 60%',
        onToggle: (self) => self.isActive && setActive(i),
      })
    })

    if (prefersReducedMotion()) return

    revealLines(root.querySelector('[data-process-title]')!)
    revealFade(root.querySelectorAll('[data-process-head] [data-reveal]'), root.querySelector('[data-process-head]')!)

    // Línea de progreso que se rellena con el scroll
    gsap.fromTo(
      '[data-process-line]',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '[data-process-list]', start: 'top 60%', end: 'bottom 60%', scrub: 0.4 },
      },
    )

    steps.forEach((el) => {
      revealFade(el.querySelectorAll('[data-reveal]'), el, { start: 'top 78%', stagger: 0.08 })
      gsap.from(el.querySelector('[data-step-dot]'), {
        scale: 0,
        duration: 0.8,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: el, start: 'top 62%', once: true },
      })
    })
  })

  return (
    <section
      id="proceso"
      ref={ref}
      aria-labelledby="process-title"
      className="relative border-t border-ink/10 bg-bone py-[clamp(6rem,12vw,11rem)]"
    >
      <div className="shell grid grid-cols-12 gap-x-6 gap-y-16">
        <div data-process-head className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-[18vh]">
            <Eyebrow index="05">Proceso</Eyebrow>
            <h2 id="process-title" data-process-title className="display mt-8 text-[clamp(2.3rem,4.2vw,4.5rem)]">
              <Lines lines={['Cómo', 'trabajamos.']} />
            </h2>
            <p data-reveal className="mt-8 max-w-[26rem] text-lg leading-relaxed text-ink/75">
              Un método claro en cuatro pasos, para que sepas en todo momento qué se está haciendo y por qué.
            </p>
            <div data-reveal aria-hidden className="mt-14 hidden items-end gap-4 lg:flex">
              <span className="display relative block h-[0.92em] overflow-hidden text-[clamp(6rem,10vw,10rem)] text-amber">
                {processSteps.map((s, i) => (
                  <span
                    key={s.number}
                    className="block transition-transform duration-700 ease-out-expo"
                    style={{ transform: `translateY(${(i - active) * 100}%)`, position: i ? 'absolute' : 'relative', top: 0, left: 0 }}
                  >
                    {s.number}
                  </span>
                ))}
              </span>
              <span className="eyebrow mb-3 text-stone">/ 04</span>
            </div>
          </div>
        </div>

        <ol data-process-list className="relative col-span-12 lg:col-span-7">
          <span aria-hidden className="absolute bottom-0 left-[5px] top-0 w-px bg-ink/12" />
          <span aria-hidden data-process-line className="absolute bottom-0 left-[5px] top-0 w-px origin-top bg-amber" />
          {processSteps.map((s, i) => (
            <li
              key={s.number}
              data-step
              aria-current={i === active ? 'step' : undefined}
              className="relative pb-20 pl-12 last:pb-0 md:pl-20"
            >
              <span
                data-step-dot
                aria-hidden
                className={`absolute left-0 top-2 block size-[11px] rounded-full border-2 transition-colors duration-500 ${
                  i <= active ? 'border-amber bg-amber' : 'border-ink/25 bg-bone'
                }`}
              />
              <p data-reveal className="eyebrow text-stone">
                Paso <span className="text-ink">{s.number}</span>
              </p>
              <h3
                data-reveal
                className={`mt-4 text-[clamp(1.9rem,3.4vw,3rem)] font-medium leading-[1.02] tracking-[-0.025em] transition-colors duration-500 [font-variation-settings:'wdth'_108] ${
                  i === active ? 'text-ink' : 'text-ink lg:text-ink/40'
                }`}
              >
                {s.title}
              </h3>
              <p data-reveal className="mt-5 max-w-[34rem] text-[1.0625rem] leading-relaxed text-stone">
                {s.text}
              </p>
              <ul data-reveal className="mt-7 grid gap-3 border-t border-ink/10 pt-6 sm:grid-cols-3">
                {s.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-[0.9375rem] text-ink/80">
                    <Check size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-amber-deep" />
                    {pt}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
