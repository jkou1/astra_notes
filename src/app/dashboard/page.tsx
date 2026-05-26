const dashboardNotes = [
  { title: "Project intro", updated: "5 minutes ago", status: "Pinned" },
  { title: "Meeting notes", updated: "Today", status: "Shared" },
  { title: "Draft outline", updated: "Yesterday", status: "Private" },
];

export default function DashboardPage() {
  return (
    <main className="shell">
      <div className="shell__frame">
        <header className="topbar">
          <div className="brand">
            <div className="brand__mark">D</div>
            <div className="brand__text">
              <h1>Dashboard</h1>
              <p>Organize notes and jump into a workspace.</p>
            </div>
          </div>
          <span className="pill pill--accent">3 folders, 12 notes</span>
        </header>

        <section className="dashboard-grid">
          <section className="panel">
            <div className="panel__section">
              <p className="muted">Notes</p>
              <ul className="note-list">
                {dashboardNotes.map((note) => (
                  <li key={note.title} className="note-card">
                    <strong>{note.title}</strong>
                    <span className="muted">Updated {note.updated}</span>
                    <span className="badge">{note.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <aside className="panel">
            <div className="panel__section">
              <p className="muted">Workspace actions</p>
              <div className="status-card">
                <div className="status-card__item">
                  <span className="muted">Create note</span>
                  <strong>Quick action</strong>
                </div>
                <div className="status-card__item">
                  <span className="muted">Invite</span>
                  <strong>Share room</strong>
                </div>
                <div className="status-card__item">
                  <span className="muted">Cleanup</span>
                  <strong>Archive old drafts</strong>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}