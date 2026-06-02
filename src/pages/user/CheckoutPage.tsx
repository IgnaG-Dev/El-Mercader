import { useState, useEffect, useRef } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useFinanceStore } from '../../store/financeStore'
import { useLocationStore } from '../../store/locationStore'
import { useCreateOrder } from '../../hooks/useOrders'
import { useAddresses, useCreateAddress } from '../../hooks/useAddresses'
import { cotizarAndreani } from '../../services/andreani'
import Button from '../../components/ui/Button'
import { PROVINCES } from '../../constants/provinces'
import { SHIPPING_ZONES } from '../../constants/shippingZones'
import { reverseGeocode } from '../../lib/geo'

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-4 sm:p-6">
      {children}
    </div>
  )
}

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <h2 className="font-headline text-xl sm:text-headline-md text-on-surface mb-4 flex items-center gap-2">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      {label}
    </h2>
  )
}

interface PersonalForm {
  name: string
  email: string
  phone: string
  dni: string
  password: string
}

interface ShippingForm {
  street: string
  city: string
  province: string
  postalCode: string
}

interface ShippingQuote {
  cost: number
  days: string
  source: 'andreani' | 'zone'
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const { user, isAuthenticated, register } = useAuthStore()
  const { shippingCost: baseShippingCost, shippingDays: baseShippingDays, paymentMethods, serviceFee } = useFinanceStore()
  const { city: savedCity, province: savedProvince, street: savedStreet, postalCode: savedPostalCode, setLocation } = useLocationStore()
  const navigate = useNavigate()
  const createOrder = useCreateOrder()
  const createAddress = useCreateAddress()
  const { data: addresses } = useAddresses({ enabled: isAuthenticated })

  const enabledMethods = Object.entries(paymentMethods).filter(([, cfg]) => cfg.enabled)

  const [showPassword, setShowPassword] = useState(false)

