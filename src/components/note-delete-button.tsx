'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type NoteDeleteButtonProps = {
  noteId: string;
  title: string;
};

type DeletePayload = {
  detail?: string;
};

export function NoteDeleteButton({ noteId, title }: NoteDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${title}"?`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });
      const payload = (await response.json()) as DeletePayload;

      if (!response.ok) {
        setError(payload.detail ?? 'Failed to delete note.');
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

  return (
    <div className="note-delete">
      <button className="toolbar-button toolbar-button--danger" type="button" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
      {error ? <span className="note-form__error">{error}</span> : null}
    </div>
  );
}
