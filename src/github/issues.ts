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
 *
 * Uses octokit.paginate() which follows Link-header cursors instead of
 * incrementing a page offset, avoiding the GitHub 422 for large repos
 * (e.g. microsoft/vscode, rust-lang/rust).
 *
 * Key optimisations to bound API usage:
 *   - Stale scan: sorted oldest-first → early exit once pages are all newer
 *     than the stale threshold (these repos have thousands of issues but
 *     stale ones cluster at the front of an asc-updated-at sort).
 *   - Recent activity scan: uses the `since` param to server-side filter,
 *     then stops paging once every item in a page is outside the 24h window.
 *   - Hard cap of 100 pages (10 000 items) for the stale scan to prevent
 *     runaway pagination on extremely large repositories.
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

  // ── Open issues — stale count ──────────────────────────────────────────────
  // Sort updated_at ASC → oldest-untouched issues come first.
  // As soon as a full page has all items newer than the stale threshold we
  // know the rest are fresh and can stop early.
  const MAX_STALE_PAGES = 100;
  let stalePages = 0;

  await client.paginate(
    client.issues.listForRepo,
    {
      owner,
      repo,
      state: 'open',
      per_page: 100,
      sort: 'updated',
      direction: 'asc',
    },
    (response, done) => {
      stalePages++;
      let allFresh = true;

      for (const issue of response.data) {
        if (issue.pull_request) continue; // skip PRs returned by issues API
        const lastUpdated = issue.updated_at ?? issue.created_at;
        if (lastUpdated < staleThreshold) {
          staleIssues++;
          allFresh = false;
        }
      }

      // Stop once every non-PR on this page is within the fresh window,
      // or we've hit the safety cap.
      if (allFresh || stalePages >= MAX_STALE_PAGES) done();
      return response.data;
    }
  );

  // ── Issues opened/closed in last 24h ──────────────────────────────────────
  // The `since` param server-side filters to items updated in the window,
  // so this is typically just 1–2 pages even on large repos.
  // Sort newest-first and stop once a full page falls outside 24h.
  await client.paginate(
    client.issues.listForRepo,
    {
      owner,
      repo,
      state: 'all',
      since: since24h,
      per_page: 100,
      sort: 'created',
      direction: 'desc',
    },
    (response, done) => {
      let anyInWindow = false;

      for (const issue of response.data) {
        if (issue.pull_request) continue; // skip PRs
        if (issue.created_at >= since24h) {
          anyInWindow = true;
          issuesOpened++;
        }
        if (issue.closed_at && issue.closed_at >= since24h) {
          issuesClosed++;
        }
      }

      if (!anyInWindow) done();
      return response.data;
    }
  );

  return { issuesOpened, issuesClosed, staleIssues };
}
