// Dashboard-side types — mirrors src/types.ts from the collector

export interface RepoSnapshot {
  repository: string;
  date: string;
  collectedAt: string;
  commits: number;
  pullRequestsOpened: number;
  pullRequestsMerged: number;
  issuesOpened: number;
  issuesClosed: number;
  contributors: number;
  openPRs: number;
  stalePRs: number;
  staleIssues: number;
  stars: number;
  forks: number;
  watchers: number;
  latestRelease: string | null;
  latestReleaseDate: string | null;
  daysSinceRelease: number | null;
  error?: string;
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

export interface Summary {
  generatedAt: string;
  trackedRepositories: number;
  totalStars: number;
  totalForks: number;
  totalOpenPRs: number;
  totalStalePRs: number;
  totalStaleIssues: number;
  prsLast24h: number;
  issuesLast24h: number;
  commitsLast24h: number;
  repositories: RepositorySummary[];
}

export type SortKey = 'stars' | 'commits' | 'openPRs' | 'stalePRs' | 'staleIssues' | 'pullRequestsOpened';
export type SortDir = 'asc' | 'desc';
