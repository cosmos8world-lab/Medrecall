import React, { useState } from 'react';
import Sheet from './Sheet';

const COMMON_SUBJECTS = [
  'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology',
  'Microbiology', 'Forensic Medicine', 'PSM', 'Medicine', 'Surgery',
  'Pediatrics', 'OBG', 'Orthopedics', 'ENT', 'Ophthalmology',
  'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesia',
];

export default function CreateDeckSheet({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');

  function handleCreate() {
    if (!name.trim()) return;
    onCreate(name, description, subject);
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
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="e.g. Pharmacology"
        list="medrecall-subjects"
      />
      <datalist id="medrecall-subjects">
        {COMMON_SUBJECTS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

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
