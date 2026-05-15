'use client'

import { useState, useRef } from 'react'
import { toggleGroupMember, createGroupPost } from '@/app/groups/actions'
import { AudioPlayer } from '@/components/ui/AudioPlayer'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { UserPlus, UserCheck, ImageIcon, Music, X } from 'lucide-react'

type Group = {
  id: string
  name: string
  description: string | null
  members_count: number
  posts_count: number
}

type Member = {
  profiles: { id: string; avatar_url: string | null } | null
}

type GroupPost = {
  id: string
  content: string | null
  media_url: string | null
  media_type: string | null
  created_at: string
  profiles: { username: string; full_name: string | null; avatar_url: string | null; badge_level: string } | null
}

type Props = {
  group: Group
  isMember: boolean
  isAdmin: boolean
  initialPosts: GroupPost[]
  members: Member[]
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

export function GroupClient({ group, isMember: initMember, isAdmin, initialPosts, members }: Props) {
  const [isMember, setIsMember] = useState(initMember)
  const [membersCount, setMembersCount] = useState(group.members_count)
  const [posts] = useState(initialPosts)
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState('')
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)

  async function handleToggleMember() {
    setIsMember(!isMember)
    setMembersCount(isMember ? membersCount - 1 : membersCount + 1)
    await toggleGroupMember(group.id)
  }

  async function handleUpload(file: File, type: 'image' | 'audio') {
    setUploading(true)
    const preset = type === 'image'
      ? process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      : process.env.NEXT_PUBLIC_CLOUDINARY_AUDIO_PRESET!
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', preset)
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    setMediaUrl(data.secure_url)
    setMediaType(type)
    setUploading(false)
  }

  async function handlePost(formData: FormData) {
    if (!content.trim() && !mediaUrl) return
    setPosting(true)
    formData.set('group_id', group.id)
    formData.set('media_url', mediaUrl)
    formData.set('media_type', mediaType)
    await createGroupPost(formData)
    setContent('')
    setMediaUrl('')
    setMediaType('')
    setPosting(false)
  }

  return (
    <div>
      {/* Header groupe */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold mb-1">{group.name}</h1>
            {group.description && (
              <p className="text-zinc-400 text-sm">{group.description}</p>
            )}
          </div>
          {!isAdmin && (
            <button onClick={handleToggleMember}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-colors flex-shrink-0 ${
                isMember
                  ? 'border-zinc-600 text-zinc-400 hover:border-red-500 hover:text-red-400'
                  : 'border-violet-500 text-violet-400 hover:bg-violet-500/10'
              }`}>
              {isMember ? <UserCheck size={15} /> : <UserPlus size={15} />}
              {isMember ? 'Membre' : 'Rejoindre'}
            </button>
          )}
        </div>
        <p className="text-zinc-600 text-xs">{membersCount} membre{membersCount !== 1 ? 's' : ''} · {group.posts_count} post{group.posts_count !== 1 ? 's' : ''}</p>

        {/* Aperçu membres */}
        {members.length > 0 && (
          <div className="flex items-center gap-1 mt-3">
            {members.slice(0, 6).map((m) => (
              <div key={m.profiles?.id} className="w-7 h-7 rounded-full bg-zinc-700 overflow-hidden -ml-1 first:ml-0 border border-zinc-900">
                {m.profiles?.avatar_url ? (
                  <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs">🎵</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Créer un post — membres seulement */}
      {isMember && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
          <form action={handlePost} className="space-y-3">
            <textarea name="content" value={content} onChange={e => setContent(e.target.value)}
              placeholder={`Partage quelque chose dans ${group.name}...`} rows={3}
              className="w-full bg-transparent text-white placeholder-zinc-500 text-sm resize-none focus:outline-none" />

            {mediaUrl && mediaType === 'image' && (
              <div className="relative inline-block">
                <img src={mediaUrl} alt="" className="max-h-40 rounded-xl object-cover" />
                <button type="button" onClick={() => { setMediaUrl(''); setMediaType('') }}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                  <X size={14} className="text-white" />
                </button>
              </div>
            )}

            {mediaUrl && mediaType === 'audio' && (
              <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2">
                <Music size={16} className="text-violet-400" />
                <span className="text-zinc-300 text-xs flex-1">Audio prêt</span>
                <button type="button" onClick={() => { setMediaUrl(''); setMediaType('') }}>
                  <X size={14} className="text-zinc-500" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <div className="flex gap-4">
                <button type="button" onClick={() => imageRef.current?.click()}
                  className="text-zinc-400 hover:text-violet-400 transition-colors">
                  <ImageIcon size={18} />
                </button>
                <input ref={imageRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'image')} />
                <button type="button" onClick={() => audioRef.current?.click()}
                  className="text-zinc-400 hover:text-violet-400 transition-colors">
                  <Music size={18} />
                </button>
                <input ref={audioRef} type="file" accept="audio/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'audio')} />
                {uploading && <span className="text-zinc-500 text-xs">Upload...</span>}
              </div>
              <button type="submit" disabled={posting || uploading || (!content.trim() && !mediaUrl)}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm px-4 py-1.5 rounded-xl transition-colors">
                {posting ? '...' : 'Publier'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">🎵</p>
          <p className="text-zinc-400 text-sm">
            {isMember ? 'Sois le premier à poster !' : 'Rejoins le groupe pour voir les posts.'}
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
            <Link href={`/profile/${post.profiles?.username}`} className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-zinc-700 overflow-hidden">
                {post.profiles?.avatar_url ? (
                  <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">🎵</div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">
                    {post.profiles?.full_name || post.profiles?.username}
                  </span>
                  <Badge level={post.profiles?.badge_level} size="sm" />
                </div>
                <span className="text-zinc-500 text-xs">{timeAgo(post.created_at)}</span>
              </div>
            </Link>

            {post.content && <p className="text-zinc-200 text-sm leading-relaxed mb-3">{post.content}</p>}
            {post.media_url && post.media_type === 'image' && (
              <img src={post.media_url} alt="" className="w-full rounded-xl object-cover max-h-80 mb-3" />
            )}
            {post.media_url && post.media_type === 'audio' && (
              <div className="mb-3"><AudioPlayer url={post.media_url} /></div>
            )}
          </div>
        ))
      )}
    </div>
  )
}