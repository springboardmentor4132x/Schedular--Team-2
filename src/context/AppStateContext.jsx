import { createContext, useContext, useState, useCallback } from 'react'
import {
  MOCK_CAMPAIGNS,
  MOCK_CLIENT_CAMPAIGNS,
  MOCK_SCHEDULED_POSTS,
  MOCK_CLIENT_POSTS,
  MOCK_PUBLISHED_POSTS,
} from '../services/mockData'

/**
 * AppStateContext — Shared application state across Business User and Marketing Team.
 *
 * This is the single source of truth for:
 *   - campaigns        (Business creates → Marketing sees in workspace)
 *   - scheduledPosts   (Marketing schedules → appears in calendar + queue)
 *   - queueItems       (Marketing queue → status flows Scheduled → Published)
 *   - publishedPosts   (Published posts → Analytics + Reports update)
 *
 * Workflow:
 *   Business User creates campaign
 *     → campaign appears in MOCK_CLIENT_CAMPAIGNS[clientId] via shared state
 *   Marketing Team schedules post
 *     → post appears in Publishing Calendar + Publishing Queue
 *   Marketing Team publishes post (Publish Now)
 *     → status updates to 'published' in queue + publishedPosts grows
 *   Analytics + Reports read from shared counts
 */

const AppStateContext = createContext(null)

// Merge all client campaigns into a flat list keyed by clientId
const initialClientCampaigns = { ...MOCK_CLIENT_CAMPAIGNS }

// Build initial queue from all scheduled posts
const buildInitialQueue = () => {
  const items = []
  Object.entries(MOCK_CLIENT_POSTS).forEach(([clientId, posts]) => {
    posts.scheduled.forEach(p => {
      items.push({ ...p, clientId: Number(clientId), status: p.status || 'scheduled' })
    })
    posts.published.forEach(p => {
      items.push({ ...p, clientId: Number(clientId), status: 'published' })
    })
  })
  // Add shared scheduled posts
  MOCK_SCHEDULED_POSTS.forEach(p => {
    items.push({ ...p, clientId: 0, status: p.status || 'scheduled' })
  })
  return items
}

