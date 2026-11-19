import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnvFiles() {
  const cwd = process.cwd()
  for (const filename of ['.env.local', '.env']) {
    const filePath = path.join(cwd, filename)
    if (!fs.existsSync(filePath)) continue
    const content = fs.readFileSync(filePath, 'utf8')
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue
      const eqIdx = line.indexOf('=')
      if (eqIdx === -1) continue
      const key = line.slice(0, eqIdx).trim()
      let val = line.slice(eqIdx + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  }
}

loadEnvFiles()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment / .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

function fixedUuid(prefix: string, index: number): string {
  const hex = index.toString(16).padStart(12, '0')
  return `${prefix}-0000-4000-8000-${hex}`
}

const SEED_PASSWORD = 'SeedVault123!'

type SeedUserSpec = {
  key: string
  email: string
  fullName: string
  username: string
  role: 'operator' | 'platform' | 'renter'
  age: number
  walletBalance: number
  kycStatus: 'verified' | 'pending'
}

const USER_SPECS: SeedUserSpec[] = [
  {
    key: 'op1',
    email: 'seed_operator1@test.com',
    fullName: 'Vikram Rao (Vault Op)',
    username: 'seed_operator1',
    role: 'operator',
    age: 29,
    walletBalance: 15000,
    kycStatus: 'verified',
  },
  {
    key: 'op2',
    email: 'seed_operator2@test.com',
    fullName: 'Ananya Nair (Vault Op)',
    username: 'seed_operator2',
    role: 'operator',
    age: 27,
    walletBalance: 15000,
    kycStatus: 'verified',
  },
  {
    key: 'plat1',
    email: 'seed_platform1@test.com',
    fullName: 'Siddharth Menon (Platform)',
    username: 'seed_platform1',
    role: 'platform',
    age: 32,
    walletBalance: 20000,
    kycStatus: 'verified',
  },
  ...Array.from({ length: 12 }, (_, i): SeedUserSpec => {
    const n = i + 1
    const names = [
      'Aarav Mehta',
      'Diya Sharma',
      'Rohan Kulkarni',
      'Meera Iyer',
      'Karthik Verma',
      'Neha Reddy',
      'Aditya Joshi',
      'Sneha Patel',
      'Varun Kapoor',
      'Ishita Bose',
      'Pranav Nair',
      'Tanvi Deshmukh',
    ]
    return {
      key: `renter${n}`,
      email: `seed_renter${n}@test.com`,
      fullName: names[i],
      username: `seed_renter${n}`,
      role: 'renter',
      age: 20 + (i % 6),
      walletBalance: 12000 + n * 500,
      kycStatus: n <= 10 ? 'verified' : 'pending',
    }
  }),
]

type SeedItemTemplate = {
  name: string
  category: 'Electronics' | 'Outdoor' | 'Appliances' | 'Furniture'
  grade: 'A' | 'B' | 'C'
  ratePerDay: number
  deposit: number
  photo: string
}

const ITEM_TEMPLATES: SeedItemTemplate[] = [
  // Electronics (9)
  {
    name: 'Sony Alpha Mirrorless Camera',
    category: 'Electronics',
    grade: 'A',
    ratePerDay: 450,
    deposit: 3000,
    photo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'PlayStation 5 Console',
    category: 'Electronics',
    grade: 'A',
    ratePerDay: 250,
    deposit: 1500,
    photo: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Epson 1080p Mini Projector',
    category: 'Electronics',
    grade: 'A',
    ratePerDay: 320,
    deposit: 2000,
    photo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'JBL PartyBox Portable Speaker',
    category: 'Electronics',
    grade: 'B',
    ratePerDay: 220,
    deposit: 1200,
    photo: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'DJI Osmo Mobile Gimbal',
    category: 'Electronics',
    grade: 'A',
    ratePerDay: 180,
    deposit: 1000,
    photo: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Dell 27-inch USB-C Monitor',
    category: 'Electronics',
    grade: 'A',
    ratePerDay: 210,
    deposit: 1800,
    photo: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    category: 'Electronics',
    grade: 'A',
    ratePerDay: 160,
    deposit: 1200,
    photo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Rode Wireless Microphone Kit',
    category: 'Electronics',
    grade: 'B',
    ratePerDay: 190,
    deposit: 1100,
    photo: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Keychron Mechanical Keyboard',
    category: 'Electronics',
    grade: 'A',
    ratePerDay: 90,
    deposit: 600,
    photo: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
  },

  // Outdoor (7)
  {
    name: 'Quechua 4-Person Camping Tent',
    category: 'Outdoor',
    grade: 'A',
    ratePerDay: 280,
    deposit: 1500,
    photo: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Trek Marlin Mountain Bike',
    category: 'Outdoor',
    grade: 'B',
    ratePerDay: 300,
    deposit: 2000,
    photo: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Osprey 65L Trekking Backpack',
    category: 'Outdoor',
    grade: 'A',
    ratePerDay: 150,
    deposit: 900,
    photo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Sub-Zero Sleeping Bag',
    category: 'Outdoor',
    grade: 'A',
    ratePerDay: 120,
    deposit: 700,
    photo: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Coleman Folding Camp Stove',
    category: 'Outdoor',
    grade: 'B',
    ratePerDay: 110,
    deposit: 600,
    photo: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'GoPro Hero Action Camera Mount Kit',
    category: 'Outdoor',
    grade: 'A',
    ratePerDay: 240,
    deposit: 1400,
    photo: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Black Diamond Trekking Poles',
    category: 'Outdoor',
    grade: 'B',
    ratePerDay: 85,
    deposit: 500,
    photo: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
  },

  // Appliances (7)
  {
    name: 'Philips HEPA Air Purifier',
    category: 'Appliances',
    grade: 'A',
    ratePerDay: 290,
    deposit: 1600,
    photo: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Garment Steam Iron',
    category: 'Appliances',
    grade: 'A',
    ratePerDay: 95,
    deposit: 500,
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'NutriBullet Mixer Grinder',
    category: 'Appliances',
    grade: 'A',
    ratePerDay: 110,
    deposit: 650,
    photo: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Delonghi Espresso Coffee Maker',
    category: 'Appliances',
    grade: 'A',
    ratePerDay: 240,
    deposit: 1500,
    photo: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Dyson Cordless Stick Vacuum',
    category: 'Appliances',
    grade: 'B',
    ratePerDay: 260,
    deposit: 1700,
    photo: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Cosori Digital Air Fryer',
    category: 'Appliances',
    grade: 'A',
    ratePerDay: 130,
    deposit: 800,
    photo: 'https://images.unsplash.com/photo-1648747066670-034eab81a631?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Induction Cooktop Portable',
    category: 'Appliances',
    grade: 'B',
    ratePerDay: 100,
    deposit: 600,
    photo: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
  },

  // Furniture (7)
  {
    name: 'Solid Oak Study Table',
    category: 'Furniture',
    grade: 'B',
    ratePerDay: 140,
    deposit: 900,
    photo: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Ergonomic Mesh Office Chair',
    category: 'Furniture',
    grade: 'A',
    ratePerDay: 135,
    deposit: 850,
    photo: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Foldable Guest Mattress Bed',
    category: 'Furniture',
    grade: 'A',
    ratePerDay: 120,
    deposit: 750,
    photo: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Industrial Metal Bookshelf',
    category: 'Furniture',
    grade: 'B',
    ratePerDay: 95,
    deposit: 600,
    photo: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Standing Desk Converter',
    category: 'Furniture',
    grade: 'A',
    ratePerDay: 155,
    deposit: 1000,
    photo: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Bamboo Monitor Riser & Drawer',
    category: 'Furniture',
    grade: 'A',
    ratePerDay: 65,
    deposit: 400,
    photo: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Minimalist Coffee Table',
    category: 'Furniture',
    grade: 'B',
    ratePerDay: 110,
    deposit: 700,
    photo: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=900&q=80',
  },
]

const REVIEW_COMMENTS = [
  'Spotless condition and smooth pickup from the vault.',
  'Worked flawlessly all weekend. Deposit released quickly.',
  'Great value for short campus projects—would rent again.',
  'Everything matched the intake inspection notes.',
  'Clean, well-maintained, and ready on time.',
  'Super helpful operator during check-in and return.',
  'Saved me from buying brand new for a one-week trip.',
  'Minor cosmetic wear as graded, zero functional issues.',
]

async function ensureSeedUsers(): Promise<Map<string, string>> {
  const existingByEmail = new Map<string, string>()
  let page = 1
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(`Failed to list auth users: ${error.message}`)
    for (const u of data.users) {
      if (u.email) existingByEmail.set(u.email.toLowerCase(), u.id)
    }
    if (data.users.length < 1000) break
    page += 1
  }

  const keyToUserId = new Map<string, string>()

  for (let i = 0; i < USER_SPECS.length; i++) {
    const spec = USER_SPECS[i]
    const email = spec.email.toLowerCase()
    let userId = existingByEmail.get(email)

    if (!userId) {
      const candidateId = fixedUuid('00000000', i + 1)
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        id: candidateId,
        email,
        password: SEED_PASSWORD,
        email_confirm: true,
        user_metadata: {
          username: spec.username,
          full_name: spec.fullName,
          age: spec.age,
        },
      })

      if (createErr || !created.user) {
        const retry = await supabase.auth.admin.createUser({
          email,
          password: SEED_PASSWORD,
          email_confirm: true,
          user_metadata: {
            username: spec.username,
            full_name: spec.fullName,
            age: spec.age,
          },
        })
        if (retry.error || !retry.data.user) {
          throw new Error(`Failed creating user ${email}: ${retry.error?.message ?? createErr?.message}`)
        }
        userId = retry.data.user.id
      } else {
        userId = created.user.id
      }
    } else {
      const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
        password: SEED_PASSWORD,
        email_confirm: true,
        user_metadata: {
          username: spec.username,
          full_name: spec.fullName,
          age: spec.age,
        },
      })
      if (updateErr) {
        throw new Error(`Failed updating user ${email}: ${updateErr.message}`)
      }
    }

    keyToUserId.set(spec.key, userId)
  }

  const profileRows = USER_SPECS.map((spec) => ({
    id: keyToUserId.get(spec.key)!,
    username: spec.username,
    full_name: spec.fullName,
    age: spec.age,
    role: spec.role,
    kyc_status: spec.kycStatus,
    wallet_balance: spec.walletBalance,
  }))

  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert(profileRows, { onConflict: 'id' })

  if (profileErr) {
    throw new Error(`Failed upserting profiles: ${profileErr.message}`)
  }

  return keyToUserId
}

