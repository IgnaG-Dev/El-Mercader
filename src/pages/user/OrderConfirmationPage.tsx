import { Link, useLocation } from 'react-router-dom'

export default function OrderConfirmationPage() {
  const location = useLocation()
  const orderId = (location.state as { orderId?: string })?.orderId

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h1 className="font-headline text-headline-lg text-on-surface mb-4">¡Pedido confirmado!</h1>
        <p className="text-body-lg text-on-surface-variant mb-2">
          Gracias por tu compra en El Mercader.
        </p>
        {orderId && (
          <p className="text-body-md text-on-surface-variant mb-8">
            Número de pedido: <strong className="text-on-surface font-bold font-mono">{orderId.slice(0, 8).toUpperCase()}</strong>
          </p>
        )}

        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6 mb-8 text-left space-y-3">
          {[
            { icon: 'email', label: 'Recibirás un email con los detalles de tu pedido.' },
            { icon: 'local_shipping', label: 'Tu pedido será enviado en 24-48 horas hábiles.' },
            { icon: 'track_changes', label: 'Podrás hacer seguimiento desde tu perfil.' },
          ].map(({ icon, label }) => (
            <div key={icon} className="flex items-center gap-3 text-body-md text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/historial-pedidos" className="bg-primary text-on-primary font-bold py-3 px-6 rounded hover:bg-primary-container transition-colors">
            Ver mis pedidos
          </Link>
          <Link to="/tienda" className="border border-primary text-primary font-bold py-3 px-6 rounded hover:bg-primary hover:text-on-primary transition-colors">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
