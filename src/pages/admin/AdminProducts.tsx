import { useState, useMemo, useEffect, useRef } from 'react'
import {
  useAdminProducts,
  useDeactivateProduct,
  useUpdateProduct,
  useCreateProduct,
  useDeleteProduct,
} from '../../hooks/useProducts'
import { useAdminCategories } from '../../hooks/useCategories'
import type { Product, VolumeTier } from '../../types'
import type { CreateProductInput } from '../../services/products'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ImageUploader from '../../components/ui/ImageUploader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const PAGE_SIZE = 8

const STATUS_OPTS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
]

const SORT_OPTS = [
  { value: 'name_asc', label: 'Nombre A-Z' },
  { value: 'name_desc', label: 'Nombre Z-A' },
  { value: 'price_asc', label: 'Precio ↑' },
  { value: 'price_desc', label: 'Precio ↓' },
  { value: 'stock_asc', label: 'Stock ↑' },
  { value: 'stock_desc', label: 'Stock ↓' },
  { value: 'category_asc', label: 'Categoría A-Z' },
  { value: 'category_desc', label: 'Categoría Z-A' },
  { value: 'status_asc', label: 'Estado: Activo primero' },
  { value: 'status_desc', label: 'Estado: Inactivo primero' },
]

const COLUMNS: { label: string; col: string | null }[] = [
  { label: 'Producto', col: 'name' },
  { label: 'Categoría', col: 'category' },
  { label: 'Precio', col: 'price' },
  { label: 'Stock', col: 'stock' },
  { label: 'Estado', col: 'status' },
  { label: 'Acciones', col: null },
]

const EMPTY_FORM: CreateProductInput = {
  name: '', price: 0, stock: 0, category: '',
  description: '', badge: '', image_urls: [], active: true, volume_tiers: [], sale_ends_at: null,
}

type GroupMode = 'none' | 'category'

function toMsg(e: unknown, fallback: string): string {
  if (!e) return fallback
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return fallback
}

