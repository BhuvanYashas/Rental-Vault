export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto p-8 animate-pulse">
      <div className="h-4 bg-[#5C7FA8]/20 rounded w-32 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-white/60 rounded-3xl border border-[#5C7FA8]/20" />
        <div className="lg:col-span-1 h-96 bg-white/60 rounded-3xl border border-[#5C7FA8]/20" />
      </div>
    </main>
  )
}