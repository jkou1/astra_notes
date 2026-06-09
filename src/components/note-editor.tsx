'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';

type NoteEditorProps = {
  noteId: string;
  title: string;
  initialContent: string;
  initialCrdtBase64: string | null;
  onSaved?: () => Promise<void> | void;
};

type SavePayload = {
  item?: {
    contentPlain: string;
    wordCount: number;
    lineCount: number;
    characterCount: number;
    lastSyncedAt: string | null;
  };
  detail?: string;
};

function base64ToBytes(value: string) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return window.btoa(binary);
}

function countWords(content: string) {
  return content.split(/\s+/).filter(Boolean).length;
}

function countLines(content: string) {
  return content.length === 0 ? 0 : content.split(/\n/).length;
}

export function NoteEditor({ noteId, title, initialContent, initialCrdtBase64, onSaved }: NoteEditorProps) {
  const router = useRouter();
  const ydoc = useMemo(() => new Y.Doc(), []);
  const ytext = useMemo(() => ydoc.getText('content'), [ydoc]);
  const [content, setContent] = useState(initialContent);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const isApplyingRemoteUpdate = useRef(false);
  const lastSavedContent = useRef(initialContent);

  function replaceYText(nextContent: string) {
    ydoc.transact(() => {
      ytext.delete(0, ytext.length);
      if (nextContent.length > 0) {
        ytext.insert(0, nextContent);
      }
    });
  }

  useEffect(() => {
    ydoc.transact(() => {
      if (initialCrdtBase64) {
        Y.applyUpdate(ydoc, base64ToBytes(initialCrdtBase64));
        return;
      }

      if (ytext.length === 0 && initialContent.length > 0) {
        ytext.insert(0, initialContent);
      }
    });

    const currentContent = ytext.toString();
    lastSavedContent.current = currentContent;
    setContent(currentContent);

    function handleTextChange() {
      isApplyingRemoteUpdate.current = true;
      setContent(ytext.toString());
      window.setTimeout(() => {
        isApplyingRemoteUpdate.current = false;
      }, 0);
    }

    ytext.observe(handleTextChange);

    return () => {
      ytext.unobserve(handleTextChange);
      ydoc.destroy();
    };
  }, [initialContent, initialCrdtBase64, ydoc, ytext]);

  async function handleSave() {
    setSaveState('saving');
    setError(null);

    try {
      const encodedState = bytesToBase64(Y.encodeStateAsUpdate(ydoc));
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          content,
          crdt_blob: encodedState,
        }),
      });

      const payload = (await response.json()) as SavePayload;

      if (!response.ok) {
        setSaveState('error');
        setError(payload.detail ?? 'Failed to save note');
        return;
      }

      setSavedAt(payload.item?.lastSyncedAt ?? new Date().toISOString());
      lastSavedContent.current = content;
      setSaveState('saved');
      if (onSaved) {
        await onSaved();
      } else {
        router.push('/');
      }
      router.refresh();
    } catch {
      setSaveState('error');
      setError('Network error while saving note.');
    }
  }

  function handleChange(nextContent: string) {
    setContent(nextContent);
    setError(null);
    setCopyState('idle');
    setSaveState('dirty');

    if (isApplyingRemoteUpdate.current) {
      return;
    }

    replaceYText(nextContent);
  }

  function handleClear() {
    if (content.length === 0 || saveState === 'saving') {
      return;
    }

    setContent('');
    setError(null);
    setCopyState('idle');
    setSaveState('dirty');
    replaceYText('');
  }

  function handleRestoreSaved() {
    if (saveState === 'saving') {
      return;
    }

    const nextContent = lastSavedContent.current;
    setContent(nextContent);
    setError(null);
    setCopyState('idle');
    setSaveState('idle');
    replaceYText(nextContent);
  }

  async function handleCopyText() {
    setError(null);

    try {
      await navigator.clipboard.writeText(ytext.toString());
      setCopyState('copied');
    } catch {
      setCopyState('error');
      setError('Unable to copy note content from this browser session.');
    }
  }

  const characterCount = content.length;
  const wordCount = countWords(content);
  const lineCount = countLines(content);
  const statusLabel =
    saveState === 'saving'
      ? 'Saving'
      : saveState === 'dirty'
        ? 'Unsaved changes'
        : saveState === 'error'
          ? 'Save failed'
          : saveState === 'saved'
            ? 'Synced'
            : 'Yjs ready';

  return (
    <article className="editor-card note-room-overlay__editor">
      <div className="editor-card__toolbar" aria-label="Editor actions">
        <span className={`pill ${saveState === 'dirty' || saveState === 'error' ? '' : 'pill--accent'}`}>
          {statusLabel}
        </span>
        <button
          className="toolbar-button toolbar-button--primary"
          type="button"
          onClick={handleSave}
          disabled={saveState === 'saving'}
        >
          {saveState === 'saving' ? 'Saving...' : 'Save note'}
        </button>
        <button className="toolbar-button" type="button" onClick={handleRestoreSaved} disabled={saveState === 'saving'}>
          Restore saved
        </button>
        <button className="toolbar-button" type="button" onClick={handleCopyText} disabled={content.length === 0}>
          {copyState === 'copied' ? 'Copied' : 'Copy text'}
        </button>
        <button
          className="toolbar-button toolbar-button--danger"
          type="button"
          onClick={handleClear}
          disabled={saveState === 'saving' || content.length === 0}
        >
          Clear draft
        </button>
      </div>

      <div className="editor-card__canvas editor-card__canvas--live">
        <label className="field">
          <span className="field__label">Title</span>
          <input className="input" value={title} readOnly aria-label="Note title" />
        </label>

        <label className="field">
          <span className="field__label">Content</span>
          <textarea
            className="textarea yjs-editor"
            value={content}
            onChange={(event) => handleChange(event.target.value)}
            aria-label="Yjs-backed note editor"
            spellCheck
          />
        </label>

        <div className="editor-metrics" aria-live="polite">
          <span>{wordCount} words</span>
          <span>{lineCount} lines</span>
          <span>{characterCount} characters</span>
          {savedAt ? <span>Last synced {new Date(savedAt).toLocaleTimeString()}</span> : null}
        </div>

        {error ? <p className="note-form__error">{error}</p> : null}
      </div>
    </article>
  );
}
