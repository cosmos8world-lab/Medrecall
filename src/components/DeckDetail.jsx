import React, { useMemo, useState } from 'react';
import { deckCounts, getCardsForDeck } from '../utils/storage';
import CardFormSheet from './CardFormSheet';
import ConfirmSheet from './ConfirmSheet';
import StudySetupSheet from './StudySetupSheet';
import Sheet from './Sheet';

export default function DeckDetail({
  data,
  deckId,
  onBack,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onRenameDeck,
  onUpdateDeck,
  onDeleteDeck,
  onStartStudy,
}) {
  const deck = data.decks.find((d) => d.id === deckId);
  const [search, setSearch] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [deletingCard, setDeletingCard] = useState(null);
  const [showEditDeck, setShowEditDeck] = useState(false);
  const [showDeleteDeck, setShowDeleteDeck] = useState(false);
  const [showStudySetup, setShowStudySetup] = useState(false);
  const [renameValue, setRenameValue] = useState(deck?.name || '');
  const [subjectValue, setSubjectValue] = useState(deck?.subject || '');

  const cards = useMemo(() => getCardsForDeck(data, deckId), [data, deckId]);
  const deckTags = useMemo(() => {
    const set = new Set();
    cards.forEach((c) => (c.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [cards]);
  const filteredCards = useMemo(() => {
    if (!search.trim()) return cards;
    const q = search.toLowerCase();
    return cards.filter(
      (c) =>
        c.front.toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [cards, search]);

  if (!deck) return null;
  const counts = deckCounts(data, deckId);

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="btn-icon" onClick={onBack}>‹</button>
        <div className="page-title" style={{ fontSize: 22 }}>{deck.name}</div>
        <button className="btn-icon" onClick={() => setShowEditDeck(true)}>⋯</button>
      </div>

      <div className="stats-row four">
        <div className="stat-box">
          <div className="stat-value">{counts.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{counts.due}</div>
          <div className="stat-label">Due</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{counts.newCount}</div>
          <div className="stat-label">New</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{counts.difficult}</div>
          <div className="stat-label">Difficult</div>
        </div>
      </div>

      <div className="button-stack" style={{ marginTop: 0, marginBottom: 20 }}>
        <button className="btn btn-primary" disabled={counts.total === 0} onClick={() => setShowStudySetup(true)}>
          Study
        </button>
      </div>

      <div className="action-row">
        <button className="btn btn-secondary" onClick={() => setShowAddCard(true)}>
          + Add Card
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search front, back, or #tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredCards.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📝</div>
          <div>{cards.length === 0 ? 'No cards yet. Add your first one.' : 'No cards match your search.'}</div>
        </div>
      ) : (
        filteredCards.map((card) => {
          const preview =
            card.type === 'mcq'
              ? (card.options || []).find((o) => o.id === card.correctOptionId)?.text || '—'
              : card.back;
          return (
            <div className="card-row" key={card.id}>
              <div className="card-row-front">
                {card.type !== 'basic' && <span className="type-badge">{card.type.toUpperCase()}</span>}
                {card.front}
              </div>
              <div className="card-row-back">{preview}</div>
              {card.tags?.length > 0 && (
                <div className="tag-row">
                  {card.tags.map((t) => (
                    <span className="tag-chip" key={t}>#{t}</span>
                  ))}
                </div>
              )}
              <div className="card-row-actions">
                <button className="btn btn-secondary" onClick={() => setEditingCard(card)}>Edit</button>
                <button className="btn btn-danger" onClick={() => setDeletingCard(card)}>Delete</button>
              </div>
            </div>
          );
        })
      )}

      {showAddCard && (
        <CardFormSheet
          onClose={() => setShowAddCard(false)}
          onSave={(fields, { andAddAnother }) => {
            onAddCard(deckId, fields);
            if (!andAddAnother) setShowAddCard(false);
          }}
        />
      )}

      {editingCard && (
        <CardFormSheet
          existingCard={editingCard}
          onClose={() => setEditingCard(null)}
          onSave={(fields) => {
            onUpdateCard(editingCard.id, fields);
            setEditingCard(null);
          }}
        />
      )}

      {deletingCard && (
        <ConfirmSheet
          title="Delete Card"
          message="This card will be permanently deleted."
          onCancel={() => setDeletingCard(null)}
          onConfirm={() => {
            onDeleteCard(deletingCard.id);
            setDeletingCard(null);
          }}
        />
      )}

      {showEditDeck && (
        <Sheet title="Edit Deck" onClose={() => setShowEditDeck(false)}>
          <label className="field-label">Deck name</label>
          <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />

          <label className="field-label">Subject</label>
          <input type="text" value={subjectValue} onChange={(e) => setSubjectValue(e.target.value)} />

          <div className="button-stack">
            <button
              className="btn btn-primary"
              disabled={!renameValue.trim()}
              onClick={() => {
                onRenameDeck(deckId, renameValue);
                onUpdateDeck(deckId, { subject: subjectValue.trim() });
                setShowEditDeck(false);
              }}
            >
              Save Changes
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                setShowEditDeck(false);
                setShowDeleteDeck(true);
              }}
            >
              Delete Deck
            </button>
          </div>
        </Sheet>
      )}

      {showStudySetup && (
        <StudySetupSheet
          data={data}
          deckId={deckId}
          deckTags={deckTags}
          defaultScope={counts.due > 0 ? 'due' : counts.newCount > 0 ? 'new' : 'all'}
          onClose={() => setShowStudySetup(false)}
          onStart={(filters) => {
            setShowStudySetup(false);
            onStartStudy(deckId, filters);
          }}
        />
      )}

      {showDeleteDeck && (
        <ConfirmSheet
          title="Delete Deck"
          message={`"${deck.name}" and all ${counts.total} cards inside it will be permanently deleted.`}
          onCancel={() => setShowDeleteDeck(false)}
          onConfirm={() => {
            onDeleteDeck(deckId);
            setShowDeleteDeck(false);
            onBack();
          }}
        />
      )}
    </div>
  );
}
