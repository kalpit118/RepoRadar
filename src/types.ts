// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types for RepoRadar
// ─────────────────────────────────────────────────────────────────────────────

/** A single repository's daily activity snapshot */
export interface RepoSnapshot {
  /** "owner/name" — e.g. "facebook/react" */
  repository: string;
  /** ISO date string: "YYYY-MM-DD" */
  date: string;
  /** ISO timestamp of when the data was collected */
  collectedAt: string;

  // ── Activity (last 24 h) ──────────────────────────────────────────────────
  commits: number;
  pullRequestsOpened: number;
  pullRequestsMerged: number;
  issuesOpened: number;
  issuesClosed: number;
  /** Unique authors with commit activity in the last 24 h */
  contributors: number;

  // ── Health ────────────────────────────────────────────────────────────────
  openPRs: number;
  /** PRs open longer than settings.stalePRDays */
  stalePRs: number;
  /** Issues open longer than settings.staleIssueDays */
  staleIssues: number;

  // ── Growth ────────────────────────────────────────────────────────────────
  stars: number;
  forks: number;
  watchers: number;

  // ── Releases ──────────────────────────────────────────────────────────────
  latestRelease: string | null;
  latestReleaseDate: string | null;
  /** Whole days since the latest release, null if no release exists */
  daysSinceRelease: number | null;

  /** true if the API returned an error for this repo (partial data) */
  error?: string;
}

/** Top-level array written to each daily data file */
export type DailySnapshot = RepoSnapshot[];

/** Aggregated summary written to data/summary.json */
export interface Summary {
  generatedAt: string;
  trackedRepositories: number;
  totalStars: number;
  totalForks: number;
  totalOpenPRs: number;
  totalStalePRs: number;
  totalStaleIssues: number;
  /** PRs opened across all repos in the last 24 h */
  prsLast24h: number;
  /** Issues opened across all repos in the last 24 h */
  issuesLast24h: number;
  /** Commits across all repos in the last 24 h */
  commitsLast24h: number;
  repositories: RepositorySummary[];
}

export interface RepositorySummary {
  repository: string;
  stars: number;
  forks: number;
  openPRs: number;
  stalePRs: number;
  staleIssues: number;
  latestRelease: string | null;
  daysSinceRelease: number | null;
}

/** Parsed config.yml */
export interface Config {
  repositories: string[];
  settings: {
    stalePRDays: number;
    staleIssueDays: number;
    timezone: string;
  };
}
