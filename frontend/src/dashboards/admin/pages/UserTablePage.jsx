import { useState, useEffect } from 'react'
import { ROLE_LABELS } from '../../../context/authRoles'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import Select from '../../../shared/components/ui/Select'
import Badge from '../../../shared/components/ui/Badge'
import { TableSkeleton } from '../../../shared/components/ui/Skeleton'
import Toast from '../../../components/Toast'
import {
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  registerAdminUser,
} from '../../../services/adminService'

const ROLE_OPTIONS = ['creator', 'business', 'marketing', 'administrator']

/* A new Administrator cannot be created once one already exists */
const CREATE_ROLE_OPTIONS = ['creator', 'business', 'marketing']

const roleVariant = {
  creator: 'primary',
  business: 'success',
  marketing: 'warning',
  administrator: 'danger',
}

const INITIAL_ADD_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  phone: '',
  password: '',
  role: 'creator',
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

function AddUserModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState(INITIAL_ADD_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="add-first" label="First name" required value={form.first_name} onChange={set('first_name')} placeholder="Jane" />
          <Input id="add-last" label="Last name" required value={form.last_name} onChange={set('last_name')} placeholder="Doe" />
          <Input id="add-email" label="Email" type="email" required value={form.email} onChange={set('email')} placeholder="jane@company.com" />
          <Input id="add-username" label="Username" required value={form.username} onChange={set('username')} placeholder="janedoe" />
          <Input id="add-phone" label="Phone" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 1234" />
          <Input id="add-password" label="Password" type="password" required value={form.password} onChange={set('password')} placeholder="Min. 8 characters" />
          <div className="sm:col-span-2">
            <Select id="add-role" label="Role" value={form.role} onChange={set('role')}>
              {CREATE_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </Select>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={saving}>Create User</Button>
        </div>
      </form>
    </Modal>
  )
}

function EditUserModal({ user, isOpen, onClose, onSave }) {
  const [role, setRole] = useState(user?.role || 'creator')
  const [company, setCompany] = useState(user?.company || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = { role }
    if (company.trim()) payload.company = company.trim()
    try {
      await onSave(user.id, payload)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${user?.first_name || 'User'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select id="edit-role" label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </Select>
        <Input id="edit-company" label="Company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company / organisation (optional)" />

        {error && (
          <p role="alert" className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function UserTablePage({ title, description, roleFilter = null, showAddUser = false }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const params = {}
        if (roleFilter) params.role = roleFilter
        else if (filterRole !== 'all') params.role = filterRole
        if (search.trim()) params.search = search.trim()
        const data = await getAdminUsers(params)
        if (!mounted) return
        setUsers(data)
        setError(null)
      } catch (err) {
        if (!mounted) return
        setError(err.response?.data?.detail || 'Failed to load users.')
        setUsers([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [roleFilter, filterRole, search, refreshKey])

  const refresh = () => {
    setLoading(true)
    setRefreshKey((k) => k + 1)
  }

  const notify = (type, message) => setToast({ type, message })

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.first_name || user.email}? This removes all of their data.`)) return
    setLoading(true)
    try {
      await deleteAdminUser(user.id)
      notify('success', `${user.first_name || user.email} deleted.`)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setLoading(false)
      notify('error', err.response?.data?.detail || 'Failed to delete user.')
    }
  }

  const handleAddUser = async (form) => {
    await registerAdminUser(form)
    notify('success', 'User created.')
    setShowAddModal(false)
    refresh()
  }

  const handleEditUser = async (id, payload) => {
    await updateAdminUser(id, payload)
    notify('success', 'User updated.')
    setEditUser(null)
    refresh()
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section aria-label="User management header" className="card p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1.5 text-sm leading-relaxed">{description}</p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex gap-2.5 w-full md:w-auto md:flex-1 md:max-w-[420px]">
              <Input
                id="user-search"
                placeholder="Search name / email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setSearch(searchInput) }}
                className="flex-1 min-w-0"
              />
              <Button variant="outline" onClick={() => setSearch(searchInput)}>
                Search
              </Button>
            </div>

            {!roleFilter && (
              <div className="w-full md:w-auto">
                <Select id="role-filter" aria-label="Filter by role" value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="min-w-[180px]">
                  <option value="all">All roles</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </Select>
              </div>
            )}

            {showAddUser && (
              <Button variant="primary" onClick={() => setShowAddModal(true)}>Add User</Button>
            )}
          </div>
        </div>
      </section>

      <section aria-label={`${title} list`} className="card overflow-hidden">
        {loading ? (
          <div className="p-5"><TableSkeleton /></div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
            <span className="text-3xl mb-2">⚠️</span>
            <p className="font-semibold text-sm text-rose-600 dark:text-rose-400">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={refresh}>Retry</Button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
            <span className="text-3xl mb-2">👤</span>
            <p className="font-semibold text-sm">No users found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-400 dark:text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="py-4 px-5 text-left font-semibold">User</th>
                  <th className="py-4 px-5 text-left font-semibold">Role</th>
                  <th className="py-4 px-5 text-left font-semibold">Company</th>
                  <th className="py-4 px-5 text-left font-semibold">Joined</th>
                  <th className="py-4 px-5 text-center font-semibold">Social</th>
                  <th className="py-4 px-5 text-center font-semibold">Campaigns</th>
                  <th className="py-4 px-5 text-center font-semibold">Posts</th>
                  <th className="py-4 px-5 text-center font-semibold">Workspaces</th>
                  <th className="py-4 px-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {`${(user.first_name || '?')[0]}${(user.last_name || '')[0]}`.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : user.username}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <Badge variant={roleVariant[user.role] || 'default'}>{ROLE_LABELS[user.role] || user.role}</Badge>
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-slate-300">{user.company || '—'}</td>
                    <td className="py-4 px-5 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{formatDate(user.created_at)}</td>
                    <td className="py-4 px-5 text-center text-slate-700 dark:text-slate-200">{user.social_accounts_count}</td>
                    <td className="py-4 px-5 text-center text-slate-700 dark:text-slate-200">{user.campaigns_count}</td>
                    <td className="py-4 px-5 text-center text-slate-700 dark:text-slate-200">{user.posts_count}</td>
                    <td className="py-4 px-5 text-center text-slate-700 dark:text-slate-200">{user.workspaces_count}</td>
                    <td className="py-4 px-5">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <Button variant="outline" size="xs" onClick={() => setEditUser(user)}>Edit</Button>
                        <Button
                          variant="danger"
                          size="xs"
                          disabled={user.role === 'administrator'}
                          title={user.role === 'administrator' ? 'Administrators cannot be deleted' : undefined}
                          onClick={() => handleDelete(user)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AddUserModal key={showAddModal ? 'open' : 'closed'} isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAddUser} />
      <EditUserModal key={editUser?.id || 'none'} user={editUser} isOpen={Boolean(editUser)} onClose={() => setEditUser(null)} onSave={handleEditUser} />
    </div>
  )
}
