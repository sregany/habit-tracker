/** Bus mínimo para preseleccionar un servicio en el formulario desde cualquier CTA. */
export const SELECT_SERVICE_EVENT = 'terraforce:select-service'

export function requestQuote(serviceId?: string) {
  window.dispatchEvent(new CustomEvent<string | undefined>(SELECT_SERVICE_EVENT, { detail: serviceId }))
}
