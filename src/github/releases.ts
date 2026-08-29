import { getClient, parseRepo, daysSince } from './client.js';

export interface ReleaseStats {
  latestRelease: string | null;
  latestReleaseDate: string | null;
  daysSinceRelease: number | null;
  stars: number;
  forks: number;
  watchers: number;
}

/**
 * Fetches the latest release and repository metadata (stars, forks, watchers)
 * in a single extra request to avoid separate repo API calls.
 */
export async function fetchReleaseStats(fullRepo: string): Promise<ReleaseStats> {
  const client = getClient();
  const { owner, repo } = parseRepo(fullRepo);

  // ── Repository metadata ────────────────────────────────────────────────────
  const { data: repoData } = await client.repos.get({ owner, repo });

  const stars = repoData.stargazers_count;
  const forks = repoData.forks_count;
  const watchers = repoData.subscribers_count ?? repoData.watchers_count;

  // ── Latest release ─────────────────────────────────────────────────────────
  let latestRelease: string | null = null;
  let latestReleaseDate: string | null = null;
  let daysSinceReleaseVal: number | null = null;

  try {
    const { data: release } = await client.repos.getLatestRelease({ owner, repo });
    latestRelease = release.tag_name;
    latestReleaseDate = release.published_at ?? release.created_at;
    daysSinceReleaseVal = latestReleaseDate ? daysSince(latestReleaseDate) : null;
  } catch (err: unknown) {
    // 404 = no releases yet — not an error worth surfacing
    const status = (err as { status?: number }).status;
    if (status !== 404) throw err;
  }

  return {
    latestRelease,
    latestReleaseDate,
    daysSinceRelease: daysSinceReleaseVal,
    stars,
    forks,
    watchers,
  };
}
