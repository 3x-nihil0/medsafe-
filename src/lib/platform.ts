/**
 * True when the app is running inside the native (Capacitor) shell,
 * false in a normal browser / installed PWA.
 *
 * Used to disable browser-only behaviour that does not apply to the APK:
 * service worker caching (which would go stale across app updates) and the
 * "Install on Phone" prompt (the app already *is* installed).
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  const bridge = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return typeof bridge?.isNativePlatform === 'function' && bridge.isNativePlatform();
}
