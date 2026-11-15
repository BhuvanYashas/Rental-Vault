export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto px-6 md:px-10 py-8 animate-pulse">
      <div className="h-4 bg-white/40 rounded w-32 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        <div className="lg:col-span-2 h-[520px] vault-card-3d rounded-3xl" />
        <div className="lg:col-span-1 h-96 vault-card-3d rounded-3xl" />
      </div>
    </main>
  )
}