'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'

type Message = {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  created_at: string
  read: boolean
}

type Props = {
  currentUserId: string
  partnerId: string
  partnerUsername: string
  partnerAvatar: string | null
}

export function ChatWindow({ currentUserId, partnerId, partnerUsername, partnerAvatar }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function fetchMessages() {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),` +
        `and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true })

    if (data) setMessages(data)

    // Marque comme lus
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', currentUserId)
      .eq('read', false)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || sending) return
    setSending(true)

    const supabase = createClient()
    await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: partnerId,
      content: content.trim(),
    })

    setContent('')
    setSending(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages()

    const supabase = createClient()
    const channel = supabase
      .channel(`chat-${currentUserId}-${partnerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`,
      }, payload => {
        const msg = payload.new as Message
        if (msg.sender_id === partnerId) {
          setMessages(prev => [...prev, msg])
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${currentUserId}`,
      }, payload => {
        const msg = payload.new as Message
        if (msg.receiver_id === partnerId) {
          setMessages(prev => [...prev, msg])
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUserId, partnerId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const timeLabel = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-black flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-zinc-700 overflow-hidden">
          {partnerAvatar ? (
            <img src={partnerAvatar} alt={partnerUsername} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm">🎵</div>
          )}
        </div>
        <span className="text-white font-medium">@{partnerUsername}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-zinc-500 text-sm py-8">
            Commence la conversation avec @{partnerUsername} 👋
          </p>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                isMe
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
              }`}>
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-violet-300' : 'text-zinc-500'}`}>
                  {timeLabel(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-3 px-4 py-3 border-t border-zinc-800 bg-black flex-shrink-0">
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={`Message à @${partnerUsername}...`}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}