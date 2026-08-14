import React, { useState, useEffect } from 'react'
import Modal from '../../../shared/components/ui/Modal'
import Button from '../../../shared/components/Button'
import Input from '../../../shared/components/Input'

export default function CreatorFormModal({ isOpen, onClose, onSave, creator }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    type: 'Individual',
    status: 'Active'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (creator) {
      setFormData({
        name: creator.name || '',
        username: creator.username || '',
        email: creator.email || '',
        type: creator.type || 'Individual',
        status: creator.status || 'Active'
      })
    } else {
      setFormData({
        name: '',
        username: '',
        email: '',
        type: 'Individual',
        status: 'Active'
      })
    }
    setErrors({})
  }, [creator, isOpen])

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Full Name is required'
    if (!formData.username.trim()) errs.username = 'Username is required'
    if (!formData.email.trim()) {
      errs.email = 'Email Address is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (!formData.type) errs.type = 'Creator Type is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSave(formData)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={creator ? 'Edit Content Creator' : 'Add New Content Creator'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="e.g. Alex Morgan"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            error={errors.username}
            placeholder="@alexmorgan"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            placeholder="alex@orbitsocial.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="label-base text-xs font-semibold">Creator Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-base select-base text-xs"
            >
              <option value="Individual">Individual</option>
              <option value="Professional">Professional</option>
              <option value="Agency">Agency</option>
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
              <option value="Pending">Pending</option>
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
            {creator ? 'Save Changes' : 'Create Creator'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
