import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#0F172A]/15 bg-[#0F172A] text-slate-300">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <p className="text-white font-extrabold text-lg tracking-tight">Rental Vault</p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Idle goods, held in trust. Photo-graded custody, escrow protection, and neighbourhood vault hubs.
          </p>
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#FB923C] font-bold mb-3">
            Marketplace
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">Browse Vault</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Sign in</Link></li>
            <li><Link href="/login?mode=signup" className="hover:text-white transition-colors">Create Account</Link></li>
            <li><Link href="/update-password" className="hover:text-white transition-colors">Update Password</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#FB923C] font-bold mb-3">
            Renter &amp; Owner
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/my-rentals" className="hover:text-white transition-colors">My Rentals</Link></li>
            <li><Link href="/owner/dashboard" className="hover:text-white transition-colors">Owner Dashboard</Link></li>
            <li><Link href="/owner/new-item" className="hover:text-white transition-colors">List New Item</Link></li>
            <li><Link href="/profile" className="hover:text-white transition-colors">Profile, KYC &amp; Wallet</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#FB923C] font-bold mb-3">
            Operations &amp; Trust
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/operator" className="hover:text-white transition-colors">Operator Command Center</Link></li>
            <li><Link href="/platform" className="hover:text-white transition-colors">Platform Mediation</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
