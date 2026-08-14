import React from 'react'
import Modal from '../../../shared/components/ui/Modal'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import Avatar from '../../../shared/components/ui/Avatar'
import Card from '../../../shared/components/ui/Card'
import Button from '../../../shared/components/Button'
import { Calendar, Clock, Layers, Send, Target, TrendingUp, ShieldCheck, Mail } from 'lucide-react'

export default function UserDetailsModal({ isOpen, onClose, user }) {
  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile Details" size="md">
      <div className="space-y-6">
        {/* User Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <Avatar src={user.avatar} alt={user.name} size="lg" />
          <div className="text-center sm:text-left space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                {user.name}
              </h3>
              <StatusBadge status={user.status} dot />
            </div>
            <p className="text-xs text-slate-500 font-semibold">{user.username} • {user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                {user.role} Role
              </span>
            </div>
          </div>
        </div>

        {/* User Core Meta Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Joined Date</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 block">{user.joinedDate}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Active</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 block">{user.lastActive}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Posts</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">{user.totalPosts}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Engagement</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{user.engagementRate}</span>
          </div>
        </div>

        {/* Connected Social Platforms */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>Connected Social Platforms</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {user.connectedPlatforms && user.connectedPlatforms.length > 0 ? (
              user.connectedPlatforms.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                >
                  {platform}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No connected social channels.</span>
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