async function seed() {
  console.log('Starting idempotent Rental Vault seed...')

  // 1. 15 Users (2 operators, 1 platform, 12 renters)
  const userIds = await ensureSeedUsers()
  const operatorIds = [userIds.get('op1')!, userIds.get('op2')!]
  const renterIds = Array.from({ length: 12 }, (_, i) => userIds.get(`renter${i + 1}`)!)
  console.log(`Seeded ${userIds.size} users & profiles (2 operators, 1 platform, 12 renters).`)

  // 2. 30 Items & 30 Listings (15 IN_VAULT, 10 RENTED, 5 RETURNED)
  const baseTime = new Date('2026-10-01T08:00:00.000Z').getTime()
  const stateByIndex = (i: number): 'IN_VAULT' | 'RENTED' | 'RETURNED' => {
    if (i < 15) return 'IN_VAULT'
    if (i < 25) return 'RENTED'
    return 'RETURNED'
  }

  const itemRows = ITEM_TEMPLATES.map((tpl, i) => {
    const itemId = fixedUuid('10000000', i + 1)
    const ownerId = renterIds[i % renterIds.length]
    return {
      id: itemId,
      owner_id: ownerId,
      name: tpl.name,
      category: tpl.category,
      serial_number: `RV-SEED-${String(i + 1).padStart(3, '0')}`,
      grade: tpl.grade,
      state: stateByIndex(i),
      photos: [tpl.photo],
      average_rating: null as number | null,
      review_count: 0,
      created_at: new Date(baseTime + i * 3600_000).toISOString(),
    }
  })

  const { error: itemErr } = await supabase
    .from('items')
    .upsert(itemRows, { onConflict: 'id' })

  if (itemErr) {
    throw new Error(`Failed upserting items: ${itemErr.message}`)
  }

  const listingRows = ITEM_TEMPLATES.map((tpl, i) => ({
    id: fixedUuid('20000000', i + 1),
    item_id: fixedUuid('10000000', i + 1),
    rate_per_day: tpl.ratePerDay,
    deposit: tpl.deposit,
    active: true,
  }))

  const { error: listingErr } = await supabase
    .from('listings')
    .upsert(listingRows, { onConflict: 'id' })

  if (listingErr) {
    throw new Error(`Failed upserting listings: ${listingErr.message}`)
  }

  console.log('Seeded 30 items & listings (15 IN_VAULT, 10 RENTED, 5 RETURNED).')

  // 3. 40 Transactions with sequential timestamps
  // Txns 1..30 are RETURNED (covering IN_VAULT & RETURNED items for reviews & claims)
  // Txns 31..40 are ACTIVE (linked 1-to-1 to the 10 RENTED items at indices 15..24)
  const txnStartTime = new Date('2026-10-10T09:00:00.000Z').getTime()
  const transactionRows = Array.from({ length: 40 }, (_, idx) => {
    const isActive = idx >= 30
    const itemIdx = isActive ? 15 + (idx - 30) : idx % 30
    const tpl = ITEM_TEMPLATES[itemIdx]
    const ownerIdx = itemIdx % renterIds.length
    const renterIdx = (ownerIdx + 1 + (idx % (renterIds.length - 1))) % renterIds.length
    const createdAtMs = txnStartTime + idx * 12 * 3600_000
    const start = new Date(createdAtMs)
    const end = new Date(createdAtMs + 3 * 24 * 3600_000)

    return {
      id: fixedUuid('30000000', idx + 1),
      listing_id: fixedUuid('20000000', itemIdx + 1),
      renter_id: renterIds[renterIdx],
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      escrow_amount: tpl.deposit + tpl.ratePerDay * 3,
      status: isActive ? ('ACTIVE' as const) : ('RETURNED' as const),
      created_at: new Date(createdAtMs).toISOString(),
    }
  })

  const { error: txnErr } = await supabase
    .from('transactions')
    .upsert(transactionRows, { onConflict: 'id' })

  if (txnErr) {
    throw new Error(`Failed upserting transactions: ${txnErr.message}`)
  }

  console.log('Seeded 40 sequential transactions (30 RETURNED, 10 ACTIVE).')

  // 4. Seed Custody Events (intake + active + return provenance)
  const custodyRows = transactionRows.map((txn, idx) => {
    const isActive = txn.status === 'ACTIVE'
    const itemIdx = isActive ? 15 + (idx - 30) : idx % 30
    const itemId = fixedUuid('10000000', itemIdx + 1)
    return {
      id: fixedUuid('60000000', idx + 1),
      item_id: itemId,
      state: isActive ? 'RENTED' : 'IN_VAULT',
      actor_id: isActive ? txn.renter_id : operatorIds[idx % operatorIds.length],
      notes: isActive
        ? 'Rental pickup verified at vault desk'
        : 'Returned to vault and passed operator inspection',
      photo_url: ITEM_TEMPLATES[itemIdx].photo,
      created_at: new Date(new Date(txn.created_at).getTime() + 60_000).toISOString(),
    }
  })

  const { error: custodyErr } = await supabase
    .from('custody_events')
    .upsert(custodyRows, { onConflict: 'id' })

  if (custodyErr) {
    throw new Error(`Failed upserting custody_events: ${custodyErr.message}`)
  }

  // 5. 5 Claims: 2 OPEN (newly filed), 1 DISPUTED, 1 ESCALATED, 1 RESOLVED
  // Note: Schema uses 'OPEN' for newly filed claims (rendered as "Damage claim filed" in UI).
  const claimNow = new Date('2026-11-10T10:00:00.000Z').getTime()
  const claimRows = [
    {
      id: fixedUuid('40000000', 1),
      transaction_id: transactionRows[0].id,
      damage_amount: 450,
      description: 'Scuff marks on lens hood noted during return check.',
      evidence: [ITEM_TEMPLATES[0].photo],
      status: 'OPEN',
      dispute_reason: null,
      disputed_at: null,
      resolution: null,
      resolved_at: null,
      escalation_reason: null,
      escalated_at: null,
      platform_resolution: null,
      platform_notes: null,
      platform_resolved_at: null,
      created_at: new Date(claimNow).toISOString(),
    },
    {
      id: fixedUuid('40000000', 2),
      transaction_id: transactionRows[1].id,
      damage_amount: 300,
      description: 'Missing HDMI cable from PlayStation carry case.',
      evidence: [ITEM_TEMPLATES[1].photo],
      status: 'OPEN',
      dispute_reason: null,
      disputed_at: null,
      resolution: null,
      resolved_at: null,
      escalation_reason: null,
      escalated_at: null,
      platform_resolution: null,
      platform_notes: null,
      platform_resolved_at: null,
      created_at: new Date(claimNow + 3600_000).toISOString(),
    },
    {
      id: fixedUuid('40000000', 3),
      transaction_id: transactionRows[2].id,
      damage_amount: 500,
      description: 'Projector carry bag zipper broken on return.',
      evidence: [ITEM_TEMPLATES[2].photo],
      status: 'DISPUTED',
      dispute_reason: 'Zipper was already stiff at pickup—see intake timestamp.',
      disputed_at: new Date(claimNow + 7200_000).toISOString(),
      resolution: null,
      resolved_at: null,
      escalation_reason: null,
      escalated_at: null,
      platform_resolution: null,
      platform_notes: null,
      platform_resolved_at: null,
      created_at: new Date(claimNow + 5400_000).toISOString(),
    },
    {
      id: fixedUuid('40000000', 4),
      transaction_id: transactionRows[3].id,
      damage_amount: 400,
      description: 'Grill mesh dent on JBL portable speaker.',
      evidence: [ITEM_TEMPLATES[3].photo],
      status: 'ESCALATED',
      dispute_reason: 'Speaker had a minor dent visible in intake photo.',
      disputed_at: new Date(claimNow + 10_800_000).toISOString(),
      resolution: 'VAULT_WINS',
      resolved_at: new Date(claimNow + 14_400_000).toISOString(),
      escalation_reason: 'Requesting platform inspection of high-res intake frame.',
      escalated_at: new Date(claimNow + 18_000_000).toISOString(),
      platform_resolution: null,
      platform_notes: null,
      platform_resolved_at: null,
      created_at: new Date(claimNow + 9000_000).toISOString(),
    },
    {
      id: fixedUuid('40000000', 5),
      transaction_id: transactionRows[4].id,
      damage_amount: 250,
      description: 'Deep scratch along oak study table edge.',
      evidence: [ITEM_TEMPLATES[23].photo],
      status: 'RESOLVED',
      dispute_reason: 'Surface mark wiped off cleanly after conditioning.',
      disputed_at: new Date(claimNow + 21_600_000).toISOString(),
      resolution: 'RENTER_WINS',
      resolved_at: new Date(claimNow + 25_200_000).toISOString(),
      escalation_reason: null,
      escalated_at: null,
      platform_resolution: null,
      platform_notes: null,
      platform_resolved_at: null,
      created_at: new Date(claimNow + 19_800_000).toISOString(),
    },
  ]

  const { error: claimErr } = await supabase
    .from('claims')
    .upsert(claimRows, { onConflict: 'id' })

  if (claimErr) {
    throw new Error(`Failed upserting claims: ${claimErr.message}`)
  }

  console.log('Seeded 5 claims (2 OPEN/filed, 1 DISPUTED, 1 ESCALATED, 1 RESOLVED).')

  // 6. 20 Reviews linked to RETURNED transactions (indices 5..24)
  const reviewRows = Array.from({ length: 20 }, (_, idx) => {
    const txn = transactionRows[idx + 5]
    const itemIdx = (idx + 5) % 30
    const rating = [5, 5, 4, 5, 4, 5, 5, 4, 5, 3][idx % 10]
    return {
      id: fixedUuid('50000000', idx + 1),
      transaction_id: txn.id,
      reviewer_id: txn.renter_id,
      item_id: fixedUuid('10000000', itemIdx + 1),
      rating,
      comment: REVIEW_COMMENTS[idx % REVIEW_COMMENTS.length],
      created_at: new Date(new Date(txn.created_at).getTime() + 4 * 24 * 3600_000).toISOString(),
    }
  })

  const { error: reviewErr } = await supabase
    .from('reviews')
    .upsert(reviewRows, { onConflict: 'id' })

  if (reviewErr) {
    throw new Error(`Failed upserting reviews: ${reviewErr.message}`)
  }

  console.log('Seeded 20 reviews linked to RETURNED transactions.')

  // 7. Recompute average_rating and review_count on items
  const seededItemIds = itemRows.map((it) => it.id)
  const { data: allReviews, error: fetchRevErr } = await supabase
    .from('reviews')
    .select('item_id, rating')
    .in('item_id', seededItemIds)

  if (fetchRevErr) {
    throw new Error(`Failed fetching reviews for rating recomputation: ${fetchRevErr.message}`)
  }

  const ratingsByItem = new Map<string, number[]>()
  for (const rev of allReviews ?? []) {
    const arr = ratingsByItem.get(rev.item_id) ?? []
    arr.push(rev.rating)
    ratingsByItem.set(rev.item_id, arr)
  }

  for (const itemId of seededItemIds) {
    const ratings = ratingsByItem.get(itemId) ?? []
    const reviewCount = ratings.length
    const averageRating =
      reviewCount > 0
        ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / reviewCount) * 10) / 10
        : null

    const { error: itemRatingErr } = await supabase
      .from('items')
      .update({
        average_rating: averageRating,
        review_count: reviewCount,
      })
      .eq('id', itemId)

    if (itemRatingErr) {
      throw new Error(`Failed updating ratings for item ${itemId}: ${itemRatingErr.message}`)
    }
  }

  console.log('Recomputed average_rating and review_count across all 30 seeded items.')
  console.log(`Seed complete! Default password for all seed_* accounts: ${SEED_PASSWORD}`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
