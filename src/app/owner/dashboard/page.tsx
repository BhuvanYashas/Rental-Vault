import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReturnedRentalRow from '@/components/ReturnedRentalRow'

export const dynamic = 'force-dynamic'

export default async function OwnerDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/owner/dashboard')

  // 1. Fetch returned rentals (without trying to join reviews here)
  const { data: returnedRentals, error } = await supabase
    .from('transactions')
    .select(`
      id, start_date, end_date, escrow_amount, renter_id, created_at, status,
      listings ( 
        id, 
        items ( 
          id, name, category, 
          custody_events ( id, state, photo_url, created_at ) 
        ) 
      )
    `)
    .eq('status', 'RETURNED')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching rentals:", error)
    return <div>Error loading dashboard.</div>
  }

  // 2. Fetch reviews separately and map them
  let reviewMap = new Map()
  if (returnedRentals && returnedRentals.length > 0) {
    const txnIds = returnedRentals.map(r => r.id)
    
    // NOTE: If your reviews table uses 'rental_id' instead of 'transaction_id', change it here!
    const { data: reviews } = await supabase
      .from('reviews')
      .select('transaction_id, rating')
      .in('transaction_id', txnIds)

    if (reviews) {
      reviewMap = new Map(reviews.map(r => [r.transaction_id, r]))
    }
  }

  // 3. Fetch renter profiles
  const renterIds = new Set<string>()
  returnedRentals?.forEach((r) => r.renter_id && renterIds.add(r.renter_id))
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', Array.from(renterIds))
  
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-4">Recently Returned — Claims</h2>
        
        <div className="flex flex-col gap-4">
          {returnedRentals && returnedRentals.length > 0 ? (
            returnedRentals.map((rental: any) => {
              const listing = rental.listings
              const item = listing?.items
              const renter = rental.renter_id ? profileMap.get(rental.renter_id) : null
              
              // Get the review from our Map
              const review = reviewMap.get(rental.id) || null
              
              const events = (item?.custody_events ?? []).slice().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              const intakePhoto = events.find((e: any) => e.state === 'RENTED' && e.photo_url)?.photo_url
              const returnPhoto = events.find((e: any) => e.state === 'IN_VAULT' && e.photo_url)?.photo_url

              return (
                <ReturnedRentalRow 
                  key={rental.id} 
                  transactionId={rental.id} 
                  itemName={item?.name ?? '—'} 
                  category={item?.category ?? ''} 
                  renterName={renter?.full_name ?? '—'}
                  startDate={rental.start_date} 
                  endDate={rental.end_date} 
                  escrowAmount={rental.escrow_amount} 
                  intakePhoto={intakePhoto ?? null} 
                  returnPhoto={returnPhoto ?? null} 
                  claim={null} 
                  review={review} 
                />
              )
            })
          ) : (
            <div className="bg-white/50 border-2 border-dashed border-[#5C7FA8]/30 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
              <p className="text-[#0F172A] font-bold text-lg">No returns yet</p>
              <p className="text-[#1E293B] font-medium mt-1">Returned items will appear here.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}