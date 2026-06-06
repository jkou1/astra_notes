'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { NoteEditor } from '@/components/note-editor';

export type NoteRoomDialogNote = {
  id: string;
  title: string;
  category: string | null;
  tags: string[];
  encryptionEnabled: boolean;
  createdAtLabel: string;
  updatedAtLabel: string;
  contentPlain: string;
  crdtBase64: string | null;
  wordCount: number;
  lineCount: number;
};

type NoteRoomDialogProps = {
  note: NoteRoomDialogNote;
  onClose: () => void;
};

function waitForRainbowBorder() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 950);
  });
}

export function NoteRoomDialog({ note, onClose }: NoteRoomDialogProps) {
  const router = useRouter();
  const [isClosingAfterSave, setIsClosingAfterSave] = useState(false);

  async function handleSaved() {
    setIsClosingAfterSave(true);
    await waitForRainbowBorder();
    onClose();
    router.refresh();
  }

  return (
    <div className="note-room-page note-room-page--overlay">
      <div className="note-room-page__backdrop" />
      <motion.section
        className="note-room-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-room-title"
        animate={
          isClosingAfterSave
            ? {
                borderColor: ['#fb7185', '#facc15', '#4ade80', '#22d3ee', '#818cf8', '#f472b6', '#fb7185'],
                boxShadow: [
                  '0 30px 90px rgba(2, 6, 23, 0.55)',
                  '0 0 42px rgba(250, 204, 21, 0.42)',
                  '0 0 52px rgba(34, 211, 238, 0.46)',
                  '0 0 68px rgba(244, 114, 182, 0.48)',
                  '0 30px 90px rgba(2, 6, 23, 0.55)',
                ],
                scale: [1, 1.008, 1],
              }
            : {
                borderColor: 'rgba(148, 163, 184, 0.26)',
                boxShadow: '0 30px 90px rgba(2, 6, 23, 0.55)',
                scale: 1,
              }
        }
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      >
        <div className="note-room-overlay__header">
          <div>
            <span className="pill">Realtime room</span>
            <h1 id="note-room-title">{note.title}</h1>
            <p>
              {note.category ? `Category: ${note.category}.` : 'This note is uncategorized.'} Workspace id {note.id}.
            </p>
          </div>
          <button className="toolbar-button" type="button" onClick={onClose} aria-label="Close note room">
            Close
          </button>
        </div>

        <div className="note-room-overlay__body">
          <div className="note-room-overlay__main">
            <NoteEditor
              noteId={note.id}
              title={note.title}
              initialContent={note.contentPlain}
              initialCrdtBase64={note.crdtBase64}
              onSaved={handleSaved}
            />
          </div>

          <aside className="summary-card note-room-overlay__summary" aria-label="Room details">
            <div>
              <p className="muted">Room details</p>
              <div className="summary-card__item">
                <span className="muted">Visibility</span>
                <strong>Private</strong>
              </div>
              <div className="summary-card__item">
                <span className="muted">Created</span>
                <strong>{note.createdAtLabel}</strong>
              </div>
              <div className="summary-card__item">
                <span className="muted">Updated</span>
                <strong>{note.updatedAtLabel}</strong>
              </div>
            </div>
            <div>
              <p className="muted">Document stats</p>
              <div className="summary-card__item">
                <span className="muted">Words</span>
                <strong>{note.wordCount}</strong>
              </div>
              <div className="summary-card__item">
                <span className="muted">Lines</span>
                <strong>{note.lineCount}</strong>
              </div>
              <div className="summary-card__item">
                <span className="muted">Tags</span>
                <strong>{note.tags.length}</strong>
              </div>
              <div className="summary-card__item">
                <span className="muted">Encryption flag</span>
                <strong>{note.encryptionEnabled ? 'On' : 'Off'}</strong>
              </div>
            </div>
          </aside>
        </div>
      </motion.section>
    </div>
  );
}
