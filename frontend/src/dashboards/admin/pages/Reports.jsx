import { useState, useEffect, useCallback } from 'react'
import Button from '../../../shared/components/ui/Button'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import AdminReportModal from '../components/AdminReportModal'
import { getAdminAnalyticsSummary, getAdminTopPosts } from '../../../services/adminAnalyticsService'
import { getReports, deleteReport, downloadReport, generateAdminReport } from '../../../services/reportService'
import { FileText, Download, Trash2, Printer, BarChart3, Layers, Megaphone, Users, Send } from 'lucide-react'
import Toast from '../../../components/Toast'

const REPORT_TYPE_META = {
  engagement: { label: 'Engagement', icon: BarChart3 },
  campaign: { label: 'Campaign', icon: Megaphone },
  audience: { label: 'Audience', icon: Users },
  publishing: { label: 'Publishing', icon: Send },
  platform_comparison: { label: 'Platform Comparison', icon: Layers },
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return '—'
  }
}

export default function Reports() {
  const [summary, setSummary] = useState(null)
  const [topPosts, setTopPosts] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [summaryData, postsData, reportsData] = await Promise.all([
        getAdminAnalyticsSummary(),
        getAdminTopPosts(),
        getReports(),
      ])
      setSummary(summaryData)
      setTopPosts(postsData)
      setReports(reportsData || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load reports.')
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to load reports.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleGenerate = async () => {
    try {
      setReportOpen(true)
      const res = await generateAdminReport({
        report_type: 'platform',
        report_name: 'Platform Analytics Report',
        export_format: 'pdf',
      })
      setToast({ type: 'success', message: `Report "${res.report_name}" generated.` })
      load()
    } catch {
      setToast({ type: 'error', message: 'Failed to generate report.' })
    }
  }

  const handleDownload = async (report) => {
    try {
      await downloadReport(report.id)
    } catch {
      setToast({ type: 'error', message: `Could not download "${report.report_name}". The file may not exist on the server.` })
    }
  }

  const handleDelete = async (report) => {
    if (!window.confirm(`Delete report "${report.report_name}"?`)) return
    try {
      await deleteReport(report.id)
      setReports((prev) => prev.filter((r) => r.id !== report.id))
      setToast({ type: 'success', message: 'Report deleted.' })
    } catch {
      setToast({ type: 'error', message: 'Failed to delete report.' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <span className="text-3xl mb-2">⚠️</span>
          <p className="font-semibold text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={load}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate printable platform-wide reports and manage previously generated report files.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" size="md" onClick={handleGenerate}>
            <Printer size={15} className="mr-1.5" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Report preview summary */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-indigo-600 dark:text-indigo-400" />
          Latest Platform Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Impressions', value: summary?.kpis?.totalImpressions?.value ?? '0' },
            { label: 'Engagement Rate', value: summary?.kpis?.overallEngagementRate?.value ?? '0%' },
            { label: 'Link Clicks', value: summary?.kpis?.totalClicks?.value ?? '0' },
            { label: 'New Followers', value: summary?.kpis?.newFollowers?.value ?? '0' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-snug">{stat.label}</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generated reports */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
          Generated Reports ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-10">
            No generated reports yet. Use "Generate Report" to create a printable report of the current platform analytics.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700/60">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-400 dark:text-slate-500 uppercase bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Report</th>
                  <th className="py-3 px-4 text-left font-semibold">Type</th>
                  <th className="py-3 px-4 text-left font-semibold">Format</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-left font-semibold">Generated</th>
                  <th className="py-3 px-4 text-right font-semibold">Downloads</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {reports.map((report) => {
                  const meta = REPORT_TYPE_META[report.report_type] || { label: report.report_type, icon: FileText }
                  const Icon = meta.icon
                  return (
                    <tr key={report.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Icon size={15} />
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{report.report_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{meta.label}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {report.export_format}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          report.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(report.generated_at)}</td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{report.download_count}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDownload(report)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Download"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(report)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        summary={summary}
        topPosts={topPosts}
      />
    </div>
  )
}
