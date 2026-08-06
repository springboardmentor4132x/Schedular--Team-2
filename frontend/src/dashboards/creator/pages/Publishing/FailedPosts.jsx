import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFailedPosts, retryPublishing } from '../../../../services/publishingService'
import { RefreshCw, Trash2, FileText, AlertTriangle } from 'lucide-react'

export default function FailedPosts() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    getFailedPosts().then((d) => { setPosts(d); setLoading(false) })
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleRetry = async (id) => {
    setRetrying(id)
    const res = await retryPublishing(id)
    setRetrying(null)
    if (res.success) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
      showToast(res.message)
    }
  }

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    showToast(`Post ${id} has been deleted.`)
  }

  const reasonIcon = {
    'Authentication Error': '🔐',
    'Server Error': '🖥️',
    'Rate Limit Exceeded': '⏱️',
    'Invalid Media': '🖼️',
    'Content Policy Violation': '🚫',
    'Network Timeout': '🌐',
    'Duplicate Content': '📋',
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-surface rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-5 w-32 bg-surface rounded" />
              <div className="h-4 w-full bg-surface rounded" />
              <div className="h-4 w-3/4 bg-surface rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Failed Posts</h1>
          <p className="text-sm text-secondary mt-1">{posts.length} failed publishing attempts</p>
        </div>
        {posts.length > 0 && (
          <button
            onClick={() => posts.forEach((p) => handleRetry(p.id))}
            className="btn btn-primary btn-md"
          >
            <RefreshCw size={16} /> Retry All
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="card flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h3 className="text-lg font-bold text-primary">All Clear!</h3>
          <p className="text-sm text-secondary mt-2 max-w-md">No failed posts at the moment. All your publishing attempts are successful.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="card space-y-4 border border-rose-200/40 dark:border-rose-900/30">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-lg flex-shrink-0">
                    {reasonIcon[post.reason] || '⚠️'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary">{post.platform}</h3>
                    <p className="text-xs text-secondary">{post.campaign}</p>
                  </div>
                </div>
                <span className="badge badge-failed">{post.reason}</span>
              </div>

              {/* Content Preview */}
              <p className="text-sm text-primary leading-relaxed line-clamp-2">{post.content}</p>

              {/* Error Message */}
              <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">{post.errorMessage}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-secondary">
                <span>Failed: {post.failedAt}</span>
                <span>Retries: {post.retryCount}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-default">
                <button
                  onClick={() => handleRetry(post.id)}
                  disabled={retrying === post.id}
                  className="btn btn-primary btn-sm flex-1"
                >
                  <RefreshCw size={14} className={retrying === post.id ? 'animate-spin' : ''} />
                  {retrying === post.id ? 'Retrying...' : 'Retry'}
                </button>
                <button onClick={() => handleDelete(post.id)} className="btn btn-outline btn-sm">
                  <Trash2 size={14} />
                </button>
                <button onClick={() => navigate('/dashboard/creator/publishing/logs')} className="btn btn-ghost btn-sm">
                  <FileText size={14} /> Logs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 text-sm font-semibold animate-slide-in">
          <span>{toast}</span>
          <button onClick={() => setToast('')} className="text-xs font-bold opacity-80 hover:opacity-100 ml-2">✕</button>
        </div>
      )}
    </div>
  )
}
