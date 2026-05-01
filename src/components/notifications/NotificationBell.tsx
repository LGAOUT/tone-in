'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Notification = {
  id: string
  type: 'follow' | 'message' | 'like' | 'comment'
  read: boolean
  created_at: string
  from_user_id: string
  post_id: string | null
  profiles: {
    username: string
    avatar_url: string | null
  }
}

type Props = {
  currentUserId: string
}

const NOTIF_LABELS: Record<string, string> = {
  follow: 'commence à te suivre',
  message: "t'a envoyé un message",
  like: 'a aimé ton post',
  comment: 'a commenté ton post',
}

export function NotificationBell({ currentUserId }: Props) {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const unreadCount = notifs.filter(n => !n.read).length

  async function fetchNotifs() {
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select(`
        id, type, read, created_at, from_user_id, post_id,
        profiles!notifications_from_user_id_fkey(username, avatar_url)
      `)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setNotifs(data as unknown as Notification[])
  }

  async function markAllRead() {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', currentUserId)
      .eq('read', false)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  function getHref(notif: Notification) {
    if (notif.type === 'message') return `/messages/${notif.from_user_id}`
    return `/profile/${notif.profiles?.username}`
  }

  function handleNotifClick(notif: Notification) {
    setOpen(false)
    router.push(getHref(notif))
  }

  useEffect(() => {
    fetchNotifs()

    const supabase = createClient()
    const channel = supabase
      .channel('notifs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUserId}`,
      }, () => fetchNotifs())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUserId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}j`
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead() }}
        className="relative"
      >
        <Bell size={20} className="text-zinc-400 hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-80 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-white font-medium text-sm">Notifications</p>
          </div>

          {notifs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-zinc-500 text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifs.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0 cursor-pointer ${
                    !notif.read ? 'bg-zinc-800/50' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
                    {notif.profiles?.avatar_url ? (
                      <img src={notif.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">🎵</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200">
                      <span className="text-white font-medium">@{notif.profiles?.username}</span>
                      {' '}{NOTIF_LABELS[notif.type]}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}