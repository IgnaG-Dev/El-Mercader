import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-surface-container-highest text-on-surface border-t border-outline-variant mt-auto">
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="font-headline text-headline-md text-primary mb-4">El Mercader</div>
            <p className="text-body-md text-on-surface-variant text-sm opacity-80">
              El gremio de confianza para los amantes de la estrategia y los juegos de mesa.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h5 className="text-label-bold font-bold text-primary mb-4 uppercase tracking-wider">Navegación</h5>
            <ul className="space-y-2">
              {[['/', 'Inicio'], ['/tienda', 'Tienda'], ['/comunidad', 'Comunidad']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-on-surface-variant hover:text-secondary transition-colors text-body-md">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h5 className="text-label-bold font-bold text-primary mb-4 uppercase tracking-wider">Servicio al Cliente</h5>
            <ul className="space-y-2">
              {['Reglas de Juego', 'Preguntas Frecuentes', 'Envíos y Devoluciones', 'Contacto'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-on-surface-variant hover:text-secondary transition-colors text-body-md">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + Payments */}
          <div>
            <h5 className="text-label-bold font-bold text-primary mb-4 uppercase tracking-wider">Síguenos</h5>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-on-surface-variant hover:text-secondary transition-colors">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a href="#" className="text-on-surface-variant hover:text-secondary transition-colors">
                <span className="material-symbols-outlined">share</span>
              </a>
            </div>
            <h5 className="text-label-bold font-bold text-primary mb-3 uppercase tracking-wider">Métodos de Pago</h5>
            <div className="flex flex-wrap gap-3 items-center mb-5">
              <div className="bg-white px-4 py-3 rounded-lg border border-outline-variant/40">
                <img src="/logos/mercadopago.png" alt="Mercado Pago" className="h-10 w-auto" />
              </div>
            </div>
            <h5 className="text-label-bold font-bold text-primary mb-3 uppercase tracking-wider">Envíos</h5>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="bg-white px-4 py-3 rounded-lg border border-outline-variant/40">
                <img src="/logos/andreani.png" alt="Andreani" className="h-10 w-auto" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant/30 text-center">
          <p className="text-body-md text-on-surface-variant text-sm opacity-80">
            © {new Date().getFullYear()} El Mercader - El Gremio de Comerciantes
          </p>
        </div>
      </div>
    </footer>
  )
}
