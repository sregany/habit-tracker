import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { services } from '../data/content'
import { placeholders, site, whatsappUrl } from '../config/site'
import { SELECT_SERVICE_EVENT } from '../lib/events'
import { Lines } from './ui/Lines'
import { Eyebrow } from './ui/Eyebrow'
import { Button } from './ui/Button'
import { WhatsAppButton } from './WhatsAppButton'
import { useGsap } from '../hooks/useGsap'
import { prefersReducedMotion } from '../lib/motion'
import { revealFade, revealLines } from '../lib/reveal'

type FormState = {
  nombre: string
  empresa: string
  telefono: string
  email: string
  servicio: string
  ubicacion: string
  descripcion: string
  privacidad: boolean
}

const empty: FormState = {
  nombre: '',
  empresa: '',
  telefono: '',
  email: '',
  servicio: '',
  ubicacion: '',
  descripcion: '',
  privacidad: false,
}

type Errors = Partial<Record<keyof FormState, string>>

function validate(f: FormState): Errors {
  const e: Errors = {}
  if (f.nombre.trim().length < 2) e.nombre = 'Indica tu nombre.'
  if (!/^[+\d][\d\s().-]{6,}$/.test(f.telefono.trim())) e.telefono = 'Introduce un teléfono válido.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Introduce un email válido.'
  if (!f.servicio) e.servicio = 'Selecciona un tipo de servicio.'
  if (f.ubicacion.trim().length < 2) e.ubicacion = 'Indica dónde está el proyecto.'
  if (f.descripcion.trim().length < 10) e.descripcion = 'Cuéntanos un poco más (mín. 10 caracteres).'
  if (!f.privacidad) e.privacidad = 'Debes aceptar la política de privacidad.'
  return e
}

const inputBase =
  'peer w-full border-0 border-b bg-transparent px-0 pb-3 pt-2 text-[1.0625rem] text-ink placeholder:text-ink/30 ' +
  'transition-colors duration-300 focus:outline-none focus:ring-0 focus-visible:outline-none'

function Field({
  id,
  label,
  required,
  error,
  className = '',
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="eyebrow mb-1 block text-stone">
        {label}
        {required ? <span className="text-amber-deep"> *</span> : <span className="normal-case tracking-normal"> (opcional)</span>}
      </label>
      {children}
      <p id={`${id}-error`} role={error ? 'alert' : undefined} className="mt-2 min-h-[1.1rem] text-[0.8125rem] text-[#a3361f]">
        {error}
      </p>
    </div>
  )
}

function ContactValue({ value, placeholder }: { value: string; placeholder: string }) {
  if (value) return <span className="text-ink">{value}</span>
  return (
    <span className="rounded-sm border border-dashed border-amber-deep/50 bg-amber/10 px-1.5 py-0.5 font-mono text-[0.75rem] text-amber-deep">
      {placeholder}
    </span>
  )
}

