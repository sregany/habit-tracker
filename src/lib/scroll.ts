import type Lenis from 'lenis'

let lenis: Lenis | null = null

export const setLenis = (instance: Lenis | null) => {
  lenis = instance
}
export const getLenis = () => lenis

/** Desplazamiento suave a un ancla (#id) respetando Lenis y la navbar fija. */
export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (!el) return
  // Posición absoluta calculada con el scroll nativo real (robusto aunque Lenis
  // aún no haya sincronizado un desplazamiento nativo previo).
  const top = el.getBoundingClientRect().top + window.scrollY + offset
  if (lenis) {
    lenis.scrollTo(top, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) })
  } else {
    window.scrollTo({ top, behavior: 'auto' })
  }
  // Mover el foco para lectores de pantalla / teclado
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}
