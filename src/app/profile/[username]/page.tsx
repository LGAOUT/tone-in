import { createClient } from '@/lib/supabase/server'
import { ProfileFeed } from '@/components/profile/ProfileFeed'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { ROLE_LABELS } from '@/types'
import { AppNav } from '@/components/navigation/AppNav'
import Link from 'next/link'
import { ExternalLink, Edit2 } from 'lucide-react'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === profile.id

  const { data: currentProfile } = user
    ? await supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
    : { data: null }
  const { data: posts } = await supabase
    .from('posts')
    .select('id, content, media_url, media_type, is_private, likes_count, comments_count, created_at')
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })

  const { data: userLikes } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user?.id ?? '')

  const likedPostIds = userLikes?.map(l => l.post_id) ?? []
  const MUSIC_ROLES = ['musician', 'producer', 'beatmaker', 'songwriter']
  const isMusicRole = MUSIC_ROLES.includes(profile.role ?? '')

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#e8e4dc' }}>
      {user && (
        <AppNav
          currentUserId={user.id}
          username={currentProfile?.username}
          avatarUrl={currentProfile?.avatar_url ?? null}
        />
      )}

      <main className="max-w-2xl mx-auto px-4 py-8 pb-[76px] md:pb-12">

        {/* ── Profile header ── */}
        <div className="flex items-start gap-5 mb-6">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl font-bold"
            style={isMusicRole
              ? { background: '#2a1f5a', border: '1.5px solid #7c6dfa40', color: '#9d91fb' }
              : { background: '#1e1e1e', border: '1.5px solid #ffffff10', color: '#888' }
            }
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              (profile.full_name || profile.username).charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1 className="text-[20px] font-medium" style={{ color: '#e8e4dc' }}>
                {profile.full_name || profile.username}
              </h1>
              <Badge level={profile.badge_level} size="sm" />
            </div>
            <p
              className="text-[13px] mb-1"
              style={{ color: '#888', fontFamily: 'var(--font-dm-mono)' }}
            >
              @{profile.username}
            </p>
            {profile.role && (
              <p className="text-[12px]" style={{ color: '#555' }}>
                {ROLE_LABELS[profile.role]}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isOwner && (
              <Link
                href="/profile/edit"
                className="hover-border flex items-center gap-1.5 text-[13px] px-3 rounded-[9px]"
                style={{
                  height: 34,
                  background: '#1a1a1a',
                  border: '0.5px solid #ffffff10',
                  color: '#888',
                }}
              >
                <Edit2 size={13} />
                Modifier
              </Link>
            )}
            {!isOwner && user && (
              <Link
                href={`/messages/${profile.id}`}
                className="flex items-center text-[13px] font-medium px-4 rounded-[9px] text-white transition-opacity hover:opacity-85"
                style={{ height: 34, background: '#7c6dfa' }}
              >
                Message
              </Link>
            )}
          </div>
        </div>

        {/* ── Bio ── */}
        {profile.bio && (
          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: '#c8c4bc' }}
          >
            {profile.bio}
          </p>
        )}

        {/* ── Stats ── */}
        <div
          className="flex gap-6 mb-6 pb-6"
          style={{ borderBottom: '0.5px solid #ffffff0a' }}
        >
          {[
            { value: profile.posts_count, label: 'Posts' },
            { value: profile.followers_count, label: 'Abonnés' },
            { value: profile.following_count, label: 'Abonnements' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-[18px] font-medium" style={{ color: '#e8e4dc' }}>{value}</p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: '#555', fontFamily: 'var(--font-dm-mono)' }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Skills ── */}
        {profile.skills?.length > 0 && (
          <div className="mb-6">
            <p
              className="text-[11px] uppercase tracking-widest mb-3"
              style={{ color: '#333', fontFamily: 'var(--font-dm-mono)' }}
            >
              Compétences
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="text-[12px] px-3 py-1 rounded-full"
                  style={{
                    background: '#1e1e1e',
                    color: '#888',
                    border: '0.5px solid #ffffff10',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Website ── */}
        {profile.website_url && (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-violet inline-flex items-center gap-1.5 text-[13px] mb-6"
            style={{ color: '#9d91fb' }}
          >
            <ExternalLink size={13} />
            {profile.website_url.replace(/^https?:\/\//, '')}
          </a>
        )}

        {/* Séparateur */}
        <div className="mt-6 pt-6" style={{ borderTop: '0.5px solid #ffffff10' }}>
          <p className="text-xs uppercase tracking-wider mb-4" style={{ color: '#444' }}>
            Posts
          </p>
          <ProfileFeed
            posts={posts ?? []}
            currentUserId={user?.id ?? ''}
            profileUserId={profile.id}
            likedPostIds={likedPostIds}
          />
        </div>

        {/* ── Owner — link to services ── */}
        {isOwner && (
          <div
            className="mt-2 pt-5"
            style={{ borderTop: '0.5px solid #ffffff0a' }}
          >
            <div className="flex items-center justify-between">
              <p
                className="text-[11px] uppercase tracking-widest"
                style={{ color: '#333', fontFamily: 'var(--font-dm-mono)' }}
              >
                Mes services
              </p>
              <Link
                href="/services/manage"
                className="hover-violet text-[12px]"
                style={{ color: '#9d91fb' }}
              >
                Gérer →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
