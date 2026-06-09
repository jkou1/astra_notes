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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = useMemo(
    () =>
      Array.from(new Set(notes.map((note) => note.category ?? 'Uncategorized'))).sort((first, second) =>
        first.localeCompare(second),
      ),
    [notes],
  );
  const visibleNotes = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase();

    return notes.filter((note) => {
      const category = note.category ?? 'Uncategorized';
      const categoryMatches = selectedCategory === 'all' || category === selectedCategory;

      if (!categoryMatches) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableContent = [
        note.title,
        category,
        note.contentPlain,
        ...note.tags,
        note.createdAtLabel,
        note.updatedAtLabel,
      ]
        .join(' ')
        .toLocaleLowerCase();

      return searchableContent.includes(normalizedSearch);
    });
  }, [notes, searchQuery, selectedCategory]);

  return (
    <>
      <div className="note-history-controls" aria-label="Recent note controls">
        <label className="field">
          <span className="field__label">Search notes</span>
          <input
            className="input"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Title, category, tags, or contents"
          />
        </label>

        <label className="field">
          <span className="field__label">Filter category</span>
          <select
            className="input"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="note-list note-list--scrollable">
        {notes.length === 0 ? (
          <li className="note-card">
            <strong>No notes yet</strong>
            <span className="muted">Create the first note to seed the Supabase workspace.</span>
          </li>
        ) : visibleNotes.length === 0 ? (
          <li className="note-card">
            <strong>No matching notes</strong>
            <span className="muted">Try a different search or category.</span>
          </li>
        ) : (
          visibleNotes.map((note) => (
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
