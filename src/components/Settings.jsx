import React, { useRef, useState } from 'react';
import { exportDataAsFile, importDataFromJSON, estimateStorageBytes } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import ConfirmSheet from './ConfirmSheet';

const WARN_BYTES = 4 * 1024 * 1024; // most browsers cap localStorage around 5MB per origin

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Settings({ data, onDataReplace }) {
  const { mode, setMode } = useTheme();
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState('');
  const [confirmImport, setConfirmImport] = useState(null); // holds the file text to import
  const usedBytes = estimateStorageBytes(data);

  function handleFileChosen(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-choosing the same file later
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImportError('');
      setConfirmImport(reader.result);
    };
    reader.readAsText(file);
  }

  function handleConfirmImport() {
    try {
      const next = importDataFromJSON(confirmImport);
      onDataReplace(next);
      setConfirmImport(null);
    } catch (err) {
      setImportError('That file could not be read. Make sure it is a MedRecall backup JSON file.');
      setConfirmImport(null);
    }
  }

  return (
    <div className="screen">
      <div className="page-title">Settings</div>

      <div className="section-title">Appearance</div>
      <div className="card">
        <div className="settings-row">
          <span>Theme</span>
          <div className="segmented">
            {['light', 'dark', 'system'].map((option) => (
              <button
                key={option}
                className={mode === option ? 'active' : ''}
                onClick={() => setMode(option)}
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section-title">Your Data</div>
      <div className="card">
        <div className="settings-row">
          <span>Decks &amp; cards</span>
          <strong>{data.decks.length} decks, {data.cards.length} cards</strong>
        </div>
        <div className="settings-row">
          <span>Storage used</span>
          <strong style={{ color: usedBytes > WARN_BYTES ? 'var(--warning)' : undefined }}>
            {formatBytes(usedBytes)}
          </strong>
        </div>
      </div>
      {usedBytes > WARN_BYTES && (
        <p style={{ color: 'var(--warning)', fontSize: 13, marginTop: -10, marginBottom: 10 }}>
          You're getting close to the typical ~5MB browser storage limit (mostly from images).
          Export a backup regularly, and consider trimming large images.
        </p>
      )}

      <div className="button-stack">
        <button className="btn btn-secondary" onClick={() => exportDataAsFile(data)}>
          Export Data
        </button>
        <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
          Import Data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleFileChosen}
        />
      </div>

      {importError && (
        <p style={{ color: 'var(--danger)', fontSize: 14, marginTop: 10 }}>{importError}</p>
      )}

      {confirmImport && (
        <ConfirmSheet
          title="Import Data"
          message="This will replace all decks and cards currently in the app with the contents of this backup file. This cannot be undone."
          confirmLabel="Import & Replace"
          onCancel={() => setConfirmImport(null)}
          onConfirm={handleConfirmImport}
        />
      )}
    </div>
  );
}
