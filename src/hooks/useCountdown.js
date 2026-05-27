import { useEffect, useState } from 'react';

const STORAGE_KEY = '__predictionpost_target';
const pad = (n) => String(n).padStart(2, '0');

// Counts down to a kick-off target that is fixed at `offsetSeconds` from the
// first ever load, then persisted in localStorage so it survives refreshes —
// matching the behaviour of the original prototype.
export default function useCountdown(offsetSeconds = 4 * 3600 + 11 * 60 + 23) {
  const [remaining, setRemaining] = useState({ d: '00', h: '04', m: '11', s: '23' });

  useEffect(() => {
    let target = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    if (!target || target < Date.now()) {
      target = Date.now() + offsetSeconds * 1000;
      localStorage.setItem(STORAGE_KEY, String(target));
    }

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining({
        d: pad(Math.floor(diff / 86400000)),
        h: pad(Math.floor(diff / 3600000) % 24),
        m: pad(Math.floor(diff / 60000) % 60),
        s: pad(Math.floor(diff / 1000) % 60),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offsetSeconds]);

  return remaining;
}

// Counts down to a real target (ISO string or Date) — used for the next
// actual kick-off. Returns zeros once the target has passed.
export function useCountdownTo(target) {
  const [remaining, setRemaining] = useState({ d: '00', h: '00', m: '00', s: '00' });

  useEffect(() => {
    if (!target) return;
    const t = new Date(target).getTime();

    const tick = () => {
      const diff = Math.max(0, t - Date.now());
      setRemaining({
        d: pad(Math.floor(diff / 86400000)),
        h: pad(Math.floor(diff / 3600000) % 24),
        m: pad(Math.floor(diff / 60000) % 60),
        s: pad(Math.floor(diff / 1000) % 60),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return remaining;
}
