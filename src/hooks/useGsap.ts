import { useLayoutEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Ejecuta animaciones GSAP dentro de un gsap.context ligado a `scope`,
 * revirtiéndolas al desmontar (seguro con StrictMode y HMR).
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (self: gsap.Context) => void | (() => void),
  deps: DependencyList = [],
) {
  useLayoutEffect(() => {
    if (!scope.current) return
    const ctx = gsap.context(setup, scope.current)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
