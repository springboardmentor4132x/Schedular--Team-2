import React, { useState, useEffect } from 'react'
import Modal from '../../../shared/components/ui/Modal'
import Button from '../../../shared/components/Button'
import Avatar from '../../../shared/components/ui/Avatar'
import Input from '../../../shared/components/Input'
import { Plus, Trash2, Users } from 'lucide-react'

const availableUsersPool = [
  { name: 'Lucas Scott', role: 'Social Strategist', email: 'lucas@orbitsocial.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Mia Hemsworth', role: 'Content Creator', email: 'mia@orbitsocial.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { name: 'Ethan Hunt', role: 'Campaign Manager', email: 'ethan@orbitsocial.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Zoe Kravitz', role: 'Copywriter', email: 'zoe@orbitsocial.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
]

export default function ManageMembersModal({ isOpen, onClose, onAddMember, onRemoveMember, team }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPoolUser, setSelectedPoolUser] = useState(availableUsersPool[0])

  if (!team) return null

  const handleAdd = () => {
    onAddMember(team.id, selectedPoolUser)
    setShowAddForm(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Team Members — ${team.name}`} size="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Active Roster ({team.members?.length || 0} Members)
          </span>
          {!showAddForm && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 text-xs"
            >
              <Plus size={13} />
              <span>+ Add Member</span>
            </Button>
          )}
        </div>

        {/* Add Member Dropdown Form */}
        {showAddForm && (
          <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Select User to Add to Team
            </span>

            <select
              value={selectedPoolUser.name}
              onChange={(e) => {
                const found = availableUsersPool.find((u) => u.name === e.target.value)
                if (found) setSelectedPoolUser(found)
              }}
              className="w-full input-base select-base text-xs"
            >
              {availableUsersPool.map((u) => (
                <option key={u.email} value={u.name}>
                  {u.name} ({u.role} - {u.email})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="xs" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="xs" onClick={handleAdd}>
                Add to Roster
              </Button>
            </div>
          </div>
        )}

        {/* Current Members List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
          {team.members && team.members.length > 0 ? (
            team.members.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={member.avatar} alt={member.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {member.role} • {member.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveMember(team.id, member.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove Member"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No members in this team.</p>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}
