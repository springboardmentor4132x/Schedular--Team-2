import { useState } from 'react'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import Avatar from '../ui/Avatar'

// ── Shared input class ────────────────────────────────────────────────────────
const inp = `w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white
             text-slate-800 placeholder:text-slate-400 focus:outline-none
             focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition`

// ── Small form-field wrapper ──────────────────────────────────────────────────
function Field({ label, id, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  )
}

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'basic',  label: 'Basic Info'   },
  { id: 'about',  label: 'About'        },
  { id: 'skills', label: 'Skills'       },
  { id: 'social', label: 'Social Links' },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function EditProfileModal({ profile, onClose, onSave }) {
  const [tab, setTab]           = useState('basic')
  const [newSkill, setNewSkill] = useState('')
  const [form, setForm] = useState({
    firstName:   profile.firstName,
    lastName:    profile.lastName,
    email:       profile.email,
    phone:       profile.phone,
    role:        profile.role,
    timezone:    profile.timezone,
    bio:         profile.bio,
    company:     profile.company,
    location:    profile.location,
    website:     profile.website,
    skills:      [...profile.skills],
    socialLinks: profile.socialLinks.map(l => ({ ...l })),
  })

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const addSkill = () => {
    const s = newSkill.trim()
    if (s && !form.skills.includes(s)) set('skills', [...form.skills, s])
    setNewSkill('')
  }

  const removeSkilll = (skill) => set('skills', form.skills.filter(s => s !== skill))

  const updateLink = (i, field, val) => {
    const links = [...form.socialLinks]
    links[i] = { ...links[i], [field]: val }
    set('socialLinks', links)
  }

  const handleSave = () => onSave({ ...profile, ...form })

  return (
    <Modal isOpen title="Edit Profile" onClose={onClose} size="lg">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 mb-6 -mx-6 px-6">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            id={`edit-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2
                        ${tab === t.id
                          ? 'text-primary-600 border-primary-600'
                          : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Basic Info ── */}
      {tab === 'basic' && (
        <div className="space-y-5">
          {/* Avatar upload row */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <Avatar initials={form.firstName[0] + form.lastName[0]} size="lg"
              className="ring-4 ring-white shadow" />
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Profile Photo</p>
              <p className="text-xs text-slate-400 mb-2">JPG, PNG or GIF — max 2 MB</p>
              <button
                type="button"
                id="edit-upload-photo-btn"
                className="btn-ghost text-xs py-1.5 px-3"
              >
                Upload Photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" id="edit-first-name">
              <input id="edit-first-name" className={inp} value={form.firstName}
                onChange={e => set('firstName', e.target.value)} placeholder="First name" />
            </Field>
            <Field label="Last Name" id="edit-last-name">
              <input id="edit-last-name" className={inp} value={form.lastName}
                onChange={e => set('lastName', e.target.value)} placeholder="Last name" />
            </Field>
            <Field label="Email Address" id="edit-email">
              <input id="edit-email" type="email" className={inp} value={form.email}
                onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="Phone Number" id="edit-phone">
              <input id="edit-phone" type="tel" className={inp} value={form.phone}
                onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
            </Field>
            <Field label="Role / Title" id="edit-role">
              <input id="edit-role" className={inp} value={form.role}
                onChange={e => set('role', e.target.value)} placeholder="Your role" />
            </Field>
            <Field label="Timezone" id="edit-timezone">
              <input id="edit-timezone" className={inp} value={form.timezone}
                onChange={e => set('timezone', e.target.value)} placeholder="e.g. Pacific Time" />
            </Field>
          </div>
        </div>
      )}

      {/* ── About ── */}
      {tab === 'about' && (
        <div className="space-y-4">
          <Field label="Bio" id="edit-bio">
            <textarea id="edit-bio" rows={4} className={`${inp} resize-none`}
              value={form.bio} onChange={e => set('bio', e.target.value)}
              placeholder="Tell the world about yourself…" />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {form.bio.length} / 300 characters
            </p>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company" id="edit-company">
              <input id="edit-company" className={inp} value={form.company}
                onChange={e => set('company', e.target.value)} placeholder="Your company" />
            </Field>
            <Field label="Location" id="edit-location">
              <input id="edit-location" className={inp} value={form.location}
                onChange={e => set('location', e.target.value)} placeholder="City, Country" />
            </Field>
          </div>
          <Field label="Website URL" id="edit-website">
            <input id="edit-website" type="url" className={inp} value={form.website}
              onChange={e => set('website', e.target.value)} placeholder="https://yoursite.com" />
          </Field>
        </div>
      )}

      {/* ── Skills ── */}
      {tab === 'skills' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Add skills to showcase your expertise on your profile.</p>
          <div className="flex gap-2">
            <input
              id="edit-skill-input"
              className={`${inp} flex-1`}
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              placeholder="e.g. Graphic Design"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
            />
            <button type="button" id="edit-add-skill-btn" onClick={addSkill} className="btn-primary whitespace-nowrap">
              + Add
            </button>
          </div>
          <div className="min-h-16 p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200
                          flex flex-wrap gap-2 content-start">
            {form.skills.length === 0
              ? <p className="text-sm text-slate-400 w-full text-center self-center">No skills added yet</p>
              : form.skills.map(skill => (
                  <Badge key={skill} variant="primary" onRemove={() => removeSkilll(skill)}>
                    {skill}
                  </Badge>
                ))
            }
          </div>
        </div>
      )}

      {/* ── Social Links ── */}
      {tab === 'social' && (
        <div className="space-y-5">
          {form.socialLinks.map((link, i) => (
            <div key={link.platform} className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">{link.platform}</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Handle" id={`edit-handle-${i}`}>
                  <input id={`edit-handle-${i}`} className={inp} value={link.handle}
                    onChange={e => updateLink(i, 'handle', e.target.value)} placeholder="@username" />
                </Field>
                <Field label="Profile URL" id={`edit-url-${i}`}>
                  <input id={`edit-url-${i}`} type="url" className={inp} value={link.url}
                    onChange={e => updateLink(i, 'url', e.target.value)} placeholder="https://…" />
                </Field>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        <button type="button" id="edit-profile-save-btn" onClick={handleSave} className="btn-primary">
          Save Changes
        </button>
      </div>
    </Modal>
  )
}
