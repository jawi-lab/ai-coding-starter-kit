'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PermissionState } from '@capacitor/core'
import { isNativePlatform } from '@/lib/native/platform'
import {
  getPushPermissionState,
  requestPushPermission,
  type PushPermissionResult,
} from '@/lib/native/push'

export type PushPermission = PermissionState | 'unsupported' | 'loading'

/**
 * Reads and drives the OS push permission for the profile section (PROJ-10).
 * `state` reflects the current OS permission; `enable()` triggers the OS dialog
 * (only useful while `state === 'prompt'`). A permanently denied permission can no
 * longer show the dialog — the caller then guides the user to the system settings.
 */
export function usePushPermission() {
  const [state, setState] = useState<PushPermission>('loading')
  const [enabling, setEnabling] = useState(false)

  const refresh = useCallback(async () => {
    setState(await getPushPermissionState())
  }, [])

  useEffect(() => {
    if (!isNativePlatform()) {
      setState('unsupported')
      return
    }
    void refresh()
  }, [refresh])

  const enable = useCallback(async (): Promise<PushPermissionResult> => {
    setEnabling(true)
    const result = await requestPushPermission()
    setEnabling(false)
    await refresh()
    return result
  }, [refresh])

  return { state, enabling, enable, refresh }
}
