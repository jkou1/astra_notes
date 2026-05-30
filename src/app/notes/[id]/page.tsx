type NotePageProps = {
  params: {
    id: string;
  };
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = params;

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
              <h2>Collaborative editor placeholder for note {id}.</h2>
              <p>
                This route is ready for the eventual Yjs-bound editor, cursors, and persistence flow.
                For now it keeps the room chrome and status visible so the next feature can slot in cleanly.
              </p>
            </div>
            <div className="workspace__stats">
              <div className="stat-card">
                <strong>Live</strong>
                <span>Connection state</span>
              </div>
              <div className="stat-card">
                <strong>4</strong>
                <span>Room events</span>
              </div>
              <div className="stat-card">
                <strong>0.0s</strong>
                <span>Latency target</span>
              </div>
            </div>
          </div>

          <div className="workspace__grid">
            <article className="editor-card">
              <div className="editor-card__toolbar">
                <button className="toolbar-button" type="button">
                  Comment
                </button>
                <button className="toolbar-button" type="button">
                  Share link
                </button>
                <button className="toolbar-button" type="button">
                  Copy state
                </button>
              </div>
              <div className="editor-card__canvas">
                <h3>Note content will live here</h3>
                <p>
                  The editor pane is intentionally empty apart from a clear placeholder, so it can be
                  replaced with a collaborative editor component without reworking the shell layout.
                </p>
              </div>
            </article>

            <aside className="summary-card">
              <div>
                <p className="muted">Room details</p>
                <div className="summary-card__item">
                  <span className="muted">Visibility</span>
                  <strong>Private</strong>
                </div>
                <div className="summary-card__item">
                  <span className="muted">Mode</span>
                  <strong>Draft</strong>
                </div>
                <div className="summary-card__item">
                  <span className="muted">Presence</span>
                  <strong>Enabled</strong>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}