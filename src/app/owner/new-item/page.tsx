'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CameraCapture from '@/components/CameraCapture'
import { createListing } from '@/app/actions/createListing'

// 🧠 Smart Categorization Helper
function suggestCategory(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('camera') || lower.includes('projector') || lower.includes('playstation') || lower.includes('ipad') || lower.includes('screen')) return 'Electronics'
  if (lower.includes('drill') || lower.includes('saw') || lower.includes('compressor')) return 'Power Tool'
  if (lower.includes('table') || lower.includes('chair') || lower.includes('desk')) return 'Furniture'
  if (lower.includes('iron') || lower.includes('purifier') || lower.includes('cooktop') || lower.includes('grinder') || lower.includes('vacuum') || lower.includes('machine')) return 'Appliance'
  if (lower.includes('tent') || lower.includes('bike')) return 'Outdoor'
  if (lower.includes('guitar')) return 'Music'
  return null
}

export default function NewItemPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('Appliance')
  const [categoryTouched, setCategoryTouched] = useState(false) // 👈 Tracks manual selection
  const [serialNumber, setSerialNumber] = useState('')
  const [ratePerDay, setRatePerDay] = useState('')
  const [deposit, setDeposit] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [notes, setNotes] = useState('') // 👈 New state for notes

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value
    setName(newName)
    
    // Only auto-select if the user hasn't manually picked a category
    if (!categoryTouched) {
      const suggested = suggestCategory(newName)
      if (suggested) {
        setCategory(suggested)
      }
    }
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategory(e.target.value)
    setCategoryTouched(true) // Mark as manually touched
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!photoUrl) return setError('You must take a photo of the item')
    
    const rateNum = parseInt(ratePerDay, 10)
    const depositNum = parseInt(deposit, 10)
    if (!rateNum || rateNum <= 0) return setError('Enter a valid daily rate')
    if (!depositNum || depositNum <= 0) return setError('Enter a valid deposit amount')

    startTransition(async () => {
      const result = await createListing(
        name,
        category,
        rateNum,
        depositNum,
        photoUrl,
        serialNumber,
        notes // 👈 Now passing the actual notes
      )

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/owner/dashboard')
        router.refresh()
      }
    })
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <Link
        href="/"
        className="text-sm text-[#0F172A] hover:text-[#D97706] font-bold mb-8 inline-block transition"
      >
        ← Back to home
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
          List an item
        </h1>
        <p className="text-[#1E293B] mt-2 font-medium">
          Deposit your idle goods into the vault and earn rental income.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border border-[#5C7FA8] rounded-2xl p-8 shadow-sm space-y-6">
        
        {/* Camera Upload */}
        <div className="pb-6 border-b border-[#E2E8F0]">
          <CameraCapture
            onCapture={setPhotoUrl}
            label="Item photo (required)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ITEM NAME */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">
              Item Name
            </label>
            <input
              type="text" 
              required 
              placeholder="e.g. DSLR Camera"
              value={name} 
              onChange={handleNameChange}
              list="item-suggestions" 
              className="w-full border border-[#5C7FA8] rounded-lg px-3 py-2.5 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A]"
            />
            <datalist id="item-suggestions">
              <option value="DSLR Camera" />
              <option value="Projector" />
              <option value="Bosch Drill" />
              <option value="Steam Iron" />
              <option value="Air Purifier" />
              <option value="Camping Tent" />
              <option value="Study Table" />
              <option value="Office Chair" />
              <option value="Mixer Grinder" />
              <option value="PlayStation 5" />
              <option value="Acoustic Guitar" />
              <option value="Mountain Bike" />
            </datalist>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">
              Category
            </label>
            <select
              value={category} 
              onChange={handleCategoryChange} // 👈 Uses the new handler
              className="w-full border border-[#5C7FA8] rounded-lg px-3 py-2.5 text-[#0F172A] focus:outline-none focus:border-[#0F172A] bg-white"
            >
              <option value="Appliance">Appliance</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Power Tool">Power Tool</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Music">Music</option>
            </select>
          </div>

          {/* SERIAL NUMBER */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">
              Serial Number (Optional)
            </label>
            <input
              type="text" 
              placeholder={
                name.toLowerCase().includes('camera') ? 'e.g. Canon-123456' :
                name.toLowerCase().includes('drill') ? 'e.g. Bosch-98765' :
                name.toLowerCase().includes('tv') ? 'e.g. SN-112233' :
                'e.g. BD-2024-001'
              }
              value={serialNumber} 
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full border border-[#5C7FA8] rounded-lg px-3 py-2.5 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A]"
            />
          </div>

          {/* DAILY RATE */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">
              Daily Rate (₹)
            </label>
            <input
              type="number" 
              required 
              min="1" 
              placeholder="e.g. 150"
              value={ratePerDay} 
              onChange={(e) => setRatePerDay(e.target.value)}
              className="w-full border border-[#5C7FA8] rounded-lg px-3 py-2.5 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A]"
            />
          </div>

          {/* SECURITY DEPOSIT */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">
              Security Deposit (₹)
            </label>
            <input
              type="number" 
              required 
              min="1" 
              placeholder="e.g. 1000"
              value={deposit} 
              onChange={(e) => setDeposit(e.target.value)}
              className="w-full border border-[#5C7FA8] rounded-lg px-3 py-2.5 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A]"
            />
          </div>
        </div>

        {/* CONDITION NOTES */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">
            Item Description / Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Original box included. Small scratch on the bottom."
            rows={3}
            className="w-full border border-[#5C7FA8] rounded-lg px-3 py-2.5 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A]"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
            {error}
          </p>
        )}

        <div className="pt-4 border-t border-[#E2E8F0]">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#D97706] text-white rounded-lg py-3 font-bold hover:bg-[#B45309] transition shadow-sm disabled:opacity-50"
          >
            {isPending ? 'Submitting for approval…' : 'Submit Item to Vault'}
          </button>
          <p className="text-center text-xs text-[#1E293B] mt-3 font-medium">
            Your item will appear on the storefront once an Operator reviews and approves it.
          </p>
        </div>

      </form>
    </main>
  )
}