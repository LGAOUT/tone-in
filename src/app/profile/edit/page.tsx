'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/app/auth/actions'
import type { Profile } from '@/types'

const ROLES = [
  { value: 'musician',   label: '🎸 Musicien' },
  { value: 'producer',   label: '🎛️ Producteur' },
  { value: 'beatmaker',  label: '🥁 Beatmaker' },
  { value: 'songwriter', label: '✍️ Songwriter' },
  { value: 'teacher',    label: '🎓 Professeur' },
  { value: 'learner',    label: '📚 Apprenant' },
]

const BADGES = [
  { value: 'beginner',     label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced',     label: 'Avancé' },
  { value: 'expert',       label: 'Expert' },
]

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
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
      if (p) { setProfile(p); setAvatarUrl(p.avatar_url ?? '') }
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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-zinc-400">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-8">Modifier mon profil</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden cursor-pointer flex items-center justify-center"
            onClick={() => fileRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">🎵</span>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-zinc-800 hover:bg-zinc-700 text-sm px-4 py-2 rounded-xl transition-colors"
            >
              {uploading ? 'Upload...' : 'Changer la photo'}
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
          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Nom complet</label>
            <input name="full_name" type="text" defaultValue={profile?.full_name ?? ''}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Nom d'utilisateur</label>
            <input name="username" type="text" required defaultValue={profile?.username ?? ''}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Bio</label>
            <textarea name="bio" rows={3} defaultValue={profile?.bio ?? ''}
              placeholder="Parle de toi, de ton style, de tes influences..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Rôle</label>
            <select name="role" defaultValue={profile?.role ?? ''}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
              <option value="">Choisis ton rôle</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Niveau</label>
            <select name="badge_level" defaultValue={profile?.badge_level ?? 'beginner'}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
              {BADGES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">
              Compétences <span className="text-zinc-500">(séparées par des virgules)</span>
            </label>
            <input name="skills" type="text" defaultValue={profile?.skills?.join(', ') ?? ''}
              placeholder="Mixage, Ableton, Guitare, Trap..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Site web</label>
            <input name="website_url" type="url" defaultValue={profile?.website_url ?? ''}
              placeholder="https://..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </form>
      </div>
    </div>
  )
}