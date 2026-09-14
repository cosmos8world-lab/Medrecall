import React, { useState } from 'react';
import Sheet from './Sheet';
import { buildStudyQueue } from '../utils/storage';

const SCOPES = [
  { key: 'due', label: 'Due cards' },
  { key: 'new', label: 'New cards' },
  { key: 'all', label: 'All cards' },
  { key: 'difficult', label: 'Difficult cards' },
];

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'basic', label: 'Basic' },
  { key: 'clinical', label: 'Clinical' },
  { key: 'mcq', label: 'MCQ' },
  { key: 'image', label: 'Image' },
];

export default function StudySetupSheet({ data, deckId, deckTags, defaultScope, onClose, onStart }) {
  const [scope, setScope] = useState(defaultScope);
  const [type, setType] = useState('all');
  const [tag, setTag] = useState('');

  const matchCount = buildStudyQueue(data, deckId, { scope, type, tag }).length;

  return (
    <Sheet title="Study" onClose={onClose}>
      <label className="field-label">Study</label>
      <div className="option-list">
        {SCOPES.map((s) => (
          <button
            key={s.key}
            className={`option-row ${scope === s.key ? 'active' : ''}`}
            onClick={() => setScope(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <label className="field-label">Card type</label>
      <div className="segmented" style={{ width: '100%', flexWrap: 'wrap' }}>
        {TYPES.map((t) => (
          <button key={t.key} className={type === t.key ? 'active' : ''} onClick={() => setType(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {deckTags.length > 0 && (
        <>
          <label className="field-label">Tag (optional)</label>
          <div className="option-list">
            <button className={`option-row ${tag === '' ? 'active' : ''}`} onClick={() => setTag('')}>
              Any tag
            </button>
            {deckTags.map((t) => (
              <button
                key={t}
                className={`option-row ${tag === t ? 'active' : ''}`}
                onClick={() => setTag(t)}
              >
                #{t}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="button-stack">
        <button className="btn btn-primary" disabled={matchCount === 0} onClick={() => onStart({ scope, type, tag })}>
          Start Studying ({matchCount})
        </button>
      </div>
    </Sheet>
  );
}
