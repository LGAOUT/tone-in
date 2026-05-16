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

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead() }}
        className="relative flex items-center justify-center w-8 h-8 rounded-[9px] transition-all"
        style={{ color: '#888' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#ffffff0a'; e.currentTarget.style.color = '#e8e4dc' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888' }}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 rounded-full"
            style={{ width: 6, height: 6, background: '#7c6dfa' }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ background: '#141414', border: '0.5px solid #ffffff10' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '0.5px solid #ffffff0a' }}>
            <p className="text-sm font-medium" style={{ color: '#e8e4dc' }}>Notifications</p>
          </div>

          {notifs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: '#555' }}>Aucune notification</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifs.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    borderBottom: '0.5px solid #ffffff08',
                    background: !notif.read ? 'rgba(124,109,250,0.04)' : 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#ffffff06')}
                  onMouseLeave={e => (e.currentTarget.style.background = !notif.read ? 'rgba(124,109,250,0.04)' : 'transparent')}
                >
                  <div
                    className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold"
                    style={{ background: '#2a1f5a', border: '0.5px solid #7c6dfa40', color: '#9d91fb' }}
                  >
                    {notif.profiles?.avatar_url ? (
                      <img src={notif.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (notif.profiles?.username ?? '?').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: '#c8c4bc' }}>
                      <span className="font-medium" style={{ color: '#e8e4dc' }}>@{notif.profiles?.username}</span>
                      {' '}{NOTIF_LABELS[notif.type]}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#555', fontFamily: 'var(--font-dm-mono)' }}>{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.read && (
                    <div className="rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: '#7c6dfa' }} />
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