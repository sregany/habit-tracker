import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { services } from '../data/content'
import { Lines } from './ui/Lines'
import { Eyebrow } from './ui/Eyebrow'
import { useGsap } from '../hooks/useGsap'
import { prefersReducedMotion } from '../lib/motion'
import { revealFade, revealImage, revealLines } from '../lib/reveal'
import { requestQuote } from '../lib/events'
import { scrollToTarget } from '../lib/scroll'

export function ServicesSection() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, () => {
    if (prefersReducedMotion()) return
    const root = ref.current!
    revealLines(root.querySelector('[data-services-title]')!)
    revealFade(root.querySelectorAll('[data-services-head] [data-reveal]'), root.querySelector('[data-services-head]')!)
    root.querySelectorAll<HTMLElement>('[data-service]').forEach((card) => {
      revealImage(card.querySelector('[data-service-media]')!, { start: 'top 90%' })
      revealFade(card.querySelectorAll('[data-reveal]'), card, { start: 'top 80%', stagger: 0.06, y: 20, delay: 0.15 })
    })
  })

  return (
    <section
      id="servicios"
      ref={ref}
      aria-labelledby="services-title"
      className="relative border-t border-ink/10 bg-bone pb-[clamp(6rem,12vw,11rem)] pt-[clamp(5rem,10vw,9rem)]"
    >
      <div className="shell">
        <header data-services-head className="grid grid-cols-12 gap-x-6 gap-y-8">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow index="02">Servicios</Eyebrow>
          </div>
          <h2
            id="services-title"
            data-services-title
            className="display col-span-12 text-[clamp(2.3rem,5.6vw,5.75rem)] md:col-span-9"
          >
            <Lines lines={['Servicios para', <>cada fase <span className="text-stone">de la obra.</span></>]} />
          </h2>
          <p
            data-reveal
            className="col-span-12 max-w-[30rem] text-lg leading-relaxed text-ink/75 md:col-span-5 md:col-start-4"
          >
            Desde la primera excavación hasta el último camino compactado, trabajamos con un mismo criterio:
            planificación, maquinaria adecuada y orden en la obra.
          </p>
        </header>

        <ol className="mt-[clamp(4rem,8vw,7rem)] grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-24">
          {services.map((s, i) => (
            <li key={s.id} data-service className={`group ${i % 3 === 1 ? 'lg:mt-28' : ''}`}>
              <article className="flex h-full flex-col">
                <div
                  data-service-media
                  className="relative aspect-[4/3] overflow-hidden bg-mist"
                >
                  <div className="absolute inset-0 transition-[scale,filter] duration-[1.4s] ease-out-expo group-hover:scale-[1.06] group-hover:brightness-[0.85]">
                    <img
                      src={s.image}
                      alt={s.alt}
                      width={814}
                      height={562}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover"
                    />
                  </div>
                  <span className="eyebrow absolute left-4 top-4 rounded-full bg-bone/90 px-2.5 py-1 text-ink backdrop-blur">
                    {s.number}
                  </span>
                </div>

                <div className="relative mt-6 flex flex-1 flex-col">
                  <span aria-hidden className="absolute inset-x-0 -top-6 h-px origin-left scale-x-0 bg-amber transition-transform duration-700 ease-out-expo group-hover:scale-x-100" />
                  <p data-reveal className="eyebrow mb-3 text-stone">
                    Servicio <span className="text-ink transition-colors group-hover:text-amber-deep">{s.number}</span> / 06
                  </p>
                  <h3 data-reveal className="text-[1.6rem] font-medium leading-[1.1] tracking-[-0.02em] [font-variation-settings:'wdth'_106]">
                    {s.title}
                  </h3>
                  <p data-reveal className="mt-4 max-w-[26rem] leading-relaxed text-stone">
                    {s.description}
                  </p>
                  <a
                    data-reveal
                    href="#contacto"
                    onClick={(e) => {
                      e.preventDefault()
                      requestQuote(s.id)
                      scrollToTarget('#contacto')
                    }}
                    className="group/link mt-6 inline-flex items-center gap-3 self-start border-b border-ink/20 pb-1.5 text-[0.8125rem] font-medium uppercase tracking-[0.08em] transition-colors hover:border-ink"
                    aria-label={`Solicitar presupuesto de ${s.title}`}
                  >
                    Solicitar presupuesto
                    <ArrowRight
                      size={15}
                      strokeWidth={1.75}
                      className="transition-transform duration-500 ease-out-expo group-hover/link:translate-x-1.5"
                    />
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
