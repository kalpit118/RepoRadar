import type { HistoryEntry } from '../hooks/useHistory.ts';
import styles from './ActivitySparkline.module.css';

interface ActivitySparklineProps {
  history: HistoryEntry[];
  repo: string;
  metric: 'commits' | 'pullRequestsOpened' | 'issuesOpened' | 'stars';
  loading: boolean;
}

const WIDTH = 400;
const HEIGHT = 60;
const PADDING = { top: 4, bottom: 4, left: 2, right: 2 };

export function ActivitySparkline({ history, repo, metric, loading }: ActivitySparklineProps) {
  if (loading) {
    return <div className={`skeleton ${styles.skeleton}`} />;
  }

  if (history.length === 0) {
    return (
      <div className={styles.empty}>
        No historical data yet — check back after the first few daily runs.
      </div>
    );
  }

  // Extract per-repo values from history
  const points = history.map((entry) => {
    const snap = entry.snapshots.find((s) => s.repository === repo);
    return {
      date: entry.date,
      value: snap ? (snap[metric] as number) : 0,
    };
  });

  const values = points.map((p) => p.value);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  // Map to SVG coordinates
  const svgPoints = points.map((p, i) => {
    const x = PADDING.left + (i / Math.max(points.length - 1, 1)) * (WIDTH - PADDING.left - PADDING.right);
    const y = PADDING.top + (1 - (p.value - minVal) / (maxVal - minVal)) * (HEIGHT - PADDING.top - PADDING.bottom);
    return { x, y, ...p };
  });

  const polyline = svgPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const area = [
    `M ${svgPoints[0].x},${HEIGHT}`,
    ...svgPoints.map((p) => `L ${p.x},${p.y}`),
    `L ${svgPoints[svgPoints.length - 1].x},${HEIGHT}`,
    'Z',
  ].join(' ');

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={styles.svg}
        aria-label={`${metric} trend for ${repo}`}
        role="img"
      >
        <defs>
          <linearGradient id={`spark-grad-${repo.replace('/', '-')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6c63ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6c63ff" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path
          d={area}
          fill={`url(#spark-grad-${repo.replace('/', '-')})`}
        />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#6c63ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots */}
        {svgPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#6c63ff">
            <title>{`${p.date}: ${p.value}`}</title>
          </circle>
        ))}
      </svg>

      {/* x-axis labels */}
      <div className={styles.labels}>
        {svgPoints.map((p, i) => (
          <span key={i} className={styles.label}>
            {p.date.slice(5)} {/* MM-DD */}
          </span>
        ))}
      </div>
    </div>
  );
}
