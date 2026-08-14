import React from 'react'
import Modal from '../../../shared/components/ui/Modal'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import Avatar from '../../../shared/components/ui/Avatar'
import Button from '../../../shared/components/Button'
import { Users, Building2, Target, Send, Sparkles } from 'lucide-react'

export default function TeamDetailsModal({ isOpen, onClose, team }) {
  if (!team) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Marketing Team Details" size="lg">
      <div className="space-y-6">
        {/* Team Banner & Lead Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <Avatar src={team.avatar} alt={team.name} size="lg" />
          <div className="text-center sm:text-left space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                {team.name}
              </h3>
              <StatusBadge status={team.status} dot />
            </div>
            <p className="text-xs text-slate-500 font-medium">{team.description}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                {team.type} Team
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Lead: <strong className="text-slate-800 dark:text-slate-200">{team.lead?.name || 'Unassigned'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Team Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Roster</span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">{team.members?.length || 0} Members</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accounts Managed</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">{team.businessAccounts?.length || 0} Accounts</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Campaigns</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">{team.activeCampaignsCount || 0} Active</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Engagement Rate</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{team.engagementRate || '8.4%'}</span>
          </div>
        </div>

        {/* Members Roster */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Users size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>Team Members ({team.members?.length || 0})</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {team.members && team.members.length > 0 ? (
              team.members.map((member) => (
                <div
                  key={member.id}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3"
                >
                  <Avatar src={member.avatar} alt={member.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{member.role} • {member.email}</p>
                  </div>
                  <StatusBadge status={member.status} dot />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No members assigned to this team.</p>
            )}
          </div>
        </div>

        {/* Assigned Business Accounts */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Building2 size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>Assigned Business Accounts ({team.businessAccounts?.length || 0})</span>
          </h4>

          <div className="flex flex-wrap gap-2">
            {team.businessAccounts && team.businessAccounts.length > 0 ? (
              team.businessAccounts.map((acc) => (
                <span
                  key={acc.id || acc.name}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                >
                  <span>{acc.name}</span>
                  <span className="text-[10px] font-normal text-slate-400">({acc.type})</span>
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400">No business accounts assigned.</p>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
