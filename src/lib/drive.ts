'use client'

import type { Post } from '@/types/database'

// Browser-only: the user's OAuth token comes from Google Identity Services and
// never reaches our server. We store only the Drive file id in Supabase.
const GIS_SRC = 'https://accounts.google.com/gsi/client'
const SCOPE = 'https://www.googleapis.com/auth/drive.file'
const FOLDER_NAME = 'CaptionFlow'
const API = 'https://www.googleapis.com/drive/v3/files'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files'

let gisPromise: Promise<void> | null = null
let folderId: string | null = null

function loadGis() {
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2)
    return Promise.resolve()
  gisPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      gisPromise = null
      reject(new Error('Could not load Google sign-in.'))
    }
    document.head.appendChild(script)
  })
  return gisPromise
}

/** Opens Google's consent popup and resolves with an access token. */
export async function requestDriveToken(): Promise<{ token: string; expiresAt: number }> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('Google Drive is not configured.')
  await loadGis()

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error('Drive access was not granted.'))
          return
        }
        resolve({
          token: response.access_token,
          expiresAt: Date.now() + Number(response.expires_in) * 1000,
        })
      },
      error_callback: () => reject(new Error('Drive sign-in was closed.')),
    })
    client.requestAccessToken()
  })
}

async function driveFetch(token: string, url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  })
  if (!res.ok && res.status !== 404) {
    throw new Error(`Drive request failed (${res.status}).`)
  }
  return res
}

async function ensureFolder(token: string) {
  if (folderId) return folderId
  const q = encodeURIComponent(
    `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  )
  const found = await driveFetch(token, `${API}?q=${q}&fields=files(id)&spaces=drive`)
  const { files } = (await found.json()) as { files: { id: string }[] }
  if (files.length > 0) {
    folderId = files[0].id
    return folderId
  }
  const created = await driveFetch(token, `${API}?fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  })
  folderId = ((await created.json()) as { id: string }).id
  return folderId
}

function multipartBody(metadata: object, content: object) {
  const boundary = `captionflow-${crypto.randomUUID()}`
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    JSON.stringify(content, null, 2),
    `--${boundary}--`,
  ].join('\r\n')
  return { body, contentType: `multipart/related; boundary=${boundary}` }
}

function postContent(post: Post) {
  return {
    id: post.id,
    caption: post.caption,
    platform: post.platform,
    status: post.status,
    scheduled_at: post.scheduled_at,
    image_path: post.image_path,
    created_at: post.created_at,
    updated_at: post.updated_at,
  }
}

/** Creates the post's JSON file, or updates it when the post already has one. */
export async function syncPostToDrive(token: string, post: Post): Promise<string> {
  const name = `captionflow-${post.id}.json`

  if (post.drive_file_id) {
    const { body, contentType } = multipartBody({ name }, postContent(post))
    const res = await driveFetch(
      token,
      `${UPLOAD}/${post.drive_file_id}?uploadType=multipart&fields=id`,
      { method: 'PATCH', headers: { 'Content-Type': contentType }, body },
    )
    // File removed in Drive meanwhile: fall through and create a new one.
    if (res.ok) return ((await res.json()) as { id: string }).id
  }

  const parent = await ensureFolder(token)
  const { body, contentType } = multipartBody(
    { name, mimeType: 'application/json', parents: [parent] },
    postContent(post),
  )
  const res = await driveFetch(token, `${UPLOAD}?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  })
  if (!res.ok) {
    folderId = null
    throw new Error('Could not create the Drive file.')
  }
  return ((await res.json()) as { id: string }).id
}

export async function deleteDriveFile(token: string, fileId: string) {
  await driveFetch(token, `${API}/${fileId}`, { method: 'DELETE' })
}

export function driveFileUrl(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/view`
}
