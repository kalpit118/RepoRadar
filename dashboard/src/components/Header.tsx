import type { Summary } from '../types.ts';
import styles from './Header.module.css';

interface HeaderProps {
  summary: Summary | null;
  loading: boolean;
}

export function Header({ summary, loading }: HeaderProps) {
  const date = summary
    ? new Date(summary.generatedAt).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.inner}>
          {/* Wordmark */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="15" stroke="url(#g1)" strokeWidth="2" />
                <circle cx="16" cy="16" r="6" fill="url(#g2)" opacity="0.9" />
                <circle cx="16" cy="16" r="10" stroke="url(#g1)" strokeWidth="1" strokeDasharray="3 3" />
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6c63ff" />
                    <stop offset="1" stopColor="#3ecfcf" />
                  </linearGradient>
                  <linearGradient id="g2" x1="10" y1="10" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6c63ff" />
                    <stop offset="1" stopColor="#3ecfcf" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className={styles.title}>
                Repo<span className="gradient-text">Radar</span>
              </h1>
              <p className={styles.subtitle}>Open Source Activity Observatory</p>
            </div>
          </div>

          {/* Last updated */}
          <div className={styles.meta}>
            <span className={styles.liveIndicator} aria-label="Live data" />
            {loading ? (
              <span className="skeleton" style={{ width: 180, height: 14, display: 'inline-block' }} />
            ) : (
              <span className="text-sm text-secondary">Updated {date}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
