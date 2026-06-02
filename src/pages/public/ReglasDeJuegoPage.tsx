import { useState } from 'react'

const GAMES = [
  {
    title: 'Catan',
    icon: 'terrain',
    description: 'El juego de construcción y comercio para 3-4 jugadores (expansión hasta 6). Coloniza la isla de Catán recolectando recursos y construyendo caminos, poblados y ciudades.',
    rules: [
      'Cada turno lanza 2 dados para producir recursos según los números adyacentes a tus poblados.',
      'Comercia con otros jugadores o con el banco (proporción 4:1 o mejor con puertos).',
      'Construye caminos, poblados y ciudades para ganar puntos de victoria.',
      'El primer jugador en alcanzar 10 puntos de victoria gana.',
      'La carta de "El Caballero más Poderoso" (3+ caballeros jugados) otorga 2 PV extra.',
      'La ruta más larga (5+ caminos continuos) otorga 2 PV extra.',
    ],
    duration: '60–120 min',
    players: '3–4',
    age: '10+',
  },
  {
    title: 'Catan: Ciudades y Caballeros',
    icon: 'castle',
    description: 'Expansión que agrega barbaros, caballeros y mejoras de ciudad. Requiere el juego base de Catan.',
    rules: [
      'Los bárbaros avanzan cada turno y atacan cuando rodean la isla.',
      'Los caballeros defienden las ciudades y pueden activarse con granos.',
      'Las mejoras de ciudad (papel, tela, monedas) otorgan poderes especiales.',
      'Nuevas cartas de progreso reemplazan las tarjetas de desarrollo.',
      'El primer jugador en alcanzar 13 puntos de victoria gana.',
    ],
    duration: '90–180 min',
    players: '3–4',
    age: '12+',
  },
  {
    title: 'Catan: Exploradores y Piratas',
    icon: 'sailing',
    description: 'Expansión que lleva a los colonos al mar. Explora territorios desconocidos, combate piratas y lleva especias y pescado a tu gente.',
    rules: [
      'Los tableros hexagonales se revelan a medida que exploras con barcos.',
      'Completa misiones para el Consejo de Catán y gana puntos de victoria.',
      'Los piratas atacan tus barcos si no tienes suficientes caballeros.',
      'Los recursos especiales (especias, pescado) abren nuevas estrategias.',
    ],
    duration: '120–180 min',
    players: '2–4',
    age: '12+',
  },
]

export default function ReglasDeJuegoPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <div className="mb-10">
        <h1 className="font-headline text-headline-lg text-primary mb-3">Reglas de Juego</h1>
        <p className="text-body-md text-on-surface-variant max-w-2xl">
          Guías rápidas de referencia para los juegos más populares de nuestra tienda. Para los reglamentos completos,
          cada producto incluye el manual oficial del fabricante.
        </p>
      </div>

      <div className="space-y-4 max-w-3xl">
        {GAMES.map((game, i) => (
          <div key={game.title} className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-surface-container-highest transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">{game.icon}</span>
                <div>
                  <div className="font-headline text-headline-sm text-primary">{game.title}</div>
                  <div className="flex gap-4 mt-1">
                    {[
                      { icon: 'group', val: `${game.players} jugadores` },
                      { icon: 'schedule', val: game.duration },
                      { icon: 'person', val: `Edad ${game.age}` },
                    ].map(({ icon, val }) => (
                      <span key={icon} className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{icon}</span>
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className={`material-symbols-outlined text-primary transition-transform ${open === i ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {open === i && (
              <div className="px-6 pb-6 border-t border-outline-variant/20">
                <p className="text-body-md text-on-surface-variant mt-4 mb-5">{game.description}</p>
                <h3 className="font-bold text-label-bold text-on-surface mb-3 uppercase tracking-wider">Reglas principales</h3>
                <ul className="space-y-2">
                  {game.rules.map((rule, ri) => (
                    <li key={ri} className="flex gap-3 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary flex-shrink-0" style={{ fontSize: '18px', marginTop: '2px' }}>check_circle</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 bg-tertiary/10 rounded-xl border border-tertiary/20 p-6 max-w-3xl">
        <div className="flex gap-3 items-start">
          <span className="material-symbols-outlined text-tertiary">info</span>
          <div>
            <h3 className="font-bold text-label-bold text-on-surface mb-1">¿Tenés dudas sobre las reglas?</h3>
            <p className="text-body-md text-on-surface-variant">
              Escribinos por{' '}
              <a href="https://wa.me/5491100000000" target="_blank" rel="noreferrer" className="text-secondary font-bold hover:underline">
                WhatsApp
              </a>{' '}
              o visitá nuestra{' '}
              <a href="/comunidad" className="text-secondary font-bold hover:underline">comunidad</a>{' '}
              donde otros jugadores pueden ayudarte.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
