import { makeId } from './id';
import { initReviewState, applyRating, isDue, isNew, isDifficult, shuffle } from './srs';

const STORAGE_KEY = 'medrecall_data_v1';

function todayStr(date = new Date()) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function emptyData() {
  return {
    decks: [],
    cards: [],
    settings: { theme: 'system' },
    stats: { reviewLog: {}, lastStudyDate: null, streak: 0 },
  };
}

// Fill in defaults for fields added after a deck/card may have been created,
// so older backups keep working without losing anything.
function migrateDeck(deck) {
  return { subject: '', ...deck };
}

// Tags are always stored clean (trimmed, no leading #, no empties/dupes) no
// matter which code path adds them - the UI shouldn't be the only thing enforcing this.
function cleanTags(tags) {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  tags.forEach((t) => {
    const clean = String(t).trim().replace(/^#/, '');
    if (clean) seen.add(clean);
  });
  return Array.from(seen);
}

function migrateCard(card) {
  const withDefaults = {
    type: 'basic',
    tags: [],
    options: null,
    correctOptionId: null,
    explanation: '',
    scenario: '',
    imagePosition: 'answer', // 'question' | 'answer' | 'both'
    ...card,
  };
  withDefaults.tags = cleanTags(withDefaults.tags);
  withDefaults.review = migrateReview(card.review);
  return withDefaults;
}

function migrateReview(review) {
  return { lapseCount: 0, hardCount: 0, ...(review || initReviewState()) };
}

// Load everything from localStorage, falling back to an empty shape.
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw);
    // Merge with empty shape so old/partial data never crashes the app.
    const merged = { ...emptyData(), ...parsed };
    merged.decks = (merged.decks || []).map(migrateDeck);
    merged.cards = (merged.cards || []).map(migrateCard);
    return merged;
  } catch (err) {
    console.error('MedRecall: failed to read storage, starting fresh.', err);
    return emptyData();
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ---------- Decks ----------

export function createDeck(data, name, description = '', subject = '') {
  const deck = {
    id: makeId(),
    name: name.trim(),
    description: description.trim(),
    subject: subject.trim(),
    createdAt: new Date().toISOString(),
  };
  const next = { ...data, decks: [...data.decks, deck] };
  saveData(next);
  return { data: next, deck };
}

export function updateDeck(data, deckId, fields) {
  const next = {
    ...data,
    decks: data.decks.map((d) => (d.id === deckId ? { ...d, ...fields } : d)),
  };
  saveData(next);
  return next;
}

export function renameDeck(data, deckId, name) {
  const next = {
    ...data,
    decks: data.decks.map((d) => (d.id === deckId ? { ...d, name: name.trim() } : d)),
  };
  saveData(next);
  return next;
}

export function updateDeckDescription(data, deckId, description) {
  const next = {
    ...data,
    decks: data.decks.map((d) => (d.id === deckId ? { ...d, description: description.trim() } : d)),
  };
  saveData(next);
  return next;
}

export function deleteDeck(data, deckId) {
  const next = {
    ...data,
    decks: data.decks.filter((d) => d.id !== deckId),
    cards: data.cards.filter((c) => c.deckId !== deckId),
  };
  saveData(next);
  return next;
}

// ---------- Cards ----------

export function getCardsForDeck(data, deckId) {
  return data.cards.filter((c) => c.deckId === deckId);
}

// `fields` shape: { front, back, image, imagePosition, type, tags, options, correctOptionId, explanation, scenario }
// type: 'basic' | 'image' | 'mcq' | 'clinical'.
export function addCard(data, deckId, fields) {
  const card = {
    id: makeId(),
    deckId,
    front: (fields.front || '').trim(),
    back: (fields.back || '').trim(),
    scenario: (fields.scenario || '').trim(),
    image: fields.image || null,
    imagePosition: fields.imagePosition || 'answer',
    type: fields.type || 'basic',
    tags: cleanTags(fields.tags || []),
    options: fields.options || null,
    correctOptionId: fields.correctOptionId || null,
    explanation: (fields.explanation || '').trim(),
    review: initReviewState(),
    createdAt: new Date().toISOString(),
  };
  const next = { ...data, cards: [...data.cards, card] };
  saveData(next);
  return { data: next, card };
}

export function updateCard(data, cardId, fields) {
  const cleanedFields = fields.tags ? { ...fields, tags: cleanTags(fields.tags) } : fields;
  const next = {
    ...data,
    cards: data.cards.map((c) => (c.id === cardId ? { ...c, ...cleanedFields } : c)),
  };
  saveData(next);
  return next;
}

export function deleteCard(data, cardId) {
  const next = { ...data, cards: data.cards.filter((c) => c.id !== cardId) };
  saveData(next);
  return next;
}

// Apply a study rating to a card, and update today's review stats/streak.
export function recordReview(data, cardId, rating) {
  const card = data.cards.find((c) => c.id === cardId);
  if (!card) return data;

  const updatedReview = applyRating(card.review, rating);
  const cards = data.cards.map((c) => (c.id === cardId ? { ...c, review: updatedReview } : c));

  const today = todayStr();
  const reviewLog = { ...data.stats.reviewLog, [today]: (data.stats.reviewLog[today] || 0) + 1 };

  let streak = data.stats.streak || 0;
  if (data.stats.lastStudyDate !== today) {
    const yesterday = todayStr(new Date(Date.now() - 24 * 60 * 60 * 1000));
    streak = data.stats.lastStudyDate === yesterday ? streak + 1 : 1;
  }

  const next = {
    ...data,
    cards,
    stats: { ...data.stats, reviewLog, lastStudyDate: today, streak },
  };
  saveData(next);
  return next;
}

// ---------- Derived stats ----------

export function deckCounts(data, deckId) {
  const cards = getCardsForDeck(data, deckId);
  const due = cards.filter((c) => isDue(c.review)).length;
  const newCount = cards.filter((c) => isNew(c.review)).length;
  const difficult = cards.filter((c) => isDifficult(c.review)).length;
  return { total: cards.length, due, newCount, difficult };
}

// Builds the actual list of cards for a study session, given the deck and the
// filters chosen in the study setup sheet. This is the one place that decides
// which cards show up and in what order, so DeckDetail's counts and StudyMode's
// queue always agree.
//
// filters: { scope: 'due'|'new'|'all'|'difficult', type: 'all'|'basic'|'clinical'|'mcq'|'image', tag: '' | tagName }
export function buildStudyQueue(data, deckId, filters) {
  let cards = getCardsForDeck(data, deckId);

  if (filters.type && filters.type !== 'all') {
    cards = cards.filter((c) => c.type === filters.type);
  }
  if (filters.tag) {
    cards = cards.filter((c) => (c.tags || []).includes(filters.tag));
  }

  if (filters.scope === 'due') {
    cards = cards.filter((c) => isDue(c.review));
    // Most overdue first - the card that's been waiting longest to be reviewed goes first.
    cards.sort((a, b) => new Date(a.review.nextReview).getTime() - new Date(b.review.nextReview).getTime());
  } else if (filters.scope === 'new') {
    cards = cards.filter((c) => isNew(c.review));
  } else if (filters.scope === 'difficult') {
    cards = cards.filter((c) => isDifficult(c.review));
  } else {
    // 'all' - randomized so the same session doesn't feel identical every time.
    cards = shuffle(cards);
  }

  return cards;
}

export function overallStats(data) {
  const total = data.cards.length;
  const due = data.cards.filter((c) => isDue(c.review)).length;
  const learned = data.cards.filter((c) => !isNew(c.review)).length;
  const today = todayStr();
  const reviewedToday = data.stats.reviewLog[today] || 0;
  return { total, due, learned, reviewedToday, streak: data.stats.streak || 0 };
}


// How many cards become due on each of the next `days` calendar days, so the
// person can see their upcoming workload rather than just "X due today".
// Cards already overdue (nextReview in the past) are all folded into "today".
const DAY_MS = 24 * 60 * 60 * 1000;

export function upcomingReviewCounts(data, days = 14) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const buckets = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startOfToday.getTime() + i * DAY_MS);
    buckets.push({ date, count: 0, cards: [] });
  }

  const deckById = new Map(data.decks.map((d) => [d.id, d]));

  data.cards.forEach((card) => {
    if (!card.review?.nextReview) return;
    const due = new Date(card.review.nextReview);
    let index = Math.floor((due.getTime() - startOfToday.getTime()) / DAY_MS);
    if (index < 0) index = 0;
    if (index < buckets.length) {
      const deck = deckById.get(card.deckId);
      buckets[index].count += 1;
      buckets[index].cards.push({
        id: card.id,
        front: card.front,
        deckId: card.deckId,
        deckName: deck ? deck.name : 'Unknown deck',
        subject: deck ? deck.subject : '',
      });
    }
  });

  return buckets;
}

