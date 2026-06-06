'use client';

import { useMemo, useState } from 'react';

import { NoteDeleteButton } from '@/components/note-delete-button';
import { NoteRoomDialog, type NoteRoomDialogNote } from '@/components/note-room-dialog';

type NoteRoomLauncherProps = {
  initialNoteId?: string;
  notes: NoteRoomDialogNote[];
};

export function NoteRoomLauncher({ initialNoteId, notes }: NoteRoomLauncherProps) {
  const initialNote = useMemo(
    () => notes.find((note) => note.id === initialNoteId) ?? null,
    [initialNoteId, notes],
  );
  const [selectedNote, setSelectedNote] = useState<NoteRoomDialogNote | null>(initialNote);

  return (
    <>
      <ul className="note-list note-list--scrollable">
        {notes.length === 0 ? (
          <li className="note-card">
            <strong>No notes yet</strong>
            <span className="muted">Create the first note to seed the Supabase workspace.</span>
          </li>
        ) : (
          notes.map((note) => (
            <li key={note.id} className="note-card note-card--with-actions">
              <button
                className="note-card__body note-card--link note-card--button"
                type="button"
                onClick={() => setSelectedNote(note)}
                aria-label={`Edit ${note.title}`}
              >
                <strong>{note.title}</strong>
                <span className="muted">{note.category ?? 'Uncategorized'}</span>
                <span className="muted">{note.contentPlain || 'No content preview yet'}</span>
                <span className="note-card__meta">
                  <span className="badge">{note.updatedAtLabel}</span>
                  <span className="badge badge--action">Edit</span>
                </span>
              </button>
              <NoteDeleteButton noteId={note.id} title={note.title} />
            </li>
          ))
        )}
      </ul>

      {selectedNote ? <NoteRoomDialog note={selectedNote} onClose={() => setSelectedNote(null)} /> : null}
    </>
  );
}
