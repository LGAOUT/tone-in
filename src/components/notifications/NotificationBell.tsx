'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'

type Props = {
  currentUserId: string
}

export function NotificationBell({ currentUserId }: Props) {
  const [unreadMessages, setUnreadMessages] = useState(0)

  async function fetchUnread() {
    const supabase = createClient()
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', currentUserId)
      .eq('read', false)

    setUnreadMessages(count ?? 0)
  }

  useEffect(() => {
    fetchUnread()

    const supabase = createClient()
    const channel = supabase
      .channel('notif-bell')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`,
      }, () => fetchUnread())
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`,
      }, () => fetchUnread())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUserId])

  return (
    <div className="relative">
      <Bell size={20} className="text-zinc-400 hover:text-white transition-colors cursor-pointer" />
      {unreadMessages > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
          {unreadMessages > 9 ? '9+' : unreadMessages}
        </span>
      )}
    </div>
  )
}