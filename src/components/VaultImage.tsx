'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'

type VaultImageProps = Omit<ImageProps, 'src'> & {
  src: string
  fallbackSrc: string
}

export default function VaultImage({
  src,
  fallbackSrc,
  alt,
  referrerPolicy = 'no-referrer',
  onError,
  ...rest
}: VaultImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const resolvedSrc = failedSrc === src ? fallbackSrc : src

  return (
    <Image
      {...rest}
      src={resolvedSrc}
      alt={alt}
      referrerPolicy={referrerPolicy}
      onError={(e) => {
        if (resolvedSrc !== fallbackSrc) {
          setFailedSrc(src)
        }
        onError?.(e)
      }}
    />
  )
}