export function ContactSection() {
  const ref = useRef<HTMLElement>(null)
  const uid = useId()
  const [form, setForm] = useState<FormState>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // Preselección del servicio desde cualquier CTA de la página
  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<string | undefined>).detail
      if (id) setForm((f) => ({ ...f, servicio: id }))
      if (status === 'sent') setStatus('idle')
    }
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect)
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect)
  }, [status])

  useGsap(ref, () => {
    if (prefersReducedMotion()) return
    const root = ref.current!
    revealLines(root.querySelector('[data-contact-title]')!)
    revealFade(root.querySelectorAll('[data-contact-info] [data-reveal]'), root.querySelector('[data-contact-info]')!)
    revealFade(root.querySelectorAll('form [data-reveal]'), root.querySelector('form')!, { stagger: 0.05, y: 18 })
  })

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    const next = { ...form, [k]: v }
    setForm(next)
    if (touched) setErrors(validate(next))
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTouched(true)
    const errs = validate(form)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus()
      return
    }
    setStatus('sending')
    try {
      const payload = {
        ...form,
        servicioNombre: services.find((s) => s.id === form.servicio)?.title ?? 'Otro',
        enviadoEn: new Date().toISOString(),
      }
      if (site.formEndpoint) {
        const res = await fetch(site.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(String(res.status))
      } else {
        // Modo demostración: no se envía a ningún servidor.
        await new Promise((r) => setTimeout(r, 900))
        console.info('[TERRA FORCE] Formulario en modo demostración. Datos:', payload)
      }
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const fid = (k: keyof FormState) => `${uid}-${k}`
  const errProps = (k: keyof FormState) => ({
    id: fid(k),
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': `${fid(k)}-error`,
  })
  const border = (k: keyof FormState) => (errors[k] ? 'border-[#a3361f]' : 'border-ink/20 focus:border-ink hover:border-ink/50')

  const waSummary = whatsappUrl(
    `Hola, soy ${form.nombre}${form.empresa ? ` (${form.empresa})` : ''}. Me interesa: ${
      services.find((s) => s.id === form.servicio)?.title ?? 'otro servicio'
    }. Ubicación: ${form.ubicacion}. ${form.descripcion}`,
  )

  return (
    <section
      id="contacto"
      ref={ref}
      aria-labelledby="contact-title"
      className="relative bg-paper py-[clamp(6rem,12vw,11rem)]"
    >
      <div className="shell grid grid-cols-12 gap-x-6 gap-y-16">
        <div data-contact-info className="col-span-12 lg:col-span-5">
          <Eyebrow index="06">Contacto</Eyebrow>
          <h2 id="contact-title" data-contact-title className="display mt-8 text-[clamp(2.3rem,4.2vw,4.5rem)]">
            <Lines lines={['Hablemos de', <span className="text-stone">tu proyecto.</span>]} />
          </h2>
          <p data-reveal className="mt-8 max-w-[26rem] text-lg leading-relaxed text-ink/75">
            Describe el trabajo que necesitas y dónde se encuentra. Revisaremos la información y nos pondremos en
            contacto contigo para preparar una propuesta.
          </p>

          <dl data-reveal className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {[
              ['Teléfono', site.contact.phone, placeholders.phone],
              ['Email', site.contact.email, placeholders.email],
              ['Dirección', site.contact.address, placeholders.address],
              ['Zona de trabajo', site.contact.serviceArea, placeholders.serviceArea],
            ].map(([k, v, ph]) => (
              <div key={k} className="grid grid-cols-[8.5rem_1fr] items-baseline gap-4 py-4">
                <dt className="eyebrow text-stone">{k}</dt>
                <dd className="text-[0.9375rem] break-words">
                  <ContactValue value={v} placeholder={ph} />
                </dd>
              </div>
            ))}
          </dl>

          <div data-reveal className="mt-8">
            <WhatsAppButton variant="inline" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          {status === 'sent' ? (
            <div role="status" className="flex min-h-[32rem] flex-col justify-center border border-ink/10 bg-bone p-8 md:p-12">
              <CheckCircle2 size={36} strokeWidth={1.25} className="text-amber-deep" />
              <p className="display mt-8 text-[clamp(2rem,4vw,3.25rem)]">Solicitud recibida.</p>
              <p className="mt-5 max-w-md leading-relaxed text-stone">
                Gracias, {form.nombre.split(' ')[0]}. Revisaremos la información de tu proyecto y te contactaremos.
              </p>
              {!site.formEndpoint && (
                <p className="mt-6 max-w-md rounded-sm border border-dashed border-amber-deep/50 bg-amber/10 px-4 py-3 font-mono text-[0.75rem] leading-relaxed text-amber-deep">
                  Modo demostración: el formulario no está conectado. Configura VITE_FORM_ENDPOINT para recibir las
                  solicitudes.
                </p>
              )}
              <div className="mt-10 flex flex-wrap gap-3">
                {waSummary && (
                  <a
                    href={waSummary}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#1f9d55] px-5 py-3 text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-white"
                  >
                    Enviar también por WhatsApp
                  </a>
                )}
                <Button
                  variant="outline-dark"
                  onClick={() => {
                    setForm(empty)
                    setErrors({})
                    setTouched(false)
                    setStatus('idle')
                  }}
                >
                  Nueva solicitud
                </Button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} aria-describedby={`${uid}-req`} className="grid grid-cols-2 gap-x-8 gap-y-6">
              <p id={`${uid}-req`} data-reveal className="eyebrow col-span-2 text-stone">
                Los campos con <span className="text-amber-deep">*</span> son obligatorios
              </p>

              <Field id={fid('nombre')} label="Nombre" required error={errors.nombre} className="col-span-2 sm:col-span-1">
                <input
                  data-reveal
                  {...errProps('nombre')}
                  type="text"
                  autoComplete="name"
                  value={form.nombre}
                  onChange={(e) => set('nombre', e.target.value)}
                  className={`${inputBase} ${border('nombre')}`}
                />
              </Field>
              <Field id={fid('empresa')} label="Empresa" error={errors.empresa} className="col-span-2 sm:col-span-1">
                <input
                  data-reveal
                  {...errProps('empresa')}
                  type="text"
                  autoComplete="organization"
                  value={form.empresa}
                  onChange={(e) => set('empresa', e.target.value)}
                  className={`${inputBase} ${border('empresa')}`}
                />
              </Field>
              <Field id={fid('telefono')} label="Teléfono" required error={errors.telefono} className="col-span-2 sm:col-span-1">
                <input
                  data-reveal
                  {...errProps('telefono')}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.telefono}
                  onChange={(e) => set('telefono', e.target.value)}
                  className={`${inputBase} ${border('telefono')}`}
                />
              </Field>
              <Field id={fid('email')} label="Email" required error={errors.email} className="col-span-2 sm:col-span-1">
                <input
                  data-reveal
                  {...errProps('email')}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className={`${inputBase} ${border('email')}`}
                />
              </Field>
              <Field id={fid('servicio')} label="Tipo de servicio" required error={errors.servicio} className="col-span-2 sm:col-span-1">
                <div className="relative">
                  <select
                    data-reveal
                    {...errProps('servicio')}
                    value={form.servicio}
                    onChange={(e) => set('servicio', e.target.value)}
                    className={`${inputBase} ${border('servicio')} appearance-none pr-8 ${form.servicio ? '' : 'text-ink/40'}`}
                  >
                    <option value="" disabled>
                      Selecciona…
                    </option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id} className="text-ink">
                        {s.number} — {s.title}
                      </option>
                    ))}
                    <option value="otro" className="text-ink">
                      Otro / varios servicios
                    </option>
                  </select>
                  <span aria-hidden className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-stone">
                    ▾
                  </span>
                </div>
              </Field>
              <Field id={fid('ubicacion')} label="Ubicación del proyecto" required error={errors.ubicacion} className="col-span-2 sm:col-span-1">
                <input
                  data-reveal
                  {...errProps('ubicacion')}
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Municipio / provincia"
                  value={form.ubicacion}
                  onChange={(e) => set('ubicacion', e.target.value)}
                  className={`${inputBase} ${border('ubicacion')}`}
                />
              </Field>
              <Field id={fid('descripcion')} label="Descripción del trabajo" required error={errors.descripcion} className="col-span-2">
                <textarea
                  data-reveal
                  {...errProps('descripcion')}
                  rows={5}
                  placeholder="Tipo de terreno, accesos, plazos aproximados…"
                  value={form.descripcion}
                  onChange={(e) => set('descripcion', e.target.value)}
                  className={`${inputBase} ${border('descripcion')} resize-y`}
                />
              </Field>

              <div className="col-span-2">
                <label data-reveal className="flex cursor-pointer items-start gap-3 text-[0.9375rem] text-ink/80">
                  <input
                    {...errProps('privacidad')}
                    type="checkbox"
                    checked={form.privacidad}
                    onChange={(e) => set('privacidad', e.target.checked)}
                    className="mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded-[3px] border border-ink/30 bg-paper bg-center bg-no-repeat transition-colors checked:border-ink checked:bg-ink checked:bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22><path%20d=%22M3.5%208.5l3%203%206-7%22%20fill=%22none%22%20stroke=%22%23D9A52D%22%20stroke-width=%222%22/></svg>')]"
                  />
                  <span>
                    He leído y acepto la{' '}
                    <a href="#privacidad" className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                      política de privacidad
                    </a>
                    .
                  </span>
                </label>
                <p id={`${fid('privacidad')}-error`} role={errors.privacidad ? 'alert' : undefined} className="mt-2 min-h-[1.1rem] text-[0.8125rem] text-[#a3361f]">
                  {errors.privacidad}
                </p>
              </div>

              <div data-reveal className="col-span-2 flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 pt-8">
                <p className="max-w-xs text-[0.8125rem] leading-relaxed text-stone">
                  {site.formEndpoint
                    ? 'Usaremos tus datos únicamente para responder a esta solicitud.'
                    : 'Formulario en modo demostración: no se envía ningún dato.'}
                </p>
                <Button
                  type="submit"
                  variant="dark"
                  disabled={status === 'sending'}
                  icon={status === 'sending' ? <Loader2 size={16} className="animate-spin" /> : undefined}
                >
                  {status === 'sending' ? 'Enviando…' : 'Solicitar presupuesto'}
                </Button>
                {status === 'error' && (
                  <p role="alert" className="w-full text-[0.875rem] text-[#a3361f]">
                    No se ha podido enviar la solicitud. Inténtalo de nuevo en unos minutos.
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
