export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-14 animate-pulse">
      <div className="space-y-3 mb-10 max-w-2xl mx-auto flex flex-col items-center">
        <div className="h-6 bg-white/40 rounded-full w-48" />
        <div className="h-12 bg-white/40 rounded-xl w-3/4" />
        <div className="h-5 bg-white/35 rounded-lg w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="vault-card-3d rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-slate-200/70" />
            <div className="p-5 space-y-3">
              <div className="h-3.5 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <div className="h-6 bg-slate-200 rounded w-1/4" />
                <div className="h-5 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}