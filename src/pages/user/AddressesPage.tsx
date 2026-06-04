import { useState } from 'react'
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useSetDefaultAddress,
  useDeleteAddress,
} from '../../hooks/useAddresses'
import { PROVINCES } from '../../constants/provinces'
import { reverseGeocode } from '../../lib/geo'
import Button from '../../components/ui/Button'
import type { Address } from '../../types'

type AddressForm = Omit<Address, 'id' | 'isDefault'>

const EMPTY_FORM: AddressForm = { label: '', street: '', city: '', province: '', postalCode: '' }

function inputCls(error?: boolean) {
  return `w-full border rounded-lg px-3 py-2.5 text-body-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors ${
    error ? 'border-error' : 'border-outline-variant focus:border-primary'
  }`
}

interface AddressFormPanelProps {
  title: string
  form: AddressForm
  errors: Partial<AddressForm>
  saving: boolean
  onChange: (field: keyof AddressForm, value: string) => void
  onGeolocate: () => void
  geoLoading: boolean
  geoError: string | null
  onSave: () => void
  onCancel: () => void
}

function AddressFormPanel({
  title, form, errors, saving, onChange, onGeolocate, geoLoading, geoError, onSave, onCancel,
}: AddressFormPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant">
          <h2 className="font-headline text-headline-md text-on-surface">{title}</h2>
          <button onClick={onCancel} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Geo button */}
          <button
            type="button"
            onClick={onGeolocate}
            disabled={geoLoading}
            className="flex items-center gap-2 text-sm text-primary font-bold border border-primary/40 rounded-lg px-4 py-2.5 hover:bg-primary/5 active:bg-primary/10 transition-colors disabled:opacity-60 w-full justify-center"
          >
            <span className={`material-symbols-outlined ${geoLoading ? 'animate-spin' : ''}`} style={{ fontSize: '18px' }}>
              {geoLoading ? 'progress_activity' : 'my_location'}
            </span>
            {geoLoading ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
          </button>
          {geoError && (
            <p className="text-xs text-error flex items-start gap-1">
              <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '14px' }}>error</span>
              {geoError}
            </p>
          )}

          {/* Etiqueta */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-bold text-on-surface">Etiqueta *</label>
            <input
              value={form.label}
              onChange={(e) => onChange('label', e.target.value)}
              className={inputCls(!!errors.label)}
              placeholder="Casa, Trabajo..."
            />
            {errors.label && <span className="text-xs text-error">{errors.label}</span>}
          </div>

          {/* Calle */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-bold text-on-surface">Calle y número *</label>
            <input
              value={form.street}
              onChange={(e) => onChange('street', e.target.value)}
              className={inputCls(!!errors.street)}
              placeholder="Av. Corrientes 1234"
            />
            {errors.street && <span className="text-xs text-error">{errors.street}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Ciudad */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-bold text-on-surface">Ciudad *</label>
              <input
                value={form.city}
                onChange={(e) => onChange('city', e.target.value)}
                className={inputCls(!!errors.city)}
                placeholder="Buenos Aires"
              />
              {errors.city && <span className="text-xs text-error">{errors.city}</span>}
            </div>

            {/* Código postal */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-bold text-on-surface">Cód. postal *</label>
              <input
                value={form.postalCode}
                onChange={(e) => onChange('postalCode', e.target.value)}
                className={inputCls(!!errors.postalCode)}
                placeholder="1043"
                inputMode="numeric"
              />
              {errors.postalCode && <span className="text-xs text-error">{errors.postalCode}</span>}
            </div>
          </div>

          {/* Provincia */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-bold text-on-surface">Provincia *</label>
            <select
              value={form.province}
              onChange={(e) => onChange('province', e.target.value)}
              className={inputCls(!!errors.province)}
            >
              <option value="">Seleccioná una provincia</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.province && <span className="text-xs text-error">{errors.province}</span>}
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-outline-variant">
          <Button onClick={onSave} loading={saving} className="flex-1">Guardar</Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        </div>
      </div>
    </div>
  )
}

function ViewModal({ addr, onClose, onEdit }: { addr: Address; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant">
          <h2 className="font-headline text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">location_on</span>
            {addr.label}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5 space-y-3">
          {addr.isDefault && (
            <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container text-label-sm font-bold px-3 py-1 rounded-full">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>star</span>
              Dirección principal
            </span>
          )}

          <div className="space-y-2 text-body-md text-on-surface-variant">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0" style={{ fontSize: '18px' }}>home</span>
              <span>{addr.street}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0" style={{ fontSize: '18px' }}>location_city</span>
              <span>{addr.city}, {addr.province}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0" style={{ fontSize: '18px' }}>markunread_mailbox</span>
              <span>CP {addr.postalCode}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-outline-variant">
          <Button onClick={onEdit} className="flex-1">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
            Editar
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Cerrar</Button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ label, onConfirm, onCancel, loading }: {
  label: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <span className="material-symbols-outlined text-error text-5xl mb-3 block">delete_outline</span>
        <h2 className="font-headline text-headline-md text-on-surface mb-2">¿Eliminar dirección?</h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          Se eliminará <strong>"{label}"</strong>. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button onClick={onConfirm} loading={loading} className="flex-1 !bg-error hover:!bg-error/90">Eliminar</Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        </div>
      </div>
    </div>
  )
}

function validateForm(form: AddressForm): Partial<AddressForm> {
  const e: Partial<AddressForm> = {}
  if (!form.label.trim()) e.label = 'Requerido'
  if (!form.street.trim()) e.street = 'Requerido'
  if (!form.city.trim()) e.city = 'Requerido'
  if (!form.province) e.province = 'Requerido'
  if (!form.postalCode.trim()) e.postalCode = 'Requerido'
  return e
}

type ModalState =
  | { type: 'none' }
  | { type: 'view'; addr: Address }
  | { type: 'edit'; addr: Address }
  | { type: 'add' }
  | { type: 'delete'; addr: Address }

export default function AddressesPage() {
  const { data: addresses = [], isLoading } = useAddresses()
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const setDefault = useSetDefaultAddress()
  const deleteAddress = useDeleteAddress()

  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<AddressForm>>({})
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setGeoError(null)
    setModal({ type: 'add' })
  }

  const openEdit = (addr: Address) => {
    setForm({ label: addr.label, street: addr.street, city: addr.city, province: addr.province, postalCode: addr.postalCode })
    setErrors({})
    setGeoError(null)
    setModal({ type: 'edit', addr })
  }

  const closeModal = () => setModal({ type: 'none' })

  const handleFieldChange = (field: keyof AddressForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleGeolocate = async () => {
    if (!navigator.geolocation) { setGeoError('Tu navegador no soporta geolocalización.'); return }
    setGeoLoading(true)
    setGeoError(null)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      )
      const result = await reverseGeocode(position.coords.latitude, position.coords.longitude)
      setForm((prev) => ({ ...prev, street: result.street, city: result.city, postalCode: result.postalCode, province: result.province }))
      if (result.provinceWarning) setGeoError('Provincia no reconocida. Verificá o seleccionála manualmente.')
    } catch (err) {
      const isGeoErr = err && typeof err === 'object' && 'code' in err
      if (isGeoErr && (err as GeolocationPositionError).code === 1) {
        setGeoError('Permiso denegado. Habilitá la ubicación en tu navegador.')
      } else {
        setGeoError('No se pudo obtener la ubicación. Completá los campos manualmente.')
      }
    } finally {
      setGeoLoading(false)
    }
  }

  const handleSave = async () => {
    const e = validateForm(form)
    if (Object.keys(e).length > 0) { setErrors(e); return }

    if (modal.type === 'add') {
      await createAddress.mutateAsync({ ...form, isDefault: addresses.length === 0 })
    } else if (modal.type === 'edit') {
      await updateAddress.mutateAsync({ id: modal.addr.id, addr: form })
    }
    closeModal()
  }

  const handleDelete = async () => {
    if (modal.type !== 'delete') return
    await deleteAddress.mutateAsync(modal.addr.id)
    closeModal()
  }

  const isSaving = createAddress.isPending || updateAddress.isPending

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline text-headline-lg text-primary">Direcciones de Envío</h1>
        <Button onClick={openAdd} size="sm">
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
      ) : addresses.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">location_off</span>
          <p className="text-body-lg text-on-surface-variant">No tenés direcciones guardadas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-surface-container rounded-xl border p-5 cursor-pointer hover:shadow-md transition-shadow ${
                addr.isDefault ? 'border-primary' : 'border-outline-variant/30'
              }`}
              onClick={() => setModal({ type: 'view', addr })}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-label-bold text-on-surface">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="bg-secondary-container text-on-secondary-container text-label-sm font-bold px-2 py-0.5 rounded-full">Principal</span>
                    )}
                  </div>
                  <p className="text-body-md text-on-surface-variant">{addr.street}</p>
                  <p className="text-label-sm text-on-surface-variant">{addr.city}, {addr.province} {addr.postalCode}</p>
                </div>

                <div className="flex gap-1 items-center flex-shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefault.mutate(addr.id)}
                      disabled={setDefault.isPending}
                      title="Predeterminar"
                      className="text-label-sm text-secondary hover:underline px-2 py-1"
                    >
                      Predeterminar
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    title="Editar"
                    className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                  </button>
                  <button
                    onClick={() => setModal({ type: 'delete', addr })}
                    title="Eliminar"
                    className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete_outline</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View modal */}
      {modal.type === 'view' && (
        <ViewModal
          addr={modal.addr}
          onClose={closeModal}
          onEdit={() => openEdit(modal.addr)}
        />
      )}

      {/* Add / Edit form modal */}
      {(modal.type === 'add' || modal.type === 'edit') && (
        <AddressFormPanel
          title={modal.type === 'add' ? 'Nueva dirección' : 'Editar dirección'}
          form={form}
          errors={errors}
          saving={isSaving}
          onChange={handleFieldChange}
          onGeolocate={handleGeolocate}
          geoLoading={geoLoading}
          geoError={geoError}
          onSave={handleSave}
          onCancel={closeModal}
        />
      )}

      {/* Delete confirm modal */}
      {modal.type === 'delete' && (
        <DeleteConfirmModal
          label={modal.addr.label}
          onConfirm={handleDelete}
          onCancel={closeModal}
          loading={deleteAddress.isPending}
        />
      )}
    </div>
  )
}
