import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Calendar,
  Layers,
  ListOrdered,
  ScrollText,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  Bell,
  User,
  Settings,
  Users,
  Building2,
  Share2,
  Inbox,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Command
} from 'lucide-react'

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const isCreator = location.pathname.startsWith('/creator')

  // Role-Aware Command Items
  const items = useMemo(() => {
    if (isCreator) {
      return [
        // Navigation Group
        { id: 'c-dash', label: 'Creator Dashboard', group: 'Navigation', icon: LayoutDashboard, path: '/creator/dashboard', keywords: 'home overview metrics' },
        { id: 'c-posts', label: 'My Posts', group: 'Navigation', icon: FileText, path: '/creator/my-posts', keywords: 'drafts content articles' },
        { id: 'c-sched', label: 'Content Scheduling', group: 'Navigation', icon: Calendar, path: '/creator/content-scheduling', keywords: 'plan schedule queue' },
        { id: 'c-cal', label: 'Publishing Calendar', group: 'Navigation', icon: Calendar, path: '/creator/publishing-calendar', keywords: 'dates events schedule' },
        { id: 'c-pub', label: 'Publishing Dashboard', group: 'Navigation', icon: Layers, path: '/creator/publishing', keywords: 'dispatch broadcast' },
        { id: 'c-queue', label: 'Publishing Queue', group: 'Navigation', icon: ListOrdered, path: '/creator/publishing/queue', keywords: 'upcoming scheduled' },
        { id: 'c-logs', label: 'Publishing Logs', group: 'Navigation', icon: ScrollText, path: '/creator/publishing/logs', keywords: 'audit history records' },
        { id: 'c-failed', label: 'Failed Posts', group: 'Navigation', icon: AlertTriangle, path: '/creator/publishing/failed', keywords: 'errors retry failed' },
        { id: 'c-analytics', label: 'Creator Analytics', group: 'Navigation', icon: BarChart3, path: '/creator/analytics', keywords: 'metrics engagement reach' },
        { id: 'c-reports', label: 'Creator Reports & Export', group: 'Navigation', icon: FileSpreadsheet, path: '/creator/reports', keywords: 'csv pdf download analytics' },
        { id: 'c-notifs', label: 'Notifications', group: 'Navigation', icon: Bell, path: '/creator/notifications', keywords: 'alerts feedback mentions' },
        { id: 'c-profile', label: 'Creator Profile', group: 'Navigation', icon: User, path: '/creator/profile', keywords: 'account bio socials' },
        { id: 'c-settings', label: 'Creator Settings', group: 'Navigation', icon: Settings, path: '/creator/settings', keywords: 'preferences security 2fa' },
        
        // Actions Group
        { id: 'act-c-create', label: 'Create New Post', group: 'Quick Actions', icon: PlusCircle, path: '/creator/create-post', keywords: 'new compose write' },
        { id: 'act-c-sched', label: 'Schedule Content', group: 'Quick Actions', icon: Calendar, path: '/creator/content-scheduling', keywords: 'schedule date plan' },
        { id: 'act-c-failed', label: 'Review Failed Posts', group: 'Quick Actions', icon: AlertTriangle, path: '/creator/publishing/failed', keywords: 'retry error fix' },
        { id: 'act-c-export', label: 'Export Analytics Report', group: 'Quick Actions', icon: FileSpreadsheet, path: '/creator/reports', keywords: 'download export report' }
      ]
    } else {
      return [
        // Navigation Group
        { id: 'a-dash', label: 'Admin Dashboard', group: 'Navigation', icon: LayoutDashboard, path: '/admin/dashboard', keywords: 'home overview platform' },
        { id: 'a-users', label: 'User Management', group: 'Navigation', icon: Users, path: '/admin/users', keywords: 'accounts roles permissions' },
        { id: 'a-biz', label: 'Business Accounts', group: 'Navigation', icon: Building2, path: '/admin/business-accounts', keywords: 'companies brands clients' },
        { id: 'a-teams', label: 'Marketing Teams', group: 'Navigation', icon: Users, path: '/admin/marketing-teams', keywords: 'groups squads members' },
        { id: 'a-creators', label: 'Content Creators', group: 'Navigation', icon: User, path: '/admin/content-creators', keywords: 'influencers creators partners' },
        { id: 'a-socials', label: 'Social Accounts', group: 'Navigation', icon: Share2, path: '/social-accounts', keywords: 'connections channels instagram linkedin' },
        { id: 'a-analytics', label: 'Platform Analytics', group: 'Navigation', icon: BarChart3, path: '/analytics', keywords: 'system metrics growth roi' },
        { id: 'a-reports', label: 'Admin Reports & Export', group: 'Navigation', icon: FileSpreadsheet, path: '/admin/reports', keywords: 'audit exports csv pdf' },
        { id: 'a-notifs', label: 'System Notifications', group: 'Navigation', icon: Bell, path: '/admin/notifications', keywords: 'alerts logs system critical' },
        { id: 'a-team', label: 'Team', group: 'Navigation', icon: Users, path: '/team', keywords: 'members staff team' },
        { id: 'a-inbox', label: 'Inbox', group: 'Navigation', icon: Inbox, path: '/inbox', keywords: 'messages chats support' },
        { id: 'a-profile', label: 'My Profile', group: 'Navigation', icon: User, path: '/profile', keywords: 'account admin profile' },
        { id: 'a-settings', label: 'Platform Settings', group: 'Navigation', icon: Settings, path: '/settings', keywords: 'system preferences configuration' },
        { id: 'a-cal', label: 'Master Calendar', group: 'Navigation', icon: Calendar, path: '/calendar', keywords: 'scheduled calendar posts' },

        // Actions Group
        { id: 'act-a-users', label: 'Add New User', group: 'Quick Actions', icon: PlusCircle, path: '/admin/users', keywords: 'create user new register' },
        { id: 'act-a-biz', label: 'Approve Business Account', group: 'Quick Actions', icon: Building2, path: '/admin/business-accounts', keywords: 'verify business review' },
        { id: 'act-a-alerts', label: 'View Security Alerts', group: 'Quick Actions', icon: ShieldAlert, path: '/admin/notifications', keywords: 'audit security critical' },
        { id: 'act-a-export', label: 'Generate System Report', group: 'Quick Actions', icon: FileSpreadsheet, path: '/admin/reports', keywords: 'export download report' }
      ]
    }
  }, [isCreator])

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase().trim()
    return items.filter(
      item =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    )
  }, [items, query])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when opened and lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1))
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault()
        handleSelect(filteredItems[selectedIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredItems, selectedIndex])

  const handleSelect = (item) => {
    onClose()
    setQuery('')
    navigate(item.path)
  }

  if (!isOpen) return null

  // Group filtered items by group name
  const grouped = filteredItems.reduce((acc, item) => {
    acc[item.group] = acc[item.group] || []
    acc[item.group].push(item)
    return acc
  }, {})

  let itemCounter = -1

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Dialog Container */}
      <div className="relative w-full max-w-xl bg-card border border-default rounded-2xl shadow-2xl overflow-hidden z-10 animate-scale-in">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-default gap-3">
          <Search size={18} className="text-secondary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${isCreator ? 'Creator' : 'Admin'} actions, pages, and tools…`}
            className="w-full bg-transparent text-sm text-primary placeholder:text-secondary focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-xs text-secondary hover:text-primary font-semibold px-1.5 py-0.5 rounded bg-surface border border-default"
            >
              Clear
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-secondary bg-surface border border-default px-2 py-0.5 rounded-md">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-secondary">
              <p className="text-sm font-semibold">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for posts, scheduling, users, reports, or settings.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, groupItems]) => (
              <div key={groupName} className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center justify-between">
                  <span>{groupName}</span>
                  <span className="text-[10px] font-normal">{groupItems.length}</span>
                </div>
                {groupItems.map((item) => {
                  itemCounter++
                  const currentIndex = itemCounter
                  const isSelected = selectedIndex === currentIndex
                  const Icon = item.icon

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-primary hover:bg-hover'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                          isSelected ? 'bg-indigo-700 text-white' : 'bg-surface text-secondary border border-default'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-100 font-medium">
                            <span>Open</span>
                            <ArrowRight size={12} />
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 bg-surface border-t border-default flex items-center justify-between text-[11px] text-secondary">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-default font-mono text-[10px] font-bold">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-default font-mono text-[10px] font-bold">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-default font-mono text-[10px] font-bold">↵</kbd>
              <span>Select</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Command size={12} className="text-secondary" />
            <span>OrbitSocial Quick Navigation</span>
          </div>
        </div>
      </div>
    </div>
  )
}
