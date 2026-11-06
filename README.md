# TERRA FORCE — Cinematic Industrial Experience

Web de una empresa **ficticia** de excavaciones, movimiento de tierras y obra civil.
React + Vite + TypeScript + Tailwind CSS v4 + GSAP/ScrollTrigger + Lenis + Lucide.

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve dist/
```

## Despliegue en Vercel

1. Vercel → **Add New… → Project** → importar `sregany/habit-tracker`.
2. **Root Directory:** dejar la raíz del repositorio (todo lo demás lo toma de `vercel.json`: Vite, `npm run build`, `dist`).
3. Añadir en *Settings → Environment Variables* las variables `VITE_*` de `.env.example`.
4. Deploy. Los fotogramas y assets se sirven con caché larga (ver `vercel.json`).

## Preparación de assets (FFmpeg)

Los fotogramas y las imágenes optimizadas ya están generados y versionados en `public/`.
Para regenerarlos (requiere `ffmpeg` y `ffprobe` en el PATH):

```bash
npm run prepare:frames   # vídeo → public/frames/terra-force/{desktop,mobile}/*.webp + manifest.json
npm run prepare:images   # assets-src/images → public/images/{intro,services,machinery,projects}
npm run prepare:assets   # ambos
```

- **Vídeo fuente:** `public/videos/terra-force-hero.mp4` (1280×720, 24 fps, 8 s, 192 fotogramas).
- **Escritorio:** 192 fotogramas WebP a 1280 px. **Móvil:** 96 fotogramas (1 de cada 2) a 854 px.
- El script genera también `public/images/hero/poster.webp` (fallback estático) y
  `public/images/cta/excavator-panorama.webp` (fotografía del bloque CTA), ambos extraídos del vídeo.
- `prepare-images.mjs` recorta los restos de borde de collage que traían varios recortes del pack
  (cajas medidas por detección de costuras) para usar siempre **una sola fotografía** por imagen.

## Configuración (sin datos inventados)

Copia `.env.example` a `.env.local` y rellena:

| Variable | Uso |
| --- | --- |
| `VITE_WHATSAPP_NUMBER` | Número en formato internacional, sólo dígitos. Activa el botón flotante y el del contacto. |
| `VITE_WHATSAPP_MESSAGE` | Mensaje inicial del chat. |
| `VITE_CONTACT_PHONE` / `VITE_CONTACT_EMAIL` / `VITE_CONTACT_ADDRESS` / `VITE_SERVICE_AREA` | Datos visibles en Contacto y footer. |
| `VITE_FORM_ENDPOINT` | Endpoint opcional (POST JSON) para el formulario. Vacío = modo demostración. |

Si una variable está vacía, la web muestra un placeholder marcado (`[TELÉFONO — configurar …]`).
Los enlaces de privacidad y aviso legal están marcados como `[pendiente]`.

## Arquitectura

```
src/
  App.tsx                    Lenis ⇄ GSAP ticker, orden de secciones
  config/site.ts             Configuración de empresa vía variables de entorno
  data/content.ts            Servicios, maquinaria, proyectos (demo), proceso, fases del hero
  lib/                       gsap (plugins), scroll (Lenis + anclas), reveal (helpers), motion, events
  hooks/useGsap.ts           gsap.context con limpieza automática
  components/
    Navbar.tsx               Transparente sobre el hero, sólida después; oculta al bajar; menú móvil
    CinematicHero.tsx        Sección sticky + timeline ScrollTrigger + textos por fases + cromo
    ScrollSequence.tsx       Canvas: carga progresiva, dibujo "cover" sin deformar, fallback
    IntroSection.tsx         Bloque editorial + panorámica con máscara y parallax
    ServicesSection.tsx      6 servicios con imagen individual; CTA que preselecciona el formulario
    MachinerySection.tsx     Imagen sticky que cambia según la máquina activa
    ProjectsGallery.tsx      Galería horizontal: pin + scroll en escritorio, drag con ratón, touch nativo
    ProcessSection.tsx       4 pasos con línea de progreso ligada al scroll
    FinalCta.tsx             Panel que se expande a todo el ancho
    ContactSection.tsx       Formulario con validación accesible + modo demo / endpoint
    Footer.tsx, WhatsAppButton.tsx, ui/
```

## Cómo funciona el hero

- La sección mide 520 vh (420 vh en móvil); el escenario interior es `position: sticky`.
- Una timeline de GSAP con `scrub` mapea el progreso del scroll → índice de fotograma, en ambos sentidos.
- Se cargan primero 12 fotogramas y después el resto en orden grueso → fino (cada 16, 8, 4, 2, 1),
  de modo que cualquier posición del scroll tiene pronto un fotograma cercano. Mientras carga se dibuja
  el fotograma más próximo disponible.
- **Fallbacks:** si falla el manifest, el primer fotograma o el contexto 2D → imagen estática.
  Con `prefers-reduced-motion` o ahorro de datos / dispositivo muy limitado → hero estático de 100 vh,
  sin secuencia ni animaciones.

## Contenido y honestidad

- Los proyectos están marcados como **demostrativos** (`demo: true`, etiqueta “Demo” y aviso visible).
- Sin modelos, potencias, capacidades, cifras ni afirmaciones verificables.
- Las imágenes del pack son conceptuales (generadas por IA, ver `assets-src/images/LEEME.txt`).
  Su resolución original es baja (~400 px de ancho la mayoría); se reescalan con Lanczos. Para
  producción conviene sustituirlas por originales de mayor resolución con los mismos nombres y
  ejecutar `npm run prepare:images`.
