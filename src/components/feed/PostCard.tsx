'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, UserPlus, UserCheck, Share2, Bookmark, MoreHorizontal } from 'lucide-react'
import { toggleLike, addComment, toggleFollow } from '@/app/posts/actions'
import { Badge } from '@/components/ui/Badge'
import { AudioPlayer } from '@/components/ui/AudioPlayer'

type Post = {
  id: string
  content: string | null
  media_url: string | null
  media_type: string | null
  likes_count: number
  comments_count: number
  created_at: string
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    badge_level: string
    role: string | null
  }
}

type Props = {
  post: Post
  currentUserId: string
  isLiked: boolean
  isFollowing: boolean
}

const MUSIC_ROLES = ['musician', 'producer', 'beatmaker', 'songwriter']

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

function getTrackName(url: string) {
  try {
    const parts = new URL(url).pathname.split('/')
    const filename = parts[parts.length - 1]
    return decodeURIComponent(filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
  } catch {
    return 'Audio Track'
  }
}

export function PostCard({ post, currentUserId, isLiked, isFollowing }: Props) {
  const [liked, setLiked] = useState(isLiked)
  const [likes, setLikes] = useState(post.likes_count)
  const [following, setFollowing] = useState(isFollowing)
  const [showComments, setShowComments] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const isOwner = post.profiles.id === currentUserId
  const isMusicUser = MUSIC_ROLES.includes(post.profiles.role ?? '')

  async function handleLike() {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
    await toggleLike(post.id)
  }

  async function handleFollow() {
    setFollowing(!following)
    await toggleFollow(post.profiles.id)
  }

  async function handleComment(formData: FormData) {
    setCommenting(true)
    formData.set('post_id', post.id)
    await addComment(formData)
    setCommenting(false)
    setShowComments(true)
  }

  return (
    <div
      className="rounded-2xl mb-3"
      style={{ background: '#141414', border: '0.5px solid #ffffff10', padding: 18 }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-3">
        <Link href={`/profile/${post.profiles.username}`} className="flex items-center gap-3 min-w-0">
          {/* Avatar — purple tint for music roles */}
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold"
            style={isMusicUser
              ? { background: 'rgba(124,109,250,0.12)', border: '1.5px solid rgba(124,109,250,0.25)', color: '#9d91fb' }
              : { background: '#1e1e1e', border: '1.5px solid rgba(255,255,255,0.06)', color: '#888' }
            }
          >
            {post.profiles.avatar_url
              ? <img src={post.profiles.avatar_url} alt={post.profiles.username} className="w-full h-full object-cover" />
              : (post.profiles.full_name || post.profiles.username).charAt(0).toUpperCase()
            }
          </div>

          {/* Name / badge / handle / timestamp */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium" style={{ color: '#e8e4dc' }}>
                {post.profiles.full_name || post.profiles.username}
              </span>
              <Badge level={post.profiles.badge_level} size="sm" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs" style={{ color: '#888' }}>@{post.profiles.username}</span>
              <span className="text-xs" style={{ color: '#444' }}>·</span>
              <span className="text-[11px]" style={{ color: '#444', fontFamily: 'var(--font-dm-mono)' }}>
                {timeAgo(post.created_at)}
              </span>
            </div>
          </div>
        </Link>

        {!isOwner && (
          <button
            onClick={handleFollow}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[9px] transition-all"
            style={{
              border: `0.5px solid ${following ? 'rgba(124,109,250,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: following ? '#9d91fb' : '#888',
              background: following ? 'rgba(124,109,250,0.08)' : 'transparent',
            }}
          >
            {following ? <UserCheck size={13} /> : <UserPlus size={13} />}
            {following ? 'Abonné' : 'Suivre'}
          </button>
        )}
      </div>

      {/* ── Genre / mood tags (audio posts) ── */}
      {post.media_type === 'audio' && (
        <div className="flex items-center gap-2 mb-3">
          {['Lo-fi', 'Chill'].map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: 'rgba(124,109,250,0.08)', color: '#9d91fb', border: '0.5px solid rgba(124,109,250,0.15)' }}
            >
              {tag}
            </span>
          ))}
          <span
            className="px-2 py-0.5 rounded-full text-[10px]"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#888', border: '0.5px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-dm-mono)' }}
          >
            90 BPM
          </span>
        </div>
      )}

      {/* ── Content ── */}
      {post.content && (
        <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap" style={{ color: '#e8e4dc' }}>
          {post.content}
        </p>
      )}

      {/* ── Image ── */}
      {post.media_url && post.media_type === 'image' && (
        <img
          src={post.media_url}
          alt="media"
          className="w-full rounded-xl object-cover max-h-96 mb-3"
        />
      )}

      {/* ── Audio player ── */}
      {post.media_url && post.media_type === 'audio' && (
        <div className="mb-3">
          <AudioPlayer url={post.media_url} trackName={getTrackName(post.media_url)} />
        </div>
      )}

      {/* ── Footer actions ── */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-4">
          {/* Like — turns pink with bg/border */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-sm transition-all px-2 py-1 rounded-[7px]"
            style={liked
              ? { color: '#e87aaa', background: '#d4537e12', border: '0.5px solid #d4537e20' }
              : { color: '#888', background: 'transparent', border: '0.5px solid transparent' }
            }
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{likes}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: showComments ? '#9d91fb' : '#888' }}
          >
            <MessageCircle size={17} />
            <span>{post.comments_count}</span>
          </button>

          {/* Share */}
          <button
            className="flex items-center gap-1.5 text-sm transition-colors hover:text-[#e8e4dc]"
            style={{ color: '#888' }}
          >
            <Share2 size={17} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Bookmark */}
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className="transition-colors"
            style={{ color: bookmarked ? '#9d91fb' : '#888' }}
          >
            <Bookmark size={17} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>

          {/* More */}
          <button className="transition-colors hover:text-[#e8e4dc]" style={{ color: '#444' }}>
            <MoreHorizontal size={17} />
          </button>
        </div>
      </div>

      {/* ── Comment zone ── */}
      {showComments && (
        <div className="mt-3 pt-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
          <form action={handleComment} className="flex gap-2">
            <input
              name="content"
              type="text"
              placeholder="Ajouter un commentaire..."
              className="flex-1 text-sm focus:outline-none transition-colors"
              style={{
                background: '#0f0f0f',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 9,
                padding: '8px 12px',
                color: '#e8e4dc',
              }}
            />
            <button
              type="submit"
              disabled={commenting}
              className="text-sm font-medium px-4 py-2 transition-colors disabled:opacity-40 text-white"
              style={{ background: '#7c6dfa', borderRadius: 9 }}
            >
              {commenting ? '...' : 'Envoyer'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
