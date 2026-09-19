import React from 'react';
import { overallStats, upcomingReviewCounts } from '../utils/storage';

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Stats({ data }) {
  const stats = overallStats(data);
  const upcoming = upcomingReviewCounts(data, 14);

  const leadingBlanks = upcoming[0].date.getDay();
  const cells = [...Array(leadingBlanks).fill(null), ...upcoming];
  while (cells.length % 7 !== 0) cells.push(null);

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
        <div className="calendar-weekdays">
          {WEEKDAY_HEADERS.map((d, i) => (
            <div className="calendar-weekday" key={i}>{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {cells.map((bucket, i) => {
            if (!bucket) return <div className="calendar-cell empty" key={i} />;
            const isToday = bucket === upcoming[0];
            const hasCount = bucket.count > 0;
            return (
              <div
                key={i}
                className={`calendar-cell ${isToday ? 'today' : ''} ${hasCount ? '' : 'zero'}`}
              >
                <span className="cal-date">{bucket.date.getDate()}</span>
                {hasCount && <span className="cal-count">{bucket.count}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
