import React, { useState } from 'react';
import { overallStats, monthGrid } from '../utils/storage';
import Sheet from './Sheet';

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const FULL_WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function formatFullDate(date) {
  return `${FULL_WEEKDAYS[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function Stats({ data }) {
  const stats = overallStats(data);
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const cells = monthGrid(data, viewYear, viewMonth);

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function goToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

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
        <div className="calendar-nav">
          <button type="button" className="btn-icon" onClick={goPrevMonth} aria-label="Previous month">‹</button>
          <button type="button" className="calendar-month-label" onClick={goToday}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </button>
          <button type="button" className="btn-icon" onClick={goNextMonth} aria-label="Next month">›</button>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAY_HEADERS.map((d, i) => (
            <div className="calendar-weekday" key={i}>{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {cells.map((cell, i) => {
            if (!cell) return <div className="calendar-cell empty" key={i} />;
            const isToday =
              cell.date.getFullYear() === today.getFullYear() &&
              cell.date.getMonth() === today.getMonth() &&
              cell.date.getDate() === today.getDate();
            const hasCount = cell.count > 0;
            return (
              <button
                key={i}
                type="button"
                className={`calendar-cell ${isToday ? 'today' : ''} ${hasCount ? '' : 'zero'}`}
                onClick={() => setSelectedDay(cell)}
              >
                <span className="cal-date">{cell.date.getDate()}</span>
                {hasCount && <span className="cal-count">{cell.count}</span>}
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
