/**
 * Contenido editorial de TERRA FORCE (empresa ficticia).
 *
 * Reglas: sin cifras, modelos, potencias, certificaciones ni afirmaciones
 * comerciales verificables. Los proyectos son demostrativos de portfolio.
 */

export type NavItem = { label: string; href: string }

export const navItems: NavItem[] = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Maquinaria', href: '#maquinaria' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Empresa', href: '#empresa' },
  { label: 'Contacto', href: '#contacto' },
]

/* ───────────────────────────── Hero ───────────────────────────── */

export type HeroPhase = {
  index: string
  label: string
  text: string
  /** Rango de progreso del scroll (0–1) en el que el texto está visible */
  from: number
  to: number
}

/** Textos sincronizados con las fases del vídeo: suelo → impacto → revelado → máquina. */
export const heroPhases: HeroPhase[] = [
  {
    index: '01',
    label: 'Lectura del terreno',
    text: 'Todo proyecto empieza en el suelo. Lo estudiamos antes de moverlo.',
    from: 0.2,
    to: 0.38,
  },
  {
    index: '02',
    label: 'Fuerza controlada',
    text: 'Cada pasada del cazo responde a un plan: ni más tierra, ni menos.',
    from: 0.42,
    to: 0.6,
  },
  {
    index: '03',
    label: 'Precisión técnica',
    text: 'Maquinaria especializada y operarios que conocen cada movimiento.',
    from: 0.64,
    to: 0.8,
  },
  {
    index: '04',
    label: 'Terreno preparado',
    text: 'Dejamos la base lista para que tu proyecto avance.',
    from: 0.84,
    to: 1,
  },
]

/* ─────────────────────────── Servicios ─────────────────────────── */

export type Service = {
  id: string
  number: string
  title: string
  description: string
  image: string
  alt: string
}

export const services: Service[] = [
  {
    id: 'excavaciones',
    number: '01',
    title: 'Excavaciones y cimentaciones',
    description:
      'Vaciados, sótanos y excavación para cimentaciones, ejecutados con control de cotas para que la estructura arranque sobre una base correcta.',
    image: '/images/services/excavaciones-cimentaciones.webp',
    alt: 'Excavación de cimentación con encofrado de hormigón en un terreno rodeado de bosque',
  },
  {
    id: 'movimiento-tierras',
    number: '02',
    title: 'Movimiento de tierras',
    description:
      'Desmontes, terraplenes, explanaciones y nivelaciones. Movemos el volumen necesario para dar al terreno la forma que exige el proyecto.',
    image: '/images/services/movimiento-tierras.webp',
    alt: 'Primer plano del cazo de una excavadora cargado de tierra',
  },
  {
    id: 'demoliciones-roca',
    number: '03',
    title: 'Demoliciones y trabajos en roca',
    description:
      'Martillo hidráulico y maquinaria adaptada para demoler estructuras y abrir paso en terrenos rocosos con seguridad y orden.',
    image: '/images/services/demoliciones-roca.webp',
    alt: 'Martillo hidráulico rompiendo roca en una ladera de montaña',
  },
  {
    id: 'zanjas',
    number: '04',
    title: 'Zanjas y canalizaciones',
    description:
      'Apertura de zanjas para redes de saneamiento, agua, electricidad o telecomunicaciones, con colocación de tubería y relleno posterior.',
    image: '/images/services/zanjas-canalizaciones.webp',
    alt: 'Zanja con tubería instalada y excavadora trabajando al fondo',
  },
  {
    id: 'caminos',
    number: '05',
    title: 'Apertura y acondicionamiento de caminos',
    description:
      'Trazado, apertura y mejora de caminos y accesos: perfilado, aporte de zahorra, cunetas y compactación del firme.',
    image: '/images/services/caminos.webp',
    alt: 'Camino de tierra recién abierto bordeando un talud de roca',
  },
  {
    id: 'alquiler',
    number: '06',
    title: 'Alquiler de maquinaria con operario',
    description:
      'Ponemos en tu obra la máquina adecuada junto a un operario con experiencia, para que tú sólo te ocupes de coordinar el trabajo.',
    image: '/images/services/alquiler-operario.webp',
    alt: 'Operario sujetando su casco junto a una excavadora',
  },
]

/* ─────────────────────────── Maquinaria ─────────────────────────── */

export type Machine = {
  id: string
  name: string
  description: string
  uses: string[]
  image: string
  alt: string
}

