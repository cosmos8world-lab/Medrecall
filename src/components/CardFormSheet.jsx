import React, { useState } from 'react';
import Sheet from './Sheet';
import { makeId } from '../utils/id';

const TYPES = [
  { key: 'basic', label: 'Basic' },
  { key: 'clinical', label: 'Clinical' },
  { key: 'mcq', label: 'MCQ' },
  { key: 'image', label: 'Image' },
];

const SUGGESTED_TAGS = [
  'PYQ', 'Clinical', 'Image', 'Mechanism', 'Diagnosis',
  'Treatment', 'Investigation', 'Side effect', 'Pathology', 'Pharmacology',
];

function emptyOptions() {
  return [makeId(), makeId(), makeId(), makeId()].map((id) => ({ id, text: '' }));
}

function tagsToText(tags) {
  return (tags || []).join(', ');
}

function textToTags(text) {
  return text
    .split(',')
    .map((t) => t.trim().replace(/^#/, ''))
    .filter(Boolean);
}

export default function CardFormSheet({ existingCard, onClose, onSave }) {
  const [type, setType] = useState(existingCard?.type || 'basic');
  const [scenario, setScenario] = useState(existingCard?.scenario || '');
  const [front, setFront] = useState(existingCard?.front || '');
  const [back, setBack] = useState(existingCard?.back || '');
  const [explanation, setExplanation] = useState(existingCard?.explanation || '');
  const [image, setImage] = useState(existingCard?.image || null);
  const [imagePosition, setImagePosition] = useState(existingCard?.imagePosition || 'answer');
  const [tagsText, setTagsText] = useState(tagsToText(existingCard?.tags));
  const [options, setOptions] = useState(
    existingCard?.options && existingCard.options.length ? existingCard.options : emptyOptions()
  );
  const [correctOptionId, setCorrectOptionId] = useState(existingCard?.correctOptionId || null);

  const isMcq = type === 'mcq';
  const isClinical = type === 'clinical';

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  }

  function updateOptionText(id, text) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  }

  function toggleTag(tag) {
    const current = textToTags(tagsText);
    if (current.includes(tag)) {
      setTagsText(current.filter((t) => t !== tag).join(', '));
    } else {
      setTagsText([...current, tag].join(', '));
    }
  }

  function buildFields() {
    return {
      type,
      front,
      back,
      scenario: isClinical ? scenario : '',
      image,
      imagePosition,
      explanation,
      tags: textToTags(tagsText),
      options: isMcq ? options.filter((o) => o.text.trim()) : null,
      correctOptionId: isMcq ? correctOptionId : null,
    };
  }

  function isValid() {
    if (!front.trim()) return false;
    if (isMcq) {
      const filled = options.filter((o) => o.text.trim());
      return filled.length >= 2 && !!correctOptionId && filled.some((o) => o.id === correctOptionId);
    }
    return !!back.trim();
  }

  function resetForNextCard() {
    setScenario('');
    setFront('');
    setBack('');
    setExplanation('');
    setImage(null);
    setOptions(emptyOptions());
    setCorrectOptionId(null);
    // Keep type and tags as-is - speeds up adding a run of similar cards.
  }

  function handleSave(andAddAnother) {
    if (!isValid()) return;
    onSave(buildFields(), { andAddAnother });
    if (andAddAnother) resetForNextCard();
  }

  const activeTags = textToTags(tagsText);

  return (
    <Sheet title={existingCard ? 'Edit Card' : 'Add Card'} onClose={onClose}>
      <label className="field-label">Type</label>
      <div className="segmented" style={{ width: '100%' }}>
        {TYPES.map((t) => (
          <button
            key={t.key}
            className={type === t.key ? 'active' : ''}
            style={{ flex: 1 }}
            onClick={() => setType(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isClinical && (
        <>
          <label className="field-label">Clinical scenario</label>
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="e.g. A 24-year-old man presents with progressive weakness of both legs following an episode of diarrhea 10 days ago…"
            style={{ minHeight: 120 }}
          />
        </>
      )}

      <label className="field-label">{isMcq ? 'Question' : 'Front'}</label>
      <textarea
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder={isMcq ? 'Question stem' : 'Question or prompt'}
        autoFocus={!isClinical}
      />

      {isMcq ? (
        <>
          <label className="field-label">Options (tap to mark the correct one)</label>
          {options.map((opt, i) => (
            <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                className="btn-icon"
                aria-label="Mark correct"
                onClick={() => setCorrectOptionId(opt.id)}
                style={{
                  background: correctOptionId === opt.id ? 'var(--success)' : 'var(--surface-2)',
                  color: correctOptionId === opt.id ? 'white' : 'var(--text)',
                }}
              >
                {String.fromCharCode(65 + i)}
              </button>
              <input
                type="text"
                value={opt.text}
                onChange={(e) => updateOptionText(opt.id, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
              />
            </div>
          ))}
        </>
      ) : (
        <>
          <label className="field-label">Answer</label>
          <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Answer" />
        </>
      )}

      <label className="field-label">Explanation (optional)</label>
      <textarea
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        placeholder="Why this is the answer - shown after you reveal / submit"
      />

      <label className="field-label">Image (optional)</label>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {image && (
        <>
          <img src={image} alt="Card attachment" className="flashcard-image" style={{ marginTop: 10 }} />
          <div className="segmented" style={{ width: '100%', marginTop: 10 }}>
            {['question', 'answer', 'both'].map((pos) => (
              <button
                key={pos}
                className={imagePosition === pos ? 'active' : ''}
                style={{ flex: 1 }}
                onClick={() => setImagePosition(pos)}
              >
                {pos === 'question' ? 'With question' : pos === 'answer' ? 'With answer' : 'Both'}
              </button>
            ))}
          </div>
        </>
      )}

      <label className="field-label">Tags (optional)</label>
      <input
        type="text"
        value={tagsText}
        onChange={(e) => setTagsText(e.target.value)}
        placeholder="comma separated, e.g. PYQ, Mechanism"
      />
      <div className="tag-row" style={{ marginTop: 10 }}>
        {SUGGESTED_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            className={`tag-chip suggest ${activeTags.includes(t) ? 'active' : ''}`}
            onClick={() => toggleTag(t)}
          >
            #{t}
          </button>
        ))}
      </div>

      <div className="button-stack">
        <button className="btn btn-primary" onClick={() => handleSave(false)} disabled={!isValid()}>
          Save Card
        </button>
        {!existingCard && (
          <button className="btn btn-secondary" onClick={() => handleSave(true)} disabled={!isValid()}>
            Save &amp; Add Another
          </button>
        )}
      </div>
    </Sheet>
  );
}
