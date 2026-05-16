'use client'

import { useState } from 'react'
import { changePassword } from '@/app/auth/actions'
import { Eye, EyeOff } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f0f0f',
  border: '0.5px solid #ffffff10',
  borderRadius: 12,
  padding: '11px 44px 11px 14px',
  color: '#e8e4dc',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color .15s ease',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#555',
  marginBottom: 6,
}

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    const result = await changePassword(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#141414', border: '0.5px solid #ffffff10' }}
    >
      <h2 className="text-sm font-medium mb-5" style={{ color: '#e8e4dc' }}>
        Modifier le mot de passe
      </h2>

      <form action={handleSubmit} className="space-y-4">
        {/* Mot de passe actuel */}
        <div>
          <label style={labelStyle}>Mot de passe actuel</label>
          <div className="relative">
            <input
              name="current_password"
              type={showCurrent ? 'text' : 'password'}
              required
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = '#7c6dfa40')}
              onBlur={e => (e.currentTarget.style.borderColor = '#ffffff10')}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#555' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#888')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Nouveau mot de passe */}
        <div>
          <label style={labelStyle}>Nouveau mot de passe</label>
          <div className="relative">
            <input
              name="new_password"
              type={showNew ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = '#7c6dfa40')}
              onBlur={e => (e.currentTarget.style.borderColor = '#ffffff10')}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#555' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#888')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirmation */}
        <div>
          <label style={labelStyle}>Confirmer le nouveau mot de passe</label>
          <div className="relative">
            <input
              name="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = '#7c6dfa40')}
              onBlur={e => (e.currentTarget.style.borderColor = '#ffffff10')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#555' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#888')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="px-4 py-3 rounded-[12px]"
            style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)' }}
          >
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            className="px-4 py-3 rounded-[12px]"
            style={{ background: 'rgba(29,158,117,0.08)', border: '0.5px solid rgba(29,158,117,0.2)' }}
          >
            <p className="text-sm" style={{ color: '#3dcca0' }}>
              Mot de passe mis à jour avec succès.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm font-medium text-white transition-opacity disabled:opacity-40"
          style={{ background: '#7c6dfa', borderRadius: 10, height: 44 }}
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </div>
  )
}
