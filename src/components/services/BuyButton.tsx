'use client'

import { useState } from 'react'

type Props = {
  serviceId: string
}

export function BuyButton({ serviceId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId }),
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
    <div className="space-y-3">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
      >
        {loading ? 'Redirection...' : '💳 Commander ce service'}
      </button>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <p className="text-zinc-600 text-xs text-center">
        Paiement sécurisé via Stripe · 10% de commission plateforme
      </p>
    </div>
  )
}