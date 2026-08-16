import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  X,
  RefreshCw,
  BellRing
} from 'lucide-react'
import Button from '../../../shared/components/ui/Button'

const initialItems = [
  {
    id: 'a-security',
    severity: 'danger',
    title: '1 Critical Security Alert',
    description: 'Unusual authentication spike detected from unverified IP block.',
    actionLabel: 'Review Security Logs',
    path: '/notifications',
    badge: 'Critical'
  },
  {
    id: 'a-failed',
    severity: 'warning',
    title: '4 System Publishing Failures',
    description: 'Rate limit errors reported across multiple creator accounts.',
    actionLabel: 'View Publishing Diagnostics',
    path: '/reports',
    badge: 'Operator Review'
  },
  {
    id: 'a-creators',
    severity: 'info',
    title: '2 Creators Require Onboarding Approval',
    description: 'New creator profiles submitted for business campaign matching.',
    actionLabel: 'Review Creators',
    path: '/content-creators',
    badge: 'Pending'
  }
]

export default function AttentionRequired() {
  const navigate = useNavigate()
  const [items, setItems] = useState(initialItems)

  const handleDismiss = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  if (items.length === 0) {
    return null
  }

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'danger':
        return {
          icon: ShieldAlert,
          iconColor: 'text-rose-600 dark:text-rose-400',
          bgColor: 'bg-rose-50 dark:bg-rose-950/30',
          borderColor: 'border-rose-200 dark:border-rose-900/60',
          badgeColor: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-950/30',
          borderColor: 'border-amber-200 dark:border-amber-900/60',
          badgeColor: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
        }
      case 'info':
      default:
        return {
          icon: BellRing,
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
          borderColor: 'border-indigo-200 dark:border-indigo-900/60',
          badgeColor: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50'
        }
    }
  }

  return (
    <section aria-label="Action Center" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-500" />
          <span>Attention Required ({items.length})</span>
        </h2>
        {items.length < initialItems.length && (
          <button
            onClick={() => setItems(initialItems)}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={11} />
            <span>Reset Alerts</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {items.map((item) => {
          const style = getSeverityStyle(item.severity)
          const Icon = style.icon

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border ${style.borderColor} ${style.bgColor} flex flex-col justify-between space-y-3 relative group transition-all duration-200 hover:shadow-card`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg ${style.iconColor} bg-card border border-default flex-shrink-0 mt-0.5`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-xs md:text-sm text-primary tracking-tight">{item.title}</h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${style.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDismiss(item.id)}
                  className="text-secondary hover:text-primary p-1 rounded-md hover:bg-hover opacity-70 hover:opacity-100 transition-opacity"
                  title="Dismiss alert"
                  aria-label="Dismiss alert"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="pt-1 flex items-center justify-end">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => navigate(item.path)}
                  className="bg-card hover:bg-hover text-xs font-semibold gap-1"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight size={12} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
