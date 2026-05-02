import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ServiceForm } from '@/components/services/ServiceForm'

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .eq('provider_id', user.id)
    .single()

  if (!service) notFound()

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/services/manage" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Mes services
          </Link>
          <span className="text-white font-medium">Modifier le service</span>
        </div>
      </nav>
      <div className="max-w-lg mx-auto px-4 py-8">
        <ServiceForm service={service} />
      </div>
    </div>
  )
}