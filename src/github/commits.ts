import { getClient, parseRepo, hoursAgo } from './client.js';

export interface CommitStats {
  commits: number;
  contributors: number;
}

/**
 * Counts commits pushed to the default branch in the last 24 hours.
 * Also counts unique committer login names for the contributor metric.
 *
 * Uses octokit.paginate() which follows Link-header cursors instead of
 * incrementing a page offset, avoiding the GitHub 422 for large repos.
 */
export async function fetchCommitStats(fullRepo: string): Promise<CommitStats> {
  const client = getClient();
  const { owner, repo } = parseRepo(fullRepo);
  const since = hoursAgo(24);

  const authors = new Set<string>();
  let commits = 0;

  // paginate() follows the Link header (cursor-based) — no manual page counter.
  await client.paginate(
    client.repos.listCommits,
    { owner, repo, since, per_page: 100 },
    (response) => {
      for (const commit of response.data) {
        commits++;
        const login = commit.author?.login ?? commit.commit.author?.name;
        if (login) authors.add(login);
      }
      // All commits are >= since (the API filters server-side), so
      // no early exit needed — just consume all pages.
      return response.data;
    }
  );

  return { commits, contributors: authors.size };
}
