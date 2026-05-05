import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { MasterclassEditClient } from '@/components/masterclasses/MasterclassEditClient'

export default async function EditMasterclassPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: mc } = await supabase
    .from('masterclasses')
    .select('*')
    .eq('id', id)
    .eq('instructor_id', user.id)
    .single()

  if (!mc) notFound()

  const { data: chapters } = await supabase
    .from('masterclass_chapters')
    .select('*')
    .eq('masterclass_id', id)
    .order('position', { ascending: true })

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/masterclasses/${id}`}
            className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Voir la masterclass
          </Link>
          <span className="text-white font-medium">Gérer les chapitres</span>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <MasterclassEditClient mc={mc} initialChapters={chapters ?? []} />
      </div>
    </div>
  )
}