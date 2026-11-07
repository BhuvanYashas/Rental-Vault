import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function OwnerDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/owner/dashboard')

  const { data: items, error } = await supabase
    .from('items')
    .select(`
      id, name, category, grade, state, photos, created_at,
      listings ( 
        id, rate_per_day, deposit, active,
        transactions ( id, status, start_date, end_date, escrow_amount )
      )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // 🚨 DEBUG LOG: Check your VS Code terminal for this output!
  console.log("OWNER DASHBOARD DATA:", JSON.stringify(items, null, 2))

  if (error) {
    return (
      <main className="max-w-5xl mx-auto p-8">
        <p className="text-red-700 font-mono text-sm font-bold">
          Failed to load items: {error.message}
        </p>
      </main>
    )
  }

  let totalEarned = 0
  let totalEscrow = 0

  items?.forEach((item) => {
    const listing = item.listings?.[0]
    const transactions = listing?.transactions ?? []
    transactions.forEach((txn: any) => {
      if (txn.status === 'RETURNED') {
        const start = new Date(txn.start_date)
        const end = new Date(txn.end_date)
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
        totalEarned += (listing.rate_per_day * days)
      } else if (txn.status === 'ACTIVE') {
        totalEscrow += txn.escrow_amount
      }
    })
  })

  const totalItems = items?.length ?? 0
  const activeListings = items?.filter((i) => i.listings?.[0]?.active === true).length ?? 0
  const pendingListings = items?.filter((i) => i.listings?.[0]?.active === false).length ?? 0

  return (
    <main className="max-w-5xl mx-auto p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#D97706] mb-2 font-bold">Owner view</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A]">My Listings</h1>
          <p className="text-[#1E293B] mt-2 font-medium text-lg">Manage your deposited items and track your earnings.</p>
        </div>
        <Link href="/owner/new-item" className="bg-[#0F172A] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#1E293B] hover:-translate-y-0.5 transition-all shadow-md inline-block text-center">
          + List New Item
        </Link>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
        <StatCard label="Total Items" value={totalItems} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
        <StatCard label="Active" value={activeListings} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard label="Pending" value={pendingListings} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        
        <div className="bg-white border border-[#5C7FA8]/40 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] hover:border-[#0F172A]/30 transition-all duration-300 ease-out relative overflow-hidden group">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-600 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>
          </div>
          <div className="relative z-10 flex items-center gap-2 mb-3 text-[#1E293B]"><span className="font-mono text-xs uppercase tracking-widest font-bold">Total Earned</span></div>
          <p className="relative z-10 text-4xl font-extrabold tracking-tight text-emerald-600">₹{totalEarned}</p>
          {totalEscrow > 0 && (<p className="relative z-10 text-xs text-[#D97706] font-bold mt-2 bg-amber-50 inline-block px-2 py-1 rounded">+ ₹{totalEscrow} in escrow</p>)}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
          Your Inventory
          <span className="bg-[#E2E8F0] text-[#1E293B] text-xs py-1 px-2.5 rounded-full">{items?.length || 0}</span>
        </h2>
        
        {!items || items.length === 0 ? (
          <div className="bg-white border border-[#5C7FA8]/40 rounded-2xl p-12 text-center shadow-sm">
             <p className="text-[#0F172A] font-bold text-xl mb-2">You haven't listed anything yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#5C7FA8]/40 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-[#F8FAFC] text-left border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#1E293B] font-bold">Item</th>
                    <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#1E293B] font-bold">Category</th>
                    <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#1E293B] font-bold">Rate / Deposit</th>
                    <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#1E293B] font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {items.map((item) => {
                    const listing = item.listings?.[0]
                    const isPending = listing?.active === false
                    
                    return (
                      <tr key={item.id} className="hover:bg-[#F8FAFC]/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {item.photos?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.photos[0]} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-[#E2E8F0] shadow-sm group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#5C7FA8]">N/A</div>
                            )}
                            <div>
                              <p className="font-bold text-[#0F172A] text-base">{item.name || 'Unknown'}</p>
                              <p className="font-mono text-xs text-[#1E293B] mt-0.5">Grade {item.grade || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#1E293B] font-medium">
                          <span className="bg-[#F1F5F9] px-3 py-1 rounded-lg text-xs font-bold text-[#0F172A]">{item.category || 'Uncategorized'}</span>
                        </td>
                        <td className="px-6 py-4">
                          {listing ? (
                            <div>
                              <p className="font-bold text-[#0F172A]">₹{listing.rate_per_day} <span className="text-xs font-normal text-[#1E293B]">/day</span></p>
                              <p className="text-xs text-[#1E293B] mt-0.5">Dep ₹{listing.deposit}</p>
                            </div>
                          ) : (<span className="text-[#1E293B]">—</span>)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span> PENDING</span>
                          ) : item.state === 'RENTED' ? (
                            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> RENTED</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> ACTIVE</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#5C7FA8]/40 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] hover:border-[#0F172A]/30 transition-all duration-300 ease-out cursor-default group relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="relative z-10 flex items-center justify-between mb-4">
        <p className="text-xs font-mono uppercase tracking-widest text-[#1E293B] font-bold group-hover:text-[#0F172A] transition-colors">{label}</p>
        <div className="text-[#5C7FA8] group-hover:text-[#D97706] group-hover:scale-110 transition-all duration-300">{icon}</div>
      </div>
      <p className="relative z-10 text-4xl font-extrabold tracking-tight text-[#0F172A]">{value}</p>
    </div>
  )
} 