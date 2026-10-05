import React, { useEffect, useState } from 'react';
import { ShieldCheck, Delete, ArrowLeft, AlertTriangle, Trash2 } from 'lucide-react';
import { PIN_LENGTH, verifyPin, clearPin } from '../lib/appLock';
import { eraseAllData } from '../services/store';

interface AppLockScreenProps {
  mode: 'unlock' | 'setup';
  onUnlock: () => void;
  onSetPin: (pin: string) => Promise<void> | void;
  onCancelSetup: () => void;
}

type Stage = 'enter' | 'confirm';

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  mode,
  onUnlock,
  onSetPin,
  onCancelSetup
}) => {
  const [digits, setDigits] = useState('');
  const [stage, setStage] = useState<Stage>('enter');
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const isSetup = mode === 'setup';

  const submit = async (value: string) => {
    if (busy) return;
    setError(null);

    if (isSetup && stage === 'enter') {
      setFirstPin(value);
      setStage('confirm');
      setDigits('');
      return;
    }

    if (isSetup && stage === 'confirm') {
      if (value !== firstPin) {
        setStage('enter');
        setFirstPin(null);
        setDigits('');
        setError('PINs did not match. Try again.');
        return;
      }
      setBusy(true);
      try {
        await onSetPin(value);
      } finally {
        setBusy(false);
      }
      return;
    }

    // unlock
    setBusy(true);
    const ok = await verifyPin(value);
    setBusy(false);
    if (ok) {
      onUnlock();
    } else {
      setDigits('');
      setError('Incorrect PIN.');
    }
  };

  const press = (d: string) => {
    if (busy || digits.length >= PIN_LENGTH) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === PIN_LENGTH) {
      // let the last dot render before evaluating
      window.setTimeout(() => submit(next), 120);
    }
  };

  const back = () => {
    setError(null);
    setDigits(prev => prev.slice(0, -1));
  };

  // Physical keyboard support (desktop browsers)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showRecovery) return;
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const removeLock = () => {
    clearPin();
    onUnlock();
  };

  const eraseEverything = () => {
    if (window.confirm('Erase every profile, medication and allergy on this device? The app lock will be removed too.')) {
      eraseAllData();
      window.location.reload();
    }
  };

  const title = isSetup
    ? stage === 'enter'
      ? 'Choose a 4-digit PIN'
      : 'Confirm your PIN'
    : 'MedSafe is locked';

  const subtitle = isSetup
    ? stage === 'enter'
      ? 'You will need it every time the app is opened.'
      : 'Enter the same PIN once more.'
    : 'Enter your 4-digit PIN to continue.';

  return (
    <div className="fixed inset-0 z-[60] safe-top safe-bottom bg-gradient-to-b from-teal-700 via-teal-800 to-slate-900 flex flex-col items-center justify-center px-6 py-8 text-white">
      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
        <ShieldCheck className="w-7 h-7 text-white" />
      </div>

      <h1 className="mt-4 text-lg font-bold">{title}</h1>
      <p className="mt-1 text-xs text-teal-100/80 text-center max-w-xs">{subtitle}</p>

      {showRecovery ? (
        <div className="mt-6 w-full max-w-xs space-y-2">
          <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-teal-50 leading-relaxed">
            Forgotten your PIN? Your data is stored unencrypted on this device, so it can be
            unlocked - or erased - from here.
          </div>
          <button
            onClick={removeLock}
            className="w-full py-2.5 rounded-xl bg-white text-teal-800 text-sm font-semibold active:scale-[0.99]"
          >
            Remove lock, keep my data
          </button>
          <button
            onClick={eraseEverything}
            className="w-full py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Trash2 className="w-4 h-4" />
            <span>Erase everything</span>
          </button>
          <button
            onClick={() => setShowRecovery(false)}
            className="w-full py-2 text-xs text-teal-100/80 hover:text-white"
          >
            Back
          </button>
        </div>
      ) : (
        <>
          {/* PIN dots */}
          <div className="mt-7 flex items-center gap-4" aria-label="PIN entry">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <span
                key={i}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  i < digits.length
                    ? 'bg-white border-white scale-110'
                    : 'bg-white/15 border-white/40'
                }`}
              />
            ))}
          </div>

          {error && (
            <div role="alert" className="mt-3 flex items-center gap-1.5 text-xs text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}
          {busy && <div className="mt-3 text-xs text-teal-100/80">Checking…</div>}

          {/* Keypad */}
          <div className="mt-7 grid grid-cols-3 gap-3 w-60">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
              <button
                key={d}
                onClick={() => press(d)}
                aria-label={`Digit ${d}`}
                className="h-14 rounded-2xl bg-white/10 hover:bg-white/15 active:bg-white/25 border border-white/10 text-xl font-semibold transition"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => (isSetup ? onCancelSetup() : setShowRecovery(true))}
              aria-label={isSetup ? 'Cancel setup' : 'Forgot PIN'}
              className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-teal-100 transition"
            >
              {isSetup ? 'Cancel' : 'Forgot?'}
            </button>
            <button
              onClick={() => press('0')}
              aria-label="Digit 0"
              className="h-14 rounded-2xl bg-white/10 hover:bg-white/15 active:bg-white/25 border border-white/10 text-xl font-semibold transition"
            >
              0
            </button>
            <button
              onClick={back}
              aria-label="Delete last digit"
              className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {!isSetup && (
            <button
              onClick={onUnlock}
              className="mt-5 text-[11px] text-teal-100/70 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Not you? Switch profile</span>
            </button>
          )}
        </>
      )}

      <p className="mt-auto pt-6 text-[10px] text-teal-100/60 text-center max-w-xs">
        Your health data stays on this device. The PIN locks the app; it does not encrypt the
        stored files.
      </p>
    </div>
  );
};
