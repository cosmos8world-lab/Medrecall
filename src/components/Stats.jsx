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

  // Show the next 7 days individually (the days you'd actually plan around),
  // then fold days 8-14 into one summary row instead of a long, mostly-empty list.
  const nextWeek = upcoming.slice(0, 7);
  const weekAfter = upcoming.slice(7);
  const weekAfterTotal = weekAfter.reduce((sum, b) => sum + b.count, 0);
  const maxCount = Math.max(1, ...nextWeek.map((b) => b.count));
  const nothingUpcoming = upcoming.every((b) => b.count === 0);

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
        {nothingUpcoming ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '8px 4px' }}>
            Nothing scheduled in the next two weeks.
          </div>
        ) : (
          <>
            {nextWeek.map((bucket, i) => (
              <div className="upcoming-row" key={i}>
                <span className="upcoming-day">{dayLabel(bucket.date, i)}</span>
                {bucket.count > 0 ? (
                  <>
                    <div className="upcoming-bar-track">
                      <div
                        className="upcoming-bar-fill"
                        style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="upcoming-count">{bucket.count}</span>
                  </>
                ) : (
                  <span className="upcoming-empty">nothing due</span>
                )}
              </div>
            ))}
            {weekAfter.length > 0 && (
              <div className="upcoming-row upcoming-summary">
                <span className="upcoming-day">Week after</span>
                {weekAfterTotal > 0 ? (
                  <span className="upcoming-empty">{weekAfterTotal} card{weekAfterTotal === 1 ? '' : 's'} scheduled</span>
                ) : (
                  <span className="upcoming-empty">nothing due</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
