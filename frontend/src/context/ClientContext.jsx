/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { marketingService } from '../services/marketingService'
import { useAuth } from './AuthContext'

const ACTIVE_CLIENT_KEY = 'orbit-active-client-id'

/**
 * ClientContext
 * Holds the currently selected client for Marketing Team workspace pages.
 * Marketing team users pick a client from the Clients page, which sets
 * the active client here. All workspace pages read from this context.
 *
 * Client shape:
 *   { id, name, logo, logoColor, industry, connectedPlatforms, ... }
 */

const ClientContext = createContext(null)

function readSavedClientId() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(ACTIVE_CLIENT_KEY)
  return raw ? Number(raw) : null
}

export function ClientProvider({ children }) {
  const { user } = useAuth()
  const isMarketing = user?.role === 'marketing'
  const [activeClient, setActiveClient] = useState(null)
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)

  const refreshClients = useCallback(async () => {
    setLoadingClients(true)
    try {
      const result = await marketingService.clients()
      setClients(result)
      const savedId = readSavedClientId()
      setActiveClient(current => current?.id === savedId ? current : result.find(client => client.id === savedId) ?? current)
    } finally { setLoadingClients(false) }
  }, [])

  useEffect(() => {
    if (!isMarketing) return
    let cancelled = false
    marketingService.clients()
      .then(result => {
        if (cancelled) return
        setClients(result)
        const savedId = readSavedClientId()
        setActiveClient(current => current?.id === savedId ? current : result.find(client => client.id === savedId) ?? current)
      })
      .catch(() => { if (!cancelled) setLoadingClients(false) })
      .finally(() => { if (!cancelled) setLoadingClients(false) })
    return () => { cancelled = true }
  }, [isMarketing])

  const selectClient = useCallback(client => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_CLIENT_KEY, String(client.id))
    }
    setActiveClient(client)
  }, [])

  const clearClient = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_CLIENT_KEY)
    }
    setActiveClient(null)
  }, [])

  return (
    <ClientContext.Provider value={{ activeClient, clients, loadingClients, refreshClients, selectClient, clearClient }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  const ctx = useContext(ClientContext)
  if (!ctx) throw new Error('useClient must be used inside <ClientProvider>')
  return ctx
}
