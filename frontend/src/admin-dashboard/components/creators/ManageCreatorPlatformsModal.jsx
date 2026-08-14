import React, { useState, useEffect } from 'react'
import Modal from '../../../shared/components/ui/Modal'
import Button from '../../../shared/components/Button'
import { Layers, CheckCircle2, XCircle } from 'lucide-react'

export default function ManageCreatorPlatformsModal({ isOpen, onClose, onSave, creator }) {
  const allPlatforms = ['Instagram', 'Facebook', 'LinkedIn', 'X', 'YouTube', 'Pinterest']
  const [selectedPlatforms, setSelectedPlatforms] = useState([])

  useEffect(() => {
    if (creator) {
      setSelectedPlatforms(creator.connectedPlatforms || [])
    }
  }, [creator, isOpen])

  const handleTogglePlatform = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform))
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform])
    }
  }

  const handleSave = () => {
    if (creator) {
      onSave(creator.id, selectedPlatforms)
    }
    onClose()
  }

  if (!creator) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Social Platforms — ${creator.name}`} size="md">
      <div className="space-y-5">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select connected social channels for creator <strong className="text-slate-800 dark:text-slate-200">{creator.username}</strong>:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allPlatforms.map((platform) => {
            const isConnected = selectedPlatforms.includes(platform)
            return (
              <div
                key={platform}
                onClick={() => handleTogglePlatform(platform)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isConnected
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-300/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers size={16} />
                  <span className="text-xs">{platform}</span>
                </div>
                {isConnected ? (
                  <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <XCircle size={16} className="text-slate-400" />
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Channels
          </Button>
        </div>
      </div>
    </Modal>
  )
}
