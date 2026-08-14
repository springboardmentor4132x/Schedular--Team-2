import React, { useState, useEffect } from 'react'
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Shield,
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Power,
  AlertOctagon,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react'

import Card from '../../shared/components/ui/Card'
import Button from '../../shared/components/Button'
import Avatar from '../../shared/components/ui/Avatar'
import StatusBadge from '../../shared/components/ui/StatusBadge'

import {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  exportUsersCsv
} from '../services/usersService'

import UserDetailsModal from '../components/users/UserDetailsModal'
import UserFormModal from '../components/users/UserFormModal'
import UserConfirmModal from '../components/users/UserConfirmModal'

export default function UsersManagement() {
  const [usersList, setUsersList] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [joinedFilter, setJoinedFilter] = useState('All')

  // Sorting State
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmVariant: 'danger',
    confirmText: 'Confirm',
    onConfirm: () => {}
  })

  const loadUsersData = async () => {
    setLoading(true)
    const data = await getUsers()
    setUsersList(data)
    setLoading(false)
  }

  useEffect(() => {
    loadUsersData()
  }, [])

  // KPI Calculations
  const totalUsersCount = usersList.length
  const activeUsersCount = usersList.filter((u) => u.status === 'Active').length
  const inactiveUsersCount = usersList.filter((u) => u.status === 'Inactive').length
  const newThisMonthCount = usersList.filter((u) => u.joinedDate.startsWith('2026') || u.joinedDate.startsWith('2025-12')).length
  const adminUsersCount = usersList.filter((u) => u.role === 'Admin').length

  // Filter Logic
  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'All' || user.role === roleFilter
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter

    let matchesJoined = true
    if (joinedFilter === 'ThisMonth') {
      matchesJoined = user.joinedDate.startsWith('2026-02') || user.joinedDate.startsWith('2026-01')
    } else if (joinedFilter === '30d') {
      matchesJoined = user.joinedDate >= '2026-01-01'
    } else if (joinedFilter === '90d') {
      matchesJoined = user.joinedDate >= '2025-11-01'
    }

    return matchesSearch && matchesRole && matchesStatus && matchesJoined
  })

  // Sort Logic
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''

    if (sortField === 'name') {
      aVal = a.name.toLowerCase()
      bVal = b.name.toLowerCase()
    } else if (sortField === 'joinedDate') {
      aVal = a.joinedDate
      bVal = b.joinedDate
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Pagination Logic
  const totalPages = Math.ceil(sortedUsers.length / pageSize) || 1
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
    setRoleFilter('All')
    setStatusFilter('All')
    setJoinedFilter('All')
    setCurrentPage(1)
  }

  // User CRUD Handlers
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
      const updated = await updateUser(editingUser.id, formData)
      setUsersList((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)))
    } else {
      const created = await createUser(formData)
      setUsersList((prev) => [created, ...prev])
    }
  }

  const handleToggleStatusConfirm = (user) => {
    setActiveMenuId(null)
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    setConfirmModal({
      isOpen: true,
      title: `${nextStatus === 'Active' ? 'Activate' : 'Deactivate'} User Account`,
      message: `Are you sure you want to change status for ${user.name} to "${nextStatus}"?`,
      confirmVariant: nextStatus === 'Active' ? 'primary' : 'warning',
      confirmText: nextStatus === 'Active' ? 'Activate User' : 'Deactivate User',
      onConfirm: async () => {
        const updated = await updateUserStatus(user.id, nextStatus)
        setUsersList((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
      }
    })
  }

  const handleSuspendConfirm = (user) => {
    setActiveMenuId(null)
    setConfirmModal({
      isOpen: true,
      title: `Suspend User Account`,
      message: `Are you sure you want to suspend ${user.name}? Suspended users cannot log in to OrbitSocial.`,
      confirmVariant: 'danger',
      confirmText: 'Suspend Account',
      onConfirm: async () => {
        const updated = await updateUserStatus(user.id, 'Suspended')
        setUsersList((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
      }
    })
  }

  const handleDeleteConfirm = (user) => {
    setActiveMenuId(null)
    setConfirmModal({
      isOpen: true,
      title: `Delete User Account`,
      message: `Are you sure you want to permanently delete user account "${user.name}" (${user.email})? This action cannot be undone.`,
      confirmVariant: 'danger',
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        await deleteUser(user.id)
        setUsersList((prev) => prev.filter((u) => u.id !== user.id))
      }
    })
  }

  const handleExportCsv = () => {
    exportUsersCsv(filteredUsers)
  }

  const isFiltersActive = searchQuery || roleFilter !== 'All' || statusFilter !== 'All' || joinedFilter !== 'All'

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* 1. PAGE HEADER */}
      <section aria-label="Users Page Header" className="card relative overflow-hidden bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Users
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs md:text-sm font-medium">
              Manage platform users, roles, account status, and activity.
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
              <span>Export Users</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 font-bold text-xs"
            >
              <Plus size={14} />
              <span>+ Add User</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. KPI / SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">{totalUsersCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users size={18} />
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Users</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{activeUsersCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck size={18} />
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inactive</span>
            <span className="text-xl font-extrabold text-slate-600 dark:text-slate-400 mt-0.5 block">{inactiveUsersCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
            <UserX size={18} />
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New This Month</span>
            <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5 block">{newThisMonthCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <UserPlus size={18} />
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Administrators</span>
            <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400 mt-0.5 block">{adminUsersCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Shield size={18} />
          </div>
        </Card>
      </div>

      {/* 3. SEARCH + FILTER TOOLBAR */}
      <Card className="p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or username..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div className="space-y-1">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full input-base select-base text-xs py-1.5"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Creator">Creator</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full input-base select-base text-xs py-1.5"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Date Joined Filter */}
          <div className="space-y-1">
            <select
              value={joinedFilter}
              onChange={(e) => {
                setJoinedFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full input-base select-base text-xs py-1.5"
            >
              <option value="All">All Time</option>
              <option value="ThisMonth">This Month</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
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

      {/* 4. USERS TABLE */}
      <Card className="p-0 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => handleSortToggle('name')}
                  className="p-4 whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>USER</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th className="p-4 whitespace-nowrap">EMAIL</th>
                <th className="p-4 whitespace-nowrap">ROLE</th>
                <th className="p-4 whitespace-nowrap">STATUS</th>
                <th
                  onClick={() => handleSortToggle('joinedDate')}
                  className="p-4 whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>JOINED</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th className="p-4 whitespace-nowrap">LAST ACTIVE</th>
                <th className="p-4 whitespace-nowrap text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-slate-400">
                    Loading users list...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-slate-400">
                    No users match your criteria. Try adjusting filters or search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150 relative"
                  >
                    {/* User Profile Column */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} alt={user.name} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email Column */}
                    <td className="p-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                      {user.email}
                    </td>

                    {/* Role Column */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                        {user.role}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={user.status} dot />
                    </td>

                    {/* Joined Column */}
                    <td className="p-4 whitespace-nowrap font-medium text-slate-500">
                      {user.joinedDate}
                    </td>

                    {/* Last Active Column */}
                    <td className="p-4 whitespace-nowrap font-medium text-slate-500">
                      {user.lastActive}
                    </td>

                    {/* Actions Column */}
                    <td className="p-4 whitespace-nowrap text-right relative">
                      <div className="inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === user.id && (
                          <div className="absolute right-4 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700 z-50 py-1 text-left animate-scale-in">
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
                              <span>Edit User</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatusConfirm(user)}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                            >
                              <Power size={14} className="text-emerald-500" />
                              <span>{user.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>

                            <button
                              onClick={() => handleSuspendConfirm(user)}
                              className="w-full px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
                            >
                              <AlertOctagon size={14} />
                              <span>Suspend User</span>
                            </button>

                            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                            <button
                              onClick={() => handleDeleteConfirm(user)}
                              className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              <span>Delete User</span>
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

        {/* 5. PAGINATION CONTROLS */}
        {sortedUsers.length > 0 && (
          <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedUsers.length)} of {sortedUsers.length} users
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <Button
                variant="outline"
                size="xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* MODALS INTEGRATION */}
      <UserDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
      />

      <UserConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmVariant={confirmModal.confirmVariant}
        confirmText={confirmModal.confirmText}
      />
    </div>
  )
}
