import React from 'react';
import { overallStats } from '../utils/storage';

export default function Stats({ data }) {
  const stats = overallStats(data);

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
    </div>
  );
}
