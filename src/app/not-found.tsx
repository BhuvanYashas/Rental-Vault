import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-[#0F172A] rounded-full flex items-center justify-center mb-6 shadow-lg">
        <svg className="w-12 h-12 text-[#D97706]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h1 className="text-4xl font-extrabold text-[#0F172A] tracking-tight mb-2">Page not found</h1>
      <p className="text-[#1E293B] font-medium text-lg mb-8 max-w-md">
        The page you are looking for doesn't exist, was moved, or is temporarily unavailable.
      </p>

      <Link
        href="/"
        className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1E293B] transition-colors shadow-md hover:-translate-y-0.5"
      >
        ← Return to Vault
      </Link>
    </main>
  )
}