import { useEffect } from 'react'
import Lenis from 'lenis'
import { Navbar } from './components/Navbar'
import { CinematicHero } from './components/CinematicHero'
import { IntroSection } from './components/IntroSection'
import { ServicesSection } from './components/ServicesSection'
import { MachinerySection } from './components/MachinerySection'
import { ProjectsGallery } from './components/ProjectsGallery'
import { ProcessSection } from './components/ProcessSection'
import { FinalCta } from './components/FinalCta'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'
import { WhatsAppButton } from './components/WhatsAppButton'
import { gsap, ScrollTrigger } from './lib/gsap'
import { setLenis } from './lib/scroll'
import { prefersReducedMotion } from './lib/motion'

export default function App() {
  // Smooth scroll con Lenis sincronizado con el ticker de GSAP / ScrollTrigger
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, smoothWheel: true })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // Recalcular posiciones cuando terminan de cargar fuentes e imágenes
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-full bg-amber px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido">
        <CinematicHero />
        <IntroSection />
        <ServicesSection />
        <MachinerySection />
        <ProjectsGallery />
        <ProcessSection />
        <FinalCta />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
