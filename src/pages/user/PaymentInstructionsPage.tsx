import { useState, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUploadReceipt, useOrders } from '../../hooks/useOrders'

function ReceiptLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)/i)
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
      </button>
      {isImage ? (
        <img
          src={url}
          alt="Comprobante"
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <div className="flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
          <span className="material-symbols-outlined text-white" style={{ fontSize: '64px' }}>picture_as_pdf</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-on-surface font-bold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
          >
            Abrir PDF
          </a>
        </div>
      )}
    </div>
  )
}

function ReceiptUploader({ orderId }: { orderId: string }) {
  const { data: orders = [] } = useOrders()
  const existingUrl = orders.find(o => o.id === orderId)?.receiptUrl ?? null

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadReceipt()

  const accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

  function handleFile(f: File) {
    if (!accept.includes(f.type)) return
    setFile(f)
    setUploaded(false)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const item = Array.from(e.clipboardData.items).find(i => i.kind === 'file')
    if (item) {
      const f = item.getAsFile()
      if (f) handleFile(f)
    }
  }, [])

  async function handleUpload() {
    if (!file) return
    await upload.mutateAsync({ orderId, file })
    setUploaded(true)
    setReplacing(false)
    setFile(null)
    setPreview(null)
  }

  // Ya hay comprobante guardado y no está reemplazando
  if ((existingUrl || uploaded) && !replacing) {
    const displayUrl = existingUrl
    const isImage = displayUrl?.match(/\.(jpg|jpeg|png|webp|gif)/i)

    return (
      <>
        {lightbox && displayUrl && <ReceiptLightbox url={displayUrl} onClose={() => setLightbox(false)} />}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>check_circle</span>
            <p className="font-bold text-on-surface">Comprobante enviado</p>
          </div>

          {/* Preview del comprobante */}
          {displayUrl && (
            <button
              onClick={() => setLightbox(true)}
              className="relative group self-start rounded-xl overflow-hidden border-2 border-outline-variant/30 hover:border-primary transition-colors"
            >
              {isImage ? (
                <img src={displayUrl} alt="Comprobante" className="max-h-48 w-full object-contain bg-surface-container-highest" />
              ) : (
                <div className="flex flex-col items-center gap-2 p-8 bg-surface-container-highest">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '48px' }}>picture_as_pdf</span>
                  <span className="text-label-sm font-bold text-on-surface">Ver PDF</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" style={{ fontSize: '36px' }}>zoom_in</span>
              </div>
            </button>
          )}

          {uploaded && !displayUrl && (
            <p className="text-label-sm text-on-surface-variant">Comprobante recibido correctamente.</p>
          )}

          <p className="text-label-sm text-on-surface-variant">Lo revisaremos y confirmaremos tu pedido dentro de las 24 hs hábiles.</p>

          <button
            onClick={() => setReplacing(true)}
            className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors self-start"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>swap_horiz</span>
            Reemplazar comprobante
          </button>
        </div>
      </>
    )
  }

  return (
    <div onPaste={onPaste} tabIndex={0} className="outline-none">
      <p className="text-body-md font-bold text-on-surface mb-3">
        {replacing ? 'Reemplazar comprobante' : 'Adjuntar comprobante'}
      </p>

      {replacing && (
        <button
          onClick={() => setReplacing(false)}
          className="mb-3 flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Cancelar
        </button>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-highest/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {preview ? (
          <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain mb-2" />
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant mb-2 block" style={{ fontSize: '40px' }}>upload_file</span>
        )}
        <p className="text-label-sm font-bold text-on-surface">
          {file ? file.name : 'Arrastrá, pegá o hacé clic para seleccionar'}
        </p>
        <p className="text-xs text-on-surface-variant mt-1">JPG, PNG, PDF · máx. 5 MB</p>
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={upload.isPending}
          className="mt-3 w-full bg-secondary text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors disabled:opacity-60"
        >
          {upload.isPending
            ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span> Subiendo...</>
            : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cloud_upload</span> Enviar comprobante</>
          }
        </button>
      )}

      {upload.isError && (
        <p className="text-error text-sm mt-2 text-center">Error al subir. Intentá de nuevo.</p>
      )}
    </div>
  )
}

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
                { label: 'Banco', value: 'Mercado Pago' },
                { label: 'CVU', value: '0000003100047837528440' },
                { label: 'Alias', value: 'ignacio.diego.gauto' },
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

          {orderId && (
            <div className="border-t border-outline-variant/30 pt-5">
              <ReceiptUploader orderId={orderId} />
            </div>
          )}

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