/** Sin modelos, potencias ni capacidades: sólo el tipo de máquina y su uso. */
export const machinery: Machine[] = [
  {
    id: 'excavadoras',
    name: 'Excavadoras de cadenas',
    description:
      'La máquina central de cualquier movimiento de tierras. Excavan, cargan y perfilan con estabilidad incluso en pendientes y terrenos irregulares.',
    uses: ['Vaciados', 'Zanjas', 'Carga'],
    image: '/images/machinery/excavadora-cadenas.webp',
    alt: 'Excavadora de cadenas vertiendo tierra al atardecer',
  },
  {
    id: 'palas',
    name: 'Palas cargadoras',
    description:
      'Agilidad para cargar, trasladar y acopiar material. Ideales para alimentar camiones y mantener ordenada la zona de trabajo.',
    uses: ['Carga', 'Acopios', 'Limpieza'],
    image: '/images/machinery/pala-cargadora.webp',
    alt: 'Pala cargadora de ruedas con el cazo lleno de grava',
  },
  {
    id: 'bulldozers',
    name: 'Bulldozers',
    description:
      'Empuje y extendido de grandes volúmenes de tierra. Abren pistas, nivelan plataformas y preparan el terreno para las siguientes fases.',
    uses: ['Explanación', 'Desbroce', 'Extendido'],
    image: '/images/machinery/bulldozer.webp',
    alt: 'Bulldozer empujando tierra con la hoja frontal',
  },
  {
    id: 'dumpers',
    name: 'Camiones dumper',
    description:
      'Transporte de tierras y áridos dentro de la obra y hacia vertedero o acopio, en accesos difíciles y terrenos sin asfaltar.',
    uses: ['Transporte', 'Áridos', 'Evacuación'],
    image: '/images/machinery/camion-dumper.webp',
    alt: 'Camión dumper circulando por una pista de obra con una excavadora al fondo',
  },
  {
    id: 'compactacion',
    name: 'Equipos de compactación',
    description:
      'Rodillos y equipos de compactado para consolidar rellenos, sub-bases y firmes, y garantizar una superficie estable.',
    uses: ['Rellenos', 'Firmes', 'Caminos'],
    image: '/images/machinery/compactacion.webp',
    alt: 'Rodillo compactador trabajando sobre un camino de tierra',
  },
]

/* ─────────────────────────── Proyectos ─────────────────────────── */

export type Project = {
  id: string
  category: string
  title: string
  description: string
  image: string
  alt: string
  /** Todos los proyectos son conceptuales: portfolio de demostración, no obras reales verificadas. */
  demo: true
  /** Proporción visual en la galería */
  shape: 'portrait' | 'landscape' | 'wide'
}

export const PROJECTS_DISCLAIMER =
  'Proyectos conceptuales con fines demostrativos de portfolio. No corresponden a obras reales verificadas.'

export const projects: Project[] = [
  {
    id: 'terreno-montanoso',
    category: 'Movimiento de tierras',
    title: 'Movimiento de tierras en terreno montañoso',
    description: 'Desmonte y perfilado de ladera para abrir una plataforma de trabajo estable en pendiente.',
    image: '/images/projects/terreno-montanoso.webp',
    alt: 'Excavadora trabajando sobre una ladera rocosa al atardecer',
    demo: true,
    shape: 'portrait',
  },
  {
    id: 'preparacion-terrenos',
    category: 'Explanación',
    title: 'Preparación de terrenos',
    description: 'Desbroce, explanación y nivelación de una parcela entre bosque antes del inicio de la edificación.',
    image: '/images/projects/preparacion-terrenos.webp',
    alt: 'Vista aérea de una parcela explanada rodeada de bosque y montañas',
    demo: true,
    shape: 'landscape',
  },
  {
    id: 'caminos-rurales',
    category: 'Caminos',
    title: 'Construcción de caminos rurales',
    description: 'Apertura de trazado, perfilado de taludes y extendido de firme para un acceso de montaña.',
    image: '/images/projects/caminos-rurales.webp',
    alt: 'Camino rural recién construido entre montañas al atardecer',
    demo: true,
    shape: 'wide',
  },
  {
    id: 'canalizaciones',
    category: 'Obra civil',
    title: 'Instalación de canalizaciones',
    description: 'Excavación de zanja, colocación de tubería y relleno compactado a lo largo del trazado.',
    image: '/images/projects/canalizaciones.webp',
    alt: 'Tubería instalada en el interior de una zanja con una excavadora al fondo',
    demo: true,
    shape: 'landscape',
  },
  {
    id: 'muros-contencion',
    category: 'Contención',
    title: 'Muros de contención',
    description: 'Muro de escollera para estabilizar un talud y proteger el camino que discurre a sus pies.',
    image: '/images/projects/muros-contencion.webp',
    alt: 'Muro de escollera de grandes bloques de piedra junto a un talud con vegetación',
    demo: true,
    shape: 'landscape',
  },
]

/* ─────────────────────────── Proceso ─────────────────────────── */

export type Step = { number: string; title: string; text: string; points: string[] }

export const processSteps: Step[] = [
  {
    number: '01',
    title: 'Estudio del terreno',
    text: 'Visitamos la parcela, revisamos accesos, tipo de suelo y condicionantes para entender qué necesita realmente el trabajo.',
    points: ['Visita técnica', 'Accesos y entorno', 'Necesidades del proyecto'],
  },
  {
    number: '02',
    title: 'Planificación y preparación',
    text: 'Definimos fases, maquinaria y recursos. Te presentamos una propuesta clara antes de mover la primera tierra.',
    points: ['Propuesta detallada', 'Selección de maquinaria', 'Calendario de trabajo'],
  },
  {
    number: '03',
    title: 'Ejecución con maquinaria',
    text: 'Trabajamos con la máquina adecuada para cada tarea, con orden en la obra y comunicación constante contigo.',
    points: ['Operarios especializados', 'Seguimiento de la obra', 'Orden y seguridad'],
  },
  {
    number: '04',
    title: 'Finalización y revisión',
    text: 'Revisamos el resultado contigo, dejamos la zona limpia y el terreno preparado para la siguiente fase.',
    points: ['Revisión conjunta', 'Limpieza de la zona', 'Entrega del trabajo'],
  },
]
