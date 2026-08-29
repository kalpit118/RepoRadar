/**
 * RepoRadar — Entry Point
 *
 * Reads config.yml → fetches GitHub data for each repo → writes JSON snapshots.
 * Run with: npm run collect
 */

import { loadConfig } from './config.js';
import { collectRepo } from './collectors/repo.js';
import { writeSnapshot } from './processors/snapshot.js';
import { writeSummary } from './processors/summary.js';

async function main(): Promise<void> {
  const startTime = Date.now();

  console.log('╔══════════════════════════════════════╗');
  console.log('║         RepoRadar Collector          ║');
  console.log('╚══════════════════════════════════════╝\n');

  // ── Load configuration ────────────────────────────────────────────────────
  const config = loadConfig();
  const { repositories, settings } = config;

  // Today's date in UTC
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

  console.log(`📅 Date: ${date}`);
  console.log(`📦 Repositories: ${repositories.length}`);
  console.log(`⚙️  Stale PR threshold: ${settings.stalePRDays}d`);
  console.log(`⚙️  Stale issue threshold: ${settings.staleIssueDays}d\n`);

  // ── Collect data sequentially to respect rate limits ─────────────────────
  // Sequential (not parallel) because large repos can each trigger many pages
  // of API calls and parallel collection risks hitting the rate limit.
  const snapshots = [];

  for (const repo of repositories) {
    const snapshot = await collectRepo(
      repo,
      date,
      settings.stalePRDays,
      settings.staleIssueDays
    );
    snapshots.push(snapshot);
  }

  console.log('\n─────────────────────────────────────────');

  // ── Write outputs ─────────────────────────────────────────────────────────
  writeSnapshot(date, snapshots);
  writeSummary(snapshots);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const errors = snapshots.filter((s) => s.error).length;

  console.log('\n╔══════════════════════════════════════╗');
  console.log(`║  Done in ${elapsed}s — ${errors} error(s)            ║`);
  console.log('╚══════════════════════════════════════╝');

  if (errors > 0) {
    const failed = snapshots.filter((s) => s.error).map((s) => s.repository);
    console.error(`\nFailed repos: ${failed.join(', ')}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
