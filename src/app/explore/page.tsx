import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExploreClient } from '@/components/explore/ExploreClient'
import { AppNav } from '@/components/navigation/AppNav'

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
            <AppNav currentUserId={user.id} username={currentProfile?.username} />

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
