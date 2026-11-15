'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type NotificationRecord = {
  id: string
  user_id: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  async function refreshNotifications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) setNotifications(data as NotificationRecord[])
  }

  useEffect(() => {
    let active = true

    async function loadInitial() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !active) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data && active) setNotifications(data as NotificationRecord[])
    }

    loadInitial()

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        loadInitial()
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [supabase])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    await refreshNotifications()
  }

  async function markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    await refreshNotifications()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border border-[#0F172A] tabular-nums">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
            <h3 className="font-bold text-base text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-[#B45309] font-bold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm font-medium text-slate-600">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50 ${
                    notif.read ? 'bg-white' : 'bg-amber-50/50'
                  }`}
                >
                  <Link
                    href={notif.link || '#'}
                    onClick={() => {
                      markAsRead(notif.id)
                      setIsOpen(false)
                    }}
                    className="block"
                  >
                    <p className={`text-sm ${notif.read ? 'text-slate-700 font-semibold' : 'text-slate-900 font-bold'}`}>
                      {notif.title}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-slate-400 font-mono mt-2">
                      {new Date(notif.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}