import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { site, whatsappUrl } from '../config/site'
import { scrollToTarget } from '../lib/scroll'
import { ScrollTrigger } from '../lib/gsap'

/**
 * Botón flotante de WhatsApp. El número se configura con VITE_WHATSAPP_NUMBER.
 * Si no está configurado, no se inventa ninguno: el botón lleva al formulario
 * y queda marcado como pendiente de configuración.
 */
export function WhatsAppButton({ variant = 'floating' }: { variant?: 'floating' | 'inline' }) {
  const url = whatsappUrl()
  const configured = Boolean(url)
  // El botón flotante aparece al salir del hero (no compite con la secuencia)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (variant !== 'floating') return
    const check = () => {
      const hero = document.getElementById('inicio')
      const limit = hero ? hero.offsetTop + hero.offsetHeight - window.innerHeight * 0.6 : 0
      setVisible(window.scrollY > limit)
    }
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: check, onRefresh: check })
    check()
    return () => st.kill()
  }, [variant])

  const label = configured ? 'Escríbenos por WhatsApp' : 'WhatsApp (número pendiente de configurar)'

  if (variant === 'inline') {
    return (
      <a
        href={url ?? '#contacto'}
        target={configured ? '_blank' : undefined}
        rel={configured ? 'noopener noreferrer' : undefined}
        onClick={(e) => {
          if (configured) return
          e.preventDefault()
          console.info('[TERRA FORCE] Configura VITE_WHATSAPP_NUMBER para activar WhatsApp.')
        }}
        aria-disabled={!configured}
        title={configured ? undefined : 'Configura VITE_WHATSAPP_NUMBER en .env.local'}
        className={`group inline-flex items-center gap-3 rounded-full border px-5 py-3 text-[0.8125rem] font-medium uppercase tracking-[0.08em] transition-colors ${
          configured
            ? 'border-ink/20 hover:border-[#1f9d55] hover:bg-[#1f9d55] hover:text-white'
            : 'cursor-help border-dashed border-ink/30 text-stone'
        }`}
      >
        <MessageCircle size={17} strokeWidth={1.75} />
        {configured ? 'WhatsApp' : 'WhatsApp · [pendiente de configurar]'}
      </a>
    )
  }

  return (
    <a
      href={url ?? '#contacto'}
      target={configured ? '_blank' : undefined}
      rel={configured ? 'noopener noreferrer' : undefined}
      onClick={(e) => {
        if (configured) return
        e.preventDefault()
        scrollToTarget('#contacto')
      }}
      aria-label={`${label} — ${site.name}`}
      title={configured ? label : 'Número de WhatsApp pendiente de configurar (VITE_WHATSAPP_NUMBER)'}
      tabIndex={visible ? undefined : -1}
      aria-hidden={!visible}
      className={`${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'} group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[clamp(1rem,2.5vw,2rem)] z-40 flex items-center gap-0 overflow-hidden rounded-full bg-[#1f9d55] p-3.5 text-white shadow-[0_8px_30px_-12px_rgba(23,25,22,0.6)] transition-[gap,padding] duration-500 ease-out-expo hover:gap-3 hover:pr-5 [transition-property:gap,padding,opacity,translate]`}
    >
      <MessageCircle size={22} strokeWidth={1.75} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[0.8125rem] font-medium transition-[max-width] duration-500 ease-out-expo group-hover:max-w-[14rem]">
        {configured ? 'WhatsApp' : 'WhatsApp · sin configurar'}
      </span>
      {!configured && (
        <span aria-hidden className="absolute right-2 top-2 size-2 rounded-full bg-amber ring-2 ring-[#1f9d55]" />
      )}
    </a>
  )
}
