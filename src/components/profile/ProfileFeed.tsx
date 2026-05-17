'use client'

import { useState } from 'react'
import { AudioPlayer } from '@/components/ui/AudioPlayer'
import { Heart, MessageCircle, Globe, Lock, Trash2 } from 'lucide-react'
import { toggleLike, addComment } from '@/app/posts/actions'
import { deletePost } from '@/app/posts/actions'

type Post = {
  id: string
  content: string | null
  media_url: string | null
  media_type: string | null
  is_private: boolean
  likes_count: number
  comments_count: number
  created_at: string
}

type Props = {
  posts: Post[]
  currentUserId: string
  profileUserId: string
  likedPostIds: string[]
}

export function ProfileFeed({ posts, currentUserId, profileUserId, likedPostIds }: Props) {
  const [localPosts, setLocalPosts] = useState(posts)
  const [liked, setLiked] = useState<Set<string>>(new Set(likedPostIds))

  const isOwner = currentUserId === profileUserId

  async function handleLike(postId: string) {
    const wasLiked = liked.has(postId)
    const newLiked = new Set(liked)
    if (wasLiked) newLiked.delete(postId)
    else newLiked.add(postId)
    setLiked(newLiked)
    setLocalPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes_count: wasLiked ? p.likes_count - 1 : p.likes_count + 1 }
        : p
    ))
    await toggleLike(postId)
  }

  async function handleDelete(postId: string) {
    if (!confirm('Supprimer ce post ?')) return
    await deletePost(postId)
    setLocalPosts(prev => prev.filter(p => p.id !== postId))
  }

  async function handleComment(formData: FormData, postId: string) {
    formData.set('post_id', postId)
    await addComment(formData)
    setLocalPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
    ))
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}j`
  }

  if (localPosts.length === 0) return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3">🎵</p>
      <p style={{ color: '#555', fontSize: '14px' }}>Aucun post pour l'instant.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {localPosts.map(post => (
        <div key={post.id} style={{
          background: '#141414',
          border: '0.5px solid #ffffff10',
          borderRadius: '16px',
          padding: '16px',
        }}>
          {/* Badge privé/public */}
          {isOwner && (
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-xs"
                style={{ color: post.is_private ? '#9d91fb' : '#444' }}>
                {post.is_private ? <Lock size={12} /> : <Globe size={12} />}
                {post.is_private ? 'Abonnés uniquement' : 'Public'}
              </span>
              <button onClick={() => handleDelete(post.id)}
                className="transition-colors" style={{ color: '#444' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e87aaa')}
                onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
                <Trash2 size={15} />
              </button>
            </div>
          )}

          {/* Contenu */}
          {post.content && (
            <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap"
              style={{ color: '#e8e4dc' }}>
              {post.content}
            </p>
          )}

          {post.media_url && post.media_type === 'image' && (
            <img src={post.media_url} alt="media"
              className="w-full rounded-xl object-cover max-h-96 mb-3" />
          )}

          {post.media_url && post.media_type === 'audio' && (
            <div className="mb-3"><AudioPlayer url={post.media_url} /></div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-5 pt-3"
            style={{ borderTop: '0.5px solid #ffffff10' }}>
            <button onClick={() => handleLike(post.id)}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: liked.has(post.id) ? '#e87aaa' : '#555' }}>
              <Heart size={17} fill={liked.has(post.id) ? 'currentColor' : 'none'} />
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}>
                {post.likes_count}
              </span>
            </button>

            <span className="flex items-center gap-1.5 text-sm" style={{ color: '#555' }}>
              <MessageCircle size={17} />
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}>
                {post.comments_count}
              </span>
            </span>

            <span className="ml-auto text-xs" style={{
              color: '#444',
              fontFamily: 'var(--font-dm-mono)',
            }}>
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}