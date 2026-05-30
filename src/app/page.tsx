const navigationItems = [
  { label: "Dashboard", count: "12" },
  { label: "Shared", count: "4" },
  { label: "Archive", count: "8" },
  { label: "Templates", count: "3" },
];

const recentNotes = [
  {
    title: "Sprint zero shell",
    description: "Landing layout, workspace scaffold, and navigation states.",
    time: "Edited 2m ago",
  },
  {
    title: "Design tokens",
    description: "Colors, motion, and density rules for the editor shell.",
    time: "Edited 18m ago",
  },
  {
    title: "Collaboration plan",
    description: "Presence, cursors, and Yjs sync flow for the first editor pass.",
    time: "Edited 1h ago",
  },
];

export default function HomePage() {
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
                  This first pass gives you the landing workspace, note overview, and editor chrome the
                  team can build on once the real CRDT editor is wired in.
                </p>
              </div>

              <div className="workspace__stats" aria-label="Workspace summary">
                <div className="stat-card">
                  <strong>12</strong>
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
                <div className="editor-card__toolbar" aria-label="Editor toolbar preview">
                  <button className="toolbar-button" type="button">
                    Bold
                  </button>
                  <button className="toolbar-button" type="button">
                    Italic
                  </button>
                  <button className="toolbar-button" type="button">
                    Heading
                  </button>
                  <button className="toolbar-button" type="button">
                    Checklist
                  </button>
                  <button className="toolbar-button" type="button">
                    Share
                  </button>
                </div>

                <div className="editor-card__canvas">
                  <h3>Q2 roadmap</h3>
                  <p>
                    This placeholder editor surface is ready for the future TipTap or Lexical integration.
                    It gives the app a realistic shell for top-level navigation, note editing, and room
                    status without pretending the collaborative engine already exists.
                  </p>
                  <p>
                    Add the CRDT document, awareness state, and persistence wiring here when the next slice
                    of implementation starts.
                  </p>
                </div>
              </article>

              <aside className="summary-card" aria-label="Note list and activity">
                <div>
                  <p className="muted">Recent notes</p>
                  <ul className="note-list">
                    {recentNotes.map((note) => (
                      <li key={note.title} className="note-card">
                        <strong>{note.title}</strong>
                        <span className="muted">{note.description}</span>
                        <span className="badge">{note.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="muted">Activity</p>
                  <div className="activity-item">
                    <div>
                      <strong>Presence preview</strong>
                      <div className="muted">2 collaborators are queued for the editor room.</div>
                    </div>
                    <span className="badge">Live</span>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <aside className="panel" aria-label="Secondary workspace overview">
            <div className="panel__section">
              <p className="muted">This week</p>
              <div className="summary-card__item">
                <span className="muted">Open rooms</span>
                <strong>3</strong>
              </div>
              <div className="summary-card__item">
                <span className="muted">Drafts</span>
                <strong>7</strong>
              </div>
              <div className="summary-card__item">
                <span className="muted">Shared links</span>
                <strong>15</strong>
              </div>
            </div>

            <div className="panel__section">
              <p className="muted">Next steps</p>
              <div className="note-card">
                <strong>Wire the collaborative editor</strong>
                <span className="muted">Replace the placeholder canvas with the real Yjs-backed editor.</span>
              </div>
              <div className="note-card">
                <strong>Add workspace routes</strong>
                <span className="muted">Connect the dashboard and dynamic note pages to real data.</span>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}