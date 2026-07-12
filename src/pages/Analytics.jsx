import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

// ── Chart Icon ────────────────────────────────────────────────────────────────
const ChartLargeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="w-12 h-12 text-primary-400 dark:text-primary-500" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

export default function Analytics() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Analytics summary">
        {[
          { label: 'Total Impressions', value: '284K', icon: '👁️', color: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' },
          { label: 'Engagement Rate', value: '5.2%', icon: '💬', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
          { label: 'Link Clicks', value: '3,847', icon: '🔗', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
          { label: 'New Followers', value: '+892', icon: '📈', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
        ].map((stat, idx) => (
          <Card key={idx} className="p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-card-lg dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </section>

      {/* Empty State — Charts Area */}
      <Card className="p-12 flex flex-col items-center justify-center text-center min-h-[340px]">
        <ChartLargeIcon />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-5">Performance Analytics</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          Track engagement, reach, and growth across all your connected social platforms.
          Detailed charts and reports will appear here once data is available.
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="primary" size="md">Generate Report</Button>
          <Button variant="secondary" size="md">Export Data</Button>
        </div>
      </Card>

      {/* Top Performing Posts */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Top Performing Posts</h3>
        <div className="space-y-3">
          {[
            { platform: 'Instagram', text: 'Product launch teaser video',      reach: '12.4K', engagement: '8.3%' },
            { platform: 'Twitter',   text: 'Weekly tips thread #SocialMedia',  reach: '8.7K',  engagement: '6.1%' },
            { platform: 'LinkedIn',  text: 'Company culture behind the scenes', reach: '5.2K',  engagement: '9.4%' },
            { platform: 'Facebook',  text: 'Customer success spotlight',       reach: '3.8K',  engagement: '4.7%' },
          ].map((post, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{post.text}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{post.platform}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{post.reach}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">{post.engagement}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
