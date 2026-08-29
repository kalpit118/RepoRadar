import { getClient, parseRepo, hoursAgo, daysAgo } from './client.js';

export interface IssueStats {
  issuesOpened: number;
  issuesClosed: number;
  staleIssues: number;
}

/**
 * Fetches issue statistics for a repository:
 * - opened in last 24h
 * - closed in last 24h
 * - open issues that haven't been updated in more than `staleDays` days
 *
 * Note: GitHub's issues API also returns PRs; we filter them out via pull_request field.
 */
export async function fetchIssueStats(
  fullRepo: string,
  staleDays: number
): Promise<IssueStats> {
  const client = getClient();
  const { owner, repo } = parseRepo(fullRepo);

  const since24h = hoursAgo(24);
  const staleThreshold = daysAgo(staleDays);

  let issuesOpened = 0;
  let issuesClosed = 0;
  let staleIssues = 0;

  // ── Open issues (for stale count) ─────────────────────────────────────────
  let page = 1;
  while (true) {
    const { data } = await client.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 100,
      page,
      sort: 'updated',
      direction: 'asc', // oldest first to detect stale efficiently
    });

    if (data.length === 0) break;

    for (const issue of data) {
      // Skip pull requests
      if (issue.pull_request) continue;
      if ((issue.updated_at ?? issue.created_at) < staleThreshold) staleIssues++;
    }

    if (data.length < 100) break;
    page++;
  }

  // ── Issues opened/closed in last 24h ──────────────────────────────────────
  page = 1;
  while (true) {
    const { data } = await client.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      since: since24h,
      per_page: 100,
      page,
      sort: 'created',
      direction: 'desc',
    });

    if (data.length === 0) break;

    for (const issue of data) {
      if (issue.pull_request) continue; // skip PRs
      if (issue.created_at >= since24h) issuesOpened++;
      if (issue.closed_at && issue.closed_at >= since24h) issuesClosed++;
    }

    if (data.length < 100) break;
    page++;
  }

  return { issuesOpened, issuesClosed, staleIssues };
}
