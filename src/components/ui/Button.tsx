import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { scrollToTarget } from '../../lib/scroll'

type Variant = 'primary' | 'light' | 'outline-light' | 'outline-dark' | 'dark'

const base =
  'group/btn relative inline-flex items-center justify-between gap-6 overflow-hidden rounded-full pl-6 pr-2 py-2 ' +
  'text-[0.8125rem] font-medium uppercase tracking-[0.08em] transition-colors duration-500 ease-out-expo ' +
  'disabled:pointer-events-none disabled:opacity-50 select-none'

const variants: Record<Variant, { root: string; fill: string; icon: string }> = {
  primary: {
    root: 'bg-amber text-ink hover:text-bone',
    fill: 'bg-ink',
    icon: 'bg-ink text-amber group-hover/btn:bg-amber group-hover/btn:text-ink',
  },
  light: {
    root: 'bg-bone text-ink hover:text-bone',
    fill: 'bg-ink',
    icon: 'bg-ink text-bone group-hover/btn:bg-amber group-hover/btn:text-ink',
  },
  dark: {
    root: 'bg-ink text-bone hover:text-ink',
    fill: 'bg-amber',
    icon: 'bg-amber text-ink group-hover/btn:bg-ink group-hover/btn:text-amber',
  },
  'outline-light': {
    root: 'text-white ring-1 ring-inset ring-white/35 hover:text-ink',
    fill: 'bg-bone',
    icon: 'bg-white/10 text-white group-hover/btn:bg-ink group-hover/btn:text-bone',
  },
  'outline-dark': {
    root: 'text-ink ring-1 ring-inset ring-ink/25 hover:text-bone',
    fill: 'bg-ink',
    icon: 'bg-ink/5 text-ink group-hover/btn:bg-amber group-hover/btn:text-ink',
  },
}

function Inner({ children, variant, icon }: { children: ReactNode; variant: Variant; icon?: ReactNode }) {
  const v = variants[variant]
  return (
    <>
      {/* Relleno que sube desde abajo al pasar el cursor */}
      <span
        aria-hidden
        className={`absolute inset-0 translate-y-[101%] rounded-full transition-transform duration-500 ease-out-expo group-hover/btn:translate-y-0 ${v.fill}`}
      />
      <span className="relative">{children}</span>
      <span
        aria-hidden
        className={`relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full transition-colors duration-500 ${v.icon}`}
      >
        {icon ?? (
          <>
            <ArrowUpRight
              size={16}
              strokeWidth={1.75}
              className="transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-5 group-hover/btn:-translate-y-5"
            />
            <ArrowUpRight
              size={16}
              strokeWidth={1.75}
              className="absolute -translate-x-5 translate-y-5 transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-0 group-hover/btn:translate-y-0"
            />
          </>
        )}
      </span>
    </>
  )
}

type Common = { variant?: Variant; icon?: ReactNode; className?: string; children: ReactNode }

export function ButtonLink({
  variant = 'primary',
  icon,
  className = '',
  children,
  href,
  onClick,
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={`${base} ${variants[variant].root} ${className}`}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        if (href?.startsWith('#')) {
          e.preventDefault()
          scrollToTarget(href)
        }
      }}
      {...rest}
    >
      <Inner variant={variant} icon={icon}>
        {children}
      </Inner>
    </a>
  )
}

export function Button({
  variant = 'primary',
  icon,
  className = '',
  children,
  type = 'button',
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`${base} ${variants[variant].root} ${className}`} {...rest}>
      <Inner variant={variant} icon={icon}>
        {children}
      </Inner>
    </button>
  )
}
