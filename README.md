# MedRecall

A simple, fast, mobile-first flashcard app with spaced repetition, built for MBBS / NEET-PG prep.
Everything is stored locally in your browser (localStorage) — no backend, no login, no accounts.

This is the **frozen core version** — stable and ready for daily use. See "Not built yet" below for
what's intentionally excluded from this pass.

## Run it on your computer

1. Install [Node.js](https://nodejs.org) (v18 or newer) if you don't have it.
2. Open a terminal in this folder and run:
   ```
   npm install
   npm run dev
   ```
3. It will print a local address like `http://localhost:5173`. Open that in your browser.

For a production build (what you'd actually deploy or use day-to-day):
```
npm run build
npm run preview
```
`npm run preview` serves the optimized build so you can confirm it behaves the same as `npm run dev`.

## Use it on your iPhone

Your iPhone and computer need to be on the **same wifi network**.

1. Run `npm run dev` (or `npm run preview` after a build) — it prints a "Network" address too, like
   `http://192.168.1.23:5173`.
2. On your iPhone, open **Safari** (not Chrome — Add to Home Screen PWA support is Safari-only on iOS)
   and go to that network address.
3. Tap the Share icon → **Add to Home Screen**. MedRecall now opens full-screen from your Home Screen
   like a real app, and works offline once loaded.

## Features in this version

**Decks**
- Create, rename, delete
- Organized by **Subject** (e.g. Pharmacology, Physiology), grouped with headers on Home

**Cards** — four types, all with optional tags:
- **Basic** — front / back
- **Clinical** — scenario → question → answer → explanation, for vignette-style questions
- **MCQ** — question + options; selecting an option is final, shows correct/incorrect immediately,
  then the explanation
- **Image** — an image can be attached to the question, the answer, or both, and is tappable to zoom
- Every type can carry an optional explanation, shown after you reveal the answer
- "Save & Add Another" for fast back-to-back entry
- Suggested tag chips (PYQ, Clinical, Mechanism, Diagnosis, Treatment, Investigation, Side effect,
  Pathology, Pharmacology) — tap to add, never forced
- Search inside a deck by front, back, or tag

**Study**
- A setup step before each session: choose scope (**Due / New / All / Difficult**), card type, and an
  optional tag filter, with a live count before you start
- Deck name and progress ("3/12") shown throughout
- Tap the card or "Show Answer" to reveal — the answer is never shown early
- Swipe left for Again, right for Good (Hard and Easy stay as buttons)
- Rating moves immediately to the next card — no extra "Next" tap
- **Study All** shuffles order each session; **Study Due** goes most-overdue-first; **Study Difficult**
  surfaces cards repeatedly rated Again or Hard
- Long clinical scenarios/explanations scroll inside the card without breaking the layout

**Spaced repetition** (simple, hand-written — see `src/utils/srs.js`, not the full Anki algorithm)
- Again → 10 minutes; Hard → 1 day; Good → 3/7/14/30/60 days; Easy → 7/21/45/90 days, each growing
  with consecutive successes
- Due / New / Total / Difficult counts per deck, updated immediately after every review

**Data**
- Export to a JSON file, import it back (older backups still load correctly — the app fills in any
  fields that didn't exist yet without touching your existing cards)
- Settings shows an estimated storage size with a warning as you approach the ~5MB typical browser
  limit

**Other**
- Stats screen: total, learned, due, reviewed today, streak
- Light / Dark / System theme, remembered across visits
- Installable as an iPhone Home Screen app (PWA) with basic offline support via a service worker

## Project structure

```
src/
  utils/storage.js      - all localStorage read/write logic, migrations, study-queue filtering
  utils/srs.js           - the spaced repetition scheduling algorithm
  context/ThemeContext.jsx
  components/            - one file per screen/piece of UI
  App.jsx                 - wires screens together, no router library used
public/
  manifest.json, sw.js, icons/ - PWA support
```

## Known limitations

- Search is scoped to one deck at a time, not global across all decks.
- The swipe gesture's sensitivity (currently ~90px of horizontal drag) hasn't been tuned against a
  real device yet.
- Storage is localStorage only — fine for thousands of text cards, but heavy image use (many dozens
  of attached photos) can approach the browser's typical ~5MB-per-origin limit. Settings will warn you
  as you get close; export a backup regularly regardless.
- "Difficult" is a lifetime count (2+ Again or 2+ Hard ratings, ever) rather than a rolling/recent
  window, so a card that was once difficult stays flagged even after you've since mastered it.

## Not built yet (intentionally, for a future phase)

AI flashcard generation, PDF/notes import, cloud sync, accounts/login, and a move to IndexedDB for
storage. All are deferred on purpose — this pass is about freezing a stable, fully working core.
