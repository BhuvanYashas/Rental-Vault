export default function Loading() {
  return (
    <main className="max-w-5xl mx-auto p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-4 bg-[#5C7FA8]/40 rounded w-48" />
        <div className="h-10 bg-[#5C7FA8]/40 rounded w-2/3 max-w-lg" />
        <div className="h-4 bg-[#5C7FA8]/40 rounded w-full max-w-xl" />
        <div className="h-4 bg-[#5C7FA8]/40 rounded w-5/6 max-w-lg" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="space-y-4 mb-8">
        <div className="flex gap-2">
          <div className="h-11 bg-white/50 border border-[#5C7FA8]/30 rounded-full w-full max-w-sm" />
          <div className="h-11 bg-[#5C7FA8]/40 rounded-full w-24" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-[#5C7FA8]/40 rounded-full w-16" />
          <div className="h-8 bg-[#5C7FA8]/40 rounded-full w-24" />
          <div className="h-8 bg-[#5C7FA8]/40 rounded-full w-20" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/60 border border-[#5C7FA8]/30 rounded-xl h-48 p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-[#5C7FA8]/40 rounded w-2/3" />
              <div className="h-4 bg-[#5C7FA8]/40 rounded w-1/3" />
            </div>
            <div className="space-y-2">
              <div className="h-px bg-[#5C7FA8]/30 w-full" />
              <div className="flex justify-between">
                <div className="h-6 bg-[#5C7FA8]/40 rounded w-1/4" />
                <div className="h-4 bg-[#5C7FA8]/40 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}