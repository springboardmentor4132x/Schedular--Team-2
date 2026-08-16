import { useState } from 'react'
import Modal from '../../../../shared/components/ui/Modal'
import Button from '../../../../shared/components/ui/Button'
import Input from '../../../../shared/components/ui/Input'
import Select from '../../../../shared/components/ui/Select'
import { ROLE_LABELS } from '../../../../context/authRoles'

const INITIAL_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  phone: '',
  password: '',
  company: '',
  role: '',
}

export default function UserFormModal({ isOpen, onClose, onSave, user, roleOptions = null, defaultRole = '' }) {
  const [formData, setFormData] = useState(() =>
    user
      ? {
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          username: user.username || '',
          phone: user.phone || '',
          password: '',
          company: user.company || '',
          role: user.role || defaultRole,
        }
      : { ...INITIAL_FORM, role: defaultRole }
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!formData.first_name.trim()) errs.first_name = 'First name is required'
    if (!formData.last_name.trim()) errs.last_name = 'Last name is required'
    if (!formData.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Enter a valid email address'
    }
    if (!user && !formData.username.trim()) errs.username = 'Username is required'
    if (!user && !formData.password) errs.password = 'Password is required'
    if (!user && formData.password && formData.password.length < 8) errs.password = 'Password must be at least 8 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      const payload = { ...formData }
      if (!user) {
        delete payload.company
      } else {
        delete payload.email
        delete payload.username
        delete payload.password
      }
      await onSave(payload)
      onClose()
    } catch (err) {
      setSaveError(err.response?.data?.detail || 'Failed to save user.')
    } finally {
      setSaving(false)
    }
  }

  const showRoleSelect = roleOptions && roleOptions.length > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Edit User Profile' : 'Add New Platform User'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="user-form-first"
            label="First Name"
            value={formData.first_name}
            onChange={set('first_name')}
            error={errors.first_name}
            placeholder="e.g. Sarah"
            required
          />
          <Input
            id="user-form-last"
            label="Last Name"
            value={formData.last_name}
            onChange={set('last_name')}
            error={errors.last_name}
            placeholder="e.g. Jenkins"
            required
          />
        </div>

        {!user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="user-form-email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={set('email')}
              error={errors.email}
              placeholder="sarah@orbitsocial.com"
              required
            />
            <Input
              id="user-form-username"
              label="Username"
              value={formData.username}
              onChange={set('username')}
              error={errors.username}
              placeholder="sarahjenkins"
              required
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="user-form-phone"
            label="Phone"
            value={formData.phone}
            onChange={set('phone')}
            placeholder="+1 555 000 1234"
          />
          {!user ? (
            <Input
              id="user-form-password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={set('password')}
              error={errors.password}
              placeholder="Min. 8 characters"
              required
            />
          ) : (
            <Input
              id="user-form-company"
              label="Company / Organization"
              value={formData.company}
              onChange={set('company')}
              placeholder="Company name"
            />
          )}
        </div>

        {showRoleSelect ? (
          <Select id="user-form-role" label="User Role" value={formData.role} onChange={set('role')}>
            {roleOptions.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </Select>
        ) : (
          <div className="space-y-1.5">
            <label className="label-base text-xs font-semibold">User Role</label>
            <div className="input-base select-base text-xs flex items-center text-slate-600 dark:text-slate-300">
              {ROLE_LABELS[formData.role] || formData.role}
            </div>
          </div>
        )}

        {saveError && (
          <p role="alert" className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            {saveError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={saving}>
            {user ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
