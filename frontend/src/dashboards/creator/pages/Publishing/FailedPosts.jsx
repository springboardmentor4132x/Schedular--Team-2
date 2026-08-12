import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { getFailedPosts, retryPublishing } from '../../../../services/publishingService'
import { deletePost } from '../../../../services/postService'
import { RefreshCw, Trash2, FileText, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

export default function FailedPosts() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let cancelled = false
    getFailedPosts()
      .then((data) => {
        if (!cancelled) {
          setPosts(data)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPosts([])
          setError(err?.response?.data?.detail || 'Failed to load failed posts.')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleRetry = async (id) => {
    if (retrying) return
    setRetrying(id)
    try {
      const res = await retryPublishing(id)
      if (res && res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
        showToast(res.message || 'Post re-queued for publishing.')
      } else {
        showToast(res?.message || 'Retry failed.', 'error')
      }
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Retry failed.', 'error')
    } finally {
      setRetrying(null)
    }
  }

  const handleRetryAll = async () => {
    if (retrying) return
    for (const p of [...posts]) {
      await handleRetry(p.id)
    }
  }

  const confirmDeletePost = async () => {
    if (!confirmDelete || deleting) return
    setDeleting(confirmDelete.id)
    try {
      await deletePost(confirmDelete.id)
      setPosts((prev) => prev.filter((p) => p.id !== confirmDelete.id))
      showToast('Post deleted.')
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to delete post.', 'error')
    } finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
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
            onClick={handleRetryAll}
            disabled={retrying !== null}
            className="btn btn-primary btn-md"
          >
            <RefreshCw size={16} className={retrying !== null ? 'animate-spin' : ''} />
            {retrying !== null ? 'Retrying...' : 'Retry All'}
          </button>
        )}
      </div>

      {error && (
        <div className="card p-4 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm font-semibold">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {!error && posts.length === 0 ? (
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
            <div key={post.id} className="card p-4 sm:p-5 space-y-5 border border-rose-200/40 dark:border-rose-900/30">
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
              <div className="p-4 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30">
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
              <div className="flex items-center gap-2 pt-4 border-t border-default">
                <button
                  onClick={() => handleRetry(post.id)}
                  disabled={retrying === post.id}
                  className="btn btn-primary btn-sm flex-1"
                >
                  <RefreshCw size={14} className={retrying === post.id ? 'animate-spin' : ''} />
                  {retrying === post.id ? 'Retrying...' : 'Retry'}
                </button>
                <button onClick={() => setConfirmDelete(post)} className="btn btn-outline btn-sm" title="Delete post">
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

      {/* Top-center toast */}
      {createPortal(
        toast && (
          <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white"
            style={{ background: toast.type === 'error' ? 'linear-gradient(135deg,#DC2626,#EF4444)' : 'linear-gradient(135deg,#059669,#22C55E)' }}
          >
            {toast.type === 'error' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            <span>{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-xs font-bold opacity-80 hover:opacity-100">✕</button>
          </div>
        ),
        document.body
      )}

      {/* Delete confirmation modal */}
      {createPortal(
        confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl my-auto bg-card border border-default">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-primary">Delete this post?</h3>
                <button onClick={() => setConfirmDelete(null)} className="p-1.5 rounded-lg hover:bg-hover text-secondary">
                  <XCircle size={16} />
                </button>
              </div>
              <p className="text-xs leading-relaxed text-secondary">
                "{confirmDelete.campaign}" will be permanently deleted from your content library. This cannot be undone.
              </p>
              <div className="flex gap-3 pt-5">
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={deleting === confirmDelete.id}
                  className="flex-1 h-10 rounded-xl border border-default text-sm font-semibold text-primary hover:bg-hover"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePost}
                  disabled={deleting === confirmDelete.id}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold text-white hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg,#DC2626,#EF4444)' }}
                >
                  {deleting === confirmDelete.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}
    </div>
  )
}
