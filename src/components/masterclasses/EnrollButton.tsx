'use client'

import { useState } from 'react'

type Props = {
  masterclassId: string
}

export function EnrollButton({ masterclassId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEnroll() {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterclassId }),
    })

    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    window.location.href = data.url
  }

  return (
    <div className="space-y-2">
      <button onClick={handleEnroll} disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors">
        {loading ? 'Redirection...' : "S'inscrire maintenant"}
      </button>
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      <p className="text-zinc-600 text-xs text-center">Paiement sécurisé via Stripe</p>
    </div>
  )
}