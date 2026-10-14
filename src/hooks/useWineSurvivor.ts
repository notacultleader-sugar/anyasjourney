import { useCallback, useEffect, useState } from 'react';
import { config } from '@/constants/config';
import { wineSurvivorFallback, type WineSurvivor } from '@/data/wineSurvivor';

// The web preview always shows the game switched on so it can be reviewed.
const initial: WineSurvivor = config.previewMode
  ? { ...wineSurvivorFallback, active: true }
  : wineSurvivorFallback;

const isValid = (data: any): data is Partial<WineSurvivor> =>
  data && typeof data === 'object' && typeof data.active === 'boolean';

// Loads the game's on/off switch, next date, tribes and draw results from the
// website, so the charity can run the game without an app update.
export function useWineSurvivor() {
  const [data, setData] = useState<WineSurvivor>(initial);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.wineSurvivorUrl}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!isValid(json)) throw new Error('Unexpected format');
      setData({ ...initial, ...json, ...(config.previewMode ? { active: true } : null) });
      setIsLive(true);
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, isLive, refresh };
}
