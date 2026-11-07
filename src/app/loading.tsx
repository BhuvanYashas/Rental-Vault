export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3 mb-10">
        <div className="h-4 bg-[#5C7FA8]/20 rounded w-48" />
        <div className="h-10 bg-[#5C7FA8]/20 rounded w-1/2 max-w-lg" />
        <div className="h-4 bg-[#5C7FA8]/20 rounded w-full max-w-xl" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/60 border border-[#5C7FA8]/20 rounded-2xl h-56 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-7 bg-[#5C7FA8]/20 rounded w-2/3" />
              <div className="h-4 bg-[#5C7FA8]/20 rounded w-1/3" />
            </div>
            <div className="space-y-3">
              <div className="h-px bg-[#5C7FA8]/20 w-full" />
              <div className="flex justify-between">
                <div className="h-6 bg-[#5C7FA8]/20 rounded w-1/4" />
                <div className="h-6 bg-[#5C7FA8]/20 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}