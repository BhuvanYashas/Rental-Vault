export type Grade = 'A' | 'B' | 'C' | 'D'

export type ItemState =
  | 'IN_VAULT'
  | 'RENTED'
  | 'RETURNED'
  | 'DAMAGED'
  | 'REPAIR'
  | 'LOST'

export type Role = 'renter' | 'owner' | 'operator' | 'platform'
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  age: number | null
  role: Role
  kyc_status: KycStatus
  wallet_balance: number
  created_at: string
}

export type Item = {
  id: string
  owner_id: string
  name: string
  category: string
  serial_number: string | null
  grade: Grade | null
  state: ItemState | null
  photos: string[] | null
  created_at: string
}

export type Listing = {
  id: string
  item_id: string
  rate_per_day: number
  deposit: number
  active: boolean
  items: Item | null
}

export type Transaction = {
  id: string
  listing_id: string
  renter_id: string
  start_date: string
  end_date: string
  escrow_amount: number
  status: 'ACTIVE' | 'RETURNED' | 'CANCELLED'
  created_at: string
  listings?: Listing // Optional because we don't always fetch it nested
}

export type CustodyEvent = {
  id: string
  item_id: string
  state: ItemState
  actor_id: string | null
  notes: string | null
  photo_url: string | null
  created_at: string
}

export type Claim = {
  id: string
  transaction_id: string
  damage_amount: number
  description: string | null
  status: 'OPEN' | 'DISPUTED' | 'RESOLVED' | 'ESCALATED'
  dispute_reason: string | null
  disputed_at: string | null
  resolution: string | null
  resolved_at: string | null
  escalation_reason: string | null
  escalated_at: string | null
  platform_resolution: string | null
  platform_notes: string | null
  platform_resolved_at: string | null
  created_at: string
}