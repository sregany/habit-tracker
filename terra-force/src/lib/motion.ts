/** Preferencias de movimiento y capacidad del dispositivo. */

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isCoarsePointer = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

type NavigatorExtras = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

/**
 * Dispositivos de bajo rendimiento o con ahorro de datos reciben la versión
 * estática del hero (imagen fija) en lugar de la secuencia de fotogramas.
 */
export const isLowPowerDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false
  const n = navigator as NavigatorExtras
  if (n.connection?.saveData) return true
  if (n.connection?.effectiveType && /(^|-)2g$/.test(n.connection.effectiveType)) return true
  if (typeof n.deviceMemory === 'number' && n.deviceMemory <= 1) return true
  return false
}