export default function AdminProducts() {
  const { data: products = [], isLoading } = useAdminProducts()
  const { data: categories = [] } = useAdminCategories()
  const deactivate = useDeactivateProduct()
  const updateProduct = useUpdateProduct()
  const createProduct = useCreateProduct()
  const deleteProduct = useDeleteProduct()

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sort, setSort] = useState('name_asc')
  const [groupMode, setGroupMode] = useState<GroupMode>('none')
  const [page, setPage] = useState(1)

  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [form, setForm] = useState<CreateProductInput>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  useEffect(() => { setPage(1) }, [search, catFilter, statusFilter, sort])

  const filtered = useMemo(() => {
    let list = [...products]
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (catFilter !== 'all') list = list.filter(p => p.category === catFilter)
    if (statusFilter === 'active') list = list.filter(p => p.active)
    if (statusFilter === 'inactive') list = list.filter(p => !p.active)
    list.sort((a, b) => {
      switch (sort) {
        case 'name_asc': return a.name.localeCompare(b.name)
        case 'name_desc': return b.name.localeCompare(a.name)
        case 'price_asc': return a.price - b.price
        case 'price_desc': return b.price - a.price
        case 'stock_asc': return a.stock - b.stock
        case 'stock_desc': return b.stock - a.stock
        case 'category_asc': return a.category.localeCompare(b.category)
        case 'category_desc': return b.category.localeCompare(a.category)
        case 'status_asc': return (b.active ? 1 : 0) - (a.active ? 1 : 0)
        case 'status_desc': return (a.active ? 1 : 0) - (b.active ? 1 : 0)
        default: return 0
      }
    })
    return list
  }, [products, search, catFilter, statusFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  )

  const grouped = useMemo(() => {
    if (groupMode === 'none') return { '': paginated }
    return paginated.reduce<Record<string, Product[]>>((acc, p) => {
      const key = p.category
      if (!acc[key]) acc[key] = []
      acc[key].push(p)
      return acc
    }, {})
  }, [paginated, groupMode])

  function handleColSort(col: string) {
    setSort(s => s === `${col}_asc` ? `${col}_desc` : `${col}_asc`)
  }

  function sortIcon(col: string) {
    if (sort === `${col}_asc`) return 'arrow_upward'
    if (sort === `${col}_desc`) return 'arrow_downward'
    return 'unfold_more'
  }

  function openCreate() {
    const firstActive = categories.find(c => c.active)
    setForm({ ...EMPTY_FORM, category: firstActive?.slug ?? '' })
    setFormError('')
    setShowCreate(true)
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name, price: p.price, stock: p.stock,
      category: p.category, description: p.description ?? '',
      badge: p.badge ?? '',
      image_urls: p.images?.length ? p.images : (p.image ? [p.image] : []),
      active: p.active ?? true,
      volume_tiers: p.volumeTiers ?? [],
      sale_ends_at: p.saleEndsAt ?? null,
    })
    setFormError('')
    setEditProduct(p)
  }

  async function handleCreate() {
    if (!form.name.trim()) { setFormError('El nombre es requerido'); return }
    if (form.price <= 0) { setFormError('El precio debe ser mayor a 0'); return }
    try {
      await createProduct.mutateAsync(form)
      setShowCreate(false)
    } catch (e: unknown) {
      setFormError(toMsg(e, 'Error al crear el producto'))
    }
  }

  async function handleEdit() {
    if (!editProduct) return
    if (!form.name.trim()) { setFormError('El nombre es requerido'); return }
    try {
      await updateProduct.mutateAsync({
        id: editProduct.id,
        updates: {
          name: form.name, price: form.price, stock: form.stock,
          active: form.active, badge: form.badge, description: form.description,
          image_urls: form.image_urls ?? [],
          volume_tiers: form.volume_tiers ?? [],
          sale_ends_at: form.sale_ends_at ?? null,
        },
      })
      setEditProduct(null)
    } catch (e: unknown) {
      setFormError(toMsg(e, 'Error al actualizar'))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteProduct.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      setDeleteTarget(null)
    }
  }

  const stockColor = (s: number) =>
    s === 0 ? 'text-error font-bold' : s < 5 ? 'text-error' : s < 10 ? 'text-tertiary' : 'text-secondary'

  const btnPage = 'px-2.5 py-1.5 rounded text-sm text-on-surface-variant border border-outline-variant/40 hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-3xl text-primary font-bold">Administración de Productos</h1>
        <Button size="sm" onClick={openCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Nuevo producto
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-surface text-sm text-on-surface focus:outline-none focus:border-primary w-56"
          />
        </div>

        {/* Category tabs — dynamic from DB */}
        <div className="flex gap-1 bg-surface-container rounded-lg p-1 flex-wrap">
          <button
            onClick={() => setCatFilter('all')}
            className={`px-3 py-1 rounded text-sm font-bold transition-colors ${catFilter === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
          >
            Todos
          </button>
          {categories.map(c => (
            <button
              key={c.slug}
              onClick={() => setCatFilter(c.slug)}
              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${catFilter === c.slug ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface text-on-surface focus:outline-none focus:border-primary"
        >
          {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface text-on-surface focus:outline-none focus:border-primary"
        >
          {SORT_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* Group toggle */}
        <button
          onClick={() => setGroupMode(g => g === 'none' ? 'category' : 'none')}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-bold transition-colors ${groupMode !== 'none' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>category</span>
          Agrupar
        </button>

        <span className="text-sm text-on-surface-variant ml-auto">{filtered.length} productos</span>
      </div>

      {/* Table */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-container-highest">
            <tr>
              {COLUMNS.map(({ label, col }) => (
                <th
                  key={label}
                  onClick={col ? () => handleColSort(col) : undefined}
                  className={`text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide select-none ${col ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {label}
                    {col && (
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', opacity: sort.startsWith(col) ? 1 : 0.35 }}>
                        {sortIcon(col)}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-8 bg-surface-container-highest rounded animate-pulse" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">No se encontraron productos.</td></tr>
            ) : Object.entries(grouped).map(([group, items]) => (
              <>
                {groupMode !== 'none' && (
                  <tr key={`group-${group}`} className="bg-surface-container-highest/50">
                    <td colSpan={6} className="px-4 py-2">
                      <span className="font-bold text-sm text-primary uppercase tracking-widest">{group}</span>
                      <span className="ml-2 text-xs text-on-surface-variant">({items.length})</span>
                    </td>
                  </tr>
                )}
                {items.map(p => (
                  <tr key={p.id} className={`hover:bg-surface-container/60 transition-colors ${!p.active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded border border-outline-variant/30" />
                        <div>
                          <div className="font-bold text-sm text-on-surface">{p.name}</div>
                          {p.badge && <div className="text-xs text-tertiary">{p.badge}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{p.category}</Badge></td>
                    <td className="px-4 py-3 font-bold text-secondary">${p.price}</td>
                    <td className="px-4 py-3 font-bold text-sm"><span className={stockColor(p.stock)}>{p.stock} unid.</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.active ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" title="Editar">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                        </button>
                        {p.active ? (
                          <button onClick={() => deactivate.mutate(p.id)} disabled={deactivate.isPending} className="p-1.5 rounded text-on-surface-variant hover:text-tertiary hover:bg-surface-container transition-colors" title="Desactivar">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility_off</span>
                          </button>
                        ) : (
                          <button onClick={() => updateProduct.mutate({ id: p.id, updates: { active: true } })} disabled={updateProduct.isPending} className="p-1.5 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors" title="Activar">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                          </button>
                        )}
                        <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors" title="Eliminar">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/30 bg-surface-container-highest/30">
            <span className="text-sm text-on-surface-variant">
              {filtered.length === 0
                ? '0 productos'
                : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length} productos`}
            </span>
            <div className="flex items-center gap-1">
              <button disabled={safePage === 1} onClick={() => setPage(1)} className={btnPage} title="Primera página">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>first_page</span>
              </button>
              <button disabled={safePage === 1} onClick={() => setPage(p => p - 1)} className={btnPage} title="Anterior">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce<(number | '...')[]>((acc, n, i, arr) => {
                  if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, i) =>
                  n === '...'
                    ? <span key={`ellipsis-${i}`} className="px-2 text-sm text-on-surface-variant">…</span>
                    : <button
                        key={n}
                        onClick={() => setPage(n as number)}
                        className={`px-2.5 py-1.5 rounded text-sm font-bold transition-colors border ${safePage === n ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-container'}`}
                      >
                        {n}
                      </button>
                )}
              <button disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)} className={btnPage} title="Siguiente">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
              </button>
              <button disabled={safePage === totalPages} onClick={() => setPage(totalPages)} className={btnPage} title="Última página">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>last_page</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Modal open={!!viewProduct} onClose={() => setViewProduct(null)} title="Detalle del Producto" maxWidth="lg">
        {viewProduct && (
          <div className="p-6 flex gap-6">
            <img src={viewProduct.image} alt={viewProduct.name} className="w-32 h-32 object-cover rounded-lg border border-outline-variant/30 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <h3 className="font-headline text-xl font-bold text-on-surface">{viewProduct.name}</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{viewProduct.category}</Badge>
                {viewProduct.badge && <Badge variant="tertiary">{viewProduct.badge}</Badge>}
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${viewProduct.active ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  {viewProduct.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-on-surface-variant">Precio:</span> <span className="font-bold text-secondary">${viewProduct.price}</span></div>
                <div><span className="text-on-surface-variant">Stock:</span> <span className={`font-bold ${stockColor(viewProduct.stock)}`}>{viewProduct.stock} unid.</span></div>
                {viewProduct.rating && <div><span className="text-on-surface-variant">Rating:</span> <span className="font-bold">⭐ {viewProduct.rating}</span></div>}
                {viewProduct.reviews !== undefined && <div><span className="text-on-surface-variant">Reseñas:</span> <span className="font-bold">{viewProduct.reviews}</span></div>}
              </div>
              {viewProduct.description && (
                <div>
                  <div className="text-xs text-on-surface-variant mb-1">Descripción</div>
                  <p className="text-sm text-on-surface leading-relaxed">{viewProduct.description}</p>
                </div>
              )}
              <div className="text-xs text-on-surface-variant font-mono">ID: {viewProduct.id}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      {(showCreate || !!editProduct) && (
        <ProductFormModal
          title={showCreate ? 'Nuevo Producto' : 'Editar Producto'}
          form={form}
          setForm={setForm}
          categories={categories}
          error={formError}
          loading={createProduct.isPending || updateProduct.isPending}
          onClose={() => { setShowCreate(false); setEditProduct(null) }}
          onSubmit={showCreate ? handleCreate : handleEdit}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteProduct.isPending}
        message={`¿Eliminar permanentemente "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}

function VolumeTiersEditor({
  basePrice,
  tiers,
  onChange,
}: {
  basePrice: number
  tiers: VolumeTier[]
  onChange: (tiers: VolumeTier[]) => void
}) {
  const qtyRef = useRef<HTMLInputElement>(null)
  const priceRef = useRef<HTMLInputElement>(null)
  const [newQty, setNewQty] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [addError, setAddError] = useState('')

  const sorted = [...tiers].sort((a, b) => a.qty - b.qty)

  const handleAdd = () => {
    const qty = parseInt(newQty, 10)
    const price = parseFloat(newPrice)
    if (!qty || qty < 2) { setAddError('La cantidad mínima es 2.'); return }
    if (!price || price <= 0) { setAddError('El precio debe ser mayor a 0.'); return }
    if (price >= basePrice) { setAddError('El precio por volumen debe ser menor al precio base.'); return }
    if (tiers.some(t => t.qty === qty)) { setAddError(`Ya existe un tier para x${qty}.`); return }
    setAddError('')
    onChange([...tiers, { qty, price }])
    setNewQty('')
    setNewPrice('')
    qtyRef.current?.focus()
  }

  return (
    <div>
      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">
        Precios por volumen
      </label>

      {sorted.length > 0 ? (
        <div className="space-y-1.5 mb-3">
          {sorted.map(t => {
            const pct = basePrice > 0 ? Math.round((1 - t.price / basePrice) * 100) : 0
            return (
              <div key={t.qty} className="flex items-center justify-between gap-3 px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/40 text-sm">
                <span className="font-bold text-on-surface">x{t.qty} unidades</span>
                <span className="text-secondary font-bold">${t.price.toLocaleString('es-AR')} c/u</span>
                {pct > 0 && <span className="text-xs text-tertiary font-bold bg-tertiary/10 px-1.5 py-0.5 rounded">-{pct}%</span>}
                <button
                  type="button"
                  onClick={() => onChange(tiers.filter(x => x.qty !== t.qty))}
                  className="ml-auto text-on-surface-variant hover:text-error transition-colors p-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-on-surface-variant mb-3 italic">Sin precios por volumen configurados.</p>
      )}

      {/* Add row */}
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1 w-24">
          <label className="text-xs text-on-surface-variant">Cant. mín.</label>
          <input
            ref={qtyRef}
            type="number" min="2" step="1"
            value={newQty}
            onChange={e => setNewQty(e.target.value)}
            placeholder="2"
            className="w-full border border-outline-variant rounded-lg px-2 py-1.5 text-sm bg-surface focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-on-surface-variant">Precio c/u (ARS $)</label>
          <input
            ref={priceRef}
            type="number" min="0" step="0.01"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            placeholder="ej: 90000"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="w-full border border-outline-variant rounded-lg px-2 py-1.5 text-sm bg-surface focus:outline-none focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          Agregar
        </button>
      </div>
      {addError && <p className="text-xs text-error mt-1">{addError}</p>}
    </div>
  )
}

function ProductFormModal({
  title, form, setForm, error, loading, onClose, onSubmit, categories,
}: {
  title: string
  form: CreateProductInput
  setForm: React.Dispatch<React.SetStateAction<CreateProductInput>>
  error: string
  loading: boolean
  onClose: () => void
  onSubmit: () => void
  categories: import('../../services/categories').Category[]
}) {
  const field = (key: keyof CreateProductInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked
        : ['price', 'stock'].includes(key as string) ? Number(e.target.value)
        : e.target.value
      setForm(f => ({ ...f, [key]: value }))
    }

  return (
    <Modal open onClose={onClose} title={title} maxWidth="2xl">
      <div className="p-6">
        {/* 2-column layout: images left, fields right */}
        <div className="grid grid-cols-[280px_1fr] gap-6">

          {/* LEFT — imágenes */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">
              Imágenes <span className="font-normal normal-case">(máx. 3)</span>
            </label>
            <ImageUploader
              images={form.image_urls ?? []}
              onChange={urls => setForm(f => ({ ...f, image_urls: urls }))}
              maxImages={3}
            />
          </div>

          {/* RIGHT — campos */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Nombre *</label>
              <input
                value={form.name}
                onChange={field('name')}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Precio (ARS $) *</label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.price}
                  onChange={field('price')}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Stock *</label>
                <input
                  type="number" min="0"
                  value={form.stock}
                  onChange={field('stock')}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Categoría *</label>
                <select
                  value={form.category}
                  onChange={field('category')}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                >
                  {categories.length === 0 && <option value="">Cargando...</option>}
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug} disabled={!c.active}>
                      {c.active ? c.name : `${c.name} — inactiva`}
                    </option>
                  ))}
                </select>
                {form.category && categories.find(c => c.slug === form.category && !c.active) && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>warning</span>
                    Categoría inactiva
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Badge</label>
                <input
                  value={form.badge ?? ''}
                  onChange={field('badge')}
                  placeholder="ej: Nuevo, Oferta..."
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Descripción</label>
              <textarea
                value={form.description ?? ''}
                onChange={field('description')}
                rows={3}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <VolumeTiersEditor
              basePrice={form.price}
              tiers={form.volume_tiers ?? []}
              onChange={tiers => setForm(f => ({ ...f, volume_tiers: tiers }))}
            />

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>timer</span>
                Oferta termina el (opcional)
              </label>
              <input
                type="datetime-local"
                value={form.sale_ends_at ? form.sale_ends_at.slice(0, 16) : ''}
                onChange={e => setForm(f => ({ ...f, sale_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
              />
              {form.sale_ends_at && (
                <button type="button" onClick={() => setForm(f => ({ ...f, sale_ends_at: null }))}
                  className="mt-1 text-xs text-error hover:underline flex items-center gap-0.5">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                  Quitar fecha de oferta
                </button>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active ?? true}
                onChange={field('active')}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-on-surface">Producto activo (visible en la tienda)</span>
            </label>
          </div>
        </div>

        {error && <p className="text-error text-sm mt-4">{error}</p>}

        <div className="flex gap-3 justify-end mt-5 pt-4 border-t border-outline-variant/30">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button size="sm" onClick={onSubmit} loading={loading}>Guardar</Button>
        </div>
      </div>
    </Modal>
  )
}
