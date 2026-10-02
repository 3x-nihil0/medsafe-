/**
 * Local-first persistence layer.
 *
 * Every clinical collection is read and written through these helpers, so the
 * whole app works with no server, no database and no network. A future sync
 * backend can be layered on top later (read-through / write-through) without
 * touching any call site.
 */

const PREFIX = 'medsafe_clinical_v1';

export type CollectionName =
  | 'patients'
  | 'medications'
  | 'allergies'
  | 'interactionRules'
  | 'reminders'
  | 'refillNotifications'
  | 'alertLogs';

function key(name: CollectionName): string {
  return `${PREFIX}_${name}`;
}

export function readCollection<T>(name: CollectionName, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(name));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`MedSafe: failed to read "${name}", using defaults.`, err);
    return fallback;
  }
}

export function writeCollection(name: CollectionName, value: unknown): void {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
  } catch (err) {
    // Quota exceeded is the realistic failure (large profile photos).
    console.error(`MedSafe: could not save "${name}" to device storage.`, err);
  }
}

export function readSetting<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${PREFIX}_${name}`);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeSetting(name: string, value: unknown): void {
  try {
    localStorage.setItem(`${PREFIX}_${name}`, JSON.stringify(value));
  } catch (err) {
    console.error(`MedSafe: could not save setting "${name}".`, err);
  }
}

/** Erase every piece of MedSafe data stored on this device. */
export function eraseAllData(): void {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(PREFIX) || k.startsWith('medsafe_'))) doomed.push(k);
    }
    doomed.forEach(k => localStorage.removeItem(k));
  } catch (err) {
    console.error('MedSafe: failed to erase local data.', err);
  }
}
