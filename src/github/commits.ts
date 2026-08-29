import { getClient, parseRepo, hoursAgo } from './client.js';

export interface CommitStats {
  commits: number;
  contributors: number;
}

/**
 * Counts commits pushed to the default branch in the last 24 hours.
 * Also counts unique committer login names for the contributor metric.
 */
export async function fetchCommitStats(fullRepo: string): Promise<CommitStats> {
  const client = getClient();
  const { owner, repo } = parseRepo(fullRepo);
  const since = hoursAgo(24);

  const authors = new Set<string>();
  let commits = 0;
  let page = 1;

  while (true) {
    const { data } = await client.repos.listCommits({
      owner,
      repo,
      since,
      per_page: 100,
      page,
    });

    if (data.length === 0) break;

    for (const commit of data) {
      commits++;
      const login = commit.author?.login ?? commit.commit.author?.name;
      if (login) authors.add(login);
    }

    if (data.length < 100) break;
    page++;
  }

  return { commits, contributors: authors.size };
}
