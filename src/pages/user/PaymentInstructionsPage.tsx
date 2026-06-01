import { Link, useLocation } from 'react-router-dom'

export default function PaymentInstructionsPage() {
  const location = useLocation()
  const { orderId, total } = (location.state as { orderId?: string; total?: number }) ?? {}

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-tertiary-fixed/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '32px' }}>account_balance</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface">Instrucciones de Pago</h1>
          <p className="text-body-md text-on-surface-variant mt-2">Completá la transferencia para confirmar tu pedido</p>
        </div>

        {orderId && (
          <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-label-sm text-on-surface-variant mb-1">Número de pedido</p>
            <p className="font-mono font-bold text-lg text-on-surface">{orderId.slice(0, 8).toUpperCase()}</p>
            {total !== undefined && (
              <p className="text-label-sm text-on-surface-variant mt-1">
                Total a transferir: <strong className="text-on-surface">${total.toLocaleString('es-AR')}</strong>
              </p>
            )}
          </div>
        )}

        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6 space-y-6">
          <div>
            <h2 className="font-headline text-headline-md text-on-surface mb-3">Datos bancarios</h2>
            <div className="space-y-2">
              {[
                { label: 'Banco', value: 'Banco Nación Argentina' },
                { label: 'CBU', value: '0110000000000000000001' },
                { label: 'Alias', value: 'EL.MERCADER.CATAN' },
                { label: 'CUIT', value: '20-12345678-9' },
                { label: 'Titular', value: 'El Mercader SRL' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-outline-variant/30 last:border-0">
                  <span className="text-label-sm text-on-surface-variant">{label}</span>
                  <span className="font-bold text-label-bold text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-tertiary-fixed/20 rounded-lg p-4">
            <p className="text-body-md text-on-surface font-bold mb-1">Importante</p>
            <p className="text-body-md text-on-surface-variant">
              Indicá el número de pedido{orderId ? ` (${orderId.slice(0, 8).toUpperCase()})` : ''} en el concepto de la transferencia.
              Tu pedido se procesará dentro de las 24 hs hábiles una vez confirmado el pago.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/historial-pedidos"
              className="w-full bg-primary text-on-primary font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>receipt_long</span>
              Ver mis pedidos
            </Link>
            <Link to="/tienda" className="text-center text-secondary hover:underline text-label-sm">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
