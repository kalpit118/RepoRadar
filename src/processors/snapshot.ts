import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { rootPath } from '../config.js';
import type { DailySnapshot } from '../types.js';

/**
 * Writes a daily snapshot array to:
 *   data/YYYY/MM/DD.json  (historical record)
 *   data/latest.json      (always overwritten — for the dashboard)
 */
export function writeSnapshot(date: string, snapshots: DailySnapshot): void {
  // Parse date "YYYY-MM-DD"
  const [year, month, day] = date.split('-');
  const dir = rootPath('data', year, month);
  mkdirSync(dir, { recursive: true });

  const dailyPath = join(dir, `${day}.json`);
  const latestPath = rootPath('data', 'latest.json');

  const json = JSON.stringify(snapshots, null, 2);

  writeFileSync(dailyPath, json, 'utf8');
  writeFileSync(latestPath, json, 'utf8');

  console.log(`\n📁 Written: data/${year}/${month}/${day}.json`);
  console.log(`📁 Written: data/latest.json`);
}
