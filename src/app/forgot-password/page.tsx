'use client'

import { useState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/app/auth/actions'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await forgotPassword(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Tone <span className="text-violet-500">In</span>
          </h1>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-4">📬</p>
              <h2 className="text-white font-semibold text-lg mb-2">Email envoyé !</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Vérifie ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-white font-semibold text-lg mb-2">Mot de passe oublié</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Saisis ton email et on t&apos;envoie un lien de réinitialisation.
              </p>

              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-zinc-400 text-sm mb-1.5 block">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="ton@email.com"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          <Link href="/login" className="text-violet-400 hover:text-violet-300">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}