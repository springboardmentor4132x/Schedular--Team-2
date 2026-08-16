import Modal from '../../../../shared/components/ui/Modal'
import Avatar from '../../../../shared/components/ui/Avatar'
import Button from '../../../../shared/components/ui/Button'
import Badge from '../../../../shared/components/ui/Badge'
import { Mail, Building2, MapPin, Globe, Phone, Briefcase } from 'lucide-react'
import { ROLE_LABELS } from '../../../../context/authRoles'
import { fullName, initialsOf, formatDate } from '../../utils/userFormat'

const roleVariant = {
  creator: 'primary',
  business: 'success',
  marketing: 'warning',
  administrator: 'danger',
}

function MetaTile({ label, value, accent = 'text-slate-900 dark:text-slate-100' }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
      <span className={`text-xs font-bold mt-1 block ${accent}`}>{value}</span>
    </div>
  )
}

function InfoRow({ icon: Icon, value }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={14} className="text-slate-400 flex-shrink-0" />
      <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
    </div>
  )
}

export default function UserDetailsModal({ isOpen, onClose, user }) {
  if (!user) return null

  const name = fullName(user)
  const roleLabel = ROLE_LABELS[user.role] || user.role

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile Details" size="md">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <Avatar
            src={user.avatar_url || undefined}
            initials={initialsOf(name)}
            alt={name}
            size="lg"
          />
          <div className="text-center sm:text-left space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{name}</h3>
              <Badge variant={roleVariant[user.role] || 'default'}>{roleLabel}</Badge>
            </div>
            <p className="text-xs text-slate-500 font-semibold">@{user.username} • {user.email}</p>
          </div>
        </div>

        {/* Core Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetaTile label="Joined" value={formatDate(user.created_at)} />
          <MetaTile label="Social Accounts" value={user.social_accounts_count ?? 0} accent="text-indigo-600 dark:text-indigo-400" />
          <MetaTile label="Campaigns" value={user.campaigns_count ?? 0} accent="text-purple-600 dark:text-purple-400" />
          <MetaTile label="Posts" value={user.posts_count ?? 0} accent="text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* Contact / Company Info */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Building2 size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>Account Information</span>
          </h4>
          <InfoRow icon={Mail} value={user.email} />
          <InfoRow icon={Building2} value={user.company} />
          <InfoRow icon={Phone} value={user.phone} />
          <InfoRow icon={MapPin} value={user.location} />
          <InfoRow icon={Globe} value={user.website} />
          <InfoRow icon={Briefcase} value={user.workspaces_count != null ? `${user.workspaces_count} workspace(s)` : null} />
          {user.bio && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
              {user.bio}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
