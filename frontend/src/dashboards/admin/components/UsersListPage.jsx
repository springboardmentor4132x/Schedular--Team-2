import { useState, useEffect } from 'react'
import {
  Search,
  Download,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react'
import Card from '../../../shared/components/ui/Card'
import Button from '../../../shared/components/ui/Button'
import Avatar from '../../../shared/components/ui/Avatar'
import Badge from '../../../shared/components/ui/Badge'
import { TableSkeleton } from '../../../shared/components/ui/Skeleton'
import Toast from '../../../components/Toast'
import {
  getAdminUsers,
  registerAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../../../services/adminService'
import { ROLE_LABELS } from '../../../context/authRoles'
import { fullName, initialsOf, formatDate, isThisMonth, isInLastDays } from '../utils/userFormat'
import { exportCsv } from '../utils/exportCsv'
import KpiCard from './KpiCard'
import Pagination from './Pagination'
import UserDetailsModal from './users/UserDetailsModal'
import UserFormModal from './users/UserFormModal'
import AdminConfirmModal from './AdminConfirmModal'

const roleVariant = {
  creator: 'primary',
  business: 'success',
  marketing: 'warning',
  administrator: 'danger',
}

const PAGE_SIZE = 8

function SortableHeader({ field, onSort, children, className = '' }) {
  return (
    <th
      onClick={() => onSort(field)}
      className={`p-4 whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span>{children}</span>
        <ArrowUpDown size={12} className="text-slate-400" />
      </div>
    </th>
  )
}

function PlainHeader({ children, className = '' }) {
  return <th className={`p-4 whitespace-nowrap ${className}`}>{children}</th>
}

const JOINED_OPTIONS = [
  { value: 'All', label: 'All Time' },
  { value: 'ThisMonth', label: 'This Month' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
]

export default function UsersListPage({
  title,
  description,
  roleFilter = null,
  entityLabel = 'users',
  csvFilename = 'OrbitSocial_Users',
  identityLabel = 'USER',
  identityField = 'name', // 'name' | 'company'
  kpis = [],
  showRoleColumn = false,
  showCompanyColumn = false,
  showOwnerColumn = false,
  showWorkspacesColumn = false,
  addRoleOptions = null,
  addDefaultRole = '',
  searchPlaceholder = 'Search by name, email, or username...',
}) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilterState, setRoleFilterState] = useState('All')
  const [joinedFilter, setJoinedFilter] = useState('All')

  // Sorting
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Modals & Menu
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = {}
        if (roleFilter) params.role = roleFilter
        const data = await getAdminUsers(params)
        if (!mounted) return
        setUsers(data || [])
      } catch (err) {
        if (!mounted) return
        setError(err.response?.data?.detail || 'Failed to load data.')
        setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to load data.' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  const refresh = () => setRefreshKey((k) => k + 1)

  const matchesJoined = (user) => {
    const created = user.created_at
    if (joinedFilter === 'ThisMonth') return isThisMonth(created)
    if (joinedFilter === '30d') return isInLastDays(created, 30)
    if (joinedFilter === '90d') return isInLastDays(created, 90)
    return true
  }

  // Filter Logic
  const filteredUsers = users.filter((user) => {
    const name = fullName(user)
    const matchesSearch =
      searchQuery.trim() === '' ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.company || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter || roleFilterState === 'All' || user.role === roleFilterState

    return matchesSearch && matchesRole && matchesJoined(user)
  })

  // Sort Logic
  const getSortValue = (user) => {
    switch (sortField) {
      case 'name':
        return fullName(user).toLowerCase()
      case 'email':
        return (user.email || '').toLowerCase()
      case 'role':
        return user.role || ''
      case 'company':
        return (user.company || '').toLowerCase()
      case 'created_at':
        return user.created_at || ''
      case 'social_accounts_count':
        return user.social_accounts_count || 0
      case 'campaigns_count':
        return user.campaigns_count || 0
      case 'posts_count':
        return user.posts_count || 0
      case 'workspaces_count':
        return user.workspaces_count || 0
      default:
        return user[sortField] || ''
    }
  }

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aVal = getSortValue(a)
    const bVal = getSortValue(b)
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / PAGE_SIZE) || 1
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setRoleFilterState('All')
    setJoinedFilter('All')
    setCurrentPage(1)
  }

  const isFiltersActive = searchQuery || joinedFilter !== 'All' || (roleFilterState !== 'All' && !roleFilter)

  // Handlers
  const handleOpenAddModal = () => {
    setEditingUser(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (user) => {
    setEditingUser(user)
    setIsFormModalOpen(true)
    setActiveMenuId(null)
  }

  const handleOpenViewModal = (user) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
    setActiveMenuId(null)
  }

  const handleSaveUser = async (formData) => {
    if (editingUser) {
      const payload = { ...formData }
      await updateAdminUser(editingUser.id, payload)
      setToast({ type: 'success', message: `${fullName(editingUser)} updated.` })
    } else {
      await registerAdminUser(formData)
      setToast({ type: 'success', message: 'User created.' })
    }
    refresh()
  }

  const handleDeleteConfirm = (user) => {
    setActiveMenuId(null)
    setConfirmModal({
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user account "${fullName(user)}" (${user.email})? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          await deleteAdminUser(user.id)
          setToast({ type: 'success', message: `${fullName(user)} deleted.` })
          refresh()
        } catch (err) {
          setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to delete user.' })
        }
      },
    })
  }

  const handleExportCsv = () => {
    const headers = ['ID', 'NAME', 'USERNAME', 'EMAIL', 'ROLE', 'COMPANY', 'JOINED', 'SOCIAL', 'CAMPAIGNS', 'POSTS', 'WORKSPACES']
    const rows = sortedUsers.map((u) => [
      u.id,
      fullName(u),
      u.username,
      u.email,
      u.role,
      u.company,
      u.created_at,
      u.social_accounts_count ?? 0,
      u.campaigns_count ?? 0,
      u.posts_count ?? 0,
      u.workspaces_count ?? 0,
    ])
    exportCsv({ filename: csvFilename, headers, rows })
    setToast({ type: 'success', message: `${sortedUsers.length} ${entityLabel} exported.` })
  }

  const kpiList = typeof kpis === 'function' ? kpis(users) : kpis

  const identityPrimary = (user) =>
    identityField === 'company' ? user.company || fullName(user) : fullName(user)
  const identitySecondary = (user) =>
    identityField === 'company' ? fullName(user) || user.email : `@${user.username}`

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* 1. PAGE HEADER */}
      <section
        aria-label={`${title} Header`}
        className="card relative overflow-hidden bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs md:text-sm font-medium">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 font-bold text-xs"
            >
              <Download size={14} />
              <span>Export</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 font-bold text-xs"
            >
              <Plus size={14} />
              <span>Add {title.replace(/s$/, '')}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. KPI SUMMARY CARDS */}
      {kpiList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {kpiList.map((kpi, i) => (
            <KpiCard key={i} {...kpi} />
          ))}
        </div>
      )}

      {/* 3. SEARCH + FILTER TOOLBAR */}
      <Card className="p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          <div className="relative lg:col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {!roleFilter && (
            <div className="space-y-1">
              <select
                value={roleFilterState}
                onChange={(e) => {
                  setRoleFilterState(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full input-base select-base text-xs py-1.5"
              >
                <option value="All">All Roles</option>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <select
              value={joinedFilter}
              onChange={(e) => {
                setJoinedFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full input-base select-base text-xs py-1.5"
            >
              {JOINED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {isFiltersActive && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">
              Active filters applied ({filteredUsers.length} records found)
            </span>
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </Card>

      {/* 4. TABLE */}
      <Card className="p-0 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-5"><TableSkeleton /></div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
            <span className="text-3xl mb-2">⚠️</span>
            <p className="font-semibold text-sm text-rose-600 dark:text-rose-400">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={refresh}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <SortableHeader field="name" onSort={handleSortToggle}>{identityLabel}</SortableHeader>
                    <PlainHeader>EMAIL</PlainHeader>
                    {showRoleColumn && <SortableHeader field="role" onSort={handleSortToggle}>ROLE</SortableHeader>}
                    {showCompanyColumn && <SortableHeader field="company" onSort={handleSortToggle}>COMPANY</SortableHeader>}
                    {showOwnerColumn && <SortableHeader field="name" onSort={handleSortToggle}>OWNER</SortableHeader>}
                    {showWorkspacesColumn && <SortableHeader field="workspaces_count" onSort={handleSortToggle}>WORKSPACES</SortableHeader>}
                    <SortableHeader field="created_at" onSort={handleSortToggle}>JOINED</SortableHeader>
                    <SortableHeader field="social_accounts_count" onSort={handleSortToggle}>SOCIAL</SortableHeader>
                    <SortableHeader field="campaigns_count" onSort={handleSortToggle}>CAMPAIGNS</SortableHeader>
                    <SortableHeader field="posts_count" onSort={handleSortToggle}>POSTS</SortableHeader>
                    <PlainHeader className="text-right">ACTIONS</PlainHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-xs text-slate-400">
                        No {entityLabel} found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150 relative"
                      >
                        {/* Identity */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user.avatar_url || undefined}
                              initials={initialsOf(identityPrimary(user))}
                              alt={identityPrimary(user)}
                              size="sm"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                {identityPrimary(user)}
                              </p>
                              <p className="text-[11px] text-slate-400 font-medium">
                                {identitySecondary(user)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                          {user.email}
                        </td>

                        {showRoleColumn && (
                          <td className="p-4 whitespace-nowrap">
                            <Badge variant={roleVariant[user.role] || 'default'}>
                              {ROLE_LABELS[user.role] || user.role}
                            </Badge>
                          </td>
                        )}

                        {showCompanyColumn && (
                          <td className="p-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                            {user.company || '—'}
                          </td>
                        )}

                        {showOwnerColumn && (
                          <td className="p-4 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                            {fullName(user)}
                          </td>
                        )}

                        {showWorkspacesColumn && (
                          <td className="p-4 whitespace-nowrap font-extrabold text-slate-900 dark:text-slate-100">
                            {user.workspaces_count || 0}
                          </td>
                        )}

                        <td className="p-4 whitespace-nowrap font-medium text-slate-500">
                          {formatDate(user.created_at)}
                        </td>

                        <td className="p-4 whitespace-nowrap font-extrabold text-indigo-600 dark:text-indigo-400">
                          {user.social_accounts_count || 0}
                        </td>

                        <td className="p-4 whitespace-nowrap font-extrabold text-slate-900 dark:text-slate-100">
                          {user.campaigns_count || 0}
                        </td>

                        <td className="p-4 whitespace-nowrap font-extrabold text-slate-900 dark:text-slate-100">
                          {user.posts_count || 0}
                        </td>

                        {/* Actions */}
                        <td className="p-4 whitespace-nowrap text-right relative">
                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {activeMenuId === user.id && (
                              <div className="absolute right-4 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700 z-50 py-1 text-left animate-scale-in">
                                <button
                                  onClick={() => handleOpenViewModal(user)}
                                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                                >
                                  <Eye size={14} className="text-indigo-500" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  onClick={() => handleOpenEditModal(user)}
                                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                                >
                                  <Edit2 size={14} className="text-blue-500" />
                                  <span>Edit Profile</span>
                                </button>

                                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                                <button
                                  onClick={() => handleDeleteConfirm(user)}
                                  disabled={user.role === 'administrator'}
                                  title={user.role === 'administrator' ? 'Administrators cannot be deleted' : undefined}
                                  className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedUsers.length}
              pageSize={PAGE_SIZE}
              entityLabel={entityLabel}
              onChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </Card>

      {/* MODALS */}
      <UserDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />

      <UserFormModal
        key={editingUser ? `edit-${editingUser.id}` : isFormModalOpen ? 'create' : 'closed'}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        roleOptions={addRoleOptions}
        defaultRole={addDefaultRole}
      />

      <AdminConfirmModal
        isOpen={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        onConfirm={() => confirmModal?.onConfirm?.()}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmText={confirmModal?.confirmText}
      />
    </div>
  )
}
