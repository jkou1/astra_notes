import { notFound } from 'next/navigation';

import { NoteEditor } from '@/components/note-editor';
import { prisma } from '@/lib/prisma';

type NotePageProps = {
  params: {
    id: string;
  };
};

export const dynamic = 'force-dynamic';

export default async function NotePage({ params }: NotePageProps) {
  const { id } = params;
  const note = await prisma.note.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      category: true,
      tags: true,
      encryptionEnabled: true,
      createdAt: true,
      updatedAt: true,
      blob: {
        select: {
          crdtBlob: true,
          contentPlain: true,
          wordCount: true,
          lineCount: true,
          characterCount: true,
        },
      },
    },
  });

  if (!note) {
    notFound();
  }

  return (
    <main className="shell">
      <div className="shell__frame">
        <header className="topbar">
          <div className="brand">
            <div className="brand__mark">N</div>
            <div className="brand__text">
              <h1>Note room</h1>
              <p>Workspace id {id}</p>
            </div>
          </div>
          <div className="topbar__actions">
            <span className="pill">2 collaborators</span>
            <span className="pill pill--accent">Sync ready</span>
          </div>
        </header>

        <section className="workspace">
          <div className="workspace__hero">
            <div className="workspace__title">
              <span className="pill">Realtime room</span>
              <h2>{note.title}</h2>
              <p>
                {note.category ? `Category: ${note.category}.` : 'This note is uncategorized.'} It was
                saved in Supabase and can be used as the first collaborative room shell.
              </p>
            </div>
            <div className="workspace__stats">
              <div className="stat-card">
                <strong>{note.tags.length}</strong>
                <span>Tags</span>
              </div>
              <div className="stat-card">
                <strong>{note.encryptionEnabled ? 'On' : 'Off'}</strong>
                <span>Encryption flag</span>
              </div>
              <div className="stat-card">
                <strong>{note.blob?.characterCount ?? 0}</strong>
                <span>Characters</span>
              </div>
            </div>
          </div>

          <div className="workspace__grid">
            <NoteEditor
              noteId={note.id}
              title={note.title}
              initialContent={note.blob?.contentPlain ?? ''}
              initialCrdtBase64={note.blob?.crdtBlob ? Buffer.from(note.blob.crdtBlob).toString('base64') : null}
            />

            <aside className="summary-card">
              <div>
                <p className="muted">Room details</p>
                <div className="summary-card__item">
                  <span className="muted">Visibility</span>
                  <strong>Private</strong>
                </div>
                <div className="summary-card__item">
                  <span className="muted">Created</span>
                  <strong>{note.createdAt.toLocaleDateString()}</strong>
                </div>
                <div className="summary-card__item">
                  <span className="muted">Updated</span>
                  <strong>{note.updatedAt.toLocaleDateString()}</strong>
                </div>
              </div>
              <div>
                <p className="muted">Document stats</p>
                <div className="summary-card__item">
                  <span className="muted">Words</span>
                  <strong>{note.blob?.wordCount ?? 0}</strong>
                </div>
                <div className="summary-card__item">
                  <span className="muted">Lines</span>
                  <strong>{note.blob?.lineCount ?? 0}</strong>
                </div>
                <div className="summary-card__item">
                  <span className="muted">Tags</span>
                  <strong>{note.tags.length}</strong>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
