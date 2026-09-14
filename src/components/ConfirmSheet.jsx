import React from 'react';
import Sheet from './Sheet';

export default function ConfirmSheet({ title, message, confirmLabel = 'Delete', onCancel, onConfirm }) {
  return (
    <Sheet title={title} onClose={onCancel}>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.5 }}>{message}</p>
      <div className="button-stack">
        <button className="btn btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </Sheet>
  );
}
