import Link from 'next/link'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🎵</div>
        <h1 className="text-2xl font-bold text-white mb-2">Bienvenue sur Tone In !</h1>
        <p className="text-zinc-400 mb-8">
          Ton compte est créé. Complète ton profil pour commencer.
        </p>
        <Link
          href="/feed"
          className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-8 py-3 rounded-xl transition-colors inline-block"
        >
          Découvrir le feed →
        </Link>
      </div>
    </div>
  )
}