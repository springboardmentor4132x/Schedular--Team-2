import { useState, useRef } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useTheme } from '../hooks/useTheme'
import { mockProfile } from '../services/profileService'

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────────────────────

function validate(form) {
  const errors = {}
  if (!form.firstName.trim())  errors.firstName = 'First name is required.'
  if (!form.lastName.trim())   errors.lastName  = 'Last name is required.'
  if (!form.username.trim())   errors.username  = 'Username is required.'
  if (!form.email.trim())      errors.email     = 'Email is required.'
  else if (!/\S+@\S+\.\S+/.test(form.email))
                               errors.email     = 'Enter a valid email address.'
  if (!form.phone.trim())      errors.phone     = 'Phone number is required.'
  else if (!/^\d{7,15}$/.test(form.phone.replace(/[\s\-+()]/g, '')))
                               errors.phone     = 'Enter a valid phone number.'
  return errors
}

/** Full password strength rules */
function getPasswordRules(pw) {
  return [
    { id: 'len',   label: 'Minimum 8 characters',      pass: pw.length >= 8          },
    { id: 'upper', label: 'At least one uppercase',     pass: /[A-Z]/.test(pw)        },
    { id: 'lower', label: 'At least one lowercase',     pass: /[a-z]/.test(pw)        },
    { id: 'num',   label: 'At least one number',        pass: /[0-9]/.test(pw)        },
    { id: 'spec',  label: 'At least one special char',  pass: /[^A-Za-z0-9]/.test(pw) },
  ]
}

function validatePassword({ current, newPw, confirm }) {
  const errors = {}
  if (!current)                errors.current = 'Current password is required.'
  if (!newPw)                  errors.newPw   = 'New password is required.'
  else {
    const rules = getPasswordRules(newPw)
    const failed = rules.find(r => !r.pass)
    if (failed)                errors.newPw   = failed.label + '.'
    else if (newPw === current) errors.newPw  = 'New password must differ from current.'
  }
  if (!confirm)                errors.confirm = 'Please confirm your new password.'
  else if (confirm !== newPw)  errors.confirm = 'Passwords do not match.'
  return errors
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline SVG Icons
// ─────────────────────────────────────────────────────────────────────────────

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-4 h-4" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-4 h-4" aria-hidden="true">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-4 h-4" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className="w-3 h-3" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const XSmallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className="w-3 h-3" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// ProfileHeader
// ─────────────────────────────────────────────────────────────────────────────

function ProfileAvatar({ initials, onUpload }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Dummy upload handler — simulates a brief "uploading" state
    setUploading(true)
    setTimeout(() => { setUploading(false); onUpload?.(file) }, 1200)
    e.target.value = ''
  }

  return (
    <div className="relative self-start group" role="img" aria-label={`Profile avatar: ${initials}`}>
      {/* Avatar circle */}
      <div
        className={[
          'w-24 h-24 sm:w-28 sm:h-28 rounded-full',
          'ring-4 ring-white dark:ring-slate-700',
          'bg-gradient-to-br from-navy-400 to-navy-600',
          'flex items-center justify-center text-white font-bold text-3xl select-none',
          'shadow-lg overflow-hidden flex-shrink-0',
          'transition-transform duration-300 group-hover:scale-105',
        ].join(' ')}
      >
        {uploading ? <SpinnerIcon /> : initials}
      </div>

      {/* Dark overlay on hover */}
      <div
        className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30
                   transition-all duration-300 flex items-center justify-center"
        aria-hidden="true"
      />

      {/* Camera icon — revealed on hover */}
      <button
        type="button"
        id="profile-change-photo"
        aria-label="Change profile photo"
        onClick={() => fileRef.current?.click()}
        className={[
          'absolute inset-0 rounded-full',
          'flex items-center justify-center',
          'text-white opacity-0 group-hover:opacity-100',
          'transition-opacity duration-300',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
          'focus-visible:opacity-100',
        ].join(' ')}
      >
        <span className="flex flex-col items-center gap-0.5">
          <CameraIcon />
          <span className="text-[9px] font-semibold tracking-wide">CHANGE</span>
        </span>
      </button>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />
    </div>
  )
}

