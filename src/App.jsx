import React, { useState } from 'react';
import {
  loadData,
  saveData,
  createDeck,
  renameDeck,
  updateDeck,
  deleteDeck,
  addCard,
  updateCard,
  deleteCard,
  recordReview,
} from './utils/storage';
import { ThemeProvider } from './context/ThemeContext';

import BottomNav from './components/BottomNav';
import Home from './components/Home';
import DeckDetail from './components/DeckDetail';
import StudyPicker from './components/StudyPicker';
import StudyMode from './components/StudyMode';
import Stats from './components/Stats';
import Settings from './components/Settings';

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [tab, setTab] = useState('home'); // home | studyPicker | stats | settings
  const [openDeckId, setOpenDeckId] = useState(null);
  const [studySession, setStudySession] = useState(null); // { deckId, filters: { scope, type, tag } }

  function updateTheme(mode) {
    const next = { ...data, settings: { ...data.settings, theme: mode } };
    setData(next);
    saveData(next);
  }

  function handleCreateDeck(name, description, subject) {
    const { data: next, deck } = createDeck(data, name, description, subject);
    setData(next);
    return deck;
  }

  function handleAddCard(deckId, fields) {
    const { data: next, card } = addCard(data, deckId, fields);
    setData(next);
    return card;
  }

  function handleUpdateCard(cardId, fields) {
    setData(updateCard(data, cardId, fields));
  }

  function handleDeleteCard(cardId) {
    setData(deleteCard(data, cardId));
  }

  function handleRenameDeck(deckId, name) {
    setData(renameDeck(data, deckId, name));
  }

  function handleUpdateDeck(deckId, fields) {
    setData(updateDeck(data, deckId, fields));
  }

  function handleDeleteDeck(deckId) {
    setData(deleteDeck(data, deckId));
  }

  function handleRate(cardId, rating) {
    setData((prev) => recordReview(prev, cardId, rating));
  }

  // Study mode takes over the whole screen (no bottom nav) while active.
  if (studySession) {
    return (
      <ThemeProvider mode={data.settings.theme} onModeChange={updateTheme}>
        <div className="app-shell">
          <StudyMode
            data={data}
            deckId={studySession.deckId}
            deckName={data.decks.find((d) => d.id === studySession.deckId)?.name || ''}
            filters={studySession.filters}
            onRate={handleRate}
            onExit={() => setStudySession(null)}
          />
        </div>
      </ThemeProvider>
    );
  }

  let body;
  if (openDeckId) {
    body = (
      <DeckDetail
        data={data}
        deckId={openDeckId}
        onBack={() => setOpenDeckId(null)}
        onAddCard={handleAddCard}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
        onRenameDeck={handleRenameDeck}
        onUpdateDeck={handleUpdateDeck}
        onDeleteDeck={handleDeleteDeck}
        onStartStudy={(deckId, filters) => setStudySession({ deckId, filters })}
      />
    );
  } else if (tab === 'studyPicker') {
    body = (
      <StudyPicker
        data={data}
         onOpenDeck={(id) => setOpenDeckId(id)} 
      />
    );
  } else if (tab === 'stats') {
    body = <Stats data={data} />;
  } else if (tab === 'settings') {
    body = <Settings data={data} onDataReplace={setData} />;
  } else {
    body = <Home data={data} onCreateDeck={handleCreateDeck} onOpenDeck={(id) => setOpenDeckId(id)} />;
  }

  return (
    <ThemeProvider mode={data.settings.theme} onModeChange={updateTheme}>
      <div className="app-shell">
        {body}
        {!openDeckId && <BottomNav active={tab} onChange={setTab} />}
      </div>
    </ThemeProvider>
  );
}
