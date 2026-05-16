import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/navigation/AppNav'
import { MarketplaceClient } from '@/components/services/MarketplaceClient'

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; max_price?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { category, max_price } = await searchParams

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('services')
    .select(`*, profiles(id, username, full_name, avatar_url, badge_level, role)`)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (max_price) query = query.lte('price', parseFloat(max_price))

  const { data: services } = await query.limit(30)

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#e8e4dc' }}>
      <AppNav
        currentUserId={user.id}
        username={currentProfile?.username}
        avatarUrl={currentProfile?.avatar_url ?? null}
      />

      <main className="max-w-[900px] mx-auto px-4 py-6 pb-[76px] md:pb-8">
        <MarketplaceClient
          services={(services ?? []) as Parameters<typeof MarketplaceClient>[0]['services']}
        />
      </main>
    </div>
  )
}