// Cards due on one specific calendar day. If that day is today, any already-
// overdue cards (nextReview in the past) are folded in too, same as the rest
// of the app's "due" definition.
export function dueCardsOnDate(data, date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + DAY_MS);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const isToday = dayStart.getTime() === now.getTime();

  const deckById = new Map(data.decks.map((d) => [d.id, d]));
  const cards = [];

  data.cards.forEach((card) => {
    if (!card.review?.nextReview) return;
    const due = new Date(card.review.nextReview);
    const matchesDay = due >= dayStart && due < dayEnd;
    const overdueOntoToday = isToday && due < dayStart;
    if (matchesDay || overdueOntoToday) {
      const deck = deckById.get(card.deckId);
      cards.push({
        id: card.id,
        front: card.front,
        deckId: card.deckId,
        deckName: deck ? deck.name : 'Unknown deck',
        subject: deck ? deck.subject : '',
      });
    }
  });

  return cards;
}

// A full navigable month grid: every day of the given month (0-11), padded
// with leading/trailing blanks so it lines up as real calendar weeks.
export function monthGrid(data, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = new Date(year, month, 1).getDay();

  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const cards = dueCardsOnDate(data, date);
    days.push({ date, cards, count: cards.length });
  }

  const cells = [...Array(leadingBlanks).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
// ---------- Import / Export ----------

export function exportDataAsFile(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medrecall-backup-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importDataFromJSON(jsonText) {
  const parsed = JSON.parse(jsonText);
  const next = { ...emptyData(), ...parsed };
  next.decks = (next.decks || []).map(migrateDeck);
  next.cards = (next.cards || []).map(migrateCard);
  saveData(next);
  return next;
}

// All distinct tags currently in use, for search/autocomplete.
export function getAllTags(data) {
  const set = new Set();
  data.cards.forEach((c) => (c.tags || []).forEach((t) => set.add(t)));
  return Array.from(set).sort();
}

// Rough estimate of how much space this data would take in localStorage, so
// Settings can warn before the user hits the browser's storage ceiling
// (commonly ~5MB per origin, tightest on Safari/iOS).
export function estimateStorageBytes(data) {
  return new Blob([JSON.stringify(data)]).size;
}
