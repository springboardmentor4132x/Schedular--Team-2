import { useMemo } from 'react'
import { Building2, ChevronDown, Megaphone, Orbit, Sparkles } from 'lucide-react'
import { useClient } from '../../context/ClientContext'
import { MOCK_CLIENTS, MOCK_CLIENT_CAMPAIGNS, MOCK_MARKETING_TEAMS } from '../../services/mockData'

function readApprovedClients() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('orbit-approved-clients') ?? '[]')
  } catch {
    return []
  }
}

export default function MarketingClientSelector() {
  const { activeClient, selectClient } = useClient()

  const clients = useMemo(() => {
    const approved = readApprovedClients()
    return approved.length > 0 ? approved : MOCK_CLIENTS
  }, [])
  const assignedTeam = MOCK_MARKETING_TEAMS.find(team => team.isAssigned) ?? MOCK_MARKETING_TEAMS[0]

  const activeSummary = activeClient ?? null
  const activeCampaigns = (activeClient ? (MOCK_CLIENT_CAMPAIGNS[activeClient.id] ?? []) : []).length

  return (
    <div className="card p-4 mb-5 border-l-4" style={{ borderColor: 'var(--primary)', background: 'linear-gradient(135deg, rgba(30,58,138,.06), rgba(79,70,229,.05))' }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: activeSummary?.logoColor || '#1E3A8A' }}>
            {activeSummary?.logo || 'CL'}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold truncate" style={{ color: 'var(--text)' }}>
              {activeSummary?.name || 'Select a client'}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate mt-1">
              {activeSummary ? `${activeSummary.industry || 'Industry'} · ${activeSummary.location || 'Location'}` : 'Choose a client to view the workspace details.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-[220px]">
            <select
              value={activeSummary?.id ?? ''}
              onChange={e => {
                const selected = clients.find(client => client.id === Number(e.target.value))
                if (selected) selectClient(selected)
              }}
              className="w-full h-11 pl-3 pr-10 text-sm rounded-[var(--r-md)] border outline-none appearance-none"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <option value="" disabled>{activeSummary ? 'Select a client' : 'Choose a client'}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs w-full">
            <div className="rounded-[var(--r-md)] px-3 py-2" style={{ background: 'var(--card)' }}>
              <div className="flex items-center gap-1 text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}><Building2 size={10} /> Team</div>
              <p className="font-semibold mt-1 truncate" style={{ color: 'var(--text)' }}>{assignedTeam?.name || 'Team'}</p>
            </div>
            <div className="rounded-[var(--r-md)] px-3 py-2" style={{ background: 'var(--card)' }}>
              <div className="flex items-center gap-1 text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}><Orbit size={10} /> Platforms</div>
              <p className="font-semibold mt-1" style={{ color: 'var(--text)' }}>{(activeSummary?.connectedPlatforms || []).length}</p>
            </div>
            <div className="rounded-[var(--r-md)] px-3 py-2" style={{ background: 'var(--card)' }}>
              <div className="flex items-center gap-1 text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}><Megaphone size={10} /> Campaigns</div>
              <p className="font-semibold mt-1" style={{ color: 'var(--text)' }}>{activeCampaigns}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <span className="px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-alt)' }}>Industry: {activeSummary?.industry || '—'}</span>
        <span className="px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-alt)' }}>Connected platforms: {(activeSummary?.connectedPlatforms || []).join(', ') || '—'}</span>
        <span className="px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-alt)' }}>Assigned team: {assignedTeam?.name || '—'}</span>
        <span className="px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-alt)' }}>Active campaigns: {activeCampaigns}</span>
      </div>
    </div>
  )
}
