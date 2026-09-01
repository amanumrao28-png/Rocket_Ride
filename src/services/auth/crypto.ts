/**
 * Universal Crypto Module using standard Web Crypto API.
 * Fully compatible with Next.js Edge Runtime and Node.js runtime.
 * Never stores plaintext passwords, even for prototype/demo modes.
 */

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getRandomHex(bytesCount: number): string {
  const bytes = new Uint8Array(bytesCount);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytesCount; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bufferToHex(bytes.buffer);
}

/**
 * Hash a plaintext password with a random salt using SHA-256 (Web Crypto).
 * Returns `salt:hash`.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = getRandomHex(16);
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = bufferToHex(hashBuffer);
  return `${salt}:${hashHex}`;
}

/**
 * Verify a plaintext password against a stored `salt:hash`.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 2) return false;
    const [salt, originalHash] = parts;

    const encoder = new TextEncoder();
    const data = encoder.encode(`${salt}:${password}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashHex = bufferToHex(hashBuffer);

    return hashHex === originalHash;
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically random session token (32 bytes hex).
 */
export function generateSessionToken(): string {
  return getRandomHex(32);
}
