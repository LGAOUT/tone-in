'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toggleServiceStatus, deleteService } from '@/app/services/actions'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  mixing: '🎚️ Mixage',
  mastering: '💿 Mastering',
  production: '🎛️ Production',
  beatmaking: '🥁 Beatmaking',
  songwriting: '✍️ Songwriting',
  recording: '🎙️ Recording',
  lessons: '🎓 Cours',
  arrangement: '🎼 Arrangement',
  graphic: '🎨 Graphisme',
  other: '💼 Autre',
}

type Service = {
  id: string
  title: string
  category: string
  price: number
  delivery_days: number
  active: boolean
  orders_count: number
}

export function ServiceManagerClient({ services: initial }: { services: Service[] }) {
  const [services, setServices] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleToggle(id: string, active: boolean) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !active } : s))
    await toggleServiceStatus(id, active)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce service définitivement ?')) return
    setDeleting(id)
    await deleteService(id)
    setServices(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }

  if (services.length === 0) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-4">🎵</p>
      <p className="text-zinc-400 mb-2">Tu n&apos;as pas encore de services.</p>
      <Link href="/services/new"
        className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
        Créer mon premier service →
      </Link>
    </div>
  )

  return (
    <div className="space-y-4">
      {services.map(service => (
        <div key={service.id}
          className={`bg-zinc-900 border rounded-2xl p-4 transition-colors ${
            service.active ? 'border-zinc-800' : 'border-zinc-800 opacity-60'
          }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  service.active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-zinc-700 text-zinc-500'
                }`}>
                  {service.active ? 'Actif' : 'Inactif'}
                </span>
                <span className="text-zinc-500 text-xs">{CATEGORY_LABELS[service.category]}</span>
              </div>
              <h3 className="text-white font-medium text-sm truncate">{service.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-violet-400 font-bold text-sm">{service.price} €</span>
                <span className="text-zinc-600 text-xs">⏱ {service.delivery_days}j</span>
                <span className="text-zinc-600 text-xs">{service.orders_count} commande{service.orders_count !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => handleToggle(service.id, service.active)}
                className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors">
                {service.active ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <Link href={`/services/edit/${service.id}`}
                className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors">
                <Pencil size={16} />
              </Link>
              <button onClick={() => handleDelete(service.id)}
                disabled={deleting === service.id}
                className="text-zinc-400 hover:text-red-400 p-2 rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}