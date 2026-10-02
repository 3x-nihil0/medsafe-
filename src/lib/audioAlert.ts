/**
 * Web Audio API Clinical Notification Chime
 * 
 * Synthesizes an audible 2-tone chime (A5: 880Hz -> C6: 1046.5Hz) when
 * a medication dose is due, ensuring patients and clinicians are alerted
 * even when focusing on another window or looking away.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function isAudioAlertEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('medsafe_audio_alerts');
  if (stored !== null) {
    return stored === 'true';
  }
  return soundEnabled;
}

export function setAudioAlertEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('medsafe_audio_alerts', String(enabled));
  }
}

export function playDoseReminderChime(): void {
  if (!isAudioAlertEnabled()) return;
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Tone 1: 880 Hz (A5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 1046.5 Hz (C6) - slightly higher pitch for attention
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.2);

    gain2.gain.setValueAtTime(0, now + 0.2);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.24);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc2.start(now + 0.2);
    osc2.stop(now + 0.65);
  } catch (err) {
    console.warn('Web Audio chime playback not permitted or failed:', err);
  }
}
