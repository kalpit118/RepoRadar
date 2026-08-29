import { writeFileSync } from 'fs';
import { rootPath } from '../config.js';
import type { DailySnapshot, Summary } from '../types.js';

/**
 * Generates data/summary.json — a pre-aggregated view of the latest snapshot
 * used by the dashboard's summary cards without needing to parse all repos.
 */
export function writeSummary(snapshots: DailySnapshot): void {
  const summary: Summary = {
    generatedAt: new Date().toISOString(),
    trackedRepositories: snapshots.length,
    totalStars: sum(snapshots, 'stars'),
    totalForks: sum(snapshots, 'forks'),
    totalOpenPRs: sum(snapshots, 'openPRs'),
    totalStalePRs: sum(snapshots, 'stalePRs'),
    totalStaleIssues: sum(snapshots, 'staleIssues'),
    prsLast24h: sum(snapshots, 'pullRequestsOpened'),
    issuesLast24h: sum(snapshots, 'issuesOpened'),
    commitsLast24h: sum(snapshots, 'commits'),
    repositories: snapshots.map((s) => ({
      repository: s.repository,
      stars: s.stars,
      forks: s.forks,
      openPRs: s.openPRs,
      stalePRs: s.stalePRs,
      staleIssues: s.staleIssues,
      latestRelease: s.latestRelease,
      daysSinceRelease: s.daysSinceRelease,
    })),
  };

  const path = rootPath('data', 'summary.json');
  writeFileSync(path, JSON.stringify(summary, null, 2), 'utf8');
  console.log('📁 Written: data/summary.json');
}

function sum(snapshots: DailySnapshot, key: keyof DailySnapshot[number]): number {
  return snapshots.reduce((acc, s) => acc + ((s[key] as number) || 0), 0);
}
