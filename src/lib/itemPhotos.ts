const LOCAL_ITEM_PHOTOS = {
  airPurifier: '/images/items/air-purifier.jpg',
  steamIron: '/images/items/steam-iron.jpg',
  studyTable: '/images/items/study-table.jpg',
  dslrCamera: '/images/items/dslr-camera.jpg',
  playstation5: '/images/items/playstation-5.jpg',
  acousticGuitar: '/images/items/acoustic-guitar.jpg',
  impactDriver: '/images/items/impact-driver.jpg',
  projector: '/images/items/projector.jpg',
  campingTent: '/images/items/camping-tent.jpg',
  mountainBike: '/images/items/mountain-bike.jpg',
  officeChair: '/images/items/office-chair.jpg',
  mixerGrinder: '/images/items/mixer-grinder.jpg',
} as const

// Items whose seeded external stock photos in the catalog were mismatched
const MISMATCHED_STOCK_RULES: Array<{ keywords: string[]; photo: string }> = [
  { keywords: ['air purifier', 'purifier', 'hepa'], photo: LOCAL_ITEM_PHOTOS.airPurifier },
  { keywords: ['steam iron', 'garment steamer', 'iron'], photo: LOCAL_ITEM_PHOTOS.steamIron },
  { keywords: ['study table', 'study desk', 'writing desk', 'desk'], photo: LOCAL_ITEM_PHOTOS.studyTable },
  { keywords: ['dslr', 'mirrorless', 'camera'], photo: LOCAL_ITEM_PHOTOS.dslrCamera },
]

// Full item-to-photo matching used for fallbacks and preview catalog
const CATALOG_PHOTO_RULES: Array<{ keywords: string[]; photo: string }> = [
  ...MISMATCHED_STOCK_RULES,
  { keywords: ['playstation', 'ps5', 'console', 'gaming'], photo: LOCAL_ITEM_PHOTOS.playstation5 },
  { keywords: ['guitar', 'ukulele', 'acoustic'], photo: LOCAL_ITEM_PHOTOS.acousticGuitar },
  { keywords: ['impact driver', 'drill', 'bosch', 'cordless', 'driver'], photo: LOCAL_ITEM_PHOTOS.impactDriver },
  { keywords: ['projector', 'cinema'], photo: LOCAL_ITEM_PHOTOS.projector },
  { keywords: ['tent', 'camping'], photo: LOCAL_ITEM_PHOTOS.campingTent },
  { keywords: ['bike', 'bicycle', 'cycle', 'mtb'], photo: LOCAL_ITEM_PHOTOS.mountainBike },
  { keywords: ['chair', 'ergonomic'], photo: LOCAL_ITEM_PHOTOS.officeChair },
  { keywords: ['mixer', 'grinder', 'blender', 'juicer'], photo: LOCAL_ITEM_PHOTOS.mixerGrinder },
]

const CATEGORY_FALLBACKS: Record<string, string> = {
  Electronics: LOCAL_ITEM_PHOTOS.dslrCamera,
  Appliance: LOCAL_ITEM_PHOTOS.airPurifier,
  Furniture: LOCAL_ITEM_PHOTOS.studyTable,
  'Power Tool': LOCAL_ITEM_PHOTOS.impactDriver,
  Outdoor: LOCAL_ITEM_PHOTOS.campingTent,
  Music: LOCAL_ITEM_PHOTOS.acousticGuitar,
}

export function isUserUploadedPhoto(url: string | null | undefined): boolean {
  if (!url) return false
  return (
    url.includes('.supabase.co/storage/') ||
    url.startsWith('/images/') ||
    url.startsWith('/assets/') ||
    url.startsWith('data:')
  )
}

export function getFallbackItemPhoto(name?: string | null, category?: string | null): string {
  const lowerName = (name ?? '').toLowerCase()
  for (const rule of CATALOG_PHOTO_RULES) {
    if (rule.keywords.some((kw) => lowerName.includes(kw))) {
      return rule.photo
    }
  }
  if (category && CATEGORY_FALLBACKS[category]) {
    return CATEGORY_FALLBACKS[category]
  }
  return LOCAL_ITEM_PHOTOS.dslrCamera
}

export function resolveItemPhotoUrl(
  name?: string | null,
  category?: string | null,
  photos?: string[] | null,
): string {
  const raw = photos?.[0]?.trim()

  // Always preserve real owner-captured photos from Supabase Storage or local paths
  if (isUserUploadedPhoto(raw)) {
    return raw!
  }

  // Override mismatched external stock URLs (e.g. Unsplash) for known broken catalog items
  const lowerName = (name ?? '').toLowerCase()
  for (const rule of MISMATCHED_STOCK_RULES) {
    if (rule.keywords.some((kw) => lowerName.includes(kw))) {
      return rule.photo
    }
  }

  if (raw) {
    return raw
  }

  return getFallbackItemPhoto(name, category)
}

export { LOCAL_ITEM_PHOTOS }
