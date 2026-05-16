'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/app/auth/actions'
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm'
import type { Profile } from '@/types'
import { ChevronDown, Check, Camera } from 'lucide-react'

const ROLES = [
  { value: 'musician',    label: 'Musicien' },
  { value: 'producer',    label: 'Producteur' },
  { value: 'beatmaker',   label: 'Beatmaker' },
  { value: 'songwriter',  label: 'Songwriter' },
  { value: 'teacher',     label: 'Professeur' },
  { value: 'learner',     label: 'Apprenant' },
]

const BADGES = [
  { value: 'beginner',      label: 'Débutant' },
  { value: 'intermediate',  label: 'Intermédiaire' },
  { value: 'advanced',      label: 'Avancé' },
  { value: 'expert',        label: 'Expert' },
]

// ── Shared input style ──
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f0f0f',
  border: '0.5px solid #ffffff10',
  borderRadius: 12,
  padding: '11px 14px',
  color: '#e8e4dc',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color .15s ease',
}

type FieldSelectProps = {
  name: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

function FieldSelect({ name, value, onChange, options, placeholder }: FieldSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-sm transition-all"
        style={{
          ...inputStyle,
          padding: '11px 14px',
          color: selected ? '#e8e4dc' : '#555',
          border: `0.5px solid ${open ? '#7c6dfa40' : '#ffffff10'}`,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span>{selected?.label ?? placeholder ?? 'Choisir...'}</span>
        <ChevronDown
          size={14}
          style={{
            color: open ? '#9d91fb' : '#555',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform .15s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 py-1 z-20 rounded-[12px] shadow-xl overflow-hidden"
          style={{ background: '#1a1a1a', border: '0.5px solid #ffffff10' }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="flex items-center justify-between w-full px-4 py-2.5 text-[13px] transition-colors text-left"
              style={{ color: value === opt.value ? '#9d91fb' : '#888' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#ffffff08')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {opt.label}
              {value === opt.value && <Check size={12} style={{ color: '#9d91fb' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#555',
  marginBottom: 6,
}

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [roleValue, setRoleValue] = useState('')
  const [badgeValue, setBadgeValue] = useState('beginner')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (p) {
        setProfile(p)
        setAvatarUrl(p.avatar_url ?? '')
        setRoleValue(p.role ?? '')
        setBadgeValue(p.badge_level ?? 'beginner')
      }
      setLoading(false)
    })
  }, [router])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    setAvatarUrl(data.secure_url)
    setUploading(false)
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    formData.set('avatar_url', avatarUrl)
    const result = await updateProfile(formData)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
    } else {
      router.push(`/profile/${formData.get('username')}`)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <p className="text-sm" style={{ color: '#555' }}>Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#e8e4dc' }}>
      <div className="max-w-lg mx-auto px-4 py-8 pb-12">
        <h1 className="text-[20px] font-medium mb-8" style={{ color: '#e8e4dc' }}>
          Modifier mon profil
        </h1>

        {/* ── Avatar ── */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl font-bold relative cursor-pointer group"
            style={{ background: '#2a1f5a', border: '0.5px solid #7c6dfa40', color: '#9d91fb' }}
            onClick={() => fileRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              (profile?.full_name || profile?.username || '?').charAt(0).toUpperCase()
            )}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <Camera size={18} className="text-white" />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-[13px] px-4 rounded-[9px] transition-all"
              style={{
                height: 34,
                background: '#1a1a1a',
                border: '0.5px solid #ffffff10',
                color: '#888',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#ffffff1e'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#ffffff10'}
            >
              {uploading ? 'Envoi...' : 'Changer la photo'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>

        <form action={handleSubmit} className="space-y-5">
          {/* Nom complet */}
          <div>
            <label style={labelStyle}>Nom complet</label>
            <input
              name="full_name"
              type="text"
              defaultValue={profile?.full_name ?? ''}
              style={inputStyle}
              placeholder="Ton nom..."
              onFocus={e => (e.currentTarget.style.borderColor = '#7c6dfa40')}
              onBlur={e => (e.currentTarget.style.borderColor = '#ffffff10')}
            />
          </div>

          {/* Username */}
          <div>
            <label style={labelStyle}>Nom d&apos;utilisateur</label>
            <input
              name="username"
              type="text"
              required
              defaultValue={profile?.username ?? ''}
              style={inputStyle}
              placeholder="@handle"
              onFocus={e => (e.currentTarget.style.borderColor = '#7c6dfa40')}
              onBlur={e => (e.currentTarget.style.borderColor = '#ffffff10')}
            />
          </div>

          {/* Bio */}
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={profile?.bio ?? ''}
              placeholder="Parle de toi, de ton style, de tes influences..."
              className="resize-none focus:outline-none transition-all"
              style={{ ...inputStyle, padding: '11px 14px' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#7c6dfa40')}
              onBlur={e => (e.currentTarget.style.borderColor = '#ffffff10')}
            />
          </div>

          {/* Rôle — custom dropdown */}
          <div>
            <label style={labelStyle}>Rôle</label>
            <FieldSelect
              name="role"
              value={roleValue}
              onChange={setRoleValue}
              options={ROLES}
              placeholder="Choisis ton rôle"
            />
          </div>

          {/* Niveau — custom dropdown */}
          <div>
            <label style={labelStyle}>Niveau</label>
            <FieldSelect
              name="badge_level"
              value={badgeValue}
              onChange={setBadgeValue}
              options={BADGES}
              placeholder="Choisis ton niveau"
            />
          </div>

          {/* Skills */}
          <div>
            <label style={labelStyle}>
              Compétences{' '}
              <span style={{ color: '#444' }}>(séparées par des virgules)</span>
            </label>
            <input
              name="skills"
              type="text"
              defaultValue={profile?.skills?.join(', ') ?? ''}
              placeholder="Mixage, Ableton, Guitare, Trap..."
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = '#7c6dfa40')}
              onBlur={e => (e.currentTarget.style.borderColor = '#ffffff10')}
            />
          </div>

          {/* Site web */}
          <div>
            <label style={labelStyle}>Site web</label>
            <input
              name="website_url"
              type="url"
              defaultValue={profile?.website_url ?? ''}
              placeholder="https://..."
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = '#7c6dfa40')}
              onBlur={e => (e.currentTarget.style.borderColor = '#ffffff10')}
            />
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

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full text-sm font-medium text-white transition-opacity disabled:opacity-40"
            style={{ background: '#7c6dfa', borderRadius: 10, height: 44 }}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </form>

        {/* ── Change password ── */}
        <div className="mt-8 pt-8" style={{ borderTop: '0.5px solid #ffffff0a' }}>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}
