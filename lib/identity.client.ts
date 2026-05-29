// Browser-only. Never import this in server components or API routes.
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import type { Identity, EncryptedVoteEnvelope, VotePayload } from '@/types'

const IDENTITY_KEY = 'scrutinder.identity.v1'
const VOTE_KEY_PREFIX = 'scrutinder.vote-key.'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

// ── Byte helpers ────────────────────────────────────────────────────────────

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0))
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

// TypeScript's strict lib types require a concrete ArrayBuffer (not ArrayBufferLike)
// when passing Uint8Array to crypto.subtle. This helper copies the bytes into one.
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', toArrayBuffer(bytes)))
}

async function importAesKey(seedBytes: Uint8Array, purpose: string): Promise<CryptoKey> {
  const material = await sha256(encoder.encode(`${purpose}:${bytesToBase64(seedBytes)}`))
  return crypto.subtle.importKey('raw', toArrayBuffer(material), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

// ── Public API ───────────────────────────────────────────────────────────────

export function isWebAuthnSupported(): boolean {
  return Boolean(
    typeof window !== 'undefined' &&
    window.PublicKeyCredential &&
    navigator.credentials &&
    window.isSecureContext
  )
}

export function getStoredIdentity(): Identity | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(IDENTITY_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as Identity } catch { return null }
}

export function storeIdentity(identity: Identity): void {
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity))
}

export function updateLocalPseudonym(identity: Identity, pseudonym: string): Identity {
  const updated = { ...identity, pseudonym: pseudonym.trim() || identity.pseudonym }
  storeIdentity(updated)
  return updated
}

export function deleteLocalProfile(identity: Identity): void {
  if (identity.id) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(`${VOTE_KEY_PREFIX}${identity.id}.`))
      .forEach((k) => localStorage.removeItem(k))
  }
  localStorage.removeItem(IDENTITY_KEY)
}

export async function createIdentityWithPasskey(
  existingIdentity: Identity | null,
  pseudonym: string
): Promise<Identity> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn nécessite HTTPS ou localhost et un navigateur compatible.')
  }

  const seedBytes = existingIdentity?.seed
    ? base64ToBytes(existingIdentity.seed)
    : randomBytes(32)
  const publicHash = await sha256(seedBytes)
  const identityId = existingIdentity?.id ?? `sc_${bytesToHex(publicHash).slice(0, 32)}`
  const displayName = pseudonym.trim() || existingIdentity?.pseudonym || `Citoyen ${identityId.slice(-4)}`

  // 1. Get options from server
  const optRes = await fetch('/api/auth/register/generate-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: identityId, pseudonym: displayName }),
  })
  if (!optRes.ok) throw new Error('Impossible de démarrer la création du passkey.')
  const options = await optRes.json()

  // 2. Browser WebAuthn ceremony (v10.0.0 takes options directly, not wrapped in { optionsJSON })
  const attResp = await startRegistration(options)

  // 3. Verify on server
  const verRes = await fetch('/api/auth/register/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: identityId, response: attResp }),
  })
  const { verified } = await verRes.json()
  if (!verified) throw new Error('La création du passkey a échoué.')

  const identity: Identity = {
    ...(existingIdentity ?? {}),
    id: identityId,
    pseudonym: displayName,
    seed: bytesToBase64(seedBytes),
    createdAt: existingIdentity?.createdAt ?? new Date().toISOString(),
    passkey: {
      credentialId: attResp.id,
      userHandle: identityId,
      createdAt: new Date().toISOString(),
    },
    authenticatedAt: new Date().toISOString(),
  }

  storeIdentity(identity)
  return identity
}

export async function authenticateIdentity(identity: Identity): Promise<Identity> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn nécessite HTTPS ou localhost et un navigateur compatible.')
  }

  // 1. Get options from server
  const optRes = await fetch('/api/auth/authenticate/generate-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: identity.id }),
  })
  if (!optRes.ok) throw new Error('Impossible de démarrer l\'authentification.')
  const options = await optRes.json()

  // 2. Browser WebAuthn ceremony (v10.0.0 takes options directly, not wrapped in { optionsJSON })
  const assertResp = await startAuthentication(options)

  // 3. Verify on server
  const verRes = await fetch('/api/auth/authenticate/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: identity.id, response: assertResp }),
  })
  const { verified } = await verRes.json()
  if (!verified) throw new Error('Authentification WebAuthn impossible.')

  const unlocked: Identity = { ...identity, authenticatedAt: new Date().toISOString() }
  storeIdentity(unlocked)
  return unlocked
}

// ── Vote encryption ──────────────────────────────────────────────────────────

export async function encryptForLocalIdentity(
  identity: Identity,
  payload: VotePayload
): Promise<EncryptedVoteEnvelope> {
  const seedBytes = base64ToBytes(identity.seed)
  const key = await importAesKey(seedBytes, 'vote-envelope')
  const iv = randomBytes(12)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encoder.encode(JSON.stringify(payload)))
  )
  return {
    alg: 'AES-GCM',
    kid: identity.id,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  }
}

export async function decryptForLocalIdentity(
  identity: Identity,
  envelope: EncryptedVoteEnvelope
): Promise<VotePayload> {
  const seedBytes = base64ToBytes(identity.seed)
  const key = await importAesKey(seedBytes, 'vote-envelope')
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(base64ToBytes(envelope.iv)) },
    key,
    toArrayBuffer(base64ToBytes(envelope.ciphertext))
  )
  return JSON.parse(decoder.decode(plaintext)) as VotePayload
}

export function storeEncryptedVote(
  identity: Identity,
  measureId: number,
  envelope: EncryptedVoteEnvelope
): void {
  localStorage.setItem(
    `${VOTE_KEY_PREFIX}${identity.id}.${measureId}`,
    JSON.stringify(envelope)
  )
}

export function getEncryptedVotesForIdentity(
  identity: Identity
): Array<{ measureId: number; envelope: EncryptedVoteEnvelope }> {
  if (!identity?.id || typeof window === 'undefined') return []
  const prefix = `${VOTE_KEY_PREFIX}${identity.id}.`
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(prefix))
    .map((k) => ({
      measureId: Number(k.replace(prefix, '')),
      envelope: JSON.parse(localStorage.getItem(k)!) as EncryptedVoteEnvelope,
    }))
}
