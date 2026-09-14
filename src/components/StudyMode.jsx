import React, { useRef, useState } from 'react';
import { buildStudyQueue } from '../utils/storage';
import { previewLabels } from '../utils/srs';

const SWIPE_THRESHOLD = 90; // px of horizontal drag needed to count as a swipe rating

export default function StudyMode({ data, deckId, deckName, filters, onRate, onExit }) {
  const [initialCards] = useState(() => buildStudyQueue(data, deckId, filters));
  const [queue, setQueue] = useState(initialCards);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [doneCount, setDoneCount] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const dragState = useRef(null); // { startX, startY, active }

  const total = initialCards.length;
  const current = queue[0];
  const isMcq = current?.type === 'mcq';
  const isClinical = current?.type === 'clinical';
  const revealed = isMcq ? selectedOptionId !== null : showAnswer;
  const showImageBefore = current?.image && (current.imagePosition === 'question' || current.imagePosition === 'both');
  const showImageAfter = current?.image && (current.imagePosition === 'answer' || current.imagePosition === 'both' || !current.imagePosition);

  function advance(rating) {
    onRate(current.id, rating);
    if (rating === 'again') {
      setQueue((prev) => [...prev.slice(1), current]);
    } else {
      setQueue((prev) => prev.slice(1));
      setDoneCount((c) => c + 1);
    }
    setShowAnswer(false);
    setSelectedOptionId(null);
    setDragX(0);
  }

  // ---- Swipe handling (only active once the answer is revealed, and never for MCQ) ----
  function onTouchStart(e) {
    if (!revealed || isMcq) return;
    const t = e.touches[0];
    dragState.current = { startX: t.clientX, startY: t.clientY, active: true };
  }

  function onTouchMove(e) {
    if (!dragState.current?.active) return;
    const t = e.touches[0];
    const dx = t.clientX - dragState.current.startX;
    const dy = t.clientY - dragState.current.startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDragX(dx);
    }
  }

  function onTouchEnd() {
    if (!dragState.current?.active) return;
    dragState.current.active = false;
    if (dragX > SWIPE_THRESHOLD) {
      advance('good');
    } else if (dragX < -SWIPE_THRESHOLD) {
      advance('again');
    } else {
      setDragX(0);
    }
  }

  if (total === 0) {
    return (
      <div className="study-screen">
        <div className="study-header">
          <button className="btn-icon" onClick={onExit}>‹</button>
        </div>
        <div className="empty-state">
          <div className="emoji">🎉</div>
          <div>Nothing matches these study filters right now.</div>
          <div className="button-stack">
            <button className="btn btn-primary" onClick={onExit}>Back to Deck</button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="study-screen">
        <div className="study-header">
          <button className="btn-icon" onClick={onExit}>‹</button>
          <div className="study-progress">{doneCount}/{total}</div>
        </div>
        <div className="empty-state">
          <div className="emoji">✅</div>
          <div>Session complete. Nicely done.</div>
          <div className="button-stack">
            <button className="btn btn-primary" onClick={onExit}>Back to Deck</button>
          </div>
        </div>
      </div>
    );
  }

  const labels = previewLabels(current.review);
  const cardStyle = dragX
    ? { transform: `translateX(${dragX}px) rotate(${dragX / 24}deg)`, transition: 'none' }
    : { transform: 'translateX(0) rotate(0)', transition: 'transform 0.2s ease' };
  const position = Math.min(doneCount + 1, total);

  return (
    <div className="study-screen">
      <div className="study-header">
        <button className="btn-icon" onClick={onExit}>‹</button>
        <div className="study-header-info">
          <div className="study-deck-name">{deckName}</div>
          <div className="study-progress">{position}/{total}</div>
        </div>
        <div style={{ width: 44 }} />
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${(doneCount / total) * 100}%` }} />
      </div>

      <div className="study-card-area">
        <div
          className="flashcard"
          style={cardStyle}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={() => {
            if (!isMcq && !showAnswer) setShowAnswer(true);
          }}
        >
          <div className="flashcard-scroll">
            {isClinical && (
              <div>
                <div className="flashcard-label">Clinical Scenario</div>
                <div className="flashcard-text">{current.scenario}</div>
              </div>
            )}

            <div>
              <div className="flashcard-label">{isMcq ? 'Question' : 'Front'}</div>
              <div className="flashcard-text">{current.front}</div>
            </div>

            {showImageBefore && (
              <img
                src={current.image}
                alt=""
                className="flashcard-image"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomImage(current.image);
                }}
              />
            )}

            {isMcq && (
              <div className="mcq-options">
                {(current.options || []).map((opt, i) => {
                  let optClass = 'mcq-option';
                  if (revealed) {
                    if (opt.id === current.correctOptionId) optClass += ' correct';
                    else if (opt.id === selectedOptionId) optClass += ' incorrect';
                  }
                  return (
                    <button
                      key={opt.id}
                      className={optClass}
                      disabled={revealed}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOptionId(opt.id);
                      }}
                    >
                      <span className="mcq-option-letter">{String.fromCharCode(65 + i)}</span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            )}

            {revealed && (
              <div className="answer-panel">
                {!isMcq && (
                  <>
                    <div className="flashcard-label">Answer</div>
                    <div className="flashcard-text">{current.back}</div>
                  </>
                )}
                {current.explanation && (
                  <>
                    <div className="flashcard-label" style={{ marginTop: !isMcq ? 12 : 0 }}>Explanation</div>
                    <div className="flashcard-text">{current.explanation}</div>
                  </>
                )}
                {showImageAfter && (
                  <img
                    src={current.image}
                    alt=""
                    className="flashcard-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomImage(current.image);
                    }}
                  />
                )}
                {current.tags?.length > 0 && (
                  <div className="tag-row">
                    {current.tags.map((t) => (
                      <span className="tag-chip" key={t}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="study-actions">
        {!revealed && !isMcq ? (
          <button className="btn btn-primary" onClick={() => setShowAnswer(true)}>
            Show Answer
          </button>
        ) : revealed ? (
          <div className="rating-grid">
            <button className="rating-btn rating-again" onClick={() => advance('again')}>
              Again
              <small>{labels.again}</small>
            </button>
            <button className="rating-btn rating-hard" onClick={() => advance('hard')}>
              Hard
              <small>{labels.hard}</small>
            </button>
            <button className="rating-btn rating-good" onClick={() => advance('good')}>
              Good
              <small>{labels.good}</small>
            </button>
            <button className="rating-btn rating-easy" onClick={() => advance('easy')}>
              Easy
              <small>{labels.easy}</small>
            </button>
          </div>
        ) : (
          <div className="study-hint">Choose an option above</div>
        )}
      </div>

      {zoomImage && (
        <div className="image-zoom-overlay" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="" />
        </div>
      )}
    </div>
  );
}
