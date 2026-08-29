import { getClient, parseRepo, hoursAgo, daysAgo } from './client.js';

export interface PullStats {
  pullRequestsOpened: number;
  pullRequestsMerged: number;
  openPRs: number;
  stalePRs: number;
}

/**
 * Fetches PR statistics for a repository:
 * - opened in last 24h
 * - merged in last 24h
 * - currently open count
 * - PRs open longer than `staleDays`
 *
 * Uses octokit.paginate() which follows Link-header cursors instead of
 * incrementing a page offset, avoiding the GitHub 422 for large repos.
 * An early-exit callback stops paging once we've moved past the windows
 * we care about, keeping API usage proportional to real activity.
 */
export async function fetchPullStats(
  fullRepo: string,
  staleDays: number
): Promise<PullStats> {
  const client = getClient();
  const { owner, repo } = parseRepo(fullRepo);

  const since24h = hoursAgo(24);
  const staleThreshold = daysAgo(staleDays);

  let pullRequestsOpened = 0;
  let pullRequestsMerged = 0;
  let openPRs = 0;
  let stalePRs = 0;

  // ── Open PRs — sorted newest-first so we can count openPRs and stalePRs ──
  // We accumulate all open PRs (no early exit possible: stale ones are at the
  // end when sorting desc). For very large open-PR backlogs we cap at 5,000
  // (50 pages) to stay within a sensible rate-limit budget.
  const MAX_OPEN_PR_PAGES = 50;
  let openPRPages = 0;

  await client.paginate(
    client.pulls.list,
    { owner, repo, state: 'open', per_page: 100, sort: 'created', direction: 'desc' },
    (response, done) => {
      openPRPages++;
      for (const pr of response.data) {
        openPRs++;
        if (pr.created_at < staleThreshold) stalePRs++;
      }
      if (openPRPages >= MAX_OPEN_PR_PAGES) done();
      return response.data;
    }
  );

  // ── PRs opened/merged in the last 24h ─────────────────────────────────────
  // Sort newest-first and stop paging as soon as a full page falls outside
  // the 24h window — keeps this to 1–2 pages in most cases.
  await client.paginate(
    client.pulls.list,
    { owner, repo, state: 'all', per_page: 100, sort: 'created', direction: 'desc' },
    (response, done) => {
      let anyInWindow = false;
      for (const pr of response.data) {
        if (pr.created_at >= since24h) {
          anyInWindow = true;
          pullRequestsOpened++;
        }
        if (pr.merged_at && pr.merged_at >= since24h) {
          pullRequestsMerged++;
        }
      }
      // Once every PR on this page is older than 24h we're done
      if (!anyInWindow) done();
      return response.data;
    }
  );

  return { pullRequestsOpened, pullRequestsMerged, openPRs, stalePRs };
}
