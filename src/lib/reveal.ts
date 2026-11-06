import { gsap } from './gsap'

/** Texto por líneas: cada `.line-mask > span` sube desde abajo de su máscara. */
export function revealLines(trigger: Element, opts: { start?: string; delay?: number; stagger?: number } = {}) {
  const lines = trigger.querySelectorAll('.line-mask > span')
  if (!lines.length) return
  gsap.from(lines, {
    yPercent: 110,
    duration: 1.2,
    ease: 'expo.out',
    stagger: opts.stagger ?? 0.09,
    delay: opts.delay ?? 0,
    scrollTrigger: { trigger, start: opts.start ?? 'top 82%', once: true },
  })
}

/** Elementos con [data-reveal]: aparecen con un ligero desplazamiento. */
export function revealFade(
  targets: gsap.TweenTarget,
  trigger: Element,
  opts: { start?: string; stagger?: number; y?: number; delay?: number } = {},
) {
  gsap.fromTo(
    targets,
    { opacity: 0, y: opts.y ?? 28 },
    {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
      stagger: opts.stagger ?? 0.08,
      delay: opts.delay ?? 0,
      scrollTrigger: { trigger, start: opts.start ?? 'top 85%', once: true },
    },
  )
}

/** Revelado de imagen por máscara (clip-path) + desescalado de la foto interior. */
export function revealImage(
  wrapper: Element,
  opts: { start?: string; from?: string; delay?: number; parallax?: boolean; zoom?: boolean } = {},
) {
  const img = wrapper.querySelector('img')
  const tl = gsap.timeline({
    scrollTrigger: { trigger: wrapper, start: opts.start ?? 'top 88%', once: true },
    delay: opts.delay ?? 0,
  })
  tl.fromTo(
    wrapper,
    { clipPath: opts.from ?? 'inset(14% 10% 14% 10%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out' },
  )
  if (img && opts.zoom !== false) tl.fromTo(img, { scale: 1.22 }, { scale: 1.08, duration: 1.8, ease: 'expo.out' }, 0)

  if (opts.parallax && img) {
    gsap.fromTo(
      img,
      { yPercent: -3 },
      {
        yPercent: 3,
        ease: 'none',
        scrollTrigger: { trigger: wrapper, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    )
  }
}
