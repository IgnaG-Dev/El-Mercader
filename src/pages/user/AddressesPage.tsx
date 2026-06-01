import { useState } from 'react'
import { useAddresses, useCreateAddress, useSetDefaultAddress, useDeleteAddress } from '../../hooks/useAddresses'
import Button from '../../components/ui/Button'

export default function AddressesPage() {
  const { data: addresses = [], isLoading } = useAddresses()
  const createAddress = useCreateAddress()
  const setDefault = useSetDefaultAddress()
  const deleteAddress = useDeleteAddress()

  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ label: '', street: '', city: '', province: '', postalCode: '' })

  const handleAdd = async () => {
    if (!form.label || !form.street || !form.city || !form.province || !form.postalCode) return
    await createAddress.mutateAsync({
      label: form.label,
      street: form.street,
      city: form.city,
      province: form.province,
      postalCode: form.postalCode,
      isDefault: addresses.length === 0,
    })
    setAdding(false)
    setForm({ label: '', street: '', city: '', province: '', postalCode: '' })
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline text-headline-lg text-primary">Direcciones de Envío</h1>
        <Button onClick={() => setAdding(true)} size="sm">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Nueva dirección
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface-container rounded-xl border border-outline-variant/30 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-surface-container rounded-xl border p-5 ${addr.isDefault ? 'border-primary' : 'border-outline-variant/30'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-label-bold text-on-surface">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="bg-secondary-container text-on-secondary-container text-label-sm font-bold px-2 py-0.5 rounded-full">Principal</span>
                    )}
                  </div>
                  <p className="text-body-md text-on-surface-variant">{addr.street}</p>
                  <p className="text-label-sm text-on-surface-variant">{addr.city}, {addr.province} {addr.postalCode}</p>
                </div>
                <div className="flex gap-2 items-center">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefault.mutate(addr.id)}
                      disabled={setDefault.isPending}
                      className="text-label-sm text-secondary hover:underline"
                    >
                      Predeterminar
                    </button>
                  )}
                  <button
                    onClick={() => deleteAddress.mutate(addr.id)}
                    disabled={deleteAddress.isPending}
                    className="text-error hover:text-error/80 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete_outline</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="mt-6 bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-headline-md text-on-surface mb-4">Nueva dirección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { key: 'label', label: 'Etiqueta (ej: Casa)', placeholder: 'Casa' },
              { key: 'street', label: 'Calle y número', placeholder: 'Av. Corrientes 1234' },
              { key: 'city', label: 'Ciudad', placeholder: 'Buenos Aires' },
              { key: 'province', label: 'Provincia', placeholder: 'CABA' },
              { key: 'postalCode', label: 'Código postal', placeholder: 'C1043' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-label-bold font-bold text-on-surface mb-1.5">{label}</label>
                <input
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full border border-outline-variant rounded px-3 py-2 text-body-md bg-surface text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} loading={createAddress.isPending}>Guardar dirección</Button>
            <Button variant="outline" onClick={() => setAdding(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  )
}
