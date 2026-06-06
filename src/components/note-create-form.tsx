'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FormState = {
  title: string;
  content: string;
  category: string;
  tags: string;
  encryptionEnabled: boolean;
};

type ApiErrorPayload = {
  detail?: string;
  request_id?: string;
  status_code?: number;
};

type ApiSuccessPayload = {
  item?: {
    id: string;
  };
  request_id?: string;
};

const initialState: FormState = {
  title: '',
  content: '',
  category: '',
  tags: '',
  encryptionEnabled: false,
};

export function NoteCreateForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const tags = formState.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          title: formState.title,
          content: formState.content,
          category: formState.category || null,
          tags,
          encryption_enabled: formState.encryptionEnabled,
        }),
      });

      const payload = (await response.json()) as ApiSuccessPayload | ApiErrorPayload;

      if (!response.ok) {
        setError('detail' in payload && payload.detail ? payload.detail : 'Failed to create note');
        return;
      }

      if (!('item' in payload) || !payload.item) {
        setError('Note was created, but the response was incomplete.');
        return;
      }

      setFormState(initialState);
      router.push(`/notes/${payload.item.id}`);
      router.refresh();
    } catch {
      setError('Network error while creating note.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <div className="note-form__grid">
        <label className="field">
          <span className="field__label">Title</span>
          <input
            className="input"
            name="title"
            type="text"
            placeholder="New project brief"
            value={formState.title}
            onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
            maxLength={500}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">Category</span>
          <input
            className="input"
            name="category"
            type="text"
            placeholder="planning"
            value={formState.category}
            onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
          />
        </label>

        <label className="field field--full">
          <span className="field__label">Content</span>
          <textarea
            className="textarea"
            name="content"
            placeholder="Capture the first draft of the note here."
            value={formState.content}
            onChange={(event) => setFormState((current) => ({ ...current, content: event.target.value }))}
            rows={8}
            required
          />
        </label>

        <label className="field field--full">
          <span className="field__label">Tags</span>
          <input
            className="input"
            name="tags"
            type="text"
            placeholder="roadmap, design, sprint"
            value={formState.tags}
            onChange={(event) => setFormState((current) => ({ ...current, tags: event.target.value }))}
          />
        </label>

        <label className="toggle field--full">
          <input
            type="checkbox"
            checked={formState.encryptionEnabled}
            onChange={(event) => setFormState((current) => ({ ...current, encryptionEnabled: event.target.checked }))}
          />
          <span>
            <strong>Enable encryption flag</strong>
            <span className="muted">Stored with the note metadata for later sync flows.</span>
          </span>
        </label>
      </div>

      <div className="note-form__footer">
        <div className="note-form__status" aria-live="polite">
          {error ? <span className="note-form__error">{error}</span> : <span className="muted">Saved to Supabase through Prisma.</span>}
        </div>

        <button className="toolbar-button toolbar-button--primary" type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Create note'}
        </button>
      </div>
    </form>
  );
}