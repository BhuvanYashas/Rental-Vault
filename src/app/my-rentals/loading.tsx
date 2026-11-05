export default function Loading() {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-neutral-300 rounded w-1/3" />
        <div className="h-4 bg-neutral-300 rounded w-1/4" />
        <div className="space-y-3">
          <div className="h-40 bg-white border border-neutral-200 rounded-xl" />
          <div className="h-40 bg-white border border-neutral-200 rounded-xl" />
        </div>
      </div>
    </main>
  )
}