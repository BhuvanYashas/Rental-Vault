import type { Listing } from './types'
import { LOCAL_ITEM_PHOTOS } from './itemPhotos'

export type PreviewReview = {
  id: string
  rating: number
  comment: string
  created_at: string
  reviewer_name: string
}

export type PreviewCustodyEvent = {
  id: string
  state: string
  notes: string
  created_at: string
}

type PreviewListingEntry = Listing & {
  notes: string
  reviews: PreviewReview[]
  custody_events: PreviewCustodyEvent[]
}

const PREVIEW_LISTINGS: PreviewListingEntry[] = [
  {
    id: 'preview-ps5',
    item_id: 'item-ps5',
    rate_per_day: 200,
    deposit: 1000,
    active: true,
    notes: 'Includes DualSense wireless controller, HDMI 2.1 cable, and power cord in padded carry case.',
    items: {
      id: 'item-ps5',
      owner_id: 'owner-demo-1',
      name: 'PlayStation 5',
      category: 'Electronics',
      serial_number: 'PS5-IN-88412',
      grade: 'A',
      state: 'IN_VAULT',
      photos: [LOCAL_ITEM_PHOTOS.playstation5],
      average_rating: 4.9,
      review_count: 14,
      created_at: '2026-10-18T10:00:00Z',
    },
    reviews: [
      {
        id: 'rev-ps5-1',
        rating: 5,
        comment: 'Spotless console, controller holds full charge, super smooth pickup at Indiranagar vault.',
        created_at: '2026-11-04T15:30:00Z',
        reviewer_name: 'Aarav M.',
      },
      {
        id: 'rev-ps5-2',
        rating: 5,
        comment: 'Rented for a weekend FIFA tournament. Escrow refunded within 10 minutes of return.',
        created_at: '2026-10-29T18:10:00Z',
        reviewer_name: 'Rohan K.',
      },
    ],
    custody_events: [
      {
        id: 'evt-ps5-1',
        state: 'IN_VAULT',
        notes: 'Operator verified HDMI port, DualSense triggers, and fan noise — Grade A.',
        created_at: '2026-11-05T11:20:00Z',
      },
    ],
  },
  {
    id: 'preview-guitar',
    item_id: 'item-guitar',
    rate_per_day: 196,
    deposit: 2019,
    active: true,
    notes: 'Full-size spruce-top dreadnought acoustic guitar with gig bag, clip-on tuner, and extra picks.',
    items: {
      id: 'item-guitar',
      owner_id: 'owner-demo-2',
      name: 'Acoustic Guitar',
      category: 'Music',
      serial_number: 'FG-800-4429',
      grade: 'B',
      state: 'IN_VAULT',
      photos: [LOCAL_ITEM_PHOTOS.acousticGuitar],
      average_rating: 4.8,
      review_count: 9,
      created_at: '2026-10-16T09:15:00Z',
    },
    reviews: [
      {
        id: 'rev-gtr-1',
        rating: 5,
        comment: 'Fresh strings and great intonation. Ideal for an acoustic jam session.',
        created_at: '2026-11-02T12:00:00Z',
        reviewer_name: 'Meera S.',
      },
    ],
    custody_events: [
      {
        id: 'evt-gtr-1',
        state: 'IN_VAULT',
        notes: 'Neck relief and bridge inspected at vault intake — Grade B (minor pickwear).',
        created_at: '2026-10-16T09:30:00Z',
      },
    ],
  },
  {
    id: 'preview-impact-driver',
    item_id: 'item-impact-driver',
    rate_per_day: 115,
    deposit: 626,
    active: true,
    notes: '18V brushless cordless impact driver with 2x lithium battery packs, fast charger, and hex bit set.',
    items: {
      id: 'item-impact-driver',
      owner_id: 'owner-demo-3',
      name: 'Cordless Impact Driver',
      category: 'Power Tool',
      serial_number: 'M18-DRV-3107',
      grade: 'A',
      state: 'IN_VAULT',
      photos: [LOCAL_ITEM_PHOTOS.impactDriver],
      average_rating: 5.0,
      review_count: 11,
      created_at: '2026-10-14T14:20:00Z',
    },
    reviews: [
      {
        id: 'rev-drv-1',
        rating: 5,
        comment: 'Assembled an entire wardrobe and wall shelves in two hours. Battery still at 70%.',
        created_at: '2026-11-08T16:45:00Z',
        reviewer_name: 'Karthik V.',
      },
    ],
    custody_events: [
      {
        id: 'evt-drv-1',
        state: 'IN_VAULT',
        notes: 'Chuck torque and battery cells load-tested at intake — Grade A.',
        created_at: '2026-10-14T14:35:00Z',
      },
    ],
  },
  {
    id: 'preview-air-purifier',
    item_id: 'item-air-purifier',
    rate_per_day: 349,
    deposit: 1800,
    active: true,
    notes: 'True H13 HEPA air purifier covering up to 450 sq ft with PM2.5 sensor and whisper sleep mode.',
    items: {
      id: 'item-air-purifier',
      owner_id: 'owner-demo-4',
      name: 'Air Purifier',
      category: 'Appliance',
      serial_number: 'AP-HEPA-9021',
      grade: 'A',
      state: 'IN_VAULT',
      photos: [LOCAL_ITEM_PHOTOS.airPurifier],
      average_rating: 4.9,
      review_count: 7,
      created_at: '2026-10-12T11:00:00Z',
    },
    reviews: [
      {
        id: 'rev-ap-1',
        rating: 5,
        comment: 'Filter was fresh and clean. Brought AQI indoors down from 140 to 18 overnight.',
        created_at: '2026-11-01T09:15:00Z',
        reviewer_name: 'Neha R.',
      },
    ],
    custody_events: [
      {
        id: 'evt-ap-1',
        state: 'IN_VAULT',
        notes: 'HEPA filter sealed and airflow sensor checked — Grade A.',
        created_at: '2026-10-12T11:15:00Z',
      },
    ],
  },
  {
    id: 'preview-steam-iron',
    item_id: 'item-steam-iron',
    rate_per_day: 95,
    deposit: 500,
    active: true,
    notes: '2400W ceramic soleplate steam iron with vertical steam burst and anti-drip valve.',
    items: {
      id: 'item-steam-iron',
      owner_id: 'owner-demo-1',
      name: 'Steam Iron',
      category: 'Appliance',
      serial_number: 'GC-2400-551',
      grade: 'A',
      state: 'IN_VAULT',
      photos: [LOCAL_ITEM_PHOTOS.steamIron],
      average_rating: 4.7,
      review_count: 6,
      created_at: '2026-10-10T08:40:00Z',
    },
    reviews: [
      {
        id: 'rev-ir-1',
        rating: 5,
        comment: 'Heats up in 30 seconds and soleplate is spotless.',
        created_at: '2026-10-25T10:20:00Z',
        reviewer_name: 'Priya N.',
      },
    ],
    custody_events: [
      {
        id: 'evt-ir-1',
        state: 'IN_VAULT',
        notes: 'Soleplate and water reservoir inspected — Grade A.',
        created_at: '2026-10-10T09:00:00Z',
      },
    ],
  },
  {
    id: 'preview-study-table',
    item_id: 'item-study-table',
    rate_per_day: 140,
    deposit: 1200,
    active: true,
    notes: 'Solid oak foldable study desk (120cm x 60cm) with dual cable grommets and matte finish.',
    items: {
      id: 'item-study-table',
      owner_id: 'owner-demo-2',
      name: 'Study Table',
      category: 'Furniture',
      serial_number: 'OAK-DSK-214',
      grade: 'B',
      state: 'IN_VAULT',
      photos: [LOCAL_ITEM_PHOTOS.studyTable],
      average_rating: 4.6,
      review_count: 5,
      created_at: '2026-10-08T12:10:00Z',
    },
    reviews: [
      {
        id: 'rev-st-1',
        rating: 5,
        comment: 'Sturdy legs, fits easily in a hatchback with legs folded.',
        created_at: '2026-10-22T14:00:00Z',
        reviewer_name: 'Siddharth P.',
      },
    ],
    custody_events: [
      {
        id: 'evt-st-1',
        state: 'IN_VAULT',
        notes: 'Tabletop surface and folding brackets verified — Grade B.',
        created_at: '2026-10-08T12:30:00Z',
      },
    ],
  },
  {
    id: 'preview-dslr-camera',
    item_id: 'item-dslr-camera',
    rate_per_day: 550,
    deposit: 5000,
    active: true,
    notes: 'Full-frame DSLR body with 24-70mm f/2.8 zoom lens, 2 batteries, 64GB SD card, and padded bag.',
    items: {
      id: 'item-dslr-camera',
      owner_id: 'owner-demo-3',
      name: 'DSLR Camera',
      category: 'Electronics',
      serial_number: 'CAM-2470-891',
      grade: 'A',
      state: 'IN_VAULT',
      photos: [LOCAL_ITEM_PHOTOS.dslrCamera],
      average_rating: 5.0,
      review_count: 19,
      created_at: '2026-10-06T16:00:00Z',
    },
    reviews: [
      {
        id: 'rev-cam-1',
        rating: 5,
        comment: 'Sensor and lens glass are pristine. Saved me ₹1.4L for a single product shoot.',
        created_at: '2026-11-10T11:45:00Z',
        reviewer_name: 'Ananya D.',
      },
    ],
    custody_events: [
      {
        id: 'evt-cam-1',
        state: 'IN_VAULT',
        notes: 'Shutter count, autofocus calibration, and front element checked — Grade A.',
        created_at: '2026-10-06T16:15:00Z',
      },
    ],
  },
  {
    id: 'preview-projector',
    item_id: 'item-projector',
    rate_per_day: 420,
    deposit: 4000,
    active: true,
    notes: '1080p/4K-input 3200-lumen home cinema projector with keystone auto-align and HDMI cable.',
    items: {
      id: 'item-projector',
      owner_id: 'owner-demo-4',
      name: 'HD Cinema Projector',
      category: 'Electronics',
      serial_number: 'PRJ-3200-112',
      grade: 'A',
      state: 'IN_VAULT',
      photos: [LOCAL_ITEM_PHOTOS.projector],
      average_rating: 4.9,
      review_count: 8,
      created_at: '2026-10-04T19:00:00Z',
    },
    reviews: [],
    custody_events: [
      {
        id: 'evt-prj-1',
        state: 'IN_VAULT',
        notes: 'Lamp hours (110h) and optical lens verified at vault intake — Grade A.',
        created_at: '2026-10-04T19:20:00Z',
      },
    ],
  },
  {
    id: 'preview-camping-tent',
    item_id: 'item-camping-tent',
    rate_per_day: 240,
    deposit: 2000,
    active: true,
    notes: 'Weatherproof 3-person dome tent with aluminum poles, rainfly, stakes, and compression sack.',
    items: {
      id: 'item-camping-tent',
      owner_id: 'owner-demo-1',
      name: '3-Person Camping Tent',
      category: 'Outdoor',
      serial_number: 'TNT-3P-774',
      grade: 'A',
      state: 'IN_VAULT',
      photos: [LOCAL_ITEM_PHOTOS.campingTent],
      average_rating: 4.8,
      review_count: 10,
      created_at: '2026-10-02T07:30:00Z',
    },
    reviews: [],
    custody_events: [
      {
        id: 'evt-tnt-1',
        state: 'IN_VAULT',
        notes: 'Seam tape, zippers, and pole shock-cords verified — Grade A.',
        created_at: '2026-10-02T07:50:00Z',
      },
    ],
  },
  {
    id: 'preview-mountain-bike',
    item_id: 'item-mountain-bike',
    rate_per_day: 380,
    deposit: 3500,
    active: true,
    notes: '29er hardtail alloy frame mountain bike with hydraulic disc brakes and front suspension lockout.',
    items: {
      id: 'item-mountain-bike',
      owner_id: 'owner-demo-2',
      name: 'Mountain Bike',
      category: 'Outdoor',
      serial_number: 'MTB-29-608',
      grade: 'A',
      state: 'RENTED',
      photos: [LOCAL_ITEM_PHOTOS.mountainBike],
      average_rating: 4.9,
      review_count: 12,
      created_at: '2026-09-28T06:00:00Z',
    },
    reviews: [],
    custody_events: [
      {
        id: 'evt-mtb-1',
        state: 'RENTED',
        notes: 'Rental dispatched with helmet and U-lock after intake photo.',
        created_at: '2026-11-18T08:00:00Z',
      },
    ],
  },
  {
    id: 'preview-office-chair',
    item_id: 'item-office-chair',
    rate_per_day: 165,
    deposit: 1500,
    active: true,
    notes: 'Breathable ergonomic mesh chair with adjustable lumbar support, headrest, and 3D armrests.',
    items: {
      id: 'item-office-chair',
      owner_id: 'owner-demo-3',
      name: 'Ergonomic Office Chair',
      category: 'Furniture',
      serial_number: 'CHR-ERG-503',
      grade: 'A',
      state: 'IN_VAULT',
      photos: [LOCAL_ITEM_PHOTOS.officeChair],
      average_rating: 4.7,
      review_count: 4,
      created_at: '2026-09-25T13:10:00Z',
    },
    reviews: [],
    custody_events: [
      {
        id: 'evt-chr-1',
        state: 'IN_VAULT',
        notes: 'Gas lift cylinder and mesh tension inspected — Grade A.',
        created_at: '2026-09-25T13:25:00Z',
      },
    ],
  },
  {
    id: 'preview-mixer-grinder',
    item_id: 'item-mixer-grinder',
    rate_per_day: 110,
    deposit: 800,
    active: true,
    notes: '1000W countertop mixer grinder & high-speed blender with heavy-duty glass jar.',
    items: {
      id: 'item-mixer-grinder',
      owner_id: 'owner-demo-4',
      name: 'Mixer Grinder',
      category: 'Appliance',
      serial_number: 'MX-1000-339',
      grade: 'A',
      state: 'IN_VAULT',
      photos: [LOCAL_ITEM_PHOTOS.mixerGrinder],
      average_rating: 4.8,
      review_count: 3,
      created_at: '2026-09-22T15:40:00Z',
    },
    reviews: [],
    custody_events: [
      {
        id: 'evt-mix-1',
        state: 'IN_VAULT',
        notes: 'Motor coupler, gasket seal, and blades sanitized — Grade A.',
        created_at: '2026-09-22T16:00:00Z',
      },
    ],
  },
]

