import React, { useState, useEffect } from 'react'
import { getAdminCreatorPerformance } from '../../services/adminAnalyticsService'
import { Search, Download, Eye, GitCompare, UserCheck } from 'lucide-react'

export default function AdminCreatorPerformance() {
  const [creators, setCreators] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminCreatorPerformance({ search, status: statusFilter }).then((res) => {
      setCreators(res)
      setLoading(false)
    })
  }, [search, statusFilter])

  const handleExport = (creatorName) => {
    alert(`Exporting performance report for ${creatorName}...`)
  }

  const handleCompare = (creatorName) => {
    alert(`Added ${creatorName} to comparison tray.`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filter Toolbar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search creator by name or handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Creator Performance Table */}
      <div className="card p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
            Creator Performance Matrix ({creators.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Creator</th>
                <th className="py-3.5 px-4">Followers</th>
                <th className="py-3.5 px-4">Posts</th>
                <th className="py-3.5 px-4">Total Reach</th>
                <th className="py-3.5 px-4">Engagement</th>
                <th className="py-3.5 px-4">Campaigns</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Loading creator matrix...
                  </td>
                </tr>
              ) : creators.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No creators found matching criteria.
                  </td>
                </tr>
              ) : (
                creators.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {c.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{c.name}</p>
                          <p className="text-[11px] text-slate-400">{c.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{c.followers}</td>
                    <td className="py-3.5 px-4">{c.posts}</td>
                    <td className="py-3.5 px-4">{c.reach}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {c.engagement}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{c.campaigns}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => alert(`Viewing detailed profile for ${c.name}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Creator"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleCompare(c.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Compare Creator"
                        >
                          <GitCompare size={15} />
                        </button>
                        <button
                          onClick={() => handleExport(c.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Export Report"
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
