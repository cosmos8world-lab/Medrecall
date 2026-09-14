import React, { useState } from 'react';
import { deckCounts } from '../utils/storage';
import CreateDeckSheet from './CreateDeckSheet';

export default function Home({ data, onCreateDeck, onOpenDeck }) {
  const [showCreate, setShowCreate] = useState(false);

  function handleCreate(name, description, subject) {
    const deck = onCreateDeck(name, description, subject);
    setShowCreate(false);
    if (deck) onOpenDeck(deck.id);
  }

  // Group decks by subject so "Pharmacology" decks sit together, etc.
  // Decks without a subject fall into their own "Other" group at the end.
  const groups = [];
  const bySubject = new Map();
  data.decks.forEach((deck) => {
    const key = deck.subject || '';
    if (!bySubject.has(key)) {
      const group = { subject: key, decks: [] };
      bySubject.set(key, group);
      groups.push(group);
    }
    bySubject.get(key).decks.push(deck);
  });
  groups.sort((a, b) => {
    if (!a.subject) return 1;
    if (!b.subject) return -1;
    return a.subject.localeCompare(b.subject);
  });

  return (
    <div className="screen">
      <div className="page-title">MedRecall</div>

      <div className="button-stack" style={{ marginTop: 0, marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Create Deck
        </button>
      </div>

      {data.decks.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🗂️</div>
          <div>No decks yet. Create your first deck to start adding flashcards.</div>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.subject || 'other'}>
            {group.subject && <div className="section-title">{group.subject}</div>}
            {group.decks.map((deck) => {
              const counts = deckCounts(data, deck.id);
              return (
                <button key={deck.id} className="deck-card" onClick={() => onOpenDeck(deck.id)}>
                  <div>
                    <div className="deck-card-name">{deck.name}</div>
                    <div className="deck-card-meta">{counts.total} cards</div>
                  </div>
                  <div className={`due-badge ${counts.due === 0 ? 'zero' : ''}`}>{counts.due} due</div>
                </button>
              );
            })}
          </div>
        ))
      )}

      {showCreate && <CreateDeckSheet onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}
