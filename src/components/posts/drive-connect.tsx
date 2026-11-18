'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, ExternalLink, HardDrive, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { driveFileUrl, requestDriveToken } from '@/lib/drive'

type DriveState = {
  /** A valid access token, or null when Drive isn't connected. */
  getToken: () => string | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<string | null>
}

const DriveContext = createContext<DriveState | null>(null)

export function DriveProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ token: string; expiresAt: number } | null>(null)
  const [connecting, setConnecting] = useState(false)

  const getToken = useCallback(
    () => (session && session.expiresAt - 60_000 > Date.now() ? session.token : null),
    [session],
  )

  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      const next = await requestDriveToken()
      setSession(next)
      toast.success('Google Drive connected')
      return next.token
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not connect Google Drive.')
      return null
    } finally {
      setConnecting(false)
    }
  }, [])

  return (
    <DriveContext.Provider
      value={{ getToken, connected: getToken() !== null, connecting, connect }}
    >
      {children}
    </DriveContext.Provider>
  )
}

export function useDrive() {
  const ctx = useContext(DriveContext)
  if (!ctx) throw new Error('useDrive must be used inside DriveProvider')
  return ctx
}

export function DriveConnectButton() {
  const { connected, connecting, connect } = useDrive()
  if (connected) {
    return (
      <p className="text-brand-success flex items-center gap-1.5 text-sm font-semibold">
        <CheckCircle2 className="size-4" /> Drive connected
      </p>
    )
  }
  return (
    <Button variant="outline" size="sm" onClick={connect} disabled={connecting}>
      {connecting ? <Loader2 className="animate-spin" /> : <HardDrive />}
      Connect Google Drive
    </Button>
  )
}

export function DriveBadge({ fileId }: { fileId: string | null }) {
  if (!fileId) return <Badge variant="outline">Not synced</Badge>
  return (
    <Badge
      variant="outline"
      className="text-brand-success border-brand-success"
      render={<a href={driveFileUrl(fileId)} target="_blank" rel="noreferrer" />}
    >
      Synced to Drive <ExternalLink />
    </Badge>
  )
}
