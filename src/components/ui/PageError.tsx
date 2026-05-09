'use client'

export default function PageError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <p className="text-zinc-400 text-sm">Une erreur est survenue</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl transition-colors"
      >
        Réessayer
      </button>
    </div>
  )
}
