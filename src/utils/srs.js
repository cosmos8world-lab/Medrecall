// A simple, hand-rolled spaced-repetition system.
// This is NOT the full Anki/SM-2 algorithm on purpose - it's easy to read and easy to tweak.

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

// How the interval grows after repeated "Good" or "Easy" ratings.
// Once a card runs past the end of a list, it just keeps repeating the last value.
const GOOD_STEPS_DAYS = [3, 7, 14, 30, 60];
const EASY_STEPS_DAYS = [7, 21, 45, 90];
const AGAIN_INTERVAL_MINUTES = 10;
const HARD_INTERVAL_DAYS = 1;

// The review fields every new card starts with.
export function initReviewState() {
  return {
    reviewCount: 0,
    lastReviewed: null,
    nextReview: new Date().toISOString(), // new cards are due immediately
    intervalMinutes: 0,
    goodStreak: 0,
    easyStreak: 0,
    lapseCount: 0, // lifetime count of "Again" ratings
    hardCount: 0,  // lifetime count of "Hard" ratings
  };
}

function daysToMs(days) {
  return days * DAY;
}

function stepValue(steps, streak) {
  const index = Math.min(streak, steps.length - 1);
  return steps[index];
}

// rating is one of: 'again' | 'hard' | 'good' | 'easy'
export function applyRating(review, rating) {
  const now = new Date();
  const next = { ...review };
  next.reviewCount = (review.reviewCount || 0) + 1;
  next.lastReviewed = now.toISOString();

  if (rating === 'again') {
    next.intervalMinutes = AGAIN_INTERVAL_MINUTES;
    next.goodStreak = 0;
    next.easyStreak = 0;
    next.lapseCount = (review.lapseCount || 0) + 1;
    next.nextReview = new Date(now.getTime() + AGAIN_INTERVAL_MINUTES * MINUTE).toISOString();
  } else if (rating === 'hard') {
    next.intervalMinutes = HARD_INTERVAL_DAYS * 24 * 60;
    next.goodStreak = 0;
    next.easyStreak = 0;
    next.hardCount = (review.hardCount || 0) + 1;
    next.nextReview = new Date(now.getTime() + daysToMs(HARD_INTERVAL_DAYS)).toISOString();
  } else if (rating === 'good') {
    const days = stepValue(GOOD_STEPS_DAYS, review.goodStreak || 0);
    next.goodStreak = (review.goodStreak || 0) + 1;
    next.easyStreak = 0;
    next.intervalMinutes = days * 24 * 60;
    next.nextReview = new Date(now.getTime() + daysToMs(days)).toISOString();
  } else if (rating === 'easy') {
    const days = stepValue(EASY_STEPS_DAYS, review.easyStreak || 0);
    next.easyStreak = (review.easyStreak || 0) + 1;
    next.goodStreak = 0;
    next.intervalMinutes = days * 24 * 60;
    next.nextReview = new Date(now.getTime() + daysToMs(days)).toISOString();
  }

  return next;
}

export function isDue(review, atDate = new Date()) {
  if (!review || !review.nextReview) return true;
  return new Date(review.nextReview).getTime() <= atDate.getTime();
}

export function isNew(review) {
  return !review || (review.reviewCount || 0) === 0;
}

// A card is "difficult" once it's repeatedly tripped you up - either rated
// Again more than once, or Hard more than once, across its lifetime.
export function isDifficult(review) {
  if (!review) return false;
  return (review.lapseCount || 0) >= 2 || (review.hardCount || 0) >= 2;
}

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Human-readable label for the current interval, used on the study buttons preview.
export function formatInterval(minutes) {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)}d`;
  const months = days / 30;
  return `${Math.round(months)}mo`;
}

// Preview labels shown on the four rating buttons before the user taps one.
export function previewLabels(review) {
  const goodDays = stepValue(GOOD_STEPS_DAYS, review?.goodStreak || 0);
  const easyDays = stepValue(EASY_STEPS_DAYS, review?.easyStreak || 0);
  return {
    again: '10m',
    hard: '1d',
    good: `${goodDays}d`,
    easy: `${easyDays}d`,
  };
}
