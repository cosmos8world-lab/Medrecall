import React from 'react';
import { deckCounts } from '../utils/storage';

export default function StudyPicker({ data, onOpenDeck }) {
  return (
    <div className="screen">
      <div className="page-title">Study</div>

      {data.decks.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📖</div>
          <div>Create a deck first, then come back here to study.</div>
        </div>
      ) : (
        data.decks.map((deck) => {
          const counts = deckCounts(data, deck.id);
          return (
            <div className="deck-card" key={deck.id} style={{ cursor: 'default' }}>
              <div style={{ flex: 1 }}>
                <div className="deck-card-name">{deck.name}</div>
                <div className="deck-card-meta">{counts.due} due · {counts.total} total</div>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: 'auto', padding: '10px 16px' }}
                onClick={() => onOpenDeck(deck.id)}
              >
                Study
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
