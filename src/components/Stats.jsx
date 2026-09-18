import React from 'react';
import { overallStats, upcomingReviewCounts } from '../utils/storage';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayLabel(date, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return `${WEEKDAY_LABELS[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}`;
}

export default function Stats({ data }) {
  const stats = overallStats(data);
  const upcoming = upcomingReviewCounts(data, 14);
  const maxCount = Math.max(1, ...upcoming.map((b) => b.count));

  const rows = [
    { label: 'Total cards', value: stats.total },
    { label: 'Cards learned', value: stats.learned },
    { label: 'Cards due', value: stats.due },
    { label: 'Reviewed today', value: stats.reviewedToday },
    { label: 'Study streak', value: `${stats.streak} day${stats.streak === 1 ? '' : 's'}` },
  ];

  return (
    <div className="screen">
      <div className="page-title">Stats</div>
      <div className="card">
        {rows.map((row) => (
          <div className="settings-row" key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>

      <div className="section-title">Upcoming Reviews</div>
      <div className="card">
        {upcoming.every((b) => b.count === 0) ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '8px 4px' }}>
            Nothing scheduled in the next two weeks.
          </div>
        ) : (
          upcoming.map((bucket, i) => (
            <div className="upcoming-row" key={i}>
              <span className="upcoming-day">{dayLabel(bucket.date, i)}</span>
              <div className="upcoming-bar-track">
                <div
                  className="upcoming-bar-fill"
                  style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="upcoming-count">{bucket.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
