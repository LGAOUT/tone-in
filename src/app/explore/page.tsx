import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExploreClient } from '@/components/explore/ExploreClient'
import Link from 'next/link'
import { MessageCircle, Bell } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; role?: string; badge?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { q, role, badge } = await searchParams

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single()

    let query = supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, role, badge_level, skills, bio, followers_count')
        .neq('id', user.id)

    if (q) {
        query = query.or(
            `username.ilike.%${q}%,full_name.ilike.%${q}%,bio.ilike.%${q}%,role.ilike.%${q}%`
        )
    }
    if (role) {
        query = query.eq('role', role)
    }
    if (badge) {
        query = query.eq('badge_level', badge)
    }

    query = query.order('followers_count', { ascending: false }).limit(24)

    const { data: profiles } = await query

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navbar */}
            <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
                <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/feed" className="text-lg font-bold">
                        Tone <span className="text-violet-500">In</span>
                    </Link>
                    <div className="flex items-center gap-5">
                        <Link href="/messages">
                            <MessageCircle size={20} className="text-zinc-400 hover:text-white transition-colors" />
                        </Link>
                        <NotificationBell currentUserId={user.id} />
                        <Link href={`/profile/${currentProfile?.username}`}
                            className="text-zinc-300 hover:text-white text-sm transition-colors">
                            @{currentProfile?.username}
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-6">
                <ExploreClient
                    initialProfiles={profiles ?? []}
                    currentUserId={user.id}
                    initialQ={q ?? ''}
                    initialRole={role ?? ''}
                    initialBadge={badge ?? ''}
                />
            </main>
        </div>
    )
}