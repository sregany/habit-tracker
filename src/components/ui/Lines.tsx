import type { ElementType, ReactNode } from 'react'

/** Texto dividido en líneas enmascaradas para animarlas con GSAP (revealLines). */
export function Lines({
  lines,
  as: Tag = 'span',
  className,
  lineClassName,
}: {
  lines: ReactNode[]
  as?: ElementType
  className?: string
  lineClassName?: string
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="line-mask">
          <span className={lineClassName}>{line}</span>
        </span>
      ))}
    </Tag>
  )
}
