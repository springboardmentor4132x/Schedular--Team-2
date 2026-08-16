import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Target,
  Users,
  Send,
  Layers,
  BarChart3,
  FileSpreadsheet,
  FileText,
  ArrowUpRight,
  Sparkles,
  Filter,
  Calendar,
  FileCode,
} from 'lucide-react'
import Card from '../../../shared/components/ui/Card'
import Button from '../../../shared/components/ui/Button'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import Toast from '../../../components/Toast'
import ReportTable from '../components/reports/ReportTable'
import { exportReportPdf, exportReportExcel } from '../utils/reportExport'
import {
  getAdminAnalyticsSummary,
  getAdminCampaignAnalytics,
  getAdminPlatformAnalytics,
  getAdminAudienceAnalytics,
} from '../../../services/adminAnalyticsService'

const REPORT_TABS = [
  { id: 'engagement', label: 'Engagement Report', icon: TrendingUp },
  { id: 'campaign', label: 'Campaign Report', icon: Target },
  { id: 'audience', label: 'Audience Growth Report', icon: Users },
  { id: 'publishing', label: 'Publishing Report', icon: Send },
  { id: 'platform', label: 'Platform Comparison', icon: Layers },
]

function numericValue(value) {
  if (typeof value === 'number') return value
  const str = String(value ?? '').trim()
  const match = str.match(/^([\d.]+)\s*([kKmMbB])?$/)
  if (!match) return Number(str) || 0
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[match[2]?.toLowerCase()]
  return Number(match[1]) * (mult || 1)
}

function formatCompact(value) {
  const n = Number(value) || 0
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1000000) return `${sign}${((abs / 1000000).toFixed(1)).replace(/\.0$/, '')}M`
  if (abs >= 1000) return `${sign}${((abs / 1000).toFixed(1)).replace(/\.0$/, '')}K`
  return `${sign}${abs}`
}

function signedCompact(value) {
  const n = Number(value) || 0
  if (n === 0) return '0'
  return `${n > 0 ? '+' : '-'}${formatCompact(Math.abs(n))}`
}

function formatPct(value) {
  const n = Number(value) || 0
  const rounded = Math.round(n * 10) / 10
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return `${n >= 0 ? '+' : ''}${text}%`
}

function weeklyChartData(rows, key) {
  const last28 = (rows || []).slice(-28)
  const weeks = []
  for (let i = 0; i < 4; i += 1) {
    const chunk = last28.slice(i * 7, (i + 1) * 7)
    weeks.push({
      name: `Week ${i + 1}`,
      value: chunk.reduce((sum, row) => sum + (Number(row[key]) || 0), 0),
    })
  }
  return weeks
}

function FilterSelect({ label, icon: Icon, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <label className="label-base text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <Icon size={12} />
        <span>{label}</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base select-base text-xs py-1.5"
      >
        {options.map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value
          const optLabel = typeof opt === 'string' ? opt : opt.label
          return <option key={optValue} value={optValue}>{optLabel}</option>
        })}
      </select>
    </div>
  )
}

