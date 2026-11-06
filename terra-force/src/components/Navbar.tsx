import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navItems } from '../data/content'
import { site } from '../config/site'
import { ScrollTrigger } from '../lib/gsap'
import { getLenis, scrollToTarget } from '../lib/scroll'
import { requestQuote } from '../lib/events'

export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap ${tone === 'light' ? 'text-white' : 'text-ink'}`}>
      <span aria-hidden className="relative block size-[0.7rem] bg-amber" />
      <span className="display text-[1.05rem] leading-none tracking-[-0.01em] [font-variation-settings:'wdth'_125]">
        {site.name}
      </span>
    </span>
  )
}

export function Navbar() {
  const [overHero, setOverHero] = useState(true)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const triggers: ScrollTrigger[] = []

    // Modo claro/oscuro según si estamos sobre el hero
    triggers.push(
      ScrollTrigger.create({
        trigger: '#inicio',
        start: 'top top',
        end: 'bottom top+=80',
        onToggle: (self) => setOverHero(self.isActive),
      }),
    )

    // Ocultar al bajar / mostrar al subir (sólo fuera del hero)
    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const hero = document.getElementById('inicio')
          const pastHero = hero ? self.scroll() > hero.offsetTop + hero.offsetHeight - 80 : true
          setHidden(pastHero && self.direction === 1 && self.getVelocity() > 20)
          if (self.direction === -1) setHidden(false)
        },
      }),
    )

    // Sección activa
    navItems.forEach(({ href }) => {
      const el = document.querySelector(href)
      if (!el) return
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 45%',
          end: 'bottom 45%',
          onToggle: (self) => {
            if (self.isActive) setActive(href)
            else setActive((a) => (a === href ? null : a))
          },
        }),
      )
    })

    return () => triggers.forEach((t) => t.kill())
  }, [])

  // Bloquear el scroll con el menú móvil abierto
  useEffect(() => {
    const lenis = getLenis()
    if (open) {
      lenis?.stop()
      document.documentElement.style.overflow = 'hidden'
      menuRef.current?.querySelector<HTMLElement>('a')?.focus()
    } else {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (href: string) => {
    setOpen(false)
    // Esperar a que se libere el scroll antes de desplazar
    requestAnimationFrame(() => scrollToTarget(href))
  }

  const light = overHero && !open
  const solid = !overHero

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-700 ease-out-expo ${
        hidden && !open ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div
        className={`absolute inset-0 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${
          solid ? 'border-ink/10 bg-bone/85 backdrop-blur-md' : 'border-transparent bg-transparent'
        }`}
      />
      <nav aria-label="Principal" className="shell relative flex h-[4.5rem] items-center justify-between">
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault()
            go('#inicio')
          }}
          aria-label={`${site.name} — inicio`}
          className="relative z-10"
        >
          <Logo tone={light ? 'light' : 'dark'} />
        </a>

        <span
          aria-hidden
          className={`mx-5 hidden h-4 w-px min-[1400px]:block ${light ? 'bg-white/30' : 'bg-ink/20'}`}
        />
        <p
          className={`eyebrow mr-auto hidden truncate transition-opacity duration-500 min-[1400px]:block ${
            overHero ? 'opacity-0' : 'text-stone opacity-100'
          }`}
          aria-hidden={overHero}
        >
          {site.tagline}
        </p>

        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(item.href)
                }}
                aria-current={active === item.href ? 'true' : undefined}
                className={`group relative block px-3.5 py-2 text-[0.8125rem] tracking-[0.02em] transition-colors duration-300 ${
                  light ? 'text-white/80 hover:text-white' : 'text-ink/70 hover:text-ink'
                }`}
              >
                <span className={active === item.href ? (light ? 'text-white' : 'text-ink') : ''}>{item.label}</span>
                <span
                  aria-hidden
                  className={`absolute inset-x-3.5 bottom-1 h-px origin-left bg-amber transition-transform duration-500 ease-out-expo ${
                    active === item.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contacto"
          onClick={(e) => {
            e.preventDefault()
            requestQuote()
            go('#contacto')
          }}
          className={`ml-4 hidden items-center gap-2 rounded-full px-4 py-2.5 text-[0.75rem] font-medium uppercase tracking-[0.08em] transition-colors duration-300 lg:inline-flex ${
            light ? 'bg-white/10 text-white ring-1 ring-white/25 hover:bg-amber hover:text-ink hover:ring-amber' : 'bg-ink text-bone hover:bg-amber hover:text-ink'
          }`}
        >
          Presupuesto
        </a>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className={`relative z-10 -mr-2 grid size-11 place-items-center md:hidden ${light ? 'text-white' : 'text-ink'}`}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </nav>
    </header>

      {/* Menú móvil (fuera del header: su transform rompería position:fixed) */}
      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!open}
        className="fixed inset-0 z-40 flex flex-col bg-bone pt-[4.5rem] md:hidden"
      >
        <ul className="shell flex flex-1 flex-col justify-center gap-1">
          {navItems.map((item, i) => (
            <li key={item.href} className="border-b border-ink/10">
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(item.href)
                }}
                className="flex items-baseline justify-between py-4"
              >
                <span className="display text-[2.4rem]">{item.label}</span>
                <span className="eyebrow text-stone">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="shell eyebrow pb-8 text-stone">{site.tagline}</p>
      </div>
    </>
  )
}
