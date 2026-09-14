import React from 'react';

const TABS = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'studyPicker', label: 'Study', icon: '📖' },
  { key: 'stats', label: 'Stats', icon: '📊' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`nav-btn ${active === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
