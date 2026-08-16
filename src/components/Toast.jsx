import { useEffect, useState } from 'react'
import { HiCheckCircle, HiXCircle, HiExclamationCircle, HiXMark } from 'react-icons/hi2'

/**
 * Toast — lightweight notification component.
 *
 * Usage (from a page):
 *   const [toast, setToast] = useState(null)
 *   setToast({ type: 'success', message: 'Account created!' })
 *   <Toast toast={toast} onClose={() => setToast(null)} />
 *
 * Props:
 *   toast   — { type: 'success' | 'error' | 'warning', message: string } | null
 *   onClose — function called when toast is dismissed
 *   duration — ms before auto-dismiss (default 3500)
 */
export default function Toast({ toast, onClose, duration = 3500 }) {
  const [visible, setVisible] = useState(false)

  // Animate in when a new toast arrives, auto-dismiss after duration
  useEffect(() => {
    if (!toast) { setVisible(false); return }
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300) // wait for fade-out before clearing
    }, duration)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  // Colours and icons per type
  const config = {
    success: {
      icon: HiCheckCircle,
      bg:   'var(--success, #22C55E)',
      border: 'rgba(34,197,94,.25)',
      text: '#fff',
    },
    error: {
      icon: HiXCircle,
      bg:   'var(--error, #EF4444)',
      border: 'rgba(239,68,68,.25)',
      text: '#fff',
    },
    warning: {
      icon: HiExclamationCircle,
      bg:   'var(--warning, #F59E0B)',
      border: 'rgba(245,158,11,.25)',
      text: '#fff',
    },
  }

  const { icon: Icon, bg, border, text } = config[toast.type] || config.error

  return (
    /* Fixed container — always top-right, above everything */
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 1000,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-12px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          background: bg,
          border: `1px solid ${border}`,
          boxShadow: '0 8px 32px rgba(0,0,0,.18)',
          color: text,
          fontSize: '0.875rem',
          fontWeight: 500,
          maxWidth: '22rem',
          minWidth: '14rem',
        }}
      >
        {/* Icon */}
        <Icon size={19} style={{ flexShrink: 0 }} aria-hidden="true" />

        {/* Message */}
        <span style={{ flex: 1, lineHeight: 1.45 }}>{toast.message}</span>

        {/* Close button */}
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
          aria-label="Dismiss notification"
          style={{
            background: 'rgba(255,255,255,.25)',
            border: 'none',
            borderRadius: '6px',
            padding: '2px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <HiXMark size={15} />
        </button>
      </div>
    </div>
  )
}
