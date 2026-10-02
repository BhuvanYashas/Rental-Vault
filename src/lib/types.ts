export type Grade = 'A' | 'B' | 'C' | 'D'

export type ItemState =
  | 'IN_VAULT'
  | 'RENTED'
  | 'RETURNED'
  | 'DAMAGED'
  | 'REPAIR'
  | 'LOST'

export type Listing = {
  id: string
  rate_per_day: number
  deposit: number
  active: boolean
  items: {
    id: string
    name: string
    category: string
    grade: Grade
    state: ItemState
  } | null
}