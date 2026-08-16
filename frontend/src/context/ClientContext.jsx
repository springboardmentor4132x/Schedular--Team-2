import { createContext, useContext, useState, useCallback } from 'react'
import { MOCK_CLIENTS } from '../services/mockData'

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

export function ClientProvider({ children }) {
  function readApprovedClients() {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('orbit-approved-clients') ?? '[]')
    } catch {
      return []
    }
  }

  function readSavedClientId() {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(ACTIVE_CLIENT_KEY)
    return raw ? Number(raw) : null
  }

  const initialClient = (() => {
    const approved = readApprovedClients()
    const savedId = readSavedClientId()
    const availableClients = [...approved, ...MOCK_CLIENTS]
    const savedClient = savedId ? availableClients.find(client => client.id === savedId) : null
    if (savedClient) return savedClient
    if (approved && approved.length > 0) return approved[0]
    return MOCK_CLIENTS && MOCK_CLIENTS.length ? MOCK_CLIENTS[0] : null
  })()

  const [activeClient, setActiveClient] = useState(initialClient)

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
    <ClientContext.Provider value={{ activeClient, selectClient, clearClient }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  const ctx = useContext(ClientContext)
  if (!ctx) throw new Error('useClient must be used inside <ClientProvider>')
  return ctx
}
