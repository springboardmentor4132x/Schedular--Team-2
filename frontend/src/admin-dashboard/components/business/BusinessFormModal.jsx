import React, { useState, useEffect } from 'react'
import Modal from '../../../shared/components/ui/Modal'
import Button from '../../../shared/components/Button'
import Input from '../../../shared/components/Input'

export default function BusinessFormModal({ isOpen, onClose, onSave, account }) {
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    type: 'Brand',
    website: '',
    status: 'Active'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        ownerName: account.ownerName || '',
        email: account.email || '',
        type: account.type || 'Brand',
        website: account.website || '',
        status: account.status || 'Active'
      })
    } else {
      setFormData({
        name: '',
        ownerName: '',
        email: '',
        type: 'Brand',
        website: '',
        status: 'Active'
      })
    }
    setErrors({})
  }, [account, isOpen])

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Business Name is required'
    if (!formData.ownerName.trim()) errs.ownerName = 'Owner Name is required'
    if (!formData.email.trim()) {
      errs.email = 'Email Address is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (!formData.type) errs.type = 'Business Type is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const domainName = formData.website
      ? formData.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      : `${formData.name.toLowerCase().replace(/\s+/g, '')}.com`

    onSave({
      ...formData,
      domain: domainName
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? 'Edit Business Account' : 'Add New Business Account'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Business Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="e.g. NovaTech Solutions"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Owner Name"
            value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            error={errors.ownerName}
            placeholder="e.g. Alex Morgan"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            placeholder="alex@company.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="label-base text-xs font-semibold">Business Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-base select-base text-xs"
            >
              <option value="Agency">Agency</option>
              <option value="Brand">Brand</option>
              <option value="Startup">Startup</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Other">Other</option>
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
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <Input
          label="Website URL (Optional)"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://company.com"
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {account ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
