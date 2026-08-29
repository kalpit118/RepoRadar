import type { RepoSnapshot, SortKey, SortDir } from '../types.ts';
import { HealthBadge } from './HealthBadge.tsx';
import styles from './RepoTable.module.css';

interface Column {
  key: SortKey | 'repository';
  label: string;
  align?: 'right';
  sortable?: boolean;
}

const COLUMNS: Column[] = [
  { key: 'repository', label: 'Repository', sortable: false },
  { key: 'stars',              label: '⭐ Stars',    align: 'right', sortable: true },
  { key: 'commits',            label: '↑ Commits',  align: 'right', sortable: true },
  { key: 'pullRequestsOpened', label: 'PRs (24h)',  align: 'right', sortable: true },
  { key: 'openPRs',            label: 'Open PRs',   align: 'right', sortable: true },
  { key: 'stalePRs',           label: 'Stale PRs',  align: 'right', sortable: true },
  { key: 'staleIssues',        label: 'Stale ↯',    align: 'right', sortable: true },
  { key: 'repository',         label: 'Health',     sortable: false },
];

interface RepoTableProps {
  snapshots: RepoSnapshot[];
  loading: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  onSelect: (repo: RepoSnapshot) => void;
  selected: string | null;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export function RepoTable({
  snapshots, loading, sortKey, sortDir, onSort, onSelect, selected,
}: RepoTableProps) {
  const sorted = [...snapshots].sort((a, b) => {
    const av = a[sortKey as keyof RepoSnapshot] as number;
    const bv = b[sortKey as keyof RepoSnapshot] as number;
    return sortDir === 'desc' ? bv - av : av - bv;
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableContainer}>
        <table className={styles.table} role="grid" aria-label="Repository activity table">
          <thead>
            <tr>
              {COLUMNS.map((col, i) => {
                // Skip duplicate "repository" column — first is the name, last is health badge
                if (i === COLUMNS.length - 1) {
                  return <th key="health" className={styles.th}>Health</th>;
                }
                if (!col.sortable || col.key === 'repository') {
                  return (
                    <th key={`${col.key}-${i}`} className={styles.th} style={{ textAlign: col.align ?? 'left' }}>
                      {col.label}
                    </th>
                  );
                }
                const active = sortKey === col.key;
                return (
                  <th
                    key={`${col.key}-${i}`}
                    className={`${styles.th} ${styles.sortable} ${active ? styles.active : ''}`}
                    style={{ textAlign: col.align ?? 'left' }}
                    onClick={() => onSort(col.key as SortKey)}
                    aria-sort={active ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'}
                  >
                    {col.label}
                    <span className={styles.sortIcon} aria-hidden="true">
                      {active ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ' ⇅'}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={styles.row}>
                    {COLUMNS.map((_, j) => (
                      <td key={j} className={styles.td}>
                        <div className="skeleton" style={{ height: 16, width: j === 0 ? 140 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))
              : sorted.map((repo) => {
                  const isSelected = repo.repository === selected;
                  const [owner, name] = repo.repository.split('/');
                  return (
                    <tr
                      key={repo.repository}
                      className={`${styles.row} ${isSelected ? styles.selected : ''}`}
                      onClick={() => onSelect(repo)}
                      tabIndex={0}
                      role="row"
                      aria-selected={isSelected}
                      onKeyDown={(e) => e.key === 'Enter' && onSelect(repo)}
                    >
                      <td className={styles.td}>
                        <div className={styles.repoName}>
                          <a
                            href={`https://github.com/${repo.repository}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.repoLink}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className={styles.owner}>{owner}/</span>
                            <span className={styles.name}>{name}</span>
                          </a>
                          {repo.error && (
                            <span className="badge badge--red" title={repo.error}>⚠</span>
                          )}
                        </div>
                      </td>
                      <td className={`${styles.td} ${styles.num}`}>{formatNum(repo.stars)}</td>
                      <td className={`${styles.td} ${styles.num}`}>{repo.commits}</td>
                      <td className={`${styles.td} ${styles.num}`}>{repo.pullRequestsOpened}</td>
                      <td className={`${styles.td} ${styles.num}`}>{repo.openPRs}</td>
                      <td className={`${styles.td} ${styles.num} ${repo.stalePRs > 0 ? styles.warn : ''}`}>
                        {repo.stalePRs}
                      </td>
                      <td className={`${styles.td} ${styles.num} ${repo.staleIssues > 0 ? styles.warn : ''}`}>
                        {repo.staleIssues}
                      </td>
                      <td className={styles.td}>
                        <HealthBadge snapshot={repo} />
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
