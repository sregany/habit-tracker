/**
 * Configuración de la empresa.
 *
 * Ningún dato de contacto está inventado: todos salen de variables de entorno
 * (ver .env.example). Si una variable está vacía se muestra el placeholder
 * correspondiente, marcado visualmente como pendiente de configurar.
 */
const env = import.meta.env

const clean = (v: string | undefined) => (v ?? '').trim()

export const site = {
  name: 'TERRA FORCE',
  tagline: 'Excavaciones · Movimiento de tierras · Obra civil',

  whatsapp: {
    /** Sólo dígitos, formato internacional sin "+" */
    number: clean(env.VITE_WHATSAPP_NUMBER).replace(/\D/g, ''),
    message: clean(env.VITE_WHATSAPP_MESSAGE) || 'Hola, me gustaría solicitar un presupuesto.',
  },

  contact: {
    phone: clean(env.VITE_CONTACT_PHONE),
    email: clean(env.VITE_CONTACT_EMAIL),
    address: clean(env.VITE_CONTACT_ADDRESS),
    serviceArea: clean(env.VITE_SERVICE_AREA),
  },

  /** Endpoint opcional para el formulario. Vacío = modo demostración. */
  formEndpoint: clean(env.VITE_FORM_ENDPOINT),
} as const

/** Placeholders visibles cuando falta la configuración. */
export const placeholders = {
  phone: '[TELÉFONO — configurar VITE_CONTACT_PHONE]',
  email: '[EMAIL — configurar VITE_CONTACT_EMAIL]',
  address: '[DIRECCIÓN — configurar VITE_CONTACT_ADDRESS]',
  serviceArea: '[ZONA DE TRABAJO — configurar VITE_SERVICE_AREA]',
} as const

export function whatsappUrl(text?: string): string | null {
  if (!site.whatsapp.number) return null
  const msg = encodeURIComponent(text ?? site.whatsapp.message)
  return `https://wa.me/${site.whatsapp.number}?text=${msg}`
}
