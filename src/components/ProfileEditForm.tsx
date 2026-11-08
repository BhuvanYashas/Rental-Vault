'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/app/actions/updateProfile'

export default function ProfileEditForm({ initialUsername, initialAge }: { initialUsername: string, initialAge: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [username, setUsername] = useState(initialUsername)
  const [age, setAge] = useState(initialAge)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    const ageNum = parseInt(age, 10)
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return setError('Please enter a valid age (13-120)')
    }

    startTransition(async () => {
      const result = await updateProfile(username, ageNum)
      if (result.error) {
        setError(result.error)
      } else {
        setIsEditing(false)
      }
    })
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="bg-white border border-[#5C7FA8]/40 text-[#0F172A] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm w-full"
      >
        Edit Profile
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#5C7FA8]/30 space-y-4 w-full text-left">
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-[#5C7FA8] font-bold mb-1">Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-[#5C7FA8]/40 rounded-lg px-3 py-2 text-[#0F172A] focus:outline-none focus:border-[#0F172A]" required />
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-[#5C7FA8] font-bold mb-1">Age</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full border border-[#5C7FA8]/40 rounded-lg px-3 py-2 text-[#0F172A] focus:outline-none focus:border-[#0F172A]" required />
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={isPending} className="bg-[#0F172A] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1E293B] disabled:opacity-50">
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" onClick={() => setIsEditing(false)} className="bg-neutral-200 text-neutral-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-300">Cancel</button>
      </div>
    </form>
  )
}