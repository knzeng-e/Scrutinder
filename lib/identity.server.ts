// Server-only. Never import this in client components.
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers'
import { prisma } from './db'

const RP_NAME = 'Scrutinder'
const RP_ID = process.env.WEBAUTHN_RP_ID ?? 'localhost'
const ORIGIN = process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:3000'
const CHALLENGE_TTL_MS = 60_000

async function cleanExpiredChallenges() {
  await prisma.webAuthnChallenge.deleteMany({ where: { expiresAt: { lt: new Date() } } })
}

// ── Registration ─────────────────────────────────────────────────────────────

export async function generateRegistrationOptionsForUser(userId: string, pseudonym: string) {
  await cleanExpiredChallenges()

  // userID is optional in v10 - omitting it lets the library generate a random one.
  // We identify users by userId (stored as challenge.userId), not by the WebAuthn userHandle.
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: userId,
    userDisplayName: pseudonym || 'Citoyen',
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'required',
    },
    supportedAlgorithmIDs: [-7, -257],
  })

  await prisma.webAuthnChallenge.create({
    data: {
      challenge: options.challenge,
      userId,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  })

  return options
}

export async function verifyRegistrationForUser(
  userId: string,
  response: unknown
): Promise<boolean> {
  const challengeRecord = await prisma.webAuthnChallenge.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })
  if (!challengeRecord) throw new Error('Challenge expiré ou introuvable.')

  let verification: Awaited<ReturnType<typeof verifyRegistrationResponse>>
  try {
    verification = await verifyRegistrationResponse({
      response: response as Parameters<typeof verifyRegistrationResponse>[0]['response'],
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    })
  } catch {
    return false
  }

  await prisma.webAuthnChallenge.delete({ where: { id: challengeRecord.id } })

  if (!verification.verified || !verification.registrationInfo) return false

  // v10.0.1: registrationInfo exposes credentialID, credentialPublicKey, counter directly
  // (not nested under a `credential` object as in later versions)
  const {
    credentialID,        // Base64URLString - already a string, no conversion needed
    credentialPublicKey, // Uint8Array - must be converted to base64url for storage
    counter,
    credentialDeviceType,
    credentialBackedUp,
  } = verification.registrationInfo

  // Transports are on the browser response, not in registrationInfo in v10
  const browserResponse = response as { response?: { transports?: string[] } }
  const transports: string[] = browserResponse?.response?.transports ?? []

  await prisma.webAuthnCredential.create({
    data: {
      credentialId: credentialID,
      userId,
      publicKey: isoBase64URL.fromBuffer(credentialPublicKey),
      counter: BigInt(counter),
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports,
    },
  })

  return true
}

// ── Authentication ────────────────────────────────────────────────────────────

export async function generateAuthenticationOptionsForUser(userId: string) {
  await cleanExpiredChallenges()

  const credentials = await prisma.webAuthnCredential.findMany({
    where: { userId },
    select: { credentialId: true, transports: true },
  })

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: credentials.map((c) => ({
      id: c.credentialId,
      transports: c.transports as AuthenticatorTransport[],
    })),
    userVerification: 'required',
  })

  await prisma.webAuthnChallenge.create({
    data: {
      challenge: options.challenge,
      userId,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  })

  return options
}

export async function verifyAuthenticationForUser(
  userId: string,
  response: unknown
): Promise<boolean> {
  const challengeRecord = await prisma.webAuthnChallenge.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })
  if (!challengeRecord) throw new Error('Challenge expiré ou introuvable.')

  const responseObj = response as { id: string }
  const storedCredential = await prisma.webAuthnCredential.findUnique({
    where: { credentialId: responseObj.id },
  })
  if (!storedCredential || storedCredential.userId !== userId) return false

  let verification: Awaited<ReturnType<typeof verifyAuthenticationResponse>>
  try {
    // v10.0.1: uses `authenticator: AuthenticatorDevice` (not `credential`)
    verification = await verifyAuthenticationResponse({
      response: response as Parameters<typeof verifyAuthenticationResponse>[0]['response'],
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: storedCredential.credentialId,
        credentialPublicKey: isoBase64URL.toBuffer(storedCredential.publicKey),
        counter: Number(storedCredential.counter),
        transports: storedCredential.transports as AuthenticatorTransport[],
      },
    })
  } catch {
    return false
  }

  await prisma.webAuthnChallenge.delete({ where: { id: challengeRecord.id } })

  if (!verification.verified) return false

  await prisma.webAuthnCredential.update({
    where: { credentialId: storedCredential.credentialId },
    data: {
      counter: BigInt(verification.authenticationInfo.newCounter),
      lastUsedAt: new Date(),
    },
  })

  return true
}
