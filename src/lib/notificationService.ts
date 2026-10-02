/**
 * Web Notifications & Push Alert Manager
 * 
 * Manages system-level desktop/mobile push notifications for dose reminders.
 * Operates even when the browser tab is minimized or in the background.
 */

export interface NotificationPayload {
  title: string;
  body: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return 'denied';
  }
}

export function sendDesktopNotification(payload: NotificationPayload): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    // If Service Worker registration is active with showNotification, use it
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(payload.title, {
          body: payload.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: payload.tag || 'medsafe-dose',
          data: payload.data || {},
          requireInteraction: payload.requireInteraction ?? true,
        });
      }).catch(() => {
        // Fallback to standard window Notification
        fallbackWindowNotification(payload);
      });
      return true;
    }

    return fallbackWindowNotification(payload);
  } catch (err) {
    console.warn('Could not display desktop notification:', err);
    return false;
  }
}

function fallbackWindowNotification(payload: NotificationPayload): boolean {
  try {
    const notif = new Notification(payload.title, {
      body: payload.body,
      icon: '/favicon.ico',
      tag: payload.tag || 'medsafe-dose',
      requireInteraction: payload.requireInteraction ?? true,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn('Fallback window notification error:', err);
    return false;
  }
}
