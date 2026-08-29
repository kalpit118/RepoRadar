import type { Summary } from '../types.ts';
import styles from './SummaryCards.module.css';

interface SummaryCardsProps {
  summary: Summary | null;
  loading: boolean;
}

interface CardDef {
  id: string;
  label: string;
  getValue: (s: Summary) => string;
  subLabel?: (s: Summary) => string;
  icon: string;
  gradientClass: string;
}

const CARDS: CardDef[] = [
  {
    id: 'tracked-repos',
    label: 'Tracked Repos',
    getValue: (s) => s.trackedRepositories.toString(),
    icon: '◎',
    gradientClass: styles.gradViolet,
  },
  {
    id: 'total-stars',
    label: 'Total Stars',
    getValue: (s) => formatNum(s.totalStars),
    subLabel: (s) => `${formatNum(s.totalForks)} forks`,
    icon: '⭐',
    gradientClass: styles.gradYellow,
  },
  {
    id: 'commits-24h',
    label: 'Commits (24 h)',
    getValue: (s) => formatNum(s.commitsLast24h),
    subLabel: (s) => `${formatNum(s.prsLast24h)} PRs opened`,
    icon: '↑',
    gradientClass: styles.gradGreen,
  },
  {
    id: 'open-prs',
    label: 'Open PRs',
    getValue: (s) => formatNum(s.totalOpenPRs),
    subLabel: (s) => `${formatNum(s.totalStalePRs)} stale`,
    icon: '⟳',
    gradientClass: styles.gradCyan,
  },
  {
    id: 'stale-issues',
    label: 'Stale Issues',
    getValue: (s) => formatNum(s.totalStaleIssues),
    subLabel: (s) => `${formatNum(s.issuesLast24h)} opened today`,
    icon: '⚡',
    gradientClass: styles.gradPink,
  },
];

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  return (
    <section aria-label="Summary statistics" className={styles.grid}>
      {CARDS.map((card, i) => (
        <article
          key={card.id}
          id={card.id}
          className={`card ${styles.card} animate-fade-in-up`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className={`${styles.iconWrapper} ${card.gradientClass}`}>
            <span className={styles.icon} aria-hidden="true">{card.icon}</span>
          </div>
          <div className={styles.content}>
            <div className={styles.label}>{card.label}</div>
            {loading ? (
              <>
                <div className={`skeleton ${styles.skeletonValue}`} />
                <div className={`skeleton ${styles.skeletonSub}`} />
              </>
            ) : (
              <>
                <div className={styles.value}>
                  {summary ? card.getValue(summary) : '—'}
                </div>
                {card.subLabel && summary && (
                  <div className={styles.sub}>{card.subLabel(summary)}</div>
                )}
              </>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
