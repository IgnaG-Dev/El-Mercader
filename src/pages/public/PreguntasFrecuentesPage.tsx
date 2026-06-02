import { useState } from 'react'

const FAQS = [
  {
    category: 'Pedidos y Pagos',
    icon: 'payments',
    items: [
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos Mercado Pago (tarjetas de crédito/débito, dinero en cuenta MP, Rapipago, Pago Fácil) y transferencia bancaria. También podés pagar en efectivo coordinando retiro en persona.',
      },
      {
        q: '¿Puedo pagar en cuotas?',
        a: 'Sí, con tarjetas de crédito a través de Mercado Pago podés pagar en hasta 12 cuotas sin interés en productos seleccionados. Las promociones vigentes se muestran en cada producto.',
      },
      {
        q: '¿Cuándo se acredita mi pago?',
        a: 'Mercado Pago se acredita de forma inmediata. La transferencia bancaria puede demorar hasta 24 horas hábiles en verificarse. Una vez acreditado el pago procesamos tu pedido.',
      },
    ],
  },
  {
    category: 'Envíos',
    icon: 'local_shipping',
    items: [
      {
        q: '¿A qué provincias envían?',
        a: 'Enviamos a todo el territorio argentino a través de Andreani. Los costos varían según la zona y se calculan al finalizar la compra ingresando tu código postal.',
      },
      {
        q: '¿Cuánto tarda en llegar mi pedido?',
        a: 'Los envíos demoran entre 1 y 2 semanas según la localidad.',
      },
      {
        q: '¿Puedo hacer retiro en persona?',
        a: 'Sí, podés retirar tu pedido en persona. Para coordinar el retiro escribinos directamente por WhatsApp al +54 9 3777 309591.',
      },
    ],
  },
  {
    category: 'Productos',
    icon: 'inventory_2',
    items: [
      {
        q: '¿Los juegos son originales?',
        a: 'Todos nuestros productos son 100% originales, con licencia oficial y garantía del fabricante. No vendemos réplicas ni ediciones no autorizadas.',
      },
      {
        q: '¿Los productos incluyen idioma español?',
        a: 'La mayoría de nuestros juegos incluyen la versión en español para Argentina. En aquellos que estén en otro idioma, lo indicamos claramente en la descripción del producto.',
      },
      {
        q: '¿Tienen stock permanente de Catan base?',
        a: 'Catan base y sus expansiones principales están siempre en stock. Para ediciones especiales y juegos de menor tirada, el stock puede ser limitado — te recomendamos activar alertas de reposición desde la página del producto.',
      },
    ],
  },
  {
    category: 'Cuenta y Comunidad',
    icon: 'manage_accounts',
    items: [
      {
        q: '¿Es necesario crear una cuenta para comprar?',
        a: 'No, podés comprar como invitado. Sin embargo, con una cuenta podés ver tu historial de pedidos, guardar direcciones y participar en la comunidad.',
      },
      {
        q: '¿Qué es la sección Comunidad?',
        a: 'La comunidad de El Mercader es un espacio para que los jugadores compartan partidas, busquen rivales y discutan estrategias. Es gratuita y abierta a todos los usuarios registrados.',
      },
      {
        q: '¿Cómo recupero mi contraseña?',
        a: 'En la pantalla de inicio de sesión hacé clic en "¿Olvidaste tu contraseña?" e ingresá tu email. Recibirás un enlace para restablecerla en minutos.',
      },
    ],
  },
]

export default function PreguntasFrecuentesPage() {
  const [open, setOpen] = useState<string | null>(null)

  const toggle = (key: string) => setOpen(open === key ? null : key)

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <div className="mb-10">
        <h1 className="font-headline text-headline-lg text-primary mb-3">Preguntas Frecuentes</h1>
        <p className="text-body-md text-on-surface-variant max-w-2xl">
          Encontrá respuestas a las consultas más comunes. Si no encontrás lo que buscás, escribinos directamente.
        </p>
      </div>

      <div className="max-w-3xl space-y-8">
        {FAQS.map((section) => (
          <div key={section.category}>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary">{section.icon}</span>
              <h2 className="font-headline text-headline-sm text-primary">{section.category}</h2>
            </div>
            <div className="space-y-2">
              {section.items.map((item, i) => {
                const key = `${section.category}-${i}`
                return (
                  <div key={key} className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-container-highest transition-colors"
                      onClick={() => toggle(key)}
                    >
                      <span className="font-bold text-label-bold text-on-surface pr-4">{item.q}</span>
                      <span className={`material-symbols-outlined text-primary flex-shrink-0 transition-transform ${open === key ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    {open === key && (
                      <div className="px-5 pb-5 border-t border-outline-variant/20">
                        <p className="text-body-md text-on-surface-variant mt-4">{item.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-surface-container rounded-xl border border-outline-variant/30 p-6 max-w-3xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="font-headline text-headline-sm text-primary mb-1">¿Seguís con dudas?</h3>
          <p className="text-body-md text-on-surface-variant">Escribinos y te respondemos a la brevedad.</p>
        </div>
        <a
          href="/contacto"
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-label-bold hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          Contactarnos
        </a>
      </div>
    </div>
  )
}
