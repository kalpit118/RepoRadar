import type { RepoSnapshot } from '../types.ts';
import { useHistory } from '../hooks/useHistory.ts';
import { ActivitySparkline } from './ActivitySparkline.tsx';
import { HealthBadge } from './HealthBadge.tsx';
import styles from './RepoCard.module.css';

interface RepoCardProps {
  snapshot: RepoSnapshot;
  onClose: () => void;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

interface StatRowProps {
  label: string;
  value: string | number;
  accent?: boolean;
  warn?: boolean;
}

function StatRow({ label, value, accent, warn }: StatRowProps) {
  return (
    <div className={styles.statRow}>
      <span className={styles.statLabel}>{label}</span>
      <span
        className={`${styles.statValue} ${accent ? styles.accent : ''} ${warn ? styles.warn : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

export function RepoCard({ snapshot: s, onClose }: RepoCardProps) {
  const { history, loading: histLoading } = useHistory(14);
  const [owner, name] = s.repository.split('/');

  return (
    <div className={`card ${styles.card} animate-fade-in-up`} role="region" aria-label={`Detail for ${s.repository}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <a
            href={`https://github.com/${s.repository}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.repoLink}
          >
            <span className={styles.owner}>{owner}/</span>
            <span className={styles.name}>{name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <HealthBadge snapshot={s} />
        </div>
        <button className={styles.close} onClick={onClose} aria-label="Close detail panel">✕</button>
      </div>

      {/* Sparkline */}
      <div className={styles.sparkSection}>
        <div className={styles.sparkLabel}>Commits — last 14 days</div>
        <ActivitySparkline
          history={history}
          repo={s.repository}
          metric="commits"
          loading={histLoading}
        />
      </div>

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        {/* Activity */}
        <div className={styles.statGroup}>
          <div className={styles.groupTitle}>Activity (24 h)</div>
          <StatRow label="Commits"        value={s.commits} accent />
          <StatRow label="PRs Opened"     value={s.pullRequestsOpened} />
          <StatRow label="PRs Merged"     value={s.pullRequestsMerged} />
          <StatRow label="Issues Opened"  value={s.issuesOpened} />
          <StatRow label="Issues Closed"  value={s.issuesClosed} />
          <StatRow label="Contributors"   value={s.contributors} />
        </div>

        {/* Health */}
        <div className={styles.statGroup}>
          <div className={styles.groupTitle}>Repository Health</div>
          <StatRow label="Open PRs"    value={s.openPRs} />
          <StatRow label="Stale PRs"   value={s.stalePRs}   warn={s.stalePRs > 5} />
          <StatRow label="Stale Issues" value={s.staleIssues} warn={s.staleIssues > 20} />
        </div>

        {/* Growth */}
        <div className={styles.statGroup}>
          <div className={styles.groupTitle}>Growth</div>
          <StatRow label="Stars"    value={formatNum(s.stars)} accent />
          <StatRow label="Forks"    value={formatNum(s.forks)} />
          <StatRow label="Watchers" value={formatNum(s.watchers)} />
        </div>

        {/* Release */}
        <div className={styles.statGroup}>
          <div className={styles.groupTitle}>Latest Release</div>
          <StatRow label="Version"       value={s.latestRelease ?? 'None'} accent={!!s.latestRelease} />
          <StatRow label="Days ago"      value={s.daysSinceRelease ?? '—'} />
          {s.latestReleaseDate && (
            <StatRow
              label="Date"
              value={new Date(s.latestReleaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            />
          )}
        </div>
      </div>

      <p className={styles.collectedAt}>
        Collected {new Date(s.collectedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>
    </div>
  );
}
