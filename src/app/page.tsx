import { prisma } from '@/lib/prisma';
import { NoteCreateForm } from '@/components/note-create-form';
import { NoteRoomLauncher } from '@/components/note-room-launcher';

export const dynamic = 'force-dynamic';

const navigationItems = [
  { label: 'Dashboard', count: '12' },
  { label: 'Shared', count: '4' },
  { label: 'Archive', count: '8' },
  { label: 'Templates', count: '3' },
];

type HomePageProps = {
  searchParams?: {
    note?: string;
  };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const [activeNoteCount, recentNotes] = await Promise.all([
    prisma.note.count({
      where: {
        status: 'ACTIVE',
      },
    }),
    prisma.note.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: { updatedAt: 'desc' },
      take: 12,
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
          },
        },
      },
    }),
  ]);
  const noteRoomItems = recentNotes.map((note) => ({
    id: note.id,
    title: note.title,
    category: note.category,
    tags: note.tags,
    encryptionEnabled: note.encryptionEnabled,
    createdAtLabel: note.createdAt.toLocaleDateString(),
    updatedAtLabel: note.updatedAt.toLocaleDateString(),
    contentPlain: note.blob?.contentPlain ?? '',
    crdtBase64: note.blob?.crdtBlob ? Buffer.from(note.blob.crdtBlob).toString('base64') : null,
    wordCount: note.blob?.wordCount ?? 0,
    lineCount: note.blob?.lineCount ?? 0,
  }));

  return (
    <main className="shell">
      <div className="shell__frame">
        <header className="topbar">
          <div className="brand">
            <div className="brand__mark">A</div>
            <div className="brand__text">
              <h1>AstraNotes</h1>
              <p>Fast, collaborative notes with a clean workspace shell.</p>
            </div>
          </div>
          <div className="topbar__actions">
            <span className="pill">Live workspace</span>
            <span className="pill pill--accent">Ready to test</span>
          </div>
        </header>

        <section className="shell__content">
          <aside className="panel" aria-label="Navigation and notebooks">
            <div className="panel__section">
              <p className="muted">Navigation</p>
              <ul className="nav-list">
                {navigationItems.map((item, index) => (
                  <li key={item.label} className={`nav-item ${index === 0 ? "nav-item--active" : ""}`}>
                    <strong>{item.label}</strong>
                    <span className="badge">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel__section">
              <p className="muted">Workspace</p>
              <div className="status-card">
                <div className="status-row">
                  <span className="status-dot" />
                  <span>Presence sync is standing by.</span>
                </div>
                <div className="status-card__item">
                  <span className="muted">Active note</span>
                  <strong>Q2 roadmap</strong>
                </div>
                <div className="status-card__item">
                  <span className="muted">Connection</span>
                  <strong>Local preview</strong>
                </div>
              </div>
            </div>
          </aside>

          <section className="workspace" aria-label="Main workspace">
            <div className="workspace__hero">
              <div className="workspace__title">
                <span className="pill">Collaborative note-taking shell</span>
                <h2>One focused space for writing, organizing, and syncing notes.</h2>
                <p>
                  Create note records, open Yjs-backed editor rooms, and keep CRDT state alongside
                  readable note metadata in Supabase.
                </p>
              </div>

              <div className="workspace__stats" aria-label="Workspace summary">
                <div className="stat-card">
                  <strong>{activeNoteCount}</strong>
                  <span>Notes in view</span>
                </div>
                <div className="stat-card">
                  <strong>4</strong>
                  <span>Shared rooms</span>
                </div>
                <div className="stat-card">
                  <strong>98%</strong>
                  <span>Shell complete</span>
                </div>
              </div>
            </div>

            <div className="workspace__grid">
              <article className="editor-card">
                <div className="editor-card__toolbar" aria-label="Create note actions">
                  <span className="pill pill--accent">Create a new note</span>
                  <span className="pill">Saved through Supabase</span>
                </div>

                <div className="editor-card__canvas">
                  <h3>Quick note entry</h3>
                  <p>
                    This form writes a new note record and its note blob through Prisma, then sends you to
                    the saved note room.
                  </p>
                  <NoteCreateForm />
                </div>
              </article>

            </div>
          </section>

          <aside className="panel shell__history" aria-label="Recent note history">
            <div className="panel__section">
              <p className="muted">Recent notes</p>
              <NoteRoomLauncher initialNoteId={searchParams?.note} notes={noteRoomItems} />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
