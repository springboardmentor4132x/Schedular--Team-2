import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  Target,
  Users,
  Send,
  Layers,
  FileSpreadsheet,
  FileText,
  Sparkles,
  ArrowUpRight
} from 'lucide-react'

import ReportHeader from '../components/reports/ReportHeader'
import ReportFilters from '../components/reports/ReportFilters'
import ReportTable from '../components/reports/ReportTable'
import Card from '../components/ui/Card'
import { getReportData, exportReportPdf, exportReportExcel } from '../services/reportService'

export default function ReportsPage({ role: propRole }) {
  const location = useLocation()
  
  // Determine role based on route prefix or props
  const role = propRole || (location.pathname.startsWith('/admin') || location.pathname.startsWith('/reports') ? 'admin' : 'creator')
  
  const [activeReportType, setActiveReportType] = useState('engagement')
  const [filters, setFilters] = useState({
    dateRange: '30d',
    platform: 'All',
    campaign: 'All',
    contentType: 'All'
  })

  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = async () => {
    setLoading(true)
    const data = await getReportData(activeReportType, filters, role)
    setReportData(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchReport()
  }, [activeReportType, filters, role])

  const reportTabs = [
    { id: 'engagement', label: 'Engagement Report', icon: TrendingUp },
    { id: 'campaign', label: 'Campaign Report', icon: Target },
    { id: 'audience', label: 'Audience Growth Report', icon: Users },
    { id: 'publishing', label: 'Publishing Report', icon: Send },
    { id: 'platform', label: 'Platform Comparison', icon: Layers },
  ]

  const handleExportPdf = () => {
    if (reportData) {
      exportReportPdf(activeReportType, filters, reportData, role)
    }
  }

  const handleExportExcel = () => {
    if (reportData) {
      exportReportExcel(activeReportType, filters, reportData, role)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Report Header */}
      <ReportHeader
        title={reportData?.title || 'System Reports & Export'}
        description={
          role === 'admin'
            ? 'Generate, inspect, and export system-wide performance, creator metrics, campaign ROI, and platform reports.'
            : 'Track, analyze, and export your content performance, campaign deliverables, audience growth, and platform activity.'
        }
        role={role}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
      />

      {/* Report Type Selector Tabs */}
      <div className="card p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border border-slate-200/80 dark:border-slate-800">
        {reportTabs.map((tab) => {
          const IconComponent = tab.icon
          const isSelected = activeReportType === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportType(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <IconComponent size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Report Filter Controls */}
      <ReportFilters filters={filters} onChange={setFilters} />

      {/* Executive KPI Summary Cards */}
      {reportData?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(reportData.summary).map(([key, val]) => (
            <Card key={key} className="p-4 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {val}
                </span>
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Visual Chart Metrics */}
      {reportData?.chartData && (
        <Card className="p-6 space-y-4 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>Report Visual Insights</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Comparative Breakdown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            {reportData.chartData.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {item.name}
                  </span>
                  <span className="text-xs text-slate-400">Metric Value</span>
                </div>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Report Data Table */}
      <Card className="p-6 space-y-4 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span>Detailed Report Records</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {reportData?.tableData?.length || 0} rows found
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading report data...</div>
        ) : (
          <ReportTable data={reportData?.tableData} />
        )}
      </Card>
    </div>
  )
}
