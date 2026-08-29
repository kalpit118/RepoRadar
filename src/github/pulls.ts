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

  // ── Open PRs (for openPRs count and stalePRs) ─────────────────────────────
  let page = 1;
  while (true) {
    const { data } = await client.pulls.list({
      owner,
      repo,
      state: 'open',
      per_page: 100,
      page,
      sort: 'created',
      direction: 'desc',
    });

    if (data.length === 0) break;

    for (const pr of data) {
      openPRs++;
      if (pr.created_at < staleThreshold) stalePRs++;
    }

    if (data.length < 100) break;
    page++;
  }

  // ── PRs opened in last 24h (state=all, filter by created_at) ─────────────
  page = 1;
  while (true) {
    const { data } = await client.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 100,
      page,
      sort: 'created',
      direction: 'desc',
    });

    if (data.length === 0) break;

    // Once we're past the 24h window we can stop paginating
    const anyInWindow = data.some((pr) => pr.created_at >= since24h);
    if (!anyInWindow) break;

    for (const pr of data) {
      if (pr.created_at >= since24h) {
        pullRequestsOpened++;
      }
      if (pr.merged_at && pr.merged_at >= since24h) {
        pullRequestsMerged++;
      }
    }

    if (data.length < 100) break;
    page++;
  }

  return { pullRequestsOpened, pullRequestsMerged, openPRs, stalePRs };
}
