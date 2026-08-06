import React from 'react'
import { X, CheckCircle2, TrendingUp } from 'lucide-react'

export default function PostCompareModal({ posts = [], onClose }) {
  if (!posts || posts.length === 0) return null

  const metrics = [
    { key: 'reach', label: 'Reach', format: (val) => val?.toLocaleString() },
    { key: 'impressions', label: 'Impressions', format: (val) => val?.toLocaleString() },
    { key: 'engagementRate', label: 'Engagement Rate', format: (val) => val },
    { key: 'likes', label: 'Likes', format: (val) => val?.toLocaleString() },
    { key: 'comments', label: 'Comments', format: (val) => val?.toLocaleString() },
    { key: 'shares', label: 'Shares', format: (val) => val?.toLocaleString() },
    { key: 'saves', label: 'Saves', format: (val) => val?.toLocaleString() },
    { key: 'clicks', label: 'Clicks', format: (val) => val?.toLocaleString() },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-default pb-4">
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
              Side-by-Side Post Comparison
            </h2>
            <p className="text-xs text-secondary mt-1">
              Comparing performance metrics for {posts.length} selected posts.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-xs text-secondary hover:text-primary">
            <X size={18} />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="overflow-x-auto">
          <table className="table-inner border border-default rounded-xl">
            <thead className="table-head">
              <tr>
                <th className="table-th w-40">Metric</th>
                {posts.map((post) => (
                  <th key={post.id} className="table-th text-center min-w-[200px]">
                    <div className="space-y-1">
                      <span className="text-lg">{post.thumbnail}</span>
                      <p className="text-xs font-bold text-primary truncate max-w-[180px] mx-auto">{post.caption}</p>
                      <span className="badge badge-primary">{post.platform}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.key} className="table-row">
                  <td className="table-td font-bold text-primary">{m.label}</td>
                  {posts.map((post) => (
                    <td key={post.id} className="table-td text-center font-semibold text-primary">
                      {m.format(post[m.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-4 border-t border-default">
          <button onClick={onClose} className="btn btn-primary btn-md">
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  )
}
