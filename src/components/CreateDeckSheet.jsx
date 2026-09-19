import React, { useState } from 'react';
import Sheet from './Sheet';

const COMMON_SUBJECTS = [
  'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology',
  'Microbiology', 'Forensic Medicine', 'PSM', 'Medicine', 'Surgery',
  'Pediatrics', 'OBG', 'Orthopedics', 'ENT', 'Ophthalmology',
  'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesia',
];

export default function CreateDeckSheet({ onClose, onCreate, existingSubjects = [] }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');

  const subjectChips = [
    ...existingSubjects,
    ...COMMON_SUBJECTS.filter((s) => !existingSubjects.includes(s)),
  ];

  const isOther = subject === '__other__';
  const finalSubject = isOther ? customSubject : subject;

  function handleCreate() {
    if (!name.trim()) return;
    onCreate(name, description, finalSubject);
  }

  return (
    <Sheet title="Create Deck" onClose={onClose}>
      <label className="field-label">Deck name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Autonomic drugs"
        autoFocus
      />

      <label className="field-label">Subject (optional)</label>
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="field-select"
      >
        <option value="">Choose a subject…</option>
        {subjectChips.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
        <option value="__other__">Other…</option>
      </select>

      {isOther && (
        <input
          type="text"
          value={customSubject}
          onChange={(e) => setCustomSubject(e.target.value)}
          placeholder="Type your subject"
          style={{ marginTop: 10 }}
          autoFocus
        />
      )}

      <label className="field-label">Description (optional)</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What's this deck for?"
      />

      <div className="button-stack">
        <button className="btn btn-primary" onClick={handleCreate} disabled={!name.trim()}>
          Create Deck
        </button>
      </div>
    </Sheet>
  );
}


