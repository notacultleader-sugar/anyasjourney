import { useCallback, useEffect, useState } from 'react';
import { config } from '@/constants/config';
import { fetchSheetTotals } from '@/lib/fundraisingSheet';
import { fetchSiteTotals } from '@/lib/siteThermometer';

export type Fundraising = {
  title: string;
  goal: number;
  raised: number;
  updated: string;
};

const isValid = (data: any): data is Fundraising =>
  data && typeof data.goal === 'number' && typeof data.raised === 'number' && data.goal > 0;

// Loads the live fundraising total from the website so it stays current
// without an app update.
export function useFundraising() {
  const [data, setData] = useState<Fundraising>(config.fundraisingFallback);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    // First choice: the charity's Google Sheet. Then the CauseVox thermometer
    // on the homepage.
    for (const source of [fetchSheetTotals, fetchSiteTotals]) {
      try {
        const totals = await source();
        if (totals) {
          setData({ ...config.fundraisingFallback, ...totals });
          setIsLive(true);
          setLoading(false);
          return;
        }
      } catch {
        // try the next source, then the JSON file
      }
    }
    try {
      const res = await fetch(`${config.fundraisingUrl}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!isValid(json)) throw new Error('Unexpected format');
      setData({ ...config.fundraisingFallback, ...json });
      setIsLive(true);
    } catch {
      setIsLive(false);
      // Couldn't reach the site: keep the last known total from config.
      setData(config.fundraisingFallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, isLive, refresh };
}
