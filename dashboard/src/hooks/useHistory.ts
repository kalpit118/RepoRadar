import { useState, useEffect } from 'react';
import type { RepoSnapshot } from '../types.ts';

export interface HistoryEntry {
  date: string;
  snapshots: RepoSnapshot[];
}

/**
 * Fetches up to `days` past daily snapshot files (working backwards from today).
 * Returns entries sorted oldest-first for charting.
 */
export function useHistory(days = 7): {
  history: HistoryEntry[];
  loading: boolean;
} {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;

    async function load() {
      const results: HistoryEntry[] = [];
      const today = new Date();

      const fetches = Array.from({ length: days }, (_, i) => {
        const d = new Date(today);
        d.setUTCDate(today.getUTCDate() - i);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const date = `${yyyy}-${mm}-${dd}`;
        const url = `${base}data/${yyyy}/${mm}/${dd}.json`;
        return { date, url };
      });

      await Promise.allSettled(
        fetches.map(async ({ date, url }) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return;
            const data = (await res.json()) as RepoSnapshot[];
            results.push({ date, snapshots: data });
          } catch {
            // silently skip missing days
          }
        })
      );

      // Sort oldest-first for charts
      results.sort((a, b) => a.date.localeCompare(b.date));
      setHistory(results);
      setLoading(false);
    }

    void load();
  }, [days]);

  return { history, loading };
}