function ProfileHeader({ profile, onEdit }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <Card id="profile-header-card" className="overflow-hidden">
      {/* Navy gradient banner */}
      <div
        className="relative h-28 sm:h-32"
        style={{ background: 'linear-gradient(135deg, #243B6B 0%, #3860b0 60%, #5c7fc5 100%)' }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Content row */}
      <div className="px-5 sm:px-7 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 sm:-mt-16">
          {/* Avatar with hover upload */}
          <ProfileAvatar initials={profile.avatarInitials} />

          {/* Edit Profile button — right side */}
          <div className="sm:mb-2">
            <Button id="profile-edit-btn" onClick={onEdit}>
              <EditIcon />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* User info + meta badges */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-sm font-semibold text-navy-600 dark:text-navy-300 mt-0.5">
            {profile.role}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {profile.email}
          </p>

          {/* Meta row — Joined Date, Account Status, Last Active */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {/* Joined Date */}
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="w-3.5 h-3.5" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Joined {profile.joinedDate}
            </span>

            {/* Dot separator */}
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true"/>

            {/* Account Status */}
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5
                         rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              aria-label="Account status: Active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"/>
              Active
            </span>

            {/* Dot separator */}
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true"/>

            {/* Last Active */}
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="w-3.5 h-3.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Last active 2 hours ago
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// UserDetailsCard  (view + inline-edit mode)
// ─────────────────────────────────────────────────────────────────────────────

function UserDetailsCard({ profile, isEditing, onEdit, onSave, onCancel }) {
  const [form,   setForm]   = useState({ ...profile })
  const [errors, setErrors] = useState({})

  const handleEditClick = () => {
    setForm({ ...profile })
    setErrors({})
    onEdit()
  }

  const handleSave = () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(form)
    setErrors({})
  }

  const handleCancel = () => {
    setForm({ ...profile })
    setErrors({})
    onCancel()
  }

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const ViewRow = ({ label, value, id: rowId }) => (
    <div id={rowId} className="py-3 first:pt-0 last:pb-0">
      <dt className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
        {label}
      </dt>
      <dd className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words">
        {value || <span className="text-slate-400 dark:text-slate-600 italic">Not set</span>}
      </dd>
    </div>
  )

  return (
    <Card id="profile-details-card" className="p-5 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">User Details</h3>
        {!isEditing && (
          <Button
            id="profile-details-edit-btn"
            variant="secondary"
            size="sm"
            onClick={handleEditClick}
          >
            <EditIcon />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <form
          id="profile-details-form"
          onSubmit={e => { e.preventDefault(); handleSave() }}
          noValidate
          className="space-y-4"
          aria-label="Edit profile details"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="edit-first-name"
              label="First Name"
              value={form.firstName}
              onChange={e => set('firstName', e.target.value)}
              error={errors.firstName}
              placeholder="John"
              autoComplete="given-name"
              autoFocus
            />
            <Input
              id="edit-last-name"
              label="Last Name"
              value={form.lastName}
              onChange={e => set('lastName', e.target.value)}
              error={errors.lastName}
              placeholder="Doe"
              autoComplete="family-name"
            />
          </div>

          <Input
            id="edit-username"
            label="Username"
            value={form.username}
            onChange={e => set('username', e.target.value)}
            error={errors.username}
            placeholder="johndoe"
            autoComplete="username"
          />

          <Input
            id="edit-email"
            label="Email"
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            error={errors.email}
            placeholder="john@orbitsocial.com"
            autoComplete="email"
          />

          <Input
            id="edit-phone"
            label="Phone Number"
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            error={errors.phone}
            placeholder="9876543210"
            autoComplete="tel"
          />

          <Input
            id="edit-role"
            label="Company / Role"
            value={form.role}
            onChange={e => set('role', e.target.value)}
            error={errors.role}
            placeholder="Creator"
          />

          <div className="space-y-1.5">
            <label
              htmlFor="edit-bio"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Bio
            </label>
            <textarea
              id="edit-bio"
              rows={3}
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="Tell the world about yourself…"
              className="w-full px-4 py-2.5 text-sm rounded-xl border resize-none transition-all
                         bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100
                         placeholder:text-slate-400 dark:placeholder:text-slate-500
                         border-slate-200 dark:border-slate-600
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-400
                         focus-visible:border-navy-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" id="profile-details-save-btn">Save Changes</Button>
            <Button variant="ghost" onClick={handleCancel} id="profile-details-cancel-btn">
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <dl className="divide-y divide-slate-100 dark:divide-slate-700/60">
          <ViewRow id="view-full-name"  label="Full Name"      value={`${profile.firstName} ${profile.lastName}`} />
          <ViewRow id="view-username"   label="Username"       value={`@${profile.username}`} />
          <ViewRow id="view-email"      label="Email"          value={profile.email} />
          <ViewRow id="view-phone"      label="Phone Number"   value={profile.phone} />
          <ViewRow id="view-role"       label="Company / Role" value={profile.role} />
          <ViewRow id="view-bio"        label="Bio"            value={profile.bio} />
        </dl>
      )}
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PasswordRuleItem — live feedback row under New Password field
// ─────────────────────────────────────────────────────────────────────────────

function PasswordRuleItem({ pass, label }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs transition-colors duration-200
                    ${pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                        transition-colors duration-200
                        ${pass ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                               : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600'}`}>
        {pass ? <CheckIcon /> : <XSmallIcon />}
      </span>
      {label}
    </li>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ChangePasswordCard
// ─────────────────────────────────────────────────────────────────────────────

function ChangePasswordCard() {
  const [pw,      setPw]      = useState({ current: '', newPw: '', confirm: '' })
  const [errors,  setErrors]  = useState({})
  const [status,  setStatus]  = useState(null)   // null | 'loading' | 'success' | 'error'

  const rules = getPasswordRules(pw.newPw)
  const allRulesPass = rules.every(r => r.pass)
  const isLoading    = status === 'loading'

  const set = (key, val) => {
    setPw(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
    if (status !== null) setStatus(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validatePassword(pw)
    if (Object.keys(errs).length) { setErrors(errs); setStatus(null); return }

    // Simulate async save (no backend)
    setStatus('loading')
    setTimeout(() => {
      const ok = true  // Always succeeds — dummy handler
      if (ok) {
        setStatus('success')
        setPw({ current: '', newPw: '', confirm: '' })
        setErrors({})
      } else {
        setStatus('error')
      }
    }, 1400)
  }

  return (
    <Card id="profile-password-card" className="p-5 sm:p-7">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="w-8 h-8 rounded-xl bg-navy-50 dark:bg-navy-900/50
                         flex items-center justify-center text-navy-600 dark:text-navy-300"
              aria-hidden="true">
          <ShieldIcon />
        </span>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Change Password</h3>
      </div>

      <form
        id="profile-password-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
        aria-label="Change password"
      >
        <Input
          id="pw-current"
          label="Current Password"
          type="password"
          value={pw.current}
          onChange={e => set('current', e.target.value)}
          error={errors.current}
          placeholder="Enter current password"
          autoComplete="current-password"
          disabled={isLoading}
        />

        {/* New Password + live rules */}
        <div className="space-y-2">
          <Input
            id="pw-new"
            label="New Password"
            type="password"
            value={pw.newPw}
            onChange={e => set('newPw', e.target.value)}
            error={errors.newPw}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            disabled={isLoading}
          />
          {pw.newPw.length > 0 && (
            <ul
              className="grid grid-cols-1 gap-1 pl-1 pt-1"
              aria-label="Password requirements"
            >
              {rules.map(r => (
                <PasswordRuleItem key={r.id} pass={r.pass} label={r.label} />
              ))}
            </ul>
          )}
        </div>

        <Input
          id="pw-confirm"
          label="Confirm Password"
          type="password"
          value={pw.confirm}
          onChange={e => set('confirm', e.target.value)}
          error={errors.confirm}
          placeholder="Repeat new password"
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Success banner */}
        {status === 'success' && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400
                       bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800
                       px-4 py-3 rounded-xl"
          >
            <CheckIcon />
            Password updated successfully!
          </div>
        )}

        {/* Error banner */}
        {status === 'error' && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-center gap-2 text-sm font-medium text-rose-700 dark:text-rose-400
                       bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800
                       px-4 py-3 rounded-xl"
          >
            <XSmallIcon />
            Something went wrong. Please try again.
          </div>
        )}

        {/* Save Password button — primary, with loading + disabled states */}
        <Button
          type="submit"
          fullWidth
          id="profile-save-password-btn"
          disabled={isLoading}
          className="mt-1"
        >
          {isLoading ? (
            <>
              <SpinnerIcon />
              Saving…
            </>
          ) : (
            'Save Password'
          )}
        </Button>
      </form>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile page (root)
// ─────────────────────────────────────────────────────────────────────────────

export default function Profile() {
  const [profile,   setProfile] = useState(mockProfile)
  const [isEditing, setEditing] = useState(false)

  const handleSaveProfile = (updated) => {
    setProfile(updated)
    setEditing(false)
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      <ProfileHeader
        profile={profile}
        onEdit={() => setEditing(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

        <div className="lg:col-span-3">
          <UserDetailsCard
            profile={profile}
            isEditing={isEditing}
            onEdit={() => setEditing(true)}
            onSave={handleSaveProfile}
            onCancel={() => setEditing(false)}
          />
        </div>

        <div className="lg:col-span-2">
          <ChangePasswordCard />
        </div>

      </div>
    </div>
  )
}
