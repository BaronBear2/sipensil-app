import crypto from 'crypto'

// Use SUPABASE_SERVICE_ROLE_KEY or a fallback secret key for AES-256-GCM (32 bytes)
const SECRET_KEY_STR = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sipensil-secret-encryption-key-32b!'
const KEY = crypto.createHash('sha256').update(SECRET_KEY_STR).digest()

const ENCRYPTION_PREFIX = 'enc:v1:'

/**
 * Encrypts a URL string using AES-256-GCM.
 * Returns encrypted string prefixed with 'enc:v1:'.
 * If already encrypted or null, returns input as is.
 */
export function encryptUrl(url: string | null | undefined): string | null {
    if (!url || typeof url !== 'string' || url.startsWith(ENCRYPTION_PREFIX)) {
        return url || null
    }

    try {
        const iv = crypto.randomBytes(12)
        const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv)
        let encrypted = cipher.update(url, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        const authTag = cipher.getAuthTag().toString('hex')

        return `${ENCRYPTION_PREFIX}${iv.toString('hex')}:${authTag}:${encrypted}`
    } catch (err) {
        console.error('[crypto] URL encryption error:', err)
        return url
    }
}

/**
 * Decrypts an encrypted URL string using AES-256-GCM.
 * If input is unencrypted, null, or invalid, safely returns original string.
 */
export function decryptUrl(encryptedUrl: string | null | undefined): string | null {
    if (!encryptedUrl || typeof encryptedUrl !== 'string' || !encryptedUrl.startsWith(ENCRYPTION_PREFIX)) {
        return encryptedUrl || null
    }

    try {
        const parts = encryptedUrl.substring(ENCRYPTION_PREFIX.length).split(':')
        if (parts.length !== 3) return encryptedUrl

        const [ivHex, authTagHex, cipherHex] = parts
        const iv = Buffer.from(ivHex, 'hex')
        const authTag = Buffer.from(authTagHex, 'hex')
        const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv)
        decipher.setAuthTag(authTag)

        let decrypted = decipher.update(cipherHex, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    } catch (err) {
        console.error('[crypto] URL decryption error:', err)
        return encryptedUrl
    }
}

/**
 * Guard Rail Helper: Guarantees profile_pencaker object is non-null and URL fields are decrypted.
 */
export function getSafePencakerProfile(profile: any) {
    if (!profile) return { profile_pencaker: {} }

    const rawPencaker = Array.isArray(profile.profile_pencaker)
        ? profile.profile_pencaker[0] || {}
        : (profile.profile_pencaker || {})

    return {
        ...profile,
        photo_url: decryptUrl(profile.photo_url || rawPencaker.photo_url),
        profile_pencaker: {
            ...rawPencaker,
            ktp_url: decryptUrl(rawPencaker.ktp_url),
            ijazah_url: decryptUrl(rawPencaker.ijazah_url),
            photo_url: decryptUrl(rawPencaker.photo_url),
        }
    }
}
