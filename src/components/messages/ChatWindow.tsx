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

  const timeLabel = (date: string) =>
    new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* ── Chat header ── */}
      <div
        className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{
          height: 52,
          background: '#0d0d0d',
          borderBottom: '0.5px solid #ffffff0a',
        }}
      >
        <div
          className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: '#2a1f5a', border: '0.5px solid #7c6dfa40', color: '#9d91fb' }}
        >
          {partnerAvatar ? (
            <img src={partnerAvatar} alt={partnerUsername} className="w-full h-full object-cover" />
          ) : (
            partnerUsername.charAt(0).toUpperCase()
          )}
        </div>
        <span
          className="text-[14px] font-medium"
          style={{ color: '#e8e4dc', fontFamily: 'var(--font-dm-mono)' }}
        >
          @{partnerUsername}
        </span>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <p
            className="text-center text-[13px] py-8"
            style={{ color: '#555' }}
          >
            Commence la conversation avec @{partnerUsername} 👋
          </p>
        )}

        {messages.map(msg => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-xs lg:max-w-md px-4 py-2.5 text-sm"
                style={{
                  background: isMe ? '#7c6dfa' : '#141414',
                  border: isMe ? 'none' : '0.5px solid #ffffff10',
                  borderRadius: isMe
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  color: isMe ? '#fff' : '#e8e4dc',
                }}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: isMe ? 'rgba(255,255,255,0.5)' : '#444',
                    fontFamily: 'var(--font-dm-mono)',
                  }}
                >
                  {timeLabel(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0"
        style={{ borderTop: '0.5px solid #ffffff0a', background: '#0d0d0d' }}
      >
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={`Message à @${partnerUsername}...`}
          className="flex-1 text-sm focus:outline-none transition-all"
          style={{
            background: '#0f0f0f',
            border: '0.5px solid #ffffff10',
            borderRadius: 12,
            padding: '10px 14px',
            color: '#e8e4dc',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#7c6dfa40')}
          onBlur={e => (e.currentTarget.style.borderColor = '#ffffff10')}
        />
        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-30 text-white"
          style={{ width: 38, height: 38, background: '#7c6dfa', borderRadius: 10 }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
