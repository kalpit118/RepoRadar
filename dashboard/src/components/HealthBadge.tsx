import type { RepoSnapshot } from '../types.ts';
import styles from './HealthBadge.module.css';

interface HealthBadgeProps {
  snapshot: RepoSnapshot;
}

type HealthLevel = 'healthy' | 'fair' | 'needs-attention' | 'critical';

function computeHealth(s: RepoSnapshot): HealthLevel {
  if (s.error) return 'critical';

  let score = 0;

  // Penalize stale PRs
  if (s.stalePRs > 20) score += 3;
  else if (s.stalePRs > 5) score += 1;

  // Penalize stale issues
  if (s.staleIssues > 50) score += 3;
  else if (s.staleIssues > 20) score += 1;

  // Penalize no recent commits
  if (s.commits === 0) score += 2;

  // Penalize no recent release (> 180 days)
  if (s.daysSinceRelease !== null && s.daysSinceRelease > 180) score += 1;

  if (score === 0) return 'healthy';
  if (score <= 1) return 'fair';
  if (score <= 3) return 'needs-attention';
  return 'critical';
}

const HEALTH_CONFIG: Record<HealthLevel, { label: string; cls: string }> = {
  'healthy':         { label: '● Healthy',    cls: styles.healthy },
  'fair':            { label: '◐ Fair',        cls: styles.fair },
  'needs-attention': { label: '◑ Watch',       cls: styles.watch },
  'critical':        { label: '● Critical',    cls: styles.critical },
};

export function HealthBadge({ snapshot }: HealthBadgeProps) {
  const level = computeHealth(snapshot);
  const { label, cls } = HEALTH_CONFIG[level];
  return (
    <span className={`${styles.badge} ${cls}`} title={`Health: ${level}`}>
      {label}
    </span>
  );
}
