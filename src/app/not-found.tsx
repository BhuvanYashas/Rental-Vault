import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center p-6 md:p-8 text-center">
      <div className="vault-card-3d rounded-3xl p-8 md:p-10 max-w-md w-full flex flex-col items-center">
        <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center mb-5 shadow-md">
          <AlertTriangle className="w-8 h-8 text-[#F97316]" aria-hidden="true" />
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