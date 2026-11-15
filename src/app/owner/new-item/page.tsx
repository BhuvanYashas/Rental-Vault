'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CameraCapture from '@/components/CameraCapture'
import { createListing } from '@/app/actions/createListing'

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
  const [categoryTouched, setCategoryTouched] = useState(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [ratePerDay, setRatePerDay] = useState('')
  const [deposit, setDeposit] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value
    setName(newName)

    if (!categoryTouched) {
      const suggested = suggestCategory(newName)
      if (suggested) {
        setCategory(suggested)
      }
    }
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategory(e.target.value)
    setCategoryTouched(true)
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
        notes,
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
    <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8 md:py-10">
      <Link
        href="/"
        className="text-sm text-[#0F172A] hover:text-white font-bold mb-6 inline-block transition-colors"
      >
        ← Back to home
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A]">
          List an item
        </h1>
        <p className="text-[#0F172A]/85 mt-1 font-semibold">
          Deposit your idle goods into the vault and earn rental income.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="vault-card-3d rounded-3xl p-6 md:p-8 space-y-6">
        <div className="pb-6 border-b border-slate-200">
          <CameraCapture
            onCapture={setPhotoUrl}
            label="Item photo (required)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
              Item Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DSLR Camera"
              value={name}
              onChange={handleNameChange}
              list="item-suggestions"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
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

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
              Category
            </label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
            >
              <option value="Appliance">Appliance</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Power Tool">Power Tool</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Music">Music</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
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
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
              Daily Rate (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 150"
              value={ratePerDay}
              onChange={(e) => setRatePerDay(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 tabular-nums"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
              Security Deposit (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 1000"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
            Item Description / Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Original box included. Small scratch on the bottom."
            rows={3}
            className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-semibold">
            {error}
          </p>
        )}

        <div className="pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isPending}
            className="w-full vault-btn-amber-3d text-white rounded-xl py-3.5 font-bold disabled:opacity-50"
          >
            {isPending ? 'Submitting for approval…' : 'Submit Item to Vault'}
          </button>
          <p className="text-center text-xs text-slate-600 mt-3 font-medium">
            Your item will appear on the storefront once an Operator reviews and approves it.
          </p>
        </div>
      </form>
    </main>
  )
}