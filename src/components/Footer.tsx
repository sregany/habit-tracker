import { ArrowUp } from 'lucide-react'
import { navItems } from '../data/content'
import { placeholders, site } from '../config/site'
import { scrollToTarget } from '../lib/scroll'
import { Logo } from './Navbar'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="shell pb-10 pt-[clamp(4rem,8vw,7rem)]">
        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 md:col-span-5">
            <Logo tone="light" />
            <p className="mt-6 max-w-sm leading-relaxed text-white/60">
              Excavaciones, movimiento de tierras y obra civil con maquinaria especializada.
            </p>
          </div>

          <nav aria-label="Pie de página" className="col-span-6 md:col-span-3">
            <p className="eyebrow mb-5 text-white/40">Navegación</p>
            <ul className="space-y-2.5">
              {navItems.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToTarget(n.href)
                    }}
                    className="text-white/75 transition-colors hover:text-amber"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-6 md:col-span-4">
            <p className="eyebrow mb-5 text-white/40">Contacto</p>
            <ul className="space-y-2.5 text-[0.9375rem] text-white/75">
              <li className="break-words">{site.contact.phone || <Placeholder>{placeholders.phone}</Placeholder>}</li>
              <li className="break-words">{site.contact.email || <Placeholder>{placeholders.email}</Placeholder>}</li>
              <li className="break-words">{site.contact.address || <Placeholder>{placeholders.address}</Placeholder>}</li>
            </ul>
          </div>
        </div>

        {/* Marca a gran escala */}
        <p
          aria-hidden
          className="display mt-[clamp(4rem,8vw,7rem)] select-none whitespace-nowrap text-[min(11.4vw,13.5rem)] leading-[0.8] text-white/[0.06] [font-variation-settings:'wdth'_112]"
        >
          TERRA FORCE
        </p>

        <div className="mt-10 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="eyebrow text-white/40">
            © {year} {site.name} · Empresa ficticia — sitio de demostración · Imágenes conceptuales
          </p>
          <div className="flex items-center gap-6">
            <a id="privacidad" href="#privacidad" className="eyebrow text-white/40 hover:text-white" onClick={(e) => e.preventDefault()}>
              Privacidad <span className="text-amber/80">[pendiente]</span>
            </a>
            <a href="#aviso-legal" className="eyebrow text-white/40 hover:text-white" onClick={(e) => e.preventDefault()}>
              Aviso legal <span className="text-amber/80">[pendiente]</span>
            </a>
            <button
              type="button"
              onClick={() => scrollToTarget('#inicio')}
              aria-label="Volver arriba"
              className="grid size-10 place-items-center rounded-full border border-white/20 transition-colors hover:border-amber hover:bg-amber hover:text-ink"
            >
              <ArrowUp size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function Placeholder({ children }: { children: string }) {
  return <span className="font-mono text-[0.75rem] text-amber/80">{children}</span>
}