export default function Reports() {
  const [activeReportType, setActiveReportType] = useState('engagement')
  const [filters, setFilters] = useState({
    dateRange: '30d',
    platform: 'All',
    campaign: 'All',
    contentType: 'All',
  })
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        let data = null
        if (activeReportType === 'engagement') {
          const summary = await getAdminAnalyticsSummary()
          const k = summary.kpis
          const chart = weeklyChartData(summary.timeSeries, 'engagement')
          const engChange = Number(k.totalEngagement?.change) || 0
          const engPlatforms = summary.platformGrowth || []
          const totalLikes = engPlatforms.reduce((a, p) => a + (Number(p.likes) || 0), 0)
          const totalComments = engPlatforms.reduce((a, p) => a + (Number(p.comments) || 0), 0)
          const totalShares = engPlatforms.reduce((a, p) => a + (Number(p.shares) || 0), 0)
          const totalSaves = engPlatforms.reduce((a, p) => a + (Number(p.saves) || 0), 0)
          const totalClicks = engPlatforms.reduce((a, p) => a + (Number(p.clicks) || 0), 0)
          const totalImpressions = engPlatforms.reduce((a, p) => a + (Number(p.impressions) || 0), 0)
          const overallRate = totalImpressions
            ? ((totalLikes + totalComments + totalShares + totalSaves) / totalImpressions) * 100
            : 0
          const reportDate = new Date().toISOString().slice(0, 10)
          data = {
            title: 'Admin System Engagement Report',
            summary: {
              totalEngagement: k.totalEngagement?.value ?? '0',
              likes: k.totalLikes?.value ?? '0',
              comments: k.totalComments?.value ?? '0',
              shares: k.totalShares?.value ?? '0',
              saves: k.totalSaves?.value ?? '0',
              clicks: k.totalClicks?.value ?? '0',
              engagementRate: k.overallEngagementRate?.value ?? '0%',
              change: `${engChange >= 0 ? '+' : ''}${engChange.toFixed(1)}%`,
            },
            tableData: [
              {
                id: 'all',
                name: 'System Core Network',
                platform: 'All Platforms',
                date: reportDate,
                likes: totalLikes.toLocaleString(),
                comments: totalComments.toLocaleString(),
                shares: totalShares.toLocaleString(),
                saves: totalSaves.toLocaleString(),
                clicks: totalClicks.toLocaleString(),
                rate: `${overallRate.toFixed(1)}%`,
              },
              ...engPlatforms.map((p, i) => ({
                id: i,
                name: `${p.platform} Network`,
                platform: p.platform,
                date: reportDate,
                likes: Number(p.likes || 0).toLocaleString(),
                comments: Number(p.comments || 0).toLocaleString(),
                shares: Number(p.shares || 0).toLocaleString(),
                saves: Number(p.saves || 0).toLocaleString(),
                clicks: Number(p.clicks || 0).toLocaleString(),
                rate: `${Number(p.engagementRate || 0).toFixed(1)}%`,
              })),
            ],
            chartData: chart,
          }
        } else if (activeReportType === 'campaign') {
          const campaigns = await getAdminCampaignAnalytics()
          const active = campaigns.filter((c) => String(c.status).toLowerCase() === 'active').length
          data = {
            title: 'Admin System Campaign Report',
            summary: {
              totalCampaigns: campaigns.length,
              activeCampaigns: active,
              creatorsInvolved: campaigns.reduce((a, c) => a + (c.creatorCount || 0), 0),
              topRoi: campaigns.length ? `${Number(campaigns[0].roi).toFixed(2)}` : '0',
            },
            tableData: campaigns.map((c) => ({
              id: c.id,
              name: c.name,
              status: c.status,
              completion: `${c.completion}%`,
              reach: c.reach,
              impressions: c.impressions,
              engagement: c.engagement,
              clicks: c.clicks,
              roi: c.roi,
            })),
          chartData: campaigns.slice(0, 4).map((c) => ({
            name: c.name,
            value: numericValue(c.engagement),
          })),
          }
        } else if (activeReportType === 'audience') {
          const audience = await getAdminAudienceAnalytics()
          const platforms = audience.platforms || []
          const totalFollowers = platforms.reduce((a, p) => a + (Number(p.followers) || 0), 0)
          const totalNew = platforms.reduce((a, p) => a + (Number(p.newFollowers) || 0), 0)
          const totalLost = platforms.reduce((a, p) => a + (Number(p.lostFollowers) || 0), 0)
          const netGrowth = totalNew - totalLost
          const growthRate = totalFollowers ? (netGrowth / totalFollowers) * 100 : 0
          data = {
            title: 'Admin Audience Growth Report',
            summary: {
              totalFollowers: formatCompact(totalFollowers),
              newFollowers: signedCompact(totalNew),
              lostFollowers: signedCompact(totalLost),
              netGrowth: signedCompact(netGrowth),
              growthRate: formatPct(growthRate),
            },
            tableData: platforms.map((p, i) => ({
              id: i,
              platform: p.platform,
              followers: formatCompact(p.followers),
              newFollowers: signedCompact(p.newFollowers),
              lostFollowers: signedCompact(p.lostFollowers),
              netGrowth: signedCompact(p.netGrowth),
              growthRate: formatPct(p.growthRate),
            })),
            chartData: platforms.map((p) => ({
              name: p.platform,
              value: Number(p.followers) || 0,
            })),
          }
        } else if (activeReportType === 'publishing') {
          const summary = await getAdminAnalyticsSummary()
          const k = summary.kpis
          data = {
            title: 'Admin System Publishing Report',
            summary: {
              published: k.totalPublished?.value ?? '0',
              scheduled: k.totalScheduled?.value ?? '0',
              creators: k.totalCreators?.value ?? '0',
              reach: k.totalReach?.value ?? '0',
            },
            tableData: (summary.publishing || []).map((p, i) => ({
              id: i,
              platform: p.platform,
              published: p.published,
              scheduled: p.scheduled,
              failed: p.failed,
              successRate: p.successRate,
              topFormat: p.topFormat,
            })),
            chartData: (summary.publishing || []).map((p) => ({
              name: p.platform,
              value: p.published,
            })),
          }
        } else {
          const platforms = await getAdminPlatformAnalytics()
          const totalReach = platforms.reduce((a, p) => a + (Number(p.reach) || 0), 0)
          data = {
            title: 'Admin Platform Comparison Report',
            summary: {
              platforms: platforms.length,
              totalReach: totalReach.toLocaleString(),
              topPlatform: platforms[0]?.platform || '—',
              avgEngagement: platforms.length
                ? `${(platforms.reduce((a, p) => a + (Number(p.engagement) || 0), 0) / platforms.length).toFixed(1)}%`
                : '0%',
            },
            tableData: platforms.map((p) => ({
              id: p.platform,
              platform: p.platform,
              followers: p.followers,
              reach: p.reach,
              engagement: p.engagement,
              growth: p.growth,
            })),
            chartData: platforms.map((p) => ({
              name: p.platform,
              value: numericValue(p.reach),
            })),
          }
        }

        if (filters.platform && filters.platform !== 'All') {
          data.tableData = (data.tableData || []).filter(
            (row) => row.platform && row.platform.toLowerCase().includes(filters.platform.toLowerCase())
          )
        }
        if (!mounted) return
        setReportData(data)
      } catch (err) {
        if (!mounted) return
        setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to load report data.' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [activeReportType, filters.platform])

  const handleExportPdf = () => {
    if (reportData) exportReportPdf(activeReportType, filters, reportData)
  }

  const handleExportExcel = () => {
    if (reportData) exportReportExcel(activeReportType, filters, reportData)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* 1. Report Header */}
      <section
        aria-label="Report Header"
        className="card relative overflow-hidden bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {reportData?.title || 'System Reports & Export'}
              </h1>
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                <Sparkles size={12} />
                Admin Scope
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs md:text-sm font-medium">
              Generate, inspect, and export system-wide performance, creator metrics, campaign ROI, and platform reports.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 font-bold text-xs"
            >
              <FileText size={14} className="text-rose-500" />
              <span>Export PDF</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 font-bold text-xs"
            >
              <FileSpreadsheet size={14} />
              <span>Export Excel</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Report Type Tabs */}
      <div className="card p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border border-slate-200/80 dark:border-slate-800">
        {REPORT_TABS.map((tab) => {
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

      {/* 3. Report Filters */}
      <div className="card p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Filter size={15} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Report Filters
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterSelect
            label="Date Range"
            icon={Calendar}
            value={filters.dateRange}
            onChange={(v) => setFilters((f) => ({ ...f, dateRange: v }))}
            options={[
              { label: 'Last 7 Days', value: '7d' },
              { label: 'Last 30 Days', value: '30d' },
              { label: 'Last 90 Days', value: '90d' },
              { label: 'Year to Date (YTD)', value: 'ytd' },
              { label: 'All Time', value: 'all' },
            ]}
          />
          <FilterSelect
            label="Platform"
            icon={Layers}
            value={filters.platform}
            onChange={(v) => setFilters((f) => ({ ...f, platform: v }))}
            options={[
              { label: 'All Platforms', value: 'All' },
              { label: 'Instagram', value: 'Instagram' },
              { label: 'YouTube', value: 'YouTube' },
              { label: 'LinkedIn', value: 'LinkedIn' },
              { label: 'X (Twitter)', value: 'X' },
              { label: 'Pinterest', value: 'Pinterest' },
              { label: 'Facebook', value: 'Facebook' },
            ]}
          />
          <FilterSelect
            label="Campaign"
            icon={Target}
            value={filters.campaign}
            onChange={(v) => setFilters((f) => ({ ...f, campaign: v }))}
            options={[{ label: 'All Campaigns', value: 'All' }]}
          />
          <FilterSelect
            label="Content Type"
            icon={FileCode}
            value={filters.contentType}
            onChange={(v) => setFilters((f) => ({ ...f, contentType: v }))}
            options={[
              { label: 'All Formats', value: 'All' },
              { label: 'Carousel', value: 'Carousel' },
              { label: 'Video / Reel', value: 'Video / Reel' },
              { label: 'Article / Post', value: 'Article / Post' },
              { label: 'Thread', value: 'Thread' },
            ]}
          />
        </div>
      </div>

      {/* 4. Loading */}
      {loading ? (
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* 5. Executive KPI Summary */}
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

          {/* 6. Chart Metrics */}
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
                      {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 7. Report Table */}
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
            <ReportTable data={reportData?.tableData} />
          </Card>
        </>
      )}

    </div>
  )
}
