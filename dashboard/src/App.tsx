import { useState } from 'react';
import { Header } from './components/Header.tsx';
import { SummaryCards } from './components/SummaryCards.tsx';
import { RepoTable } from './components/RepoTable.tsx';
import { RepoCard } from './components/RepoCard.tsx';
import { useSnapshot } from './hooks/useSnapshot.ts';
import type { RepoSnapshot, SortKey, SortDir } from './types.ts';
import styles from './App.module.css';

export default function App() {
  const { snapshots, summary, loading, error } = useSnapshot();
  const [selected, setSelected] = useState<RepoSnapshot | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('stars');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function handleSelect(repo: RepoSnapshot) {
    setSelected((prev) => (prev?.repository === repo.repository ? null : repo));
  }

  return (
    <div className={styles.app}>
      <Header summary={summary} loading={loading} />

      <main className={styles.main}>
        <div className="container">

          {/* Error state */}
          {error && (
            <div className={styles.errorBanner} role="alert">
              <strong>⚠ Could not load data</strong>
              <p className="text-sm">{error}</p>
              <p className="text-sm text-secondary">
                Make sure the GitHub Actions workflow has run at least once and
                committed <code>data/latest.json</code> and <code>data/summary.json</code>.
              </p>
            </div>
          )}

          {/* Summary cards */}
          {!error && (
            <SummaryCards summary={summary} loading={loading} />
          )}

          {/* Section header */}
          {!error && (
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Tracked Repositories
                {!loading && (
                  <span className={styles.repoCount}>{snapshots.length}</span>
                )}
              </h2>
              {selected && (
                <button
                  className={styles.clearBtn}
                  onClick={() => setSelected(null)}
                  aria-label="Clear selection"
                >
                  Clear selection ✕
                </button>
              )}
            </div>
          )}

          {/* Detail card (when a row is selected) */}
          {selected && (
            <RepoCard
              snapshot={selected}
              onClose={() => setSelected(null)}
            />
          )}

          {/* Repository table */}
          {!error && (
            <RepoTable
              snapshots={snapshots}
              loading={loading}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              onSelect={handleSelect}
              selected={selected?.repository ?? null}
            />
          )}

        </div>
      </main>

      <footer className={styles.footer}>
        <div className="container">
          <p className="text-xs text-secondary">
            RepoRadar — powered by{' '}
            <a
              href="https://github.com/features/actions"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              GitHub Actions
            </a>{' '}
            · Data refreshes daily · Click any row to see details
          </p>
        </div>
      </footer>
    </div>
  );
}