  const [personal, setPersonal] = useState<PersonalForm>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    dni: user?.dni ?? '',
    password: '',
  })
  const [form, setForm] = useState<ShippingForm>({
    street: '',
    city: '',
    province: '',
    postalCode: '',
  })
  const [formInitialised, setFormInitialised] = useState(false)
  const defaultMethod = enabledMethods[0]?.[0] ?? 'transfer'
  const [paymentMethod, setPaymentMethod] = useState(defaultMethod)
  const [errors, setErrors] = useState<Partial<ShippingForm & PersonalForm>>({})
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-fill shipping form from saved default address (auth) or locationStore (guest)
  useEffect(() => {
    if (formInitialised) return
    const defaultAddr = addresses?.find((a) => a.isDefault) ?? addresses?.[0]
    if (isAuthenticated && defaultAddr) {
      setForm({
        street: defaultAddr.street,
        city: defaultAddr.city,
        province: defaultAddr.province,
        postalCode: defaultAddr.postalCode,
      })
      setLocation({
        city: defaultAddr.city,
        province: defaultAddr.province,
        street: defaultAddr.street,
        postalCode: defaultAddr.postalCode,
      })
      setFormInitialised(true)
    } else if (!isAuthenticated && (savedCity || savedProvince)) {
      setForm((prev) => ({
        ...prev,
        city: savedCity || prev.city,
        province: savedProvince || prev.province,
        street: savedStreet || prev.street,
        postalCode: savedPostalCode || prev.postalCode,
      }))
      setFormInitialised(true)
    }
  }, [addresses, isAuthenticated, formInitialised, savedCity, savedProvince, savedStreet, savedPostalCode, setLocation])

  // When province changes recalculate immediately via zone table (instant feedback),
  // then try Andreani once we also have a valid postal code
  useEffect(() => {
    if (!form.province) {
      setShippingQuote(null)
      return
    }
    const zone = SHIPPING_ZONES[form.province] ?? { cost: baseShippingCost, days: baseShippingDays }
    setShippingQuote({ cost: zone.cost, days: zone.days, source: 'zone' })
  }, [form.province, baseShippingCost, baseShippingDays])

  // Debounce Andreani API call when postal code is ready
  useEffect(() => {
    const cp = form.postalCode.replace(/\D/g, '')
    if (cp.length < 4) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setShippingLoading(true)
      const result = await cotizarAndreani(cp)
      setShippingLoading(false)
      if (result) {
        setShippingQuote({ cost: result.costo, days: result.diasHabiles, source: 'andreani' })
      }
      // If Andreani fails, the zone-based quote already set by the province effect remains
    }, 600)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [form.postalCode])

  const handlePersonal = (field: keyof PersonalForm) => (e: ChangeEvent<HTMLInputElement>) =>
    setPersonal((prev) => ({ ...prev, [field]: e.target.value }))

  const handleField = (field: keyof ShippingForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleGeolocate = async () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      )
      const { latitude, longitude } = position.coords
      const result = await reverseGeocode(latitude, longitude)
      setForm((prev) => ({
        ...prev,
        street: result.street,
        city: result.city,
        postalCode: result.postalCode,
        province: result.province,
      }))
      if (result.provinceWarning) setGeoError('Provincia no reconocida. Verificá o seleccionála manualmente.')
    } catch (err) {
      const isGeoError = err && typeof err === 'object' && 'code' in err
      if (isGeoError && (err as GeolocationPositionError).code === 1) {
        setGeoError('Permiso denegado. Habilitá el acceso a tu ubicación en el navegador.')
      } else if (isGeoError) {
        setGeoError('No se pudo obtener tu ubicación. Completá los campos manualmente.')
      } else {
        setGeoError('No se pudo obtener la dirección. Completá los campos manualmente.')
      }
    } finally {
      setGeoLoading(false)
    }
  }

  const validate = () => {
    const e: Partial<ShippingForm & PersonalForm> = {}
    if (!personal.name.trim()) e.name = 'Requerido'
    if (!personal.email.trim()) e.email = 'Requerido'
    else if (!/\S+@\S+\.\S+/.test(personal.email)) e.email = 'Email inválido'
    if (!personal.phone.trim()) e.phone = 'Requerido'
    if (!personal.dni.trim()) e.dni = 'Requerido'
    if (!isAuthenticated && !personal.password.trim()) e.password = 'Requerido'
    if (!form.street.trim()) e.street = 'Requerido'
    if (!form.city.trim()) e.city = 'Requerido'
    if (!form.province) e.province = 'Requerido'
    if (!form.postalCode.trim()) e.postalCode = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleOrder = async () => {
    if (!validate()) return
    setRegisterError(null)
    try {
      if (!isAuthenticated) {
        try {
          await register({
            name: personal.name,
            email: personal.email,
            password: personal.password,
            phone: personal.phone,
            dni: personal.dni,
          })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : ''
          if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
            setRegisterError('Este email ya tiene una cuenta. ¿Querés iniciar sesión?')
          } else {
            setRegisterError('No se pudo crear la cuenta. Intentá de nuevo.')
          }
          return
        }
      }

      const orderId = await createOrder.mutateAsync({
        items,
        total: orderTotal,
        paymentMethod,
        shippingAddress: {
          name: personal.name,
          email: personal.email,
          phone: personal.phone,
          street: form.street,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
        },
      })

      // Persist location for future visits
      setLocation({
        city: form.city,
        province: form.province,
        street: form.street,
        postalCode: form.postalCode,
      })

      // Save address to DB if authenticated and it doesn't already exist.
      // Read from store directly to avoid the stale closure when the user
      // just registered moments earlier in this same handler.
      const currentIsAuthenticated = useAuthStore.getState().isAuthenticated
      if (currentIsAuthenticated) {
        const alreadySaved = addresses?.some(
          (a) =>
            a.street.toLowerCase() === form.street.toLowerCase() &&
            a.city.toLowerCase() === form.city.toLowerCase() &&
            a.postalCode === form.postalCode,
        )
        if (!alreadySaved) {
          try {
            await createAddress.mutateAsync({
              label: form.city,
              street: form.street,
              city: form.city,
              province: form.province,
              postalCode: form.postalCode,
              isDefault: !addresses?.length,
            })
          } catch {
            // Address save failed — don't block checkout completion
          }
        }
      }

      clearCart()
      if (paymentMethod === 'transfer') {
        navigate('/instrucciones-pago', { state: { orderId, total: orderTotal } })
      } else {
        navigate('/pago-mercadopago', { state: { orderId, total: orderTotal } })
      }
    } catch {
      // error handled by mutation state
    }
  }

  const mpFee = paymentMethod === 'mercadopago' ? Math.round(total * paymentMethods.mercadopago.fee / 100) : 0
  const serviceFeeSaving = serviceFee > 0 ? Math.round(total * serviceFee / 100) : 0
  const activeShippingCost = shippingQuote?.cost ?? 0
  const orderTotal = total + activeShippingCost + mpFee

  const inputClass = (field: keyof (ShippingForm & PersonalForm)) =>
    `w-full border rounded-lg px-3 py-2.5 text-body-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors ${
      errors[field] ? 'border-error' : 'border-outline-variant focus:border-primary'
    }`

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-4 sm:py-8 md:py-12">

      <h1 className="font-headline text-2xl sm:text-headline-lg text-primary mb-4 sm:mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

        {/* ── Left column: form ── */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          {/* ── Datos personales ── */}
          <SectionCard>
            <SectionTitle icon="person" label="Datos personales" />

            {isAuthenticated ? (
              <p className="text-label-sm text-on-surface-variant mb-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>check_circle</span>
                Tus datos de cuenta ya están cargados.
              </p>
            ) : (
              <p className="text-label-sm text-on-surface-variant mb-4">
                ¿Ya tenés cuenta?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline">Iniciá sesión</Link>
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Nombre */}
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface">Nombre completo *</label>
                <input value={personal.name} onChange={handlePersonal('name')} className={inputClass('name')} placeholder="Juan Pérez" readOnly={isAuthenticated} />
                {errors.name && <span className="text-xs text-error">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface">Email *</label>
                <input type="email" value={personal.email} onChange={handlePersonal('email')} className={inputClass('email')} placeholder="juan@mail.com" readOnly={isAuthenticated} />
                {errors.email && <span className="text-xs text-error">{errors.email}</span>}
              </div>

              {/* Celular */}
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface">Celular *</label>
                <input value={personal.phone} onChange={handlePersonal('phone')} className={inputClass('phone')} placeholder="11 1234-5678" inputMode="tel" readOnly={isAuthenticated && !!user?.phone} />
                {errors.phone && <span className="text-xs text-error">{errors.phone}</span>}
              </div>

              {/* DNI */}
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface">DNI *</label>
                <input value={personal.dni} onChange={handlePersonal('dni')} className={inputClass('dni')} placeholder="12.345.678" inputMode="numeric" readOnly={isAuthenticated && !!user?.dni} />
                {errors.dni && <span className="text-xs text-error">{errors.dni}</span>}
              </div>

              {/* Contraseña — solo para no registrados */}
              {!isAuthenticated && (
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-label-sm font-bold text-on-surface">Contraseña *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={personal.password}
                      onChange={handlePersonal('password')}
                      className={`${inputClass('password')} pr-10`}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.password && <span className="text-xs text-error">{errors.password}</span>}
                  <span className="text-xs text-on-surface-variant">Se creará tu cuenta para que puedas hacer seguimiento del pedido.</span>
                </div>
              )}
            </div>

            {registerError && (
              <p className="text-error text-xs mt-3 flex items-start gap-1">
                <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '14px' }}>error</span>
                {registerError}{' '}
                {registerError.includes('iniciar sesión') && (
                  <Link to="/login" className="font-bold underline">Iniciar sesión</Link>
                )}
              </p>
            )}
          </SectionCard>

          {/* ── Datos de envío ── */}
          <SectionCard>
            <SectionTitle icon="local_shipping" label="Datos de envío" />

            {/* Geolocation autocomplete */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGeolocate}
                disabled={geoLoading}
                className="flex items-center gap-2 text-sm text-primary font-bold border border-primary/40 rounded-lg px-4 py-2.5 hover:bg-primary/5 active:bg-primary/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto justify-center sm:justify-start"
              >
                <span
                  className={`material-symbols-outlined ${geoLoading ? 'animate-spin' : ''}`}
                  style={{ fontSize: '18px' }}
                >
                  {geoLoading ? 'progress_activity' : 'my_location'}
                </span>
                {geoLoading ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
              </button>
              {geoError && (
                <p className="text-xs text-error mt-2 flex items-start gap-1">
                  <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '14px' }}>error</span>
                  {geoError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Calle */}
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface">Calle y número *</label>
                <input value={form.street} onChange={handleField('street')} className={inputClass('street')} placeholder="Av. Corrientes 1234" />
                {errors.street && <span className="text-xs text-error">{errors.street}</span>}
              </div>

              {/* Ciudad */}
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface">Ciudad *</label>
                <input value={form.city} onChange={handleField('city')} className={inputClass('city')} placeholder="Buenos Aires" />
                {errors.city && <span className="text-xs text-error">{errors.city}</span>}
              </div>

              {/* Código postal */}
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface">Código postal *</label>
                <div className="relative">
                  <input
                    value={form.postalCode}
                    onChange={handleField('postalCode')}
                    className={inputClass('postalCode')}
                    placeholder="1043"
                    inputMode="numeric"
                  />
                  {shippingLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined animate-spin text-primary/60" style={{ fontSize: '16px' }}>
                      progress_activity
                    </span>
                  )}
                </div>
                {errors.postalCode && <span className="text-xs text-error">{errors.postalCode}</span>}
              </div>

              {/* Provincia */}
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface">Provincia *</label>
                <select value={form.province} onChange={handleField('province')} className={inputClass('province')}>
                  <option value="">Seleccioná una provincia</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.province && <span className="text-xs text-error">{errors.province}</span>}
                {shippingQuote && (
                  <p className="text-xs text-secondary flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>local_shipping</span>
                    {shippingQuote.source === 'andreani' ? (
                      <>Costo Andreani:&nbsp;<strong>${shippingQuote.cost.toLocaleString('es-AR')}</strong>&nbsp;·&nbsp;{shippingQuote.days}</>
                    ) : (
                      <>Envío estimado a {form.province}:&nbsp;<strong>${shippingQuote.cost.toLocaleString('es-AR')}</strong>&nbsp;·&nbsp;{shippingQuote.days}</>
                    )}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Payment */}
          <SectionCard>
            <SectionTitle icon="payment" label="Método de pago" />
            {enabledMethods.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No hay métodos de pago disponibles.</p>
            ) : (
              <div className="space-y-3">
                {enabledMethods.map(([key, cfg]) => {
                  const META: Record<string, { logo?: string; label: string; icon: string; desc: string }> = {
                    mercadopago: { logo: '/logos/mercadopago.png', label: 'Mercado Pago', icon: 'account_balance_wallet', desc: `Tarjetas, débito, cuotas sin interés · Comisión ${cfg.fee}%` },
                    transfer:    { label: 'Transferencia bancaria', icon: 'account_balance', desc: 'Pago directo, sin comisión extra' },
                  }
                  const m = META[key]
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === key ? 'border-primary bg-primary-fixed/10' : 'border-outline-variant hover:border-primary/50'
                      }`}
                    >
                      <input type="radio" name="payment" value={key} checked={paymentMethod === key} onChange={() => setPaymentMethod(key)} className="accent-primary flex-shrink-0" />
                      {m.logo
                        ? <img src={m.logo} alt={m.label} className="h-8 sm:h-10 w-auto flex-shrink-0" />
                        : <span className="material-symbols-outlined text-primary flex-shrink-0">{m.icon}</span>
                      }
                      <div className="min-w-0">
                        {!m.logo && <div className="font-bold text-label-bold text-on-surface">{m.label}</div>}
                        <div className="text-xs sm:text-label-sm text-on-surface-variant">{m.desc}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Right column: summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-headline text-xl sm:text-headline-md text-on-surface mb-4">Resumen</h2>

            {/* Items */}
            <div className="space-y-2 sm:space-y-3 mb-4 max-h-40 sm:max-h-48 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-2 sm:gap-3">
                  <img src={product.image} alt="" className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-label-sm font-bold text-on-surface line-clamp-1">{product.name}</div>
                    <div className="text-xs text-on-surface-variant">x{quantity}</div>
                  </div>
                  <span className="text-xs sm:text-label-sm font-bold text-on-surface whitespace-nowrap">
                    ${(product.price * quantity).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-outline-variant pt-3 sm:pt-4 space-y-2 mb-4 sm:mb-6">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>

              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>
                  Envío
                  {shippingQuote && <span className="text-xs ml-1">· {shippingQuote.days}</span>}
                </span>
                {shippingLoading ? (
                  <span className="text-xs italic text-on-surface-variant/60 flex items-center gap-1">
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '12px' }}>progress_activity</span>
                    Calculando...
                  </span>
                ) : shippingQuote ? (
                  <span>${activeShippingCost.toLocaleString('es-AR')}</span>
                ) : (
                  <span className="italic text-xs text-on-surface-variant/60">Ingresá tu destino</span>
                )}
              </div>

              {mpFee > 0 && (
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span>Comisión MP ({paymentMethods.mercadopago.fee}%)</span>
                  <span>${mpFee.toLocaleString('es-AR')}</span>
                </div>
              )}

              {serviceFeeSaving > 0 && (
                <div className="flex justify-between text-sm text-secondary">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>local_offer</span>
                    Descuento comisión servicio ({serviceFee}%)
                  </span>
                  <span>-${serviceFeeSaving.toLocaleString('es-AR')}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-base sm:text-headline-md text-on-surface border-t border-outline-variant pt-2">
                <span>Total</span>
                {shippingQuote ? (
                  <span>${orderTotal.toLocaleString('es-AR')}</span>
                ) : (
                  <span className="italic font-normal text-sm text-on-surface-variant/60">A calcular</span>
                )}
              </div>
            </div>

            {createOrder.isError && (
              <p className="text-error text-xs sm:text-label-sm mb-4">Error al procesar el pedido. Intentá de nuevo.</p>
            )}

            <Button onClick={handleOrder} loading={createOrder.isPending} className="w-full" size="lg">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
              Confirmar pedido
            </Button>

            <p className="text-xs text-on-surface-variant text-center mt-3 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
              Pago 100% seguro
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
