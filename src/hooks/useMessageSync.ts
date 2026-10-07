import { useEffect, useRef } from 'react';
import { subscribeToMessages } from '../lib/cloud';

/**
 * Calls `onChange` whenever a messages row is inserted or updated for the
 * signed-in user (Supabase Realtime - row-level security still filters the
 * events server-side). The very first callback fires only after realtime
 * confirms, so consumers keep their own initial load.
 *
 * If realtime cannot be established (table not in the `supabase_realtime`
 * publication, or the project has realtime off) the hook silently falls back
 * to the previous 15-second polling interval, so chat keeps working either
 * way - see supabase/patches/20261007_messages_read_and_realtime.sql.
 */
export function useMessageSync(onChange: () => void, enabled: boolean): void {
  const cbRef = useRef(onChange);
  cbRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    let close: (() => void) | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;

    const fire = () => {
      if (alive) cbRef.current();
    };
    const startFallback = () => {
      if (alive && !interval) interval = setInterval(fire, 15_000);
    };

    subscribeToMessages(fire, ['INSERT', 'UPDATE'])
      .then(sync => {
        if (!alive) {
          sync.close();
          return;
        }
        close = sync.close;
        sync.ready.then(ok => {
          if (alive && !ok) startFallback();
        });
      })
      .catch(() => startFallback());

    return () => {
      alive = false;
      close?.();
      if (interval) clearInterval(interval);
    };
  }, [enabled]);
}
