export default function Loading() {
  return (
    <main className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-8 md:py-12 animate-pulse">
      <div className="space-y-3 mb-10 max-w-3xl mx-auto flex flex-col items-center">
        <div className="h-5 bg-white/40 rounded-full w-48" />
        <div className="h-12 bg-white/50 rounded-2xl w-3/4" />
        <div className="h-6 bg-white/40 rounded-full w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="vault-card-3d rounded-3xl overflow-hidden">
            <div className="h-16 bg-[#0F172A]/85" />
            <div className="aspect-[4/3] bg-slate-200" />
            <div className="p-4 flex justify-between items-center bg-[#F8FBFF]">
              <div className="h-6 bg-slate-200 rounded-lg w-1/3" />
              <div className="h-8 bg-[#EA580C]/30 rounded-xl w-20" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}