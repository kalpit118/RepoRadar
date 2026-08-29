import { useState, useEffect } from 'react';
import type { RepoSnapshot, Summary } from '../types.ts';

export interface SnapshotData {
  snapshots: RepoSnapshot[];
  summary: Summary | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches the latest snapshot array and the summary aggregation.
 * In development the files come from the local /data/ folder;
 * in production (GitHub Pages) they are committed JSON files served statically.
 */
export function useSnapshot(): SnapshotData {
  const [snapshots, setSnapshots] = useState<RepoSnapshot[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;

    async function load() {
      try {
        const [latestRes, summaryRes] = await Promise.all([
          fetch(`${base}data/latest.json`),
          fetch(`${base}data/summary.json`),
        ]);

        if (!latestRes.ok) throw new Error(`latest.json: ${latestRes.status} ${latestRes.statusText}`);
        if (!summaryRes.ok) throw new Error(`summary.json: ${summaryRes.status} ${summaryRes.statusText}`);

        const [latestData, summaryData] = await Promise.all([
          latestRes.json() as Promise<RepoSnapshot[]>,
          summaryRes.json() as Promise<Summary>,
        ]);

        setSnapshots(latestData);
        setSummary(summaryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return { snapshots, summary, loading, error };
}
