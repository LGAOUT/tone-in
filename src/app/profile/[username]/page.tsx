import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { ROLE_LABELS } from '@/types'
import Link from 'next/link'

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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header profil */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                🎵
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-bold">{profile.full_name || profile.username}</h1>
              <Badge level={profile.badge_level} size="sm" />
            </div>
            <p className="text-zinc-400 text-sm mb-2">@{profile.username}</p>
            {profile.role && (
              <p className="text-zinc-300 text-sm">{ROLE_LABELS[profile.role]}</p>
            )}
          </div>

          {isOwner && (
            <Link
              href="/profile/edit"
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-xl transition-colors flex-shrink-0"
            >
              Modifier
            </Link>
          )}

          {!isOwner && user && (
            <Link
              href={`/messages/${profile.id}`}
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-xl transition-colors flex-shrink-0"
            >
              Message
            </Link>
          )}

        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-zinc-300 mb-6 leading-relaxed">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-6 mb-6">
          <div className="text-center">
            <p className="text-white font-bold text-lg">{profile.posts_count}</p>
            <p className="text-zinc-500 text-xs">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">{profile.followers_count}</p>
            <p className="text-zinc-500 text-xs">Abonnés</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">{profile.following_count}</p>
            <p className="text-zinc-500 text-xs">Abonnements</p>
          </div>
        </div>

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="mb-6">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Compétences</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="bg-zinc-800 text-zinc-300 text-sm px-3 py-1 rounded-full border border-zinc-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {isOwner && (
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-500 text-xs uppercase tracking-wider">Mes services</p>
              <Link href="/services/manage" className="text-violet-400 hover:text-violet-300 text-xs transition-colors">
                Gérer →
              </Link>
            </div>
          </div>
        )}

        {profile.website_url && (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 text-sm"
          >
            🔗 {profile.website_url}
          </a>
        )}

      </div>
    </div>
  )
}