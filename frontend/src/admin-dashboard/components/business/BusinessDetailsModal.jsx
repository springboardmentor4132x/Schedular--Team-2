import React from 'react'
import Modal from '../../../shared/components/ui/Modal'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import Avatar from '../../../shared/components/ui/Avatar'
import Button from '../../../shared/components/Button'
import { Globe, Layers, Target, Send, TrendingUp, Users, ExternalLink } from 'lucide-react'

export default function BusinessDetailsModal({ isOpen, onClose, account }) {
  if (!account) return null

  const allPlatforms = ['Instagram', 'Facebook', 'LinkedIn', 'X', 'YouTube', 'Pinterest']

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Business Account Details" size="lg">
      <div className="space-y-6">
        {/* Business Banner & Avatar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <Avatar src={account.logo} alt={account.name} size="lg" />
          <div className="text-center sm:text-left space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                {account.name}
              </h3>
              <StatusBadge status={account.status} dot />
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Owner: {account.ownerName} • {account.email}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                {account.type} Account
              </span>
              {account.website && (
                <a
                  href={account.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <Globe size={13} />
                  <span>{account.domain || 'Website'}</span>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Performance Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Campaigns</span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">{account.totalCampaigns}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Published Posts</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">{account.publishedPosts}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Reach</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">{account.totalReach}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Engagement Rate</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{account.engagementRate}</span>
          </div>
        </div>

        {/* Connected Platforms Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>Connected Social Platforms</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allPlatforms.map((platform) => {
              const isConnected = (account.connectedPlatforms || []).includes(platform)
              const followerCount = account.platformFollowers?.[platform] || null
              return (
                <div
                  key={platform}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                    isConnected
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-800/40 text-slate-900 dark:text-slate-100'
                      : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{platform}</span>
                    {isConnected && followerCount && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{followerCount} followers</span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      isConnected
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
              )
            })}
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
