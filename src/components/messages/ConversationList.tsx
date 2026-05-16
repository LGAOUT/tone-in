'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  username: string
  avatar_url: string | null
}

type MessageRow = {
  id: string
  content: string
  created_at: string
  read: boolean
  sender_id: string
  receiver_id: string
  sender: Profile
  receiver: Profile
}

type Conversation = {
  partner_id: string
  partner_username: string
  partner_avatar: string | null
  last_message: string
  last_message_at: string
  unread_count: number
}

type Props = {
  currentUserId: string
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

export function ConversationList({ currentUserId }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchConversations() {
    const supabase = createClient()

    const { data: messages } = await supabase
      .from('messages')
      .select(`
        id, content, created_at, read,
        sender_id, receiver_id,
        sender:profiles!messages_sender_id_fkey(id, username, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(id, username, avatar_url)
      `)
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false })

    if (!messages) { setLoading(false); return }

    const rows = messages as unknown as MessageRow[]
    const seen = new Set<string>()
    const convos: Conversation[] = []

    for (const msg of rows) {
      const partner = msg.sender_id === currentUserId ? msg.receiver : msg.sender
      if (!partner || seen.has(partner.id)) continue
      seen.add(partner.id)

      const unread = rows.filter(m =>
        m.sender_id === partner.id &&
        m.receiver_id === currentUserId &&
        !m.read
      ).length

      convos.push({
        partner_id: partner.id,
        partner_username: partner.username,
        partner_avatar: partner.avatar_url,
        last_message: msg.content,
        last_message_at: msg.created_at,
        unread_count: unread,
      })
    }

    setConversations(convos)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversations()

    const supabase = createClient()
    const channel = supabase
      .channel('messages-list')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`,
      }, () => fetchConversations())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUserId])

  if (loading) return (
    <div className="px-4 py-6">
      <p className="text-sm" style={{ color: '#555' }}>Chargement...</p>
    </div>
  )

  if (conversations.length === 0) return (
    <div className="text-center py-16 px-4">
      <p className="text-3xl mb-3">💬</p>
      <p className="text-sm" style={{ color: '#888' }}>Aucune conversation pour l&apos;instant.</p>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div
        className="px-4 py-4"
        style={{ borderBottom: '0.5px solid #ffffff0a' }}
      >
        <p className="text-[15px] font-medium" style={{ color: '#e8e4dc' }}>Messages</p>
      </div>

      {conversations.map(conv => (
        <Link
          key={conv.partner_id}
          href={`/messages/${conv.partner_id}`}
          className="flex items-center gap-3 px-4 py-3.5 transition-colors"
          style={{ borderBottom: '0.5px solid #ffffff08' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#ffffff06')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {/* Avatar */}
          <div
            className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold"
            style={{ background: '#2a1f5a', border: '0.5px solid #7c6dfa40', color: '#9d91fb' }}
          >
            {conv.partner_avatar ? (
              <img src={conv.partner_avatar} alt={conv.partner_username} className="w-full h-full object-cover" />
            ) : (
              conv.partner_username.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span
                className="text-[14px] font-medium"
                style={{ color: '#e8e4dc', fontFamily: 'var(--font-dm-mono)' }}
              >
                @{conv.partner_username}
              </span>
              <span
                className="text-[10px] flex-shrink-0"
                style={{ color: '#444', fontFamily: 'var(--font-dm-mono)' }}
              >
                {timeAgo(conv.last_message_at)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] truncate" style={{ color: '#555' }}>
                {conv.last_message}
              </p>
              {conv.unread_count > 0 && (
                <span
                  className="flex items-center justify-center text-[10px] font-medium text-white rounded-full flex-shrink-0"
                  style={{ width: 18, height: 18, background: '#7c6dfa', fontFamily: 'var(--font-dm-mono)' }}
                >
                  {conv.unread_count > 9 ? '9+' : conv.unread_count}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
