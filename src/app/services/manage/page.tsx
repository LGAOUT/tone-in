import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ServiceManagerClient } from '@/components/services/ServiceManagerClient'

export default async function ManageServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/marketplace" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Marketplace
          </Link>
          <span className="text-white font-medium">Mes services</span>
          <Link href="/services/new"
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-xl transition-colors">
            + Nouveau
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <ServiceManagerClient services={services ?? []} />
      </main>
    </div>
  )
}