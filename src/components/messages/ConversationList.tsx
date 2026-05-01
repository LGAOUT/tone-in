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

    // Cast pour corriger le typage Supabase
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

  if (loading) return <p className="text-zinc-500 text-sm p-4">Chargement...</p>

  if (conversations.length === 0) return (
    <div className="text-center py-16">
      <p className="text-3xl mb-3">💬</p>
      <p className="text-zinc-400 text-sm">Aucune conversation pour l'instant.</p>
    </div>
  )

  return (
    <div>
      {conversations.map(conv => (
        <Link
          key={conv.partner_id}
          href={`/messages/${conv.partner_id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition-colors border-b border-zinc-800"
        >
          <div className="w-11 h-11 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
            {conv.partner_avatar ? (
              <img src={conv.partner_avatar} alt={conv.partner_username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm">🎵</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium text-sm">@{conv.partner_username}</span>
              {conv.unread_count > 0 && (
                <span className="bg-violet-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {conv.unread_count}
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-xs truncate mt-0.5">{conv.last_message}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}