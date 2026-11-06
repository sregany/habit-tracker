import type { ReactNode } from 'react'

export function Eyebrow({
  index,
  children,
  className = '',
  tone = 'dark',
}: {
  index?: string
  children: ReactNode
  className?: string
  tone?: 'dark' | 'light'
}) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${tone === 'light' ? 'text-white/70' : 'text-stone'} ${className}`}>
      {index && <span className={tone === 'light' ? 'text-amber' : 'text-ink'}>{index}</span>}
      <span aria-hidden className="h-px w-8 bg-current opacity-40" />
      <span>{children}</span>
    </p>
  )
}
