import React, { useState, useEffect } from 'react'
import Modal from '../../../shared/components/ui/Modal'
import Button from '../../../shared/components/Button'
import Input from '../../../shared/components/Input'

export default function UserFormModal({ isOpen, onClose, onSave, user }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'Creator',
    status: 'Active'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        role: user.role || 'Creator',
        status: user.status || 'Active'
      })
    } else {
      setFormData({
        name: '',
        email: '',
        username: '',
        role: 'Creator',
        status: 'Active'
      })
    }
    setErrors({})
  }, [user, isOpen])

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Full Name is required'
    if (!formData.email.trim()) {
      errs.email = 'Email Address is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (!formData.role) errs.role = 'Role selection is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSave({
      ...formData,
      username: formData.username.trim()
        ? formData.username
        : `@${formData.name.toLowerCase().replace(/\s+/g, '')}`
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Edit User Profile' : 'Add New Platform User'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="e.g. Sarah Jenkins"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            placeholder="sarah@orbitsocial.com"
            required
          />

          <Input
            label="Username (Optional)"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="@sarahj_mktg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="label-base text-xs font-semibold">User Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-base select-base text-xs"
            >
              <option value="Admin">Admin</option>
              <option value="Creator">Creator</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="label-base text-xs font-semibold">Account Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-base select-base text-xs"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {user ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
