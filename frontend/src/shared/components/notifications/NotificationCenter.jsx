import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, CheckCheck, ExternalLink, Sparkles } from 'lucide-react'
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../../services/notificationService'
import NotificationItem from './NotificationItem'

export default function NotificationCenter() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef(null)

  // Detect role from route prefix
  const role = location.pathname.startsWith('/admin') || location.pathname.startsWith('/analytics') ? 'admin' : 'creator'
  const targetPage = role === 'admin' ? '/admin/notifications' : '/creator/notifications'

  const fetchNotifications = async () => {
    const data = await getNotifications(role)
    setNotifications(data)
    const count = await getUnreadCount(role)
    setUnreadCount(count)
  }

  useEffect(() => {
    fetchNotifications()
  }, [role, location.pathname])

  // Outside click handler
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleMarkRead = async (id) => {
    const updated = await markNotificationAsRead(id, role)
    setNotifications(updated)
    const count = await getUnreadCount(role)
    setUnreadCount(count)
  }

  const handleMarkAllRead = async () => {
    const updated = await markAllNotificationsAsRead(role)
    setNotifications(updated)
    setUnreadCount(0)
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left z-40">
      {/* Navbar Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications menu"
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 cursor-pointer"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-extrabold text-white bg-indigo-600 rounded-full leading-none ring-2 ring-white dark:ring-slate-900 min-w-[16px] h-[16px] flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Menu Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transform origin-top-right transition-all duration-200 ease-out z-50 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={13} />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Scrollable Notification List */}
          <div className="max-h-[340px] overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/60 no-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <NotificationItem
                  key={item.id}
                  notification={item}
                  onMarkAsRead={handleMarkRead}
                  compact
                />
              ))
            )}
          </div>

          {/* Footer Navigation Link */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 text-center">
            <Link
              to={targetPage}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline py-1 w-full"
            >
              <span>View All Notifications Page</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
