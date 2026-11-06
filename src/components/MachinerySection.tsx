import { useRef, useState } from 'react'
import { machinery } from '../data/content'
import { Lines } from './ui/Lines'
import { Eyebrow } from './ui/Eyebrow'
import { useGsap } from '../hooks/useGsap'
import { ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import { revealFade, revealImage, revealLines } from '../lib/reveal'

export function MachinerySection() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGsap(ref, () => {
    const root = ref.current!

    // La máquina activa sigue al scroll (escritorio). Funciona también con movimiento reducido.
    root.querySelectorAll<HTMLElement>('[data-machine]').forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(i),
      })
    })

    if (prefersReducedMotion()) return
    revealLines(root.querySelector('[data-machinery-title]')!)
    revealFade(root.querySelectorAll('[data-machinery-head] [data-reveal]'), root.querySelector('[data-machinery-head]')!)
    revealImage(root.querySelector('[data-machinery-stage]')!, { from: 'inset(10% 10% 10% 10%)', zoom: false })
    root.querySelectorAll<HTMLElement>('[data-machine]').forEach((el) => {
      revealFade(el.querySelectorAll('[data-reveal]'), el, { start: 'top 85%', stagger: 0.07, y: 22 })
      const media = el.querySelector('[data-machine-media]')
      if (media && getComputedStyle(media).display !== 'none') revealImage(media, { start: 'top 90%' })
    })
  })

  return (
    <section
      id="maquinaria"
      ref={ref}
      aria-labelledby="machinery-title"
      className="relative bg-paper py-[clamp(6rem,12vw,11rem)]"
    >
      <div className="shell">
        <header data-machinery-head className="grid grid-cols-12 gap-x-6 gap-y-8">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow index="03">Maquinaria</Eyebrow>
          </div>
          <h2
            id="machinery-title"
            data-machinery-title
            className="display col-span-12 text-[clamp(2.3rem,5.6vw,5.75rem)] md:col-span-9"
          >
            <Lines lines={['Maquinaria', 'preparada para', <span className="text-stone">cada reto.</span>]} />
          </h2>
          <p
            data-reveal
            className="col-span-12 max-w-[30rem] text-lg leading-relaxed text-ink/75 md:col-span-5 md:col-start-4"
          >
            Cada trabajo pide una máquina distinta. Combinamos equipos de excavación, carga, empuje, transporte
            y compactación según el terreno y la fase de la obra.
          </p>
        </header>

        <div className="mt-[clamp(4rem,8vw,7rem)] grid grid-cols-12 gap-x-6">
          {/* Imagen fija (escritorio) */}
          <div className="relative col-span-12 hidden lg:col-span-6 lg:block">
            <div className="sticky top-[14vh]">
              <div data-machinery-stage className="relative aspect-[5/4] overflow-hidden bg-mist">
                {machinery.map((m, i) => (
                  <img
                    key={m.id}
                    src={m.image}
                    alt={i === active ? m.alt : ''}
                    aria-hidden={i !== active}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover transition-[clip-path,scale] duration-[1.1s] ease-out-expo"
                    style={{
                      clipPath: i === active ? 'inset(0% 0% 0% 0%)' : i < active ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)',
                      scale: i === active ? '1' : '1.08',
                      zIndex: i === active ? 2 : 1,
                    }}
                  />
                ))}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between bg-gradient-to-t from-ink/60 to-transparent p-5 pt-16 text-white">
                  <span className="eyebrow">{machinery[active].name}</span>
                  <span className="eyebrow tabular-nums">
                    {String(active + 1).padStart(2, '0')} / {String(machinery.length).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Listado */}
          <ol className="col-span-12 lg:col-span-6 lg:pl-[clamp(1rem,4vw,5rem)]">
            {machinery.map((m, i) => {
              const on = i === active
              return (
                <li
                  key={m.id}
                  data-machine
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  tabIndex={0}
                  aria-current={on ? 'true' : undefined}
                  className="group relative border-t border-ink/12 py-10 outline-none last:border-b lg:py-14"
                >
                  <span
                    aria-hidden
                    className={`absolute left-0 top-[-1px] h-px w-full origin-left bg-ink transition-transform duration-700 ease-out-expo ${
                      on ? 'lg:scale-x-100' : 'scale-x-0'
                    }`}
                  />
                  <div data-machine-media className="relative mb-8 aspect-[16/10] overflow-hidden bg-mist lg:hidden">
                    <img
                      src={m.image}
                      alt={m.alt}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover"
                    />
                  </div>
                  <div className="flex items-baseline gap-5">
                    <span data-reveal className={`eyebrow transition-colors ${on ? 'lg:text-amber-deep' : ''} text-stone`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <h3
                        data-reveal
                        className={`text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium leading-[1.02] tracking-[-0.025em] transition-colors duration-500 [font-variation-settings:'wdth'_108] ${
                          on ? 'text-ink' : 'text-ink lg:text-ink/35'
                        }`}
                      >
                        {m.name}
                      </h3>
                      <p
                        data-reveal
                        className={`mt-4 max-w-[30rem] leading-relaxed text-stone transition-opacity duration-500 ${
                          on ? 'opacity-100' : 'lg:opacity-60'
                        }`}
                      >
                        {m.description}
                      </p>
                      <ul data-reveal className="mt-5 flex flex-wrap gap-2" aria-label="Usos habituales">
                        {m.uses.map((u) => (
                          <li key={u} className="eyebrow rounded-full border border-ink/15 px-3 py-1.5 text-ink/70">
                            {u}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
