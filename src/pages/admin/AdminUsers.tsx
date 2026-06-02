import { useState, useMemo } from 'react'
import {
  useUsers,
  useUpdateUser,
  useUpdateUserRole,
  useDeleteUser,
  useCreateUser,
} from '../../hooks/useUsers'
import type { User } from '../../types'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const ROLE_OPTS = [
  { value: 'all', label: 'Todos los roles' },
  { value: 'user', label: 'Usuario' },
  { value: 'admin', label: 'Admin' },
]

const SORT_OPTS = [
  { value: 'name_asc', label: 'Nombre A-Z' },
  { value: 'name_desc', label: 'Nombre Z-A' },
  { value: 'role', label: 'Por rol' },
]

function Avatar({ user, size = 'sm' }: { user: User; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-14 h-14 text-xl' : 'w-8 h-8 text-sm'
  if (user.avatar) return <img src={user.avatar} alt={user.name} className={`${sz} rounded-full object-cover`} />
  return (
    <div className={`${sz} rounded-full bg-primary flex items-center justify-center text-on-primary font-bold flex-shrink-0`}>
      {user.name?.[0]?.toUpperCase() ?? 'U'}
    </div>
  )
}

export default function AdminUsers() {
  const { data: users = [], isLoading } = useUsers()
  const updateUser = useUpdateUser()
  const updateRole = useUpdateUserRole()
  const deleteUser = useDeleteUser()
  const createUser = useCreateUser()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [sort, setSort] = useState('name_asc')

  const [viewUser, setViewUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const [editForm, setEditForm] = useState({ name: '', phone: '', dni: '', role: 'user' as 'user' | 'admin' })
  const [editError, setEditError] = useState('')

  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user' as 'user' | 'admin' })
  const [createError, setCreateError] = useState('')

  const filtered = useMemo(() => {
    let list = [...users]
    if (search) list = list.filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter)
    list.sort((a, b) => {
      switch (sort) {
        case 'name_asc': return (a.name ?? '').localeCompare(b.name ?? '')
        case 'name_desc': return (b.name ?? '').localeCompare(a.name ?? '')
        case 'role': return a.role.localeCompare(b.role)
        default: return 0
      }
    })
    return list
  }, [users, search, roleFilter, sort])

  function openEdit(u: User) {
    setEditForm({ name: u.name ?? '', phone: u.phone ?? '', dni: u.dni ?? '', role: u.role })
    setEditError('')
    setEditUser(u)
  }

  async function handleEdit() {
    if (!editUser) return
    if (!editForm.name.trim()) { setEditError('El nombre es requerido'); return }
    try {
      await updateUser.mutateAsync({ id: editUser.id, updates: { name: editForm.name, phone: editForm.phone || undefined, dni: editForm.dni || undefined } })
      if (editForm.role !== editUser.role) {
        await updateRole.mutateAsync({ id: editUser.id, role: editForm.role })
      }
      setEditUser(null)
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : 'Error al actualizar')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteUser.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  async function handleCreate() {
    setCreateError('')
    if (!createForm.name.trim()) { setCreateError('El nombre es requerido'); return }
    if (!createForm.email.trim()) { setCreateError('El email es requerido'); return }
    if (createForm.password.length < 6) { setCreateError('La contraseña debe tener al menos 6 caracteres'); return }
    try {
      await createUser.mutateAsync({
        email: createForm.email,
        password: createForm.password,
        name: createForm.name,
        role: createForm.role,
      })
      setShowCreate(false)
      setCreateForm({ name: '', email: '', password: '', role: 'user' })
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Error al crear el usuario')
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-3xl text-primary font-bold">Usuarios</h1>
        <Button size="sm" onClick={() => { setCreateForm({ name: '', email: '', password: '', role: 'user' }); setCreateError(''); setShowCreate(true) }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
          Nuevo usuario
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-surface text-sm text-on-surface focus:outline-none focus:border-primary w-64"
          />
        </div>

        <div className="flex gap-1 bg-surface-container rounded-lg p-1">
          {ROLE_OPTS.map(r => (
            <button key={r.value} onClick={() => setRoleFilter(r.value as typeof roleFilter)}
              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${roleFilter === r.value ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>
              {r.label}
            </button>
          ))}
        </div>

        <select value={sort} onChange={e => setSort(e.target.value)} className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface text-on-surface focus:outline-none focus:border-primary">
          {SORT_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <span className="text-sm text-on-surface-variant ml-auto">{filtered.length} usuario{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-container-highest">
            <tr>
              {['Miembro', 'Email', 'Contacto', 'Rol', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-8 bg-surface-container-highest rounded animate-pulse" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-on-surface-variant">No se encontraron usuarios.</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-surface-container/60 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar user={u} />
                    <span className="font-bold text-sm text-on-surface">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-on-surface-variant">{u.email}</td>
                <td className="px-4 py-3">
                  {u.phone || u.dni ? (
                    <div className="flex flex-col gap-0.5">
                      {u.phone && (
                        <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>phone</span>
                          {u.phone}
                        </span>
                      )}
                      {u.dni && (
                        <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>badge</span>
                          DNI {u.dni}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-on-surface-variant">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === 'admin' ? 'primary' : 'outline'}>
                    {u.role === 'admin' ? 'Admin' : 'Usuario'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setViewUser(u)} className="p-1.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" title="Ver perfil">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                    </button>
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" title="Editar">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                    <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors" title="Eliminar">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title="Perfil de Usuario" maxWidth="md">
        {viewUser && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <Avatar user={viewUser} size="lg" />
              <div>
                <h3 className="font-bold text-lg text-on-surface">{viewUser.name}</h3>
                <div className="text-sm text-on-surface-variant">{viewUser.email}</div>
                <Badge variant={viewUser.role === 'admin' ? 'primary' : 'outline'}>
                  {viewUser.role === 'admin' ? 'Administrador' : 'Usuario'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-on-surface-variant w-20">Teléfono:</span>
                <span className="font-bold">{viewUser.phone ?? '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-on-surface-variant w-20">DNI:</span>
                <span className="font-bold">{viewUser.dni ?? '—'}</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-on-surface-variant w-20">ID:</span>
                <span className="font-mono text-xs text-on-surface-variant break-all">{viewUser.id}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Editar Usuario" maxWidth="md">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Nombre *</label>
            <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Teléfono</label>
              <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="Ej: 5493777..." className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">DNI</label>
              <input value={editForm.dni} onChange={e => setEditForm(f => ({ ...f, dni: e.target.value }))}
                placeholder="Ej: 12345678" className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Rol</label>
            <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as 'user' | 'admin' }))}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary">
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {editError && <p className="text-error text-sm">{editError}</p>}
          <div className="flex gap-3 justify-end pt-2 border-t border-outline-variant/30">
            <Button variant="outline" size="sm" onClick={() => setEditUser(null)} disabled={updateUser.isPending}>Cancelar</Button>
            <Button size="sm" onClick={handleEdit} loading={updateUser.isPending || updateRole.isPending}>Guardar</Button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Usuario" maxWidth="md">
        <div className="p-6 space-y-4">
          <div className="p-3 bg-tertiary-fixed/20 rounded-lg text-xs text-on-surface-variant">
            Se creará una cuenta nueva. El usuario recibirá un email de confirmación.
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Nombre *</label>
            <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Email *</label>
            <input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Contraseña temporal *</label>
            <input type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Rol</label>
            <select value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value as 'user' | 'admin' }))}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary">
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {createError && <p className="text-error text-sm">{createError}</p>}
          <div className="flex gap-3 justify-end pt-2 border-t border-outline-variant/30">
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)} disabled={createUser.isPending}>Cancelar</Button>
            <Button size="sm" onClick={handleCreate} loading={createUser.isPending}>Crear usuario</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteUser.isPending}
        message={`¿Eliminar el perfil de "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
