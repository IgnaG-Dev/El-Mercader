import { useState } from 'react'
import IconPicker from '../../components/ui/IconPicker'
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories'
import type { Category, CategoryInput } from '../../services/categories'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Button from '../../components/ui/Button'

const EMPTY_FORM: CategoryInput = {
  slug: '', name: '', description: '', icon: '', sortOrder: 0, active: true,
}

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useAdminCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryInput>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError('')
    setShowCreate(true)
  }

  function openEdit(c: Category) {
    setForm({
      slug: c.slug,
      name: c.name,
      description: c.description ?? '',
      icon: c.icon ?? '',
      sortOrder: c.sortOrder,
      active: c.active,
    })
    setFormError('')
    setEditTarget(c)
  }

  async function handleCreate() {
    setFormError('')
    if (!form.name.trim()) { setFormError('El nombre es requerido'); return }
    if (!form.slug.trim()) { setFormError('El slug es requerido'); return }
    if (!/^[a-z0-9_-]+$/.test(form.slug)) { setFormError('El slug solo puede contener letras minúsculas, números, guiones y guiones bajos'); return }
    try {
      await createCategory.mutateAsync(form)
      setShowCreate(false)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error al crear la categoría')
    }
  }

  async function handleEdit() {
    if (!editTarget) return
    setFormError('')
    if (!form.name.trim()) { setFormError('El nombre es requerido'); return }
    if (!form.slug.trim()) { setFormError('El slug es requerido'); return }
    if (!/^[a-z0-9_-]+$/.test(form.slug)) { setFormError('El slug solo puede contener letras minúsculas, números, guiones y guiones bajos'); return }
    try {
      await updateCategory.mutateAsync({ id: editTarget.id, input: form })
      setEditTarget(null)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error al actualizar')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteCategory.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  async function toggleActive(c: Category) {
    await updateCategory.mutateAsync({ id: c.id, input: { active: !c.active } })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline text-3xl text-primary font-bold">Categorías</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Administrá las categorías que se usan en los productos y filtros de la tienda.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Nueva categoría
        </Button>
      </div>

      {/* Table */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-container-highest">
            <tr>
              {['Orden', 'Ícono', 'Nombre', 'Slug', 'Descripción', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-8 bg-surface-container-highest rounded animate-pulse" /></td></tr>
              ))
            ) : categories.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-on-surface-variant">No hay categorías aún.</td></tr>
            ) : categories.map(c => (
              <tr key={c.id} className={`hover:bg-surface-container/60 transition-colors ${!c.active ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3 text-sm text-on-surface-variant font-bold w-16 text-center">{c.sortOrder}</td>
                <td className="px-4 py-3 w-12">
                  {c.icon
                    ? <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>{c.icon}</span>
                    : <span className="text-on-surface-variant text-xs">—</span>
                  }
                </td>
                <td className="px-4 py-3 font-bold text-sm text-on-surface">{c.name}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-surface-container-highest px-2 py-1 rounded text-on-surface-variant">{c.slug}</span>
                </td>
                <td className="px-4 py-3 text-sm text-on-surface-variant max-w-xs truncate">{c.description ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.active ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    {c.active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                    <button
                      onClick={() => toggleActive(c)}
                      disabled={updateCategory.isPending}
                      className="p-1.5 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors"
                      title={c.active ? 'Desactivar' : 'Activar'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{c.active ? 'visibility_off' : 'visibility'}</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info box */}
      <div className="mt-4 p-4 bg-tertiary-fixed/20 rounded-lg text-sm text-on-surface-variant">
        <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '16px' }}>info</span>
        El <strong>slug</strong> es el identificador interno (ej: <code className="font-mono text-xs bg-surface-container px-1 rounded">expansion</code>).
        Debe coincidir con el campo <code className="font-mono text-xs bg-surface-container px-1 rounded">category</code> de los productos.
        Modificar un slug existente puede romper los filtros de la tienda.
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || !!editTarget) && (
        <CategoryFormModal
          title={showCreate ? 'Nueva Categoría' : 'Editar Categoría'}
          form={form}
          setForm={setForm}
          error={formError}
          loading={createCategory.isPending || updateCategory.isPending}
          onClose={() => { setShowCreate(false); setEditTarget(null) }}
          onSubmit={showCreate ? handleCreate : handleEdit}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteCategory.isPending}
        message={`¿Eliminar la categoría "${deleteTarget?.name}" (slug: ${deleteTarget?.slug})? Los productos que usen este slug quedarán sin categoría reconocida.`}
      />
    </div>
  )
}

function CategoryFormModal({
  title, form, setForm, error, loading, onClose, onSubmit,
}: {
  title: string
  form: CategoryInput
  setForm: React.Dispatch<React.SetStateAction<CategoryInput>>
  error: string
  loading: boolean
  onClose: () => void
  onSubmit: () => void
}) {
  return (
    <Modal open onClose={onClose} title={title} maxWidth="md">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Nombre *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="ej: Expansión"
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Slug * <span className="font-normal text-on-surface-variant/60">(identificador único)</span></label>
            <input
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
              placeholder="ej: expansion"
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Ícono</label>
            <IconPicker
              value={form.icon ?? ''}
              onChange={icon => setForm(f => ({ ...f, icon }))}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Descripción</label>
            <input
              value={form.description ?? ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descripción breve..."
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Orden</label>
            <input
              type="number" min="0"
              value={form.sortOrder ?? 0}
              onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active ?? true}
                onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-on-surface">Categoría activa</span>
            </label>
          </div>
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        <div className="flex gap-3 justify-end pt-2 border-t border-outline-variant/30">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button size="sm" onClick={onSubmit} loading={loading}>Guardar</Button>
        </div>
      </div>
    </Modal>
  )
}
