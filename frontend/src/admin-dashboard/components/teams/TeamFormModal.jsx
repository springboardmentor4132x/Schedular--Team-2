import React, { useState, useEffect } from 'react'
import Modal from '../../../shared/components/ui/Modal'
import Button from '../../../shared/components/Button'
import Input from '../../../shared/components/Input'

export default function TeamFormModal({ isOpen, onClose, onSave, team }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leadName: '',
    leadEmail: '',
    type: 'Internal',
    status: 'Active'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        leadName: team.lead?.name || '',
        leadEmail: team.lead?.email || '',
        type: team.type || 'Internal',
        status: team.status || 'Active'
      })
    } else {
      setFormData({
        name: '',
        description: '',
        leadName: '',
        leadEmail: '',
        type: 'Internal',
        status: 'Active'
      })
    }
    setErrors({})
  }, [team, isOpen])

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Team Name is required'
    if (!formData.leadName.trim()) errs.leadName = 'Team Lead Name is required'
    if (!formData.type) errs.type = 'Team Type is required'
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
      title={team ? 'Edit Marketing Team' : 'Create New Marketing Team'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Team Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="e.g. Orbit Growth Team"
          required
        />

        <div className="space-y-1.5">
          <label className="label-base text-xs font-semibold">Description</label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief overview of team responsibilities and campaign scope..."
            className="input-base text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Team Lead Name"
            value={formData.leadName}
            onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
            error={errors.leadName}
            placeholder="e.g. Alex Morgan"
            required
          />

          <Input
            label="Team Lead Email (Optional)"
            type="email"
            value={formData.leadEmail}
            onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })}
            placeholder="alex@orbitsocial.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="label-base text-xs font-semibold">Team Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-base select-base text-xs"
            >
              <option value="Internal">Internal</option>
              <option value="Agency">Agency</option>
              <option value="Brand">Brand</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="label-base text-xs font-semibold">Team Status</label>
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
            {team ? 'Save Changes' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
