'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type NoteDeleteButtonProps = {
  noteId: string;
  title: string;
};

type DeletePayload = {
  detail?: string;
};

const PERMANENT_DELETE_HOLD_MS = 900;

export function NoteDeleteButton({ noteId, title }: NoteDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, []);

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  async function deleteNote(permanent: boolean) {
    const confirmed = window.confirm(
      permanent
        ? `Permanently delete "${title}" from the database? This cannot be undone.`
        : `Delete "${title}"?`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const deleteUrl = permanent ? `/api/notes/${noteId}?permanent=true` : `/api/notes/${noteId}`;
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });
      const payload = (await response.json()) as DeletePayload;

      if (!response.ok) {
        setError(payload.detail ?? (permanent ? 'Failed to permanently delete note.' : 'Failed to delete note.'));
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Network error while deleting note.');
    } finally {
      setIsDeleting(false);
    }
  }

  function handlePointerDown() {
    if (isDeleting) {
      return;
    }

    longPressTriggeredRef.current = false;
    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      void deleteNote(true);
      clearLongPressTimer();
    }, PERMANENT_DELETE_HOLD_MS);
  }

  function handlePointerEnd() {
    clearLongPressTimer();
  }

  function handleClick() {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    void deleteNote(false);
  }

  return (
    <div className="note-delete">
      <button
        className="toolbar-button toolbar-button--danger"
        type="button"
        onClick={handleClick}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerEnd}
        onPointerUp={handlePointerEnd}
        disabled={isDeleting}
        title="Click to delete. Long-click to permanently delete from the database."
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
      {error ? <span className="note-form__error">{error}</span> : null}
    </div>
  );
}
