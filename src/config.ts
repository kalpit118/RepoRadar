import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import type { Config } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/** Reads and validates config.yml from the repo root */
export function loadConfig(): Config {
  const configPath = join(ROOT, 'config.yml');
  const raw = readFileSync(configPath, 'utf8');
  const parsed = yaml.load(raw) as Partial<Config>;

  if (!Array.isArray(parsed?.repositories) || parsed.repositories.length === 0) {
    throw new Error('config.yml must contain a non-empty "repositories" list.');
  }

  // Validate each entry is in "owner/repo" format
  for (const repo of parsed.repositories) {
    if (typeof repo !== 'string' || !repo.includes('/')) {
      throw new Error(`Invalid repository format: "${repo}". Expected "owner/name".`);
    }
  }

  return {
    repositories: parsed.repositories,
    settings: {
      stalePRDays: parsed.settings?.stalePRDays ?? 7,
      staleIssueDays: parsed.settings?.staleIssueDays ?? 30,
      timezone: parsed.settings?.timezone ?? 'UTC',
    },
  };
}

/** Returns an absolute path relative to the repo root */
export function rootPath(...segments: string[]): string {
  return join(ROOT, ...segments);
}