export function getPreviewListings(filters: {
  category?: string
  search?: string
  onlyAvailable?: boolean
  sort?: string
}): { listings: Listing[]; categories: string[] } {
  const categories = [
    'All',
    ...Array.from(
      new Set(PREVIEW_LISTINGS.map((l) => l.items?.category).filter(Boolean) as string[]),
    ).sort(),
  ]

  let results: Listing[] = [...PREVIEW_LISTINGS]

  if (filters.category && filters.category !== 'All') {
    results = results.filter((l) => l.items?.category === filters.category)
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    results = results.filter(
      (l) =>
        l.items?.name.toLowerCase().includes(q) ||
        l.items?.category.toLowerCase().includes(q),
    )
  }

  if (filters.onlyAvailable) {
    results = results.filter((l) => l.items?.state === 'IN_VAULT')
  }

  if (filters.sort === 'price_asc') {
    results.sort((a, b) => a.rate_per_day - b.rate_per_day)
  } else if (filters.sort === 'price_desc') {
    results.sort((a, b) => b.rate_per_day - a.rate_per_day)
  } else if (filters.sort === 'top_rated') {
    results.sort((a, b) => {
      const ratingDiff = (b.items?.average_rating ?? 0) - (a.items?.average_rating ?? 0)
      if (ratingDiff !== 0) return ratingDiff
      return (b.items?.review_count ?? 0) - (a.items?.review_count ?? 0)
    })
  } else {
    results.sort(
      (a, b) =>
        new Date(b.items?.created_at ?? 0).getTime() -
        new Date(a.items?.created_at ?? 0).getTime(),
    )
  }

  return { listings: results, categories }
}

export function getPreviewListingById(id: string): PreviewListingEntry | null {
  return PREVIEW_LISTINGS.find((l) => l.id === id) ?? null
}
