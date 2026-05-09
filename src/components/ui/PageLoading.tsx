export default function PageLoading() {
  return (
    <div className="animate-pulse max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div className="h-6 w-44 rounded-lg bg-zinc-800" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 rounded-xl bg-zinc-800/60" />
      ))}
    </div>
  )
}
