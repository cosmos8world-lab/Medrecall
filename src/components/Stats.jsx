import React, { useState } from 'react';
import { overallStats, upcomingReviewCounts } from '../utils/storage';
import Sheet from './Sheet';

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function formatFullDate(date) {
  return `${FULL_WEEKDAYS[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

export default function Stats({ data }) {
  const stats = overallStats(data);
  const upcoming = upcomingReviewCounts(data, 14);
  const [selectedDay, setSelectedDay] = useState(null);

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

  function groupByDeck(cards) {
    const groups = new Map();
    cards.forEach((c) => {
      if (!groups.has(c.deckId)) {
        groups.set(c.deckId, { deckName: c.deckName, subject: c.subject, count: 0 });
      }
      groups.get(c.deckId).count += 1;
    });
    return Array.from(groups.values());
  }

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
              <button
                key={i}
                type="button"
                className={`calendar-cell ${isToday ? 'today' : ''} ${hasCount ? '' : 'zero'}`}
                onClick={() => setSelectedDay(bucket)}
              >
                <span className="cal-date">{bucket.date.getDate()}</span>
                {hasCount && <span className="cal-count">{bucket.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <Sheet title={formatFullDate(selectedDay.date)} onClose={() => setSelectedDay(null)}>
          {selectedDay.cards.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '8px 4px' }}>
              Nothing due this day.
            </div>
          ) : (
            groupByDeck(selectedDay.cards).map((g) => (
              <div className="settings-row" key={g.deckName + g.subject}>
                <span>
                  {g.deckName}
                  {g.subject && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}> · {g.subject}</span>
                  )}
                </span>
                <strong>{g.count} card{g.count === 1 ? '' : 's'}</strong>
              </div>
            ))
          )}
        </Sheet>
      )}
    </div>
  );
}
