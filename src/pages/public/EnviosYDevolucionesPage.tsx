const ZONES = [
  { zone: 'CABA', days: '2–3 días hábiles', cost: '$2.500' },
  { zone: 'GBA', days: '3–4 días hábiles', cost: '$3.200' },
  { zone: 'Interior (provincia de Bs. As.)', days: '4–6 días hábiles', cost: '$4.500' },
  { zone: 'Resto del país', days: '6–10 días hábiles', cost: '$5.800' },
  { zone: 'Patagonia / NOA / NEA', days: '8–12 días hábiles', cost: '$6.500' },
]

export default function EnviosYDevolucionesPage() {
  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <div className="mb-10">
        <h1 className="font-headline text-headline-lg text-primary mb-3">Envíos y Devoluciones</h1>
        <p className="text-body-md text-on-surface-variant max-w-2xl">
          Toda la información sobre cómo enviamos tus pedidos y qué hacer si necesitás devolver un producto.
        </p>
      </div>

      <div className="max-w-3xl space-y-10">
        {/* Shipping */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-secondary">local_shipping</span>
            <h2 className="font-headline text-headline-md text-primary">Política de Envíos</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: 'inventory', title: 'Despacho', desc: 'Despachamos de lunes a viernes. Los pedidos confirmados antes de las 14 hs se despachan el mismo día.' },
              { icon: 'local_shipping', title: 'Logística', desc: 'Trabajamos exclusivamente con Andreani para garantizar el cuidado de cajas y componentes.' },
              { icon: 'local_offer', title: 'Envío gratis', desc: 'Pedidos por encima de $30.000 tienen envío gratis a todo el país, sin mínimo de productos.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-surface-container rounded-xl border border-outline-variant/30 p-5">
                <span className="material-symbols-outlined text-primary mb-3 block">{icon}</span>
                <h3 className="font-bold text-label-bold text-on-surface mb-1">{title}</h3>
                <p className="text-label-sm text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>

          <h3 className="font-bold text-label-bold text-on-surface uppercase tracking-wider mb-4">Tiempos y costos estimados</h3>
          <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
            <table className="w-full text-body-md">
              <thead>
                <tr className="bg-surface-container-highest text-left">
                  <th className="px-5 py-3 font-bold text-label-bold text-on-surface">Zona</th>
                  <th className="px-5 py-3 font-bold text-label-bold text-on-surface">Tiempo estimado</th>
                  <th className="px-5 py-3 font-bold text-label-bold text-on-surface">Costo base</th>
                </tr>
              </thead>
              <tbody>
                {ZONES.map((z, i) => (
                  <tr key={z.zone} className={i % 2 === 0 ? '' : 'bg-surface-container-highest/40'}>
                    <td className="px-5 py-3 text-on-surface">{z.zone}</td>
                    <td className="px-5 py-3 text-on-surface-variant">{z.days}</td>
                    <td className="px-5 py-3 text-secondary font-bold">{z.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-label-sm text-on-surface-variant mt-2">
            * Los costos son orientativos. El valor exacto se calcula al finalizar la compra según tu código postal.
          </p>
        </section>

        {/* Pickup */}
        <section className="bg-tertiary/10 rounded-xl border border-tertiary/20 p-6">
          <div className="flex gap-3 items-start">
            <span className="material-symbols-outlined text-tertiary">storefront</span>
            <div>
              <h3 className="font-bold text-label-bold text-on-surface mb-1">Retiro en persona — sin costo</h3>
              <p className="text-body-md text-on-surface-variant">
                Podés retirar tu pedido en Buenos Aires sin cargo. Seleccioná "Retiro en tienda" al finalizar la compra
                y te contactaremos en menos de 24 hs hábiles para coordinar lugar y horario.
              </p>
            </div>
          </div>
        </section>

        {/* Returns */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-secondary">assignment_return</span>
            <h2 className="font-headline text-headline-md text-primary">Política de Devoluciones</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: 'verified',
                title: '30 días para cambios',
                desc: 'Tenés 30 días desde la entrega para solicitar un cambio o devolución, siempre que el producto esté en su estado original, sin usar y con el embalaje completo.',
              },
              {
                icon: 'broken_image',
                title: 'Producto dañado o defectuoso',
                desc: 'Si el producto llegó dañado o tiene un defecto de fabricación, contactanos dentro de las 48 hs de recibido. Gestionamos el cambio o reembolso sin costo adicional para vos.',
              },
              {
                icon: 'currency_exchange',
                title: 'Proceso de reembolso',
                desc: 'Una vez que recibimos y verificamos el producto devuelto, procesamos el reembolso en 5-10 días hábiles por el mismo medio de pago original.',
              },
              {
                icon: 'block',
                title: 'Productos no retornables',
                desc: 'Por razones de higiene y garantía, no aceptamos devoluciones de productos que hayan sido abiertos, usados o cuyos precintos estén rotos, salvo defecto de fabricación.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-surface-container rounded-xl border border-outline-variant/30 p-5 flex gap-4">
                <span className="material-symbols-outlined text-primary flex-shrink-0 mt-0.5">{icon}</span>
                <div>
                  <h3 className="font-bold text-label-bold text-on-surface mb-1">{title}</h3>
                  <p className="text-body-md text-on-surface-variant">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to return */}
        <section>
          <h2 className="font-headline text-headline-md text-primary mb-5">¿Cómo iniciar una devolución?</h2>
          <ol className="space-y-4">
            {[
              'Contactanos por email o WhatsApp indicando tu número de pedido y el motivo.',
              'Te enviaremos las instrucciones y la etiqueta de envío prepaga (en casos de defecto o error nuestro).',
              'Empaquetá el producto de forma segura y entregalo al correo.',
              'Una vez recibido, procesamos el cambio o reembolso en 5-10 días hábiles.',
            ].map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-label-bold flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-body-md text-on-surface-variant mt-1">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="font-headline text-headline-sm text-primary mb-1">¿Necesitás ayuda con tu envío?</h3>
            <p className="text-body-md text-on-surface-variant">Nuestro equipo te asiste por WhatsApp o email.</p>
          </div>
          <a
            href="/contacto"
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-label-bold hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Contactarnos
          </a>
        </div>
      </div>
    </div>
  )
}
