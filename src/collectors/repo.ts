import { fetchCommitStats } from '../github/commits.js';
import { fetchPullStats } from '../github/pulls.js';
import { fetchIssueStats } from '../github/issues.js';
import { fetchReleaseStats } from '../github/releases.js';
import type { RepoSnapshot } from '../types.js';

/**
 * Orchestrates all GitHub API calls for a single repository and assembles
 * a complete RepoSnapshot. Any error is caught and surfaced in the `error`
 * field so one bad repo doesn't abort the entire run.
 */
export async function collectRepo(
  fullRepo: string,
  date: string,
  stalePRDays: number,
  staleIssueDays: number
): Promise<RepoSnapshot> {
  const collectedAt = new Date().toISOString();
  console.log(`  ⏳ Collecting ${fullRepo}…`);

  try {
    const [commits, pulls, issues, releases] = await Promise.all([
      fetchCommitStats(fullRepo),
      fetchPullStats(fullRepo, stalePRDays),
      fetchIssueStats(fullRepo, staleIssueDays),
      fetchReleaseStats(fullRepo),
    ]);

    const snapshot: RepoSnapshot = {
      repository: fullRepo,
      date,
      collectedAt,
      // Activity
      commits: commits.commits,
      pullRequestsOpened: pulls.pullRequestsOpened,
      pullRequestsMerged: pulls.pullRequestsMerged,
      issuesOpened: issues.issuesOpened,
      issuesClosed: issues.issuesClosed,
      contributors: commits.contributors,
      // Health
      openPRs: pulls.openPRs,
      stalePRs: pulls.stalePRs,
      staleIssues: issues.staleIssues,
      // Growth
      stars: releases.stars,
      forks: releases.forks,
      watchers: releases.watchers,
      // Releases
      latestRelease: releases.latestRelease,
      latestReleaseDate: releases.latestReleaseDate,
      daysSinceRelease: releases.daysSinceRelease,
    };

    console.log(
      `  ✅ ${fullRepo} — ${snapshot.commits} commits, ` +
      `${snapshot.pullRequestsOpened} PRs opened, ` +
      `${snapshot.stars.toLocaleString()} ⭐`
    );

    return snapshot;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ ${fullRepo} — ${message}`);

    // Return a skeleton snapshot so the file is still valid JSON
    return {
      repository: fullRepo,
      date,
      collectedAt,
      commits: 0,
      pullRequestsOpened: 0,
      pullRequestsMerged: 0,
      issuesOpened: 0,
      issuesClosed: 0,
      contributors: 0,
      openPRs: 0,
      stalePRs: 0,
      staleIssues: 0,
      stars: 0,
      forks: 0,
      watchers: 0,
      latestRelease: null,
      latestReleaseDate: null,
      daysSinceRelease: null,
      error: message,
    };
  }
}
