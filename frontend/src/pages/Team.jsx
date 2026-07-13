import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { workspaceService, authService } from '../services/api'
import Modal from '../components/ui/Modal'

// ── Team Icon ─────────────────────────────────────────────────────────────────
const TeamLargeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="w-12 h-12 text-primary-400 dark:text-primary-500" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export default function Team() {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')

  useEffect(() => {
    loadWorkspaces()
  }, [])

  const loadWorkspaces = async () => {
    try {
      const data = await workspaceService.getWorkspaces()
      setWorkspaces(data)
    } catch (e) {
      console.error('Failed to load workspaces', e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName) return
    try {
      await workspaceService.createWorkspace({ name: newWorkspaceName })
      setCreateModalOpen(false)
      setNewWorkspaceName('')
      loadWorkspaces()
    } catch (e) {
      console.error('Failed to create workspace', e)
      alert("Failed to create workspace. Try again.")
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading workspaces...</div>
  }

  const activeWorkspace = workspaces[0] // Simple: just take the first one for now
  const members = activeWorkspace?.members || []

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Team summary">
        {[
          { label: 'Team Members', value: members.length.toString(), icon: '👥', color: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' },
          { label: 'Active Now', value: members.length.toString(), icon: '🟢', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
          { label: 'Pending Invites', value: '0', icon: '✉️', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
          { label: 'Roles Assigned', value: members.length.toString(), icon: '🔑', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
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

      {workspaces.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center min-h-[240px]">
          <TeamLargeIcon />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-5">Team Workspaces</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
            Collaborate with your team by creating shared workspaces. Assign roles, manage permissions,
            and streamline your social media workflow.
          </p>
          <Button variant="primary" size="md" className="mt-6" onClick={() => setCreateModalOpen(true)}>Create Workspace</Button>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{activeWorkspace.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Team Members</p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={() => alert('Invite member feature coming soon!')}>Invite Member</Button>
              <Button variant="secondary" size="sm" onClick={() => setCreateModalOpen(true)}>New Workspace</Button>
            </div>
          </div>
          <div className="space-y-3">
            {members.map((m, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {m.user?.first_name ? m.user.first_name[0] : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {m.user?.first_name} {m.user?.last_name}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{m.user?.email}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                  {m.role}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Workspace Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Workspace" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Workspace Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={newWorkspaceName}
              onChange={e => setNewWorkspaceName(e.target.value)}
              placeholder="e.g. Marketing Team"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateWorkspace}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
