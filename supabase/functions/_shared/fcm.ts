/**
 * Firebase Cloud Messaging (FCM) HTTP v1 client for Deno edge runtime.
 *
 * Reads a JSON service-account key from the FIREBASE_SERVICE_ACCOUNT env var.
 * Caches the OAuth2 access token until expiry.
 */

import { SignJWT, importPKCS8 } from 'npm:jose@5'

interface ServiceAccount {
  project_id: string
  client_email: string
  private_key: string
  token_uri?: string
}

interface CachedToken {
  token: string
  expiresAt: number // epoch ms
}

let cached: CachedToken | null = null

function readServiceAccount(): ServiceAccount {
  const raw = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set.')
  }
  try {
    return JSON.parse(raw) as ServiceAccount
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT must be a JSON string.')
  }
}

export function fcmProjectId(): string {
  return readServiceAccount().project_id
}

/** Get an OAuth2 access token for FCM, cached until 60s before expiry. */
export async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token
  }

  const sa = readServiceAccount()
  const now = Math.floor(Date.now() / 1000)

  // Normalise the PEM — service account JSON escapes newlines as `\n`.
  const pem = sa.private_key.replace(/\\n/g, '\n')
  const privateKey = await importPKCS8(pem, 'RS256')

  const jwt = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience(sa.token_uri ?? 'https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey)

  const res = await fetch(sa.token_uri ?? 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OAuth2 token exchange failed: ${res.status} ${text}`)
  }

  const json = (await res.json()) as { access_token: string; expires_in: number }
  cached = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  }
  return cached.token
}

export interface FcmMessage {
  token: string
  title: string
  body: string
  data?: Record<string, string>
  /** Android-specific tint / small icon are set via AndroidManifest meta-data; here we just forward the color. */
  androidColor?: string
}

export interface FcmResult {
  token: string
  success: boolean
  error: string | null
  /** When `true`, the token is gone from FCM — caller should delete it. */
  tokenInvalid: boolean
}

/** Send a single message via FCM v1. */
export async function sendToToken(
  accessToken: string,
  projectId: string,
  msg: FcmMessage,
): Promise<FcmResult> {
  const body = {
    message: {
      token: msg.token,
      notification: { title: msg.title, body: msg.body },
      data: msg.data ?? {},
      android: {
        priority: 'HIGH',
        notification: {
          sound: 'default',
          color: msg.androidColor ?? '#b7131a',
          channel_id: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: { title: msg.title, body: msg.body },
            sound: 'default',
            badge: 1,
          },
        },
      },
    },
  }

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )

  if (res.ok) {
    return { token: msg.token, success: true, error: null, tokenInvalid: false }
  }

  const text = await res.text()
  // FCM marks unregistered / invalid tokens with these error codes.
  const tokenInvalid =
    /UNREGISTERED/i.test(text) ||
    /INVALID_ARGUMENT/i.test(text) ||
    /NOT_FOUND/i.test(text) ||
    res.status === 404
  return {
    token: msg.token,
    success: false,
    error: `${res.status}: ${text.slice(0, 300)}`,
    tokenInvalid,
  }
}

/** Send to many tokens in parallel (chunked to avoid overloading). */
export async function sendToMany(
  accessToken: string,
  projectId: string,
  messages: FcmMessage[],
  chunkSize = 20,
): Promise<FcmResult[]> {
  const results: FcmResult[] = []
  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize)
    const chunkResults = await Promise.all(
      chunk.map((m) => sendToToken(accessToken, projectId, m)),
    )
    results.push(...chunkResults)
  }
  return results
}
