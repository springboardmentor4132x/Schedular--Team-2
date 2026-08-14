import React, { useState, useEffect } from 'react'
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
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
  RotateCcw,
  Globe,
  Settings
} from 'lucide-react'

import Card from '../../shared/components/ui/Card'
import Button from '../../shared/components/Button'
import Avatar from '../../shared/components/ui/Avatar'
import StatusBadge from '../../shared/components/ui/StatusBadge'

import {
  getBusinessAccounts,
  createBusinessAccount,
  updateBusinessAccount,
  updateBusinessAccountStatus,
  updateConnectedPlatforms,
  deleteBusinessAccount,
  exportBusinessAccountsCsv
} from '../services/businessAccountsService'

import BusinessDetailsModal from '../components/business/BusinessDetailsModal'
import BusinessFormModal from '../components/business/BusinessFormModal'
import ManagePlatformsModal from '../components/business/ManagePlatformsModal'
import BusinessConfirmModal from '../components/business/BusinessConfirmModal'

export default function BusinessAccountsManagement() {
  const [accountsList, setAccountsList] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [platformFilter, setPlatformFilter] = useState('All')

  // Sort State
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modals & Menu State
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isPlatformsModalOpen, setIsPlatformsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmVariant: 'danger',
    confirmText: 'Confirm',
    onConfirm: () => {}
  })

  const loadData = async () => {
    setLoading(true)
    const data = await getBusinessAccounts()
    setAccountsList(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // KPI Calculations
  const totalAccountsCount = accountsList.length
  const activeAccountsCount = accountsList.filter((a) => a.status === 'Active').length
  const inactiveAccountsCount = accountsList.filter((a) => a.status === 'Inactive').length
  const pendingAccountsCount = accountsList.filter((a) => a.status === 'Pending').length
  const totalConnectedPlatformsCount = accountsList.reduce(
    (acc, curr) => acc + (curr.connectedPlatforms ? curr.connectedPlatforms.length : 0),
    0
  )

  // Filter Logic
  const filteredAccounts = accountsList.filter((account) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || account.status === statusFilter
    const matchesType = typeFilter === 'All' || account.type === typeFilter
    const matchesPlatform =
      platformFilter === 'All' ||
      (account.connectedPlatforms && account.connectedPlatforms.includes(platformFilter))

    return matchesSearch && matchesStatus && matchesType && matchesPlatform
  })

  // Sort Logic
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''

    if (sortField === 'name') {
      aVal = a.name.toLowerCase()
      bVal = b.name.toLowerCase()
    } else if (sortField === 'totalCampaigns') {
      aVal = a.totalCampaigns || 0
      bVal = b.totalCampaigns || 0
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Pagination Logic
  const totalPages = Math.ceil(sortedAccounts.length / pageSize) || 1
  const paginatedAccounts = sortedAccounts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
    setStatusFilter('All')
    setTypeFilter('All')
    setPlatformFilter('All')
    setCurrentPage(1)
  }

  // Handlers
  const handleOpenAddModal = () => {
    setEditingAccount(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (account) => {
    setEditingAccount(account)
    setIsFormModalOpen(true)
    setActiveMenuId(null)
  }

  const handleOpenViewModal = (account) => {
    setSelectedAccount(account)
    setIsViewModalOpen(true)
    setActiveMenuId(null)
  }

  const handleOpenPlatformsModal = (account) => {
    setSelectedAccount(account)
    setIsPlatformsModalOpen(true)
    setActiveMenuId(null)
  }

  const handleSaveAccount = async (formData) => {
    if (editingAccount) {
      const updated = await updateBusinessAccount(editingAccount.id, formData)
      setAccountsList((prev) => prev.map((a) => (a.id === editingAccount.id ? updated : a)))
    } else {
      const created = await createBusinessAccount(formData)
      setAccountsList((prev) => [created, ...prev])
    }
  }

  const handleSavePlatforms = async (id, platforms) => {
    const updated = await updateConnectedPlatforms(id, platforms)
    setAccountsList((prev) => prev.map((a) => (a.id === id ? updated : a)))
  }

  const handleToggleStatusConfirm = (account) => {
    setActiveMenuId(null)
    const nextStatus = account.status === 'Active' ? 'Inactive' : 'Active'
    setConfirmModal({
      isOpen: true,
      title: `${nextStatus === 'Active' ? 'Activate' : 'Deactivate'} Business Account`,
      message: `Are you sure you want to change status for "${account.name}" to "${nextStatus}"?`,
      confirmVariant: nextStatus === 'Active' ? 'primary' : 'warning',
      confirmText: nextStatus === 'Active' ? 'Activate Account' : 'Deactivate Account',
      onConfirm: async () => {
        const updated = await updateBusinessAccountStatus(account.id, nextStatus)
        setAccountsList((prev) => prev.map((a) => (a.id === account.id ? updated : a)))
      }
    })
  }

  const handleSuspendConfirm = (account) => {
    setActiveMenuId(null)
    setConfirmModal({
      isOpen: true,
      title: `Suspend Business Account`,
      message: `Are you sure you want to suspend "${account.name}"? Suspended accounts cannot publish posts or run campaigns.`,
      confirmVariant: 'danger',
      confirmText: 'Suspend Account',
      onConfirm: async () => {
        const updated = await updateBusinessAccountStatus(account.id, 'Suspended')
        setAccountsList((prev) => prev.map((a) => (a.id === account.id ? updated : a)))
      }
    })
  }

  const handleDeleteConfirm = (account) => {
    setActiveMenuId(null)
    setConfirmModal({
      isOpen: true,
      title: `Delete Business Account`,
      message: `Are you sure you want to permanently delete business account "${account.name}"? This action cannot be undone.`,
      confirmVariant: 'danger',
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        await deleteBusinessAccount(account.id)
        setAccountsList((prev) => prev.filter((a) => a.id !== account.id))
      }
    })
  }

  const handleExportCsv = () => {
    exportBusinessAccountsCsv(filteredAccounts)
  }

  const isFiltersActive = searchQuery || statusFilter !== 'All' || typeFilter !== 'All' || platformFilter !== 'All'

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* 1. PAGE HEADER */}
      <section aria-label="Business Accounts Header" className="card relative overflow-hidden bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Business Accounts
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs md:text-sm font-medium">
              Manage business accounts, connected platforms, campaigns, and account activity.
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
              <span>+ Add Business Account</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Accounts</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">{totalAccountsCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Building2 size={18} />
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Accounts</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{activeAccountsCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inactive</span>
            <span className="text-xl font-extrabold text-slate-600 dark:text-slate-400 mt-0.5 block">{inactiveAccountsCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
            <XCircle size={18} />
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
            <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">{pendingAccountsCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={18} />
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connected Channels</span>
            <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400 mt-0.5 block">{totalConnectedPlatformsCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Layers size={18} />
          </div>
        </Card>
      </div>

      {/* 3. SEARCH + FILTER BAR */}
      <Card className="p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search business accounts, owner, or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
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
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Business Type Filter */}
          <div className="space-y-1">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full input-base select-base text-xs py-1.5"
            >
              <option value="All">All Types</option>
              <option value="Agency">Agency</option>
              <option value="Brand">Brand</option>
              <option value="Startup">Startup</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Platform Filter */}
          <div className="space-y-1">
            <select
              value={platformFilter}
              onChange={(e) => {
                setPlatformFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full input-base select-base text-xs py-1.5"
            >
              <option value="All">All Platforms</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="X">X (Twitter)</option>
              <option value="YouTube">YouTube</option>
              <option value="Pinterest">Pinterest</option>
            </select>
          </div>
        </div>

        {isFiltersActive && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">
              Active filters applied ({filteredAccounts.length} records found)
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

      {/* 4. BUSINESS ACCOUNTS TABLE */}
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
                    <span>BUSINESS</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th className="p-4 whitespace-nowrap">OWNER</th>
                <th className="p-4 whitespace-nowrap">EMAIL</th>
                <th className="p-4 whitespace-nowrap">TYPE</th>
                <th className="p-4 whitespace-nowrap">CONNECTED PLATFORMS</th>
                <th
                  onClick={() => handleSortToggle('totalCampaigns')}
                  className="p-4 whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>CAMPAIGNS</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th className="p-4 whitespace-nowrap">STATUS</th>
                <th className="p-4 whitespace-nowrap">LAST ACTIVE</th>
                <th className="p-4 whitespace-nowrap text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-xs text-slate-400">
                    Loading business accounts...
                  </td>
                </tr>
              ) : paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-xs text-slate-400">
                    No business accounts found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150 relative"
                  >
                    {/* Business Name & Domain */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar src={account.logo} alt={account.name} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {account.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {account.domain}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Owner Name */}
                    <td className="p-4 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                      {account.ownerName}
                    </td>

                    {/* Email */}
                    <td className="p-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                      {account.email}
                    </td>

                    {/* Type Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                        {account.type}
                      </span>
                    </td>

                    {/* Connected Platforms */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {account.connectedPlatforms && account.connectedPlatforms.length > 0 ? (
                          account.connectedPlatforms.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400">None</span>
                        )}
                      </div>
                    </td>

                    {/* Campaigns Count */}
                    <td className="p-4 whitespace-nowrap font-extrabold text-slate-900 dark:text-slate-100">
                      {account.totalCampaigns}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={account.status} dot />
                    </td>

                    {/* Last Active */}
                    <td className="p-4 whitespace-nowrap font-medium text-slate-500">
                      {account.lastActive}
                    </td>

                    {/* Actions Menu */}
                    <td className="p-4 whitespace-nowrap text-right relative">
                      <div className="inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === account.id ? null : account.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === account.id && (
                          <div className="absolute right-4 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700 z-50 py-1 text-left animate-scale-in">
                            <button
                              onClick={() => handleOpenViewModal(account)}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                            >
                              <Eye size={14} className="text-indigo-500" />
                              <span>View Details</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(account)}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                            >
                              <Edit2 size={14} className="text-blue-500" />
                              <span>Edit Account</span>
                            </button>

                            <button
                              onClick={() => handleOpenPlatformsModal(account)}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                            >
                              <Layers size={14} className="text-purple-500" />
                              <span>Manage Channels</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatusConfirm(account)}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                            >
                              <Power size={14} className="text-emerald-500" />
                              <span>{account.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>

                            <button
                              onClick={() => handleSuspendConfirm(account)}
                              className="w-full px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
                            >
                              <AlertOctagon size={14} />
                              <span>Suspend Account</span>
                            </button>

                            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                            <button
                              onClick={() => handleDeleteConfirm(account)}
                              className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              <span>Delete Account</span>
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

        {/* 5. PAGINATION */}
        {sortedAccounts.length > 0 && (
          <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedAccounts.length)} of {sortedAccounts.length} accounts
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
      <BusinessDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        account={selectedAccount}
      />

      <BusinessFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveAccount}
        account={editingAccount}
      />

      <ManagePlatformsModal
        isOpen={isPlatformsModalOpen}
        onClose={() => setIsPlatformsModalOpen(false)}
        onSave={handleSavePlatforms}
        account={selectedAccount}
      />

      <BusinessConfirmModal
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
