import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center p-6 md:p-8 text-center">
      <div className="vault-card-3d rounded-3xl p-8 md:p-10 max-w-md w-full flex flex-col items-center">
        <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center mb-5 shadow-[0_4px_0_0_#020617]">
          <svg className="w-8 h-8 text-[#F97316]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Page not found</h1>
        <p className="text-slate-600 font-medium text-sm md:text-base mb-8">
          The page you are looking for doesn&apos;t exist, was moved, or is temporarily unavailable.
        </p>

        <Link
          href="/"
          className="vault-btn-amber-3d text-white px-6 py-3 rounded-xl font-bold text-sm inline-block"
        >
          ← Return to Vault
        </Link>
      </div>
    </main>
  )
}