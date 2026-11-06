import { useRef } from 'react'
import { Lines } from './ui/Lines'
import { Eyebrow } from './ui/Eyebrow'
import { useGsap } from '../hooks/useGsap'
import { prefersReducedMotion } from '../lib/motion'
import { revealFade, revealImage, revealLines } from '../lib/reveal'

const pillars = [
  { k: 'Estudio previo', v: 'Analizamos cada terreno antes de proponer cómo trabajarlo.' },
  { k: 'Maquinaria adecuada', v: 'Elegimos el equipo según la tarea, el acceso y el tipo de suelo.' },
  { k: 'Comunicación directa', v: 'Un interlocutor claro durante toda la obra.' },
]

export function IntroSection() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, () => {
    if (prefersReducedMotion()) return
    const root = ref.current!
    revealLines(root.querySelector('[data-intro-title]')!)
    revealFade(root.querySelectorAll('[data-intro-copy] [data-reveal]'), root.querySelector('[data-intro-copy]')!)
    revealImage(root.querySelector('[data-intro-image]')!, { from: 'inset(18% 18% 18% 18%)', parallax: true })
    revealFade(root.querySelectorAll('[data-pillar]'), root.querySelector('[data-pillars]')!, { stagger: 0.12 })
  })

  return (
    <section id="empresa" ref={ref} aria-labelledby="intro-title" className="relative bg-bone py-[clamp(6rem,13vw,12rem)]">
      <div className="shell">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow index="01">Empresa</Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 id="intro-title" data-intro-title className="display text-[clamp(2.3rem,5.6vw,5.75rem)]">
              <Lines lines={['Preparamos', 'el terreno.']} />
              <Lines lines={['Hacemos posible', 'el proyecto.']} className="text-stone" />
            </h2>
          </div>

          <div data-intro-copy className="col-span-12 grid grid-cols-12 gap-6 md:col-span-9 md:col-start-4">
            <p
              data-reveal
              className="col-span-12 max-w-[34rem] text-[1.125rem] leading-[1.65] text-ink/80 md:col-span-7 md:text-[1.25rem]"
            >
              Desde excavaciones y movimientos de tierra hasta trabajos de obra civil, ofrecemos soluciones
              adaptadas a las necesidades de cada proyecto.
            </p>
            <p data-reveal className="eyebrow col-span-12 self-end text-stone md:col-span-5 md:text-right">
              Excavación — Movimiento de tierras — Obra civil
            </p>
          </div>
        </div>

        <figure className="mt-[clamp(4rem,8vw,7rem)]">
          <div
            data-intro-image
            className="relative aspect-[4/3] overflow-hidden bg-mist sm:aspect-[16/9] lg:aspect-[2.35/1]"
          >
            <img
              src="/images/intro/terraces-aerial.webp"
              alt="Vista aérea de un movimiento de tierras en terrazas de montaña con excavadora y camión trabajando"
              width={1664}
              height={736}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
          <figcaption className="eyebrow mt-4 flex justify-between gap-4 text-stone">
            <span>Movimiento de tierras en ladera</span>
            <span className="hidden sm:inline">Imagen conceptual</span>
          </figcaption>
        </figure>

        <ul data-pillars className="mt-[clamp(3.5rem,7vw,6rem)] grid gap-px bg-ink/10 md:grid-cols-3">
          {pillars.map((p, i) => (
            <li data-pillar data-reveal key={p.k} className="bg-bone py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <p className="eyebrow mb-4 text-stone">0{i + 1}</p>
              <p className="text-xl font-medium tracking-[-0.01em]">{p.k}</p>
              <p className="mt-2 max-w-xs leading-relaxed text-stone">{p.v}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
