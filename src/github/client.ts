import { Octokit } from '@octokit/rest';

let _client: Octokit | null = null;

/**
 * Returns a singleton Octokit instance authenticated with GITHUB_TOKEN.
 * Falls back to unauthenticated (60 req/h) when running locally without a token.
 */
export function getClient(): Octokit {
  if (_client) return _client;

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn(
      '[client] ⚠ No GITHUB_TOKEN found. Falling back to unauthenticated (60 req/h limit).'
    );
  }

  _client = new Octokit({
    auth: token,
    userAgent: 'RepoRadar/1.0.0',
    throttle: {
      onRateLimit: (retryAfter: number, options: { method: string; url: string }) => {
        console.warn(`[client] Rate limit hit for ${options.method} ${options.url}. Retrying after ${retryAfter}s.`);
        return true; // retry once
      },
      onSecondaryRateLimit: (_retryAfter: number, options: { method: string; url: string }) => {
        console.warn(`[client] Secondary rate limit for ${options.method} ${options.url}. Skipping.`);
        return false;
      },
    },
  });

  return _client;
}

/** Parses "owner/repo" into { owner, repo } */
export function parseRepo(full: string): { owner: string; repo: string } {
  const [owner, repo] = full.split('/');
  if (!owner || !repo) throw new Error(`Invalid repo identifier: "${full}"`);
  return { owner, repo };
}

/** Returns an ISO timestamp for N hours ago */
export function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}

/** Returns an ISO timestamp for N days ago */
export function daysAgo(n: number): string {
  return hoursAgo(n * 24);
}

/** Whole-number of days between now and a past date string */
export function daysSince(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
