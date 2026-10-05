/**
 * Optional PIN app lock.
 *
 * The PIN guards the app when it is opened or brought back to the
 * foreground - it is a screen lock, not encryption: the health data itself
 * stays in plain browser storage on the device (see PRIVACY_POLICY.md).
 *
 * The PIN is never stored. A random salt plus a PBKDF2-SHA256 hash is saved,
 * so the PIN cannot be recovered from storage.
 */

const STORAGE_KEY = 'medsafe_app_lock';
const ITERATIONS = 150_000;
const encoder = new TextEncoder();

export const PIN_LENGTH = 4;

interface LockRecord {
  salt: string;
  hash: string;
  iterations: number;
  createdAt: string;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function derive(salt: Uint8Array, pin: string, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash: 'SHA-256' },
    key,
    256
  );
  return toHex(bits);
}

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

function readRecord(): LockRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LockRecord;
    return parsed && parsed.salt && parsed.hash ? parsed : null;
  } catch {
    return null;
  }
}

export function isPinSet(): boolean {
  return readRecord() !== null;
}

/** Store a new PIN, replacing any existing one. */
export async function setPin(pin: string): Promise<void> {
  if (!isValidPin(pin)) throw new Error('PIN must be exactly 4 digits.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(salt, pin, ITERATIONS);
  const record: LockRecord = {
    salt: toHex(salt.buffer as ArrayBuffer),
    hash,
    iterations: ITERATIONS,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

/** Constant-work verification of a candidate PIN. */
export async function verifyPin(pin: string): Promise<boolean> {
  const record = readRecord();
  if (!record) return false;
  if (!isValidPin(pin)) return false;
  try {
    const candidate = await derive(fromHex(record.salt), pin, record.iterations || ITERATIONS);
    // Compare manually to keep the work independent of the outcome.
    let diff = 0;
    for (let i = 0; i < candidate.length; i++) {
      diff |= candidate.charCodeAt(i) ^ record.hash.charCodeAt(i);
    }
    return diff === 0;
  } catch (err) {
    console.error('MedSafe: PIN verification failed.', err);
    return false;
  }
}

/** Remove the lock without touching any health data. */
export function clearPin(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('MedSafe: could not remove the app lock.', err);
  }
}
