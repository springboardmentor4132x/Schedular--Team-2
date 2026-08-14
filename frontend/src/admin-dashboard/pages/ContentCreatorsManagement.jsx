import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  Clock,
  Star,
  Send,
  TrendingUp,
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Eye,
  BarChart2,
  Edit2,
  Layers,
  Power,
  AlertOctagon,
  Trash2,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react'

import Card from '../../shared/components/ui/Card'
import Button from '../../shared/components/Button'
import Avatar from '../../shared/components/ui/Avatar'
import StatusBadge from '../../shared/components/ui/StatusBadge'

import {
  getContentCreators,
  createContentCreator,
  updateContentCreator,
  updateContentCreatorStatus,
  updateCreatorPlatforms,
  deleteContentCreator,
  exportContentCreatorsCsv
} from '../services/contentCreatorsService'

import CreatorDetailsModal from '../components/creators/CreatorDetailsModal'
import CreatorFormModal from '../components/creators/CreatorFormModal'
import ManageCreatorPlatformsModal from '../components/creators/ManageCreatorPlatformsModal'
import CreatorConfirmModal from '../components/creators/CreatorConfirmModal'

export default function ContentCreatorsManagement() {
  const navigate = useNavigate()
  const [creatorsList, setCreatorsList] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [performanceFilter, setPerformanceFilter] = useState('All')
  const [platformFilter, setPlatformFilter] = useState('All')

  // Sort State
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modals & Menu State
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isPlatformsModalOpen, setIsPlatformsModalOpen] = useState(false)
  const [editingCreator, setEditingCreator] = useState(null)
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

  const loadData = async () => {
    setLoading(true)
    const data = await getContentCreators()
    setCreatorsList(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // KPI Calculations
  const totalCreatorsCount = creatorsList.length
  const activeCreatorsCount = creatorsList.filter((c) => c.status === 'Active').length
  const pendingCreatorsCount = creatorsList.filter((c) => c.status === 'Pending').length
  const topPerformingCount = creatorsList.filter((c) => c.performanceTier === 'Top Performing').length
  const totalPublishedPostsSum = creatorsList.reduce((acc, curr) => acc + (curr.publishedPosts || 0), 0)
  
  const avgEngagementRate =
    creatorsList.length > 0
      ? (
          creatorsList.reduce((acc, curr) => acc + parseFloat(curr.engagementRate || '0'), 0) /
          creatorsList.length
        ).toFixed(1) + '%'
      : '0.0%'

  // Filter Logic
  const filteredCreators = creatorsList.filter((creator) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || creator.status === statusFilter
    const matchesType = typeFilter === 'All' || creator.type === typeFilter
    const matchesPerformance = performanceFilter === 'All' || creator.performanceTier === performanceFilter
    const matchesPlatform =
      platformFilter === 'All' ||
      (creator.connectedPlatforms && creator.connectedPlatforms.includes(platformFilter))

    return matchesSearch && matchesStatus && matchesType && matchesPerformance && matchesPlatform
  })

  // Sort Logic
  const sortedCreators = [...filteredCreators].sort((a, b) => {
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''

    if (sortField === 'name') {
      aVal = a.name.toLowerCase()
      bVal = b.name.toLowerCase()
    } else if (sortField === 'publishedPosts') {
      aVal = a.publishedPosts || 0
      bVal = b.publishedPosts || 0
    } else if (sortField === 'engagementRate') {
      aVal = parseFloat(a.engagementRate || '0')
      bVal = parseFloat(b.engagementRate || '0')
    } else if (sortField === 'totalFollowers') {
      aVal = parseFloat(a.totalFollowers || '0')
      bVal = parseFloat(b.totalFollowers || '0')
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Pagination Logic
  const totalPages = Math.ceil(sortedCreators.length / pageSize) || 1
  const paginatedCreators = sortedCreators.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
    setPerformanceFilter('All')
    setPlatformFilter('All')
    setCurrentPage(1)
  }

  // Handlers
  const handleOpenAddModal = () => {
    setEditingCreator(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (creator) => {
    setEditingCreator(creator)
    setIsFormModalOpen(true)
    setActiveMenuId(null)
  }

  const handleOpenViewModal = (creator) => {
    setSelectedCreator(creator)
    setIsViewModalOpen(true)
    setActiveMenuId(null)
  }

  const handleOpenPlatformsModal = (creator) => {
    setSelectedCreator(creator)
    setIsPlatformsModalOpen(true)
    setActiveMenuId(null)
  }

  const handleNavigateToAnalytics = (creator) => {
    setActiveMenuId(null)
    navigate('/admin/analytics/creators')
  }

  const handleSaveCreator = async (formData) => {
    if (editingCreator) {
      const updated = await updateContentCreator(editingCreator.id, formData)
      setCreatorsList((prev) => prev.map((c) => (c.id === editingCreator.id ? updated : c)))
    } else {
      const created = await createContentCreator(formData)
      setCreatorsList((prev) => [created, ...prev])
    }
  }

  const handleSavePlatforms = async (id, platforms) => {
    const updated = await updateCreatorPlatforms(id, platforms)
    setCreatorsList((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }

  const handleToggleStatusConfirm = (creator) => {
    setActiveMenuId(null)
    const nextStatus = creator.status === 'Active' ? 'Inactive' : 'Active'
    setConfirmModal({
      isOpen: true,
      title: `${nextStatus === 'Active' ? 'Activate' : 'Deactivate'} Creator Account`,
      message: `Are you sure you want to change status for "${creator.name}" to "${nextStatus}"?`,
      confirmVariant: nextStatus === 'Active' ? 'primary' : 'warning',
      confirmText: nextStatus === 'Active' ? 'Activate Creator' : 'Deactivate Creator',
      onConfirm: async () => {
        const updated = await updateContentCreatorStatus(creator.id, nextStatus)
        setCreatorsList((prev) => prev.map((c) => (c.id === creator.id ? updated : c)))
      }
    })
  }

  const handleSuspendConfirm = (creator) => {
    setActiveMenuId(null)
    setConfirmModal({
      isOpen: true,
      title: `Suspend Creator Account`,
      message: `Are you sure you want to suspend "${creator.name}"? Suspended creators cannot post or join campaigns.`,
      confirmVariant: 'danger',
      confirmText: 'Suspend Account',
      onConfirm: async () => {
        const updated = await updateContentCreatorStatus(creator.id, 'Suspended')
        setCreatorsList((prev) => prev.map((c) => (c.id === creator.id ? updated : c)))
      }
    })
  }

  const handleDeleteConfirm = (creator) => {
    setActiveMenuId(null)
    setConfirmModal({
      isOpen: true,
      title: `Delete Creator Account`,
      message: `Are you sure you want to permanently delete content creator "${creator.name}"? This action cannot be undone.`,
      confirmVariant: 'danger',
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        await deleteContentCreator(creator.id)
        setCreatorsList((prev) => prev.filter((c) => c.id !== creator.id))
      }
    })
  }

  const handleExportCsv = () => {
    exportContentCreatorsCsv(filteredCreators)
  }

  const isFiltersActive =
    searchQuery ||
    statusFilter !== 'All' ||
    typeFilter !== 'All' ||
    performanceFilter !== 'All' ||
    platformFilter !== 'All'

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* 1. PAGE HEADER */}
      <section aria-label="Content Creators Header" className="card relative overflow-hidden bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Content Creators
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs md:text-sm font-medium">
              Manage creators, performance, campaigns, and connected social platforms.
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
              <span>+ Add Creator</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Creators</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">{totalCreatorsCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users size={17} />
          </div>
        </Card>

        <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{activeCreatorsCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck size={17} />
          </div>
        </Card>

        <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
            <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">{pendingCreatorsCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={17} />
          </div>
        </Card>

        <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Performers</span>
            <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5 block">{topPerformingCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Star size={17} />
          </div>
        </Card>

        <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Published Posts</span>
            <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400 mt-0.5 block">{totalPublishedPostsSum}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Send size={17} />
          </div>
        </Card>

        <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Engagement</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{avgEngagementRate}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp size={17} />
          </div>
        </Card>
      </div>

      {/* 3. SEARCH + FILTER TOOLBAR */}
      <Card className="p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* Search Input */}
          <div className="relative lg:col-span-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search creator name or email..."
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
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Creator Type Filter */}
          <div className="space-y-1">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full input-base select-base text-xs py-1.5"
            >
              <option value="All">All Creator Types</option>
              <option value="Individual">Individual</option>
              <option value="Professional">Professional</option>
              <option value="Agency">Agency</option>
            </select>
          </div>

          {/* Performance Filter */}
          <div className="space-y-1">
            <select
              value={performanceFilter}
              onChange={(e) => {
                setPerformanceFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full input-base select-base text-xs py-1.5"
            >
              <option value="All">All Performance</option>
              <option value="Top Performing">Top Performing</option>
              <option value="Average">Average</option>
              <option value="Needs Attention">Needs Attention</option>
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
              Active filters applied ({filteredCreators.length} records found)
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

      {/* 4. CREATOR TABLE */}
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
                    <span>CREATOR</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th className="p-4 whitespace-nowrap">EMAIL</th>
                <th className="p-4 whitespace-nowrap">PLATFORMS</th>
                <th className="p-4 whitespace-nowrap">CAMPAIGNS</th>
                <th
                  onClick={() => handleSortToggle('publishedPosts')}
                  className="p-4 whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>POSTS</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('engagementRate')}
                  className="p-4 whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ENGAGEMENT</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('totalFollowers')}
                  className="p-4 whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>FOLLOWERS</span>
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
                  <td colSpan={10} className="p-12 text-center text-xs text-slate-400">
                    Loading content creators...
                  </td>
                </tr>
              ) : paginatedCreators.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-xs text-slate-400">
                    No content creators found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedCreators.map((creator) => (
                  <tr
                    key={creator.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150 relative"
                  >
                    {/* Creator Column */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar src={creator.avatar} alt={creator.name} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {creator.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {creator.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email Column */}
                    <td className="p-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                      {creator.email}
                    </td>

                    {/* Connected Platforms */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {creator.connectedPlatforms && creator.connectedPlatforms.length > 0 ? (
                          creator.connectedPlatforms.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40"
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
                      {creator.campaignsCount || 0}
                    </td>

                    {/* Published Posts */}
                    <td className="p-4 whitespace-nowrap font-extrabold text-slate-900 dark:text-slate-100">
                      {creator.publishedPosts || 0}
                    </td>

                    {/* Engagement Rate */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {creator.engagementRate}
                      </span>
                    </td>

                    {/* Followers */}
                    <td className="p-4 whitespace-nowrap font-extrabold text-slate-900 dark:text-slate-100">
                      {creator.totalFollowers}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={creator.status} dot />
                    </td>

                    {/* Last Active */}
                    <td className="p-4 whitespace-nowrap font-medium text-slate-500">
                      {creator.lastActive}
                    </td>

                    {/* Actions Menu */}
                    <td className="p-4 whitespace-nowrap text-right relative">
                      <div className="inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === creator.id ? null : creator.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === creator.id && (
                          <div className="absolute right-4 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700 z-50 py-1 text-left animate-scale-in">
                            <button
                              onClick={() => handleOpenViewModal(creator)}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                            >
                              <Eye size={14} className="text-indigo-500" />
                              <span>View Profile</span>
                            </button>

                            <button
                              onClick={() => handleNavigateToAnalytics(creator)}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                            >
                              <BarChart2 size={14} className="text-purple-500" />
                              <span>View Analytics</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(creator)}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                            >
                              <Edit2 size={14} className="text-blue-500" />
                              <span>Edit Profile</span>
                            </button>

                            <button
                              onClick={() => handleOpenPlatformsModal(creator)}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                            >
                              <Layers size={14} className="text-sky-500" />
                              <span>Manage Platforms</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatusConfirm(creator)}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                            >
                              <Power size={14} className="text-emerald-500" />
                              <span>{creator.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>

                            <button
                              onClick={() => handleSuspendConfirm(creator)}
                              className="w-full px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
                            >
                              <AlertOctagon size={14} />
                              <span>Suspend Creator</span>
                            </button>

                            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                            <button
                              onClick={() => handleDeleteConfirm(creator)}
                              className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              <span>Delete Creator</span>
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
        {sortedCreators.length > 0 && (
          <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedCreators.length)} of {sortedCreators.length} creators
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
      <CreatorDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        creator={selectedCreator}
      />

      <CreatorFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveCreator}
        creator={editingCreator}
      />

      <ManageCreatorPlatformsModal
        isOpen={isPlatformsModalOpen}
        onClose={() => setIsPlatformsModalOpen(false)}
        onSave={handleSavePlatforms}
        creator={selectedCreator}
      />

      <CreatorConfirmModal
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
