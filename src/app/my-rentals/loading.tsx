export default function Loading() {
  return (
    <main className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-8 md:py-10 animate-pulse">
      <div className="space-y-6">
        <div className="h-8 bg-white/40 rounded-lg w-1/3" />
        <div className="h-4 bg-white/35 rounded w-1/4" />
        <div className="space-y-4">
          <div className="h-40 vault-card-3d rounded-2xl" />
          <div className="h-40 vault-card-3d rounded-2xl" />
        </div>
      </div>
    </main>
  )
}