import Link from 'next/link'
import { ServiceForm } from '@/components/services/ServiceForm'

export default function NewServicePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/services/manage" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Mes services
          </Link>
          <span className="text-white font-medium">Nouveau service</span>
        </div>
      </nav>
      <div className="max-w-lg mx-auto px-4 py-8">
        <ServiceForm />
      </div>
    </div>
  )
}