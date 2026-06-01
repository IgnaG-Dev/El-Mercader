import { Link, useLocation } from 'react-router-dom'

export default function MercadoPagoPage() {
  const location = useLocation()
  const { orderId, total } = (location.state as { orderId?: string; total?: number }) ?? {}

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#009ee3]/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[#009ee3]" style={{ fontSize: '32px' }}>account_balance_wallet</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface">Pago con Mercado Pago</h1>
          <p className="text-body-md text-on-surface-variant mt-2">Completá el pago para confirmar tu pedido</p>
        </div>

        {orderId && (
          <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-label-sm text-on-surface-variant mb-1">Número de pedido</p>
            <p className="font-mono font-bold text-lg text-on-surface">{orderId.slice(0, 8).toUpperCase()}</p>
            {total !== undefined && (
              <p className="text-label-sm text-on-surface-variant mt-1">
                Total a pagar: <strong className="text-on-surface">${total.toLocaleString('es-AR')}</strong>
              </p>
            )}
          </div>
        )}

        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6 space-y-6">
          <div className="space-y-3">
            {[
              { icon: 'credit_card', label: 'Tarjetas de crédito y débito' },
              { icon: 'account_balance_wallet', label: 'Saldo en cuenta Mercado Pago' },
              { icon: 'payments', label: 'Cuotas sin interés disponibles' },
            ].map(({ icon, label }) => (
              <div key={icon} className="flex items-center gap-3 text-body-md text-on-surface-variant">
                <span className="material-symbols-outlined text-[#009ee3]" style={{ fontSize: '20px' }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>

          <div className="bg-tertiary-fixed/20 rounded-lg p-4">
            <p className="text-body-md text-on-surface-variant">
              Serás redirigido a Mercado Pago para completar el pago de forma segura.
              Una vez aprobado, tu pedido será procesado automáticamente.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="https://www.mercadopago.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#009ee3] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-3 hover:bg-[#0085c3] transition-colors"
            >
              <img src="/logos/mercadopago.png" alt="Mercado Pago" className="h-6 w-auto brightness-0 invert" />
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
              Pagar ahora
            </a>
            <Link
              to="/historial-pedidos"
              className="text-center text-secondary hover:underline text-label-sm"
            >
              Ver mis pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
