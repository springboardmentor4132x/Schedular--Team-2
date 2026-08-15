import Modal from '../../../shared/components/ui/Modal'

export default function AdminReportModal({ isOpen, onClose, summary, topPosts }) {
  if (!summary) return null

  const k = summary.kpis || {}
  const reportDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  const platformRows = Object.values(
    (summary.platformGrowth || []).reduce((acc, p) => {
      const key = p.platform
      acc[key] = acc[key] || { platform: key, followers: 0, reach: 0, engagement: 0 }
      acc[key].followers += Number(p.followers) || 0
      acc[key].reach += Number(p.reach) || 0
      acc[key].engagement += Number(p.engagement) || 0
      return acc
    }, {})
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Performance Report" size="xl" className="max-w-6xl">
      <div className="report-print-area space-y-4">
        {/* Report header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">OrbitSocial — Platform Analytics Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Generated on {reportDate}</p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 rounded-full self-start sm:self-center">
            Admin View
          </span>
        </div>

        {/* KPI summary */}
        <section>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">Key Performance Indicators</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
            {Object.entries(k).map(([key, kpi]) => (
              <div key={key} className="px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-snug">{kpi.label}</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{kpi.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Platform breakdown + Top posts side by side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <section className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">Platform Breakdown</h4>
            {platformRows.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No connected platforms yet.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-700/60">
                <table className="w-full text-xs">
                  <thead className="text-[10px] text-slate-400 dark:text-slate-500 uppercase bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="py-1.5 px-3 text-left font-semibold">Platform</th>
                      <th className="py-1.5 px-3 text-right font-semibold">Followers</th>
                      <th className="py-1.5 px-3 text-right font-semibold">Reach</th>
                      <th className="py-1.5 px-3 text-right font-semibold">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {platformRows.map((p) => (
                      <tr key={p.platform}>
                        <td className="py-1.5 px-3 font-semibold text-slate-800 dark:text-slate-100 capitalize">{p.platform}</td>
                        <td className="py-1.5 px-3 text-right text-slate-600 dark:text-slate-300">{Number(p.followers).toLocaleString()}</td>
                        <td className="py-1.5 px-3 text-right text-slate-600 dark:text-slate-300">{Number(p.reach).toLocaleString()}</td>
                        <td className="py-1.5 px-3 text-right text-slate-600 dark:text-slate-300">{Number(p.engagement).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">Top Performing Posts</h4>
            {!topPosts || topPosts.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No published post analytics yet.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-700/60">
                <table className="w-full text-xs">
                  <thead className="text-[10px] text-slate-400 dark:text-slate-500 uppercase bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="py-1.5 px-3 text-left font-semibold">Post</th>
                      <th className="py-1.5 px-3 text-left font-semibold">Platform</th>
                      <th className="py-1.5 px-3 text-right font-semibold">Reach</th>
                      <th className="py-1.5 px-3 text-right font-semibold">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {topPosts.map((post) => (
                      <tr key={post.id}>
                        <td className="py-1.5 px-3 font-medium text-slate-800 dark:text-slate-100 break-words">{post.text}</td>
                        <td className="py-1.5 px-3 text-slate-500 dark:text-slate-400 capitalize whitespace-nowrap">{post.platform}</td>
                        <td className="py-1.5 px-3 text-right text-slate-600 dark:text-slate-300 whitespace-nowrap">{post.reach}</td>
                        <td className="py-1.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">{post.engagement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </Modal>
  )
}