export function AppStateProvider({ children }) {
  // ── Business campaigns (shared with Marketing) ────────────────
  const [businessCampaigns, setBusinessCampaigns] = useState([...MOCK_CAMPAIGNS])

  // ── Per-client campaigns (Marketing manages) ─────────────────
  const [clientCampaigns, setClientCampaigns] = useState(initialClientCampaigns)

  // ── Publishing queue (shared) ─────────────────────────────────
  const [queueItems, setQueueItems] = useState(buildInitialQueue)

  // ── Published posts (grows as queue items get published) ──────
  const [publishedPosts, setPublishedPosts] = useState([...MOCK_PUBLISHED_POSTS])

  // ─────────────────────────────────────────────────────────────
  // BUSINESS CAMPAIGNS
  // ─────────────────────────────────────────────────────────────
  const createBusinessCampaign = useCallback(form => {
    const newC = {
      ...form,
      id: Date.now(),
      budget: Number(form.budget) || 0,
      spent: 0,
      progress: 0,
      posts: 0,
      reach: 0,
    }
    setBusinessCampaigns(prev => [newC, ...prev])
    return newC
  }, [])

  const updateBusinessCampaign = useCallback((id, form) => {
    setBusinessCampaigns(prev =>
      prev.map(c => c.id === id ? { ...c, ...form, budget: Number(form.budget) || c.budget } : c)
    )
  }, [])

  const deleteBusinessCampaign = useCallback(id => {
    setBusinessCampaigns(prev => prev.filter(c => c.id !== id))
  }, [])

  // ─────────────────────────────────────────────────────────────
  // CLIENT CAMPAIGNS (Marketing Team manages per-client)
  // ─────────────────────────────────────────────────────────────
  const getClientCampaigns = useCallback(clientId => {
    return clientCampaigns[clientId] ?? []
  }, [clientCampaigns])

  const createClientCampaign = useCallback((clientId, form) => {
    const newC = {
      ...form,
      id: Date.now(),
      budget: Number(form.budget) || 0,
      spent: 0,
      progress: 0,
      posts: 0,
      reach: 0,
    }
    setClientCampaigns(prev => ({
      ...prev,
      [clientId]: [newC, ...(prev[clientId] ?? [])],
    }))
    return newC
  }, [])

  const updateClientCampaign = useCallback((clientId, id, form) => {
    setClientCampaigns(prev => ({
      ...prev,
      [clientId]: (prev[clientId] ?? []).map(c =>
        c.id === id ? { ...c, ...form, budget: Number(form.budget) || c.budget } : c
      ),
    }))
  }, [])

  const deleteClientCampaign = useCallback((clientId, id) => {
    setClientCampaigns(prev => ({
      ...prev,
      [clientId]: (prev[clientId] ?? []).filter(c => c.id !== id),
    }))
  }, [])

  // ─────────────────────────────────────────────────────────────
  // PUBLISHING QUEUE
  // ─────────────────────────────────────────────────────────────
  const getQueueItems = useCallback((clientId = null) => {
    if (clientId === null) return queueItems
    return queueItems.filter(q => q.clientId === clientId)
  }, [queueItems])

  const addToQueue = useCallback((post, clientId = 0) => {
    const item = {
      ...post,
      id: post.id ?? `q-${Date.now()}`,
      clientId,
      status: 'scheduled',
      queuedAt: new Date().toISOString(),
    }
    setQueueItems(prev => {
      // avoid duplicates
      if (prev.find(q => q.id === item.id)) return prev
      return [item, ...prev]
    })
    return item
  }, [])

  const updateQueueStatus = useCallback((id, status) => {
    setQueueItems(prev =>
      prev.map(q => q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q)
    )
    // If publishing now → also add to published posts
    if (status === 'published') {
      setQueueItems(prev => {
        const item = prev.find(q => q.id === id)
        if (item) {
          const pub = {
            ...item,
            publishedAt: new Date().toISOString(),
            reach: Math.floor(Math.random() * 5000) + 500,
            engagement: Math.floor(Math.random() * 500) + 50,
            likes: Math.floor(Math.random() * 300) + 30,
            shares: Math.floor(Math.random() * 80) + 5,
            comments: Math.floor(Math.random() * 60) + 0,
            clicks: Math.floor(Math.random() * 120) + 0,
          }
          setPublishedPosts(pp => [pub, ...pp])
        }
        return prev
      })
    }
  }, [])

  const removeFromQueue = useCallback(id => {
    setQueueItems(prev => prev.filter(q => q.id !== id))
  }, [])

  const retryQueueItem = useCallback(id => {
    setQueueItems(prev =>
      prev.map(q => q.id === id ? { ...q, status: 'scheduled', error: null } : q)
    )
  }, [])

  // Schedule a new post — adds to queue and returns the item
  const schedulePost = useCallback((postData, clientId = 0) => {
    const item = {
      ...postData,
      id: postData.id ?? `s-${Date.now()}`,
      clientId,
      status: 'scheduled',
      scheduledAt: postData.scheduledAt ?? `${postData.date ?? new Date().toISOString().split('T')[0]}T${postData.time ?? '09:00'}`,
      queuedAt: new Date().toISOString(),
    }
    setQueueItems(prev => [item, ...prev])
    return item
  }, [])

  // ─────────────────────────────────────────────────────────────
  // DERIVED COUNTS (for dashboards, analytics, reports)
  // ─────────────────────────────────────────────────────────────
  const getStats = useCallback((clientId = null) => {
    const items = clientId !== null ? queueItems.filter(q => q.clientId === clientId) : queueItems
    return {
      scheduled:  items.filter(q => q.status === 'scheduled').length,
      pending:    items.filter(q => q.status === 'pending_approval').length,
      published:  publishedPosts.filter(p => clientId === null || p.clientId === clientId).length,
      failed:     items.filter(q => q.status === 'failed').length,
      cancelled:  items.filter(q => q.status === 'cancelled').length,
      totalQueue: items.length,
    }
  }, [queueItems, publishedPosts])

  const value = {
    // Business campaigns
    businessCampaigns,
    createBusinessCampaign,
    updateBusinessCampaign,
    deleteBusinessCampaign,
    // Client campaigns
    clientCampaigns,
    getClientCampaigns,
    createClientCampaign,
    updateClientCampaign,
    deleteClientCampaign,
    // Queue
    queueItems,
    getQueueItems,
    addToQueue,
    schedulePost,
    updateQueueStatus,
    removeFromQueue,
    retryQueueItem,
    // Published
    publishedPosts,
    // Stats
    getStats,
  }

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>')
  return ctx
}
