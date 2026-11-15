'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/app/actions/updateProfile'

export default function ProfileEditForm({
  initialUsername,
  initialAge,
}: {
  initialUsername: string
  initialAge: string
}) {
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
        type="button"
        onClick={() => setIsEditing(true)}
        className="bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm w-full"
      >
        Edit Profile
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 w-full text-left">
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-slate-900"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-slate-900"
          required
        />
      </div>
      {error && <p className="text-xs text-red-700 font-semibold">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-[#0F172A] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-300"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}