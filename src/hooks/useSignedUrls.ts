'use client'

import { useEffect, useState } from 'react'
import { getSignedUrls } from '@/lib/storage'

/** Signierte URLs für Objekte eines privaten Buckets, als Map Pfad → URL. */
export function useSignedUrls(bucket: string, paths: string[]): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>({})
  const pathsKey = paths.join('\n')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const next = await getSignedUrls(bucket, pathsKey ? pathsKey.split('\n') : [])
      if (!cancelled) setUrls(next)
    })()
    return () => {
      cancelled = true
    }
  }, [bucket, pathsKey])

  return urls
}
