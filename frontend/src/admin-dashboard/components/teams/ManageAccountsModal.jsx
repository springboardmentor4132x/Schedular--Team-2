import React, { useState } from 'react'
import Modal from '../../../shared/components/ui/Modal'
import Button from '../../../shared/components/Button'
import { Building2, Plus, Trash2, CheckCircle2 } from 'lucide-react'

const availableAccountsPool = [
  { id: 'b-pool-1', name: 'Starlight Media', type: 'Agency', status: 'Active' },
  { id: 'b-pool-2', name: 'CyberPulse Tech', type: 'Brand', status: 'Active' },
  { id: 'b-pool-3', name: 'Vanguard Ventures', type: 'Startup', status: 'Active' },
  { id: 'b-pool-4', name: 'Global Nexus Group', type: 'Enterprise', status: 'Active' }
]

export default function ManageAccountsModal({ isOpen, onClose, onAssignAccount, onRemoveAccount, team }) {
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedPoolAccount, setSelectedPoolAccount] = useState(availableAccountsPool[0])

  if (!team) return null

  const handleAssign = () => {
    onAssignAccount(team.id, selectedPoolAccount)
    setShowAssignForm(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Business Accounts — ${team.name}`} size="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Assigned Business Accounts ({team.businessAccounts?.length || 0})
          </span>
          {!showAssignForm && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowAssignForm(true)}
              className="flex items-center gap-1 text-xs"
            >
              <Plus size={13} />
              <span>+ Assign Account</span>
            </Button>
          )}
        </div>

        {/* Assign Account Form */}
        {showAssignForm && (
          <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Select Business Account to Assign
            </span>

            <select
              value={selectedPoolAccount.name}
              onChange={(e) => {
                const found = availableAccountsPool.find((a) => a.name === e.target.value)
                if (found) setSelectedPoolAccount(found)
              }}
              className="w-full input-base select-base text-xs"
            >
              {availableAccountsPool.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name} ({a.type} - {a.status})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="xs" onClick={() => setShowAssignForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="xs" onClick={handleAssign}>
                Assign Account
              </Button>
            </div>
          </div>
        )}

        {/* Assigned Accounts List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
          {team.businessAccounts && team.businessAccounts.length > 0 ? (
            team.businessAccounts.map((acc) => (
              <div
                key={acc.id || acc.name}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{acc.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{acc.type} Account</p>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveAccount(team.id, acc.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove Account"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No business accounts assigned.</p>
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
