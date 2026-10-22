import WorkspaceLayout from './components/WorkspaceLayout'
import './App.css'


function App() {
  return (
    <WorkspaceLayout>
      {/* Primary page content */}
      <section 
        className="hero"
        aria-labelledby="page-title"
        >
        <p className="eyebrow">
          Collaborative workspaces
        </p>
        <h1 id="page-title">
          Keep your team's work connected          
        </h1>
        <p>
        Organize discussions, goals, meetings, and shared documents in one accessible workspace.
        </p>
        <a 
          className="primary-action"
          href="#workspace-overview">
          Explore the workspace
        </a>
      </section>
    <section
      id="workspace-overview"
      className="workspace-overview"
      aria-labelledby="overview-title"
    >
      <h2 id="overview-title">Workspace overview</h2>
      <div className="feature-grid">
        <article id="discussions">
          <h3>Discussions</h3>
          <p>Track responsibilities, progress, and upcoming work.</p>
        </article>
        <article id="goals">
          <h3>Goals</h3>
          <p>Track responsibilities, progress, and upcoming work.</p>
        </article>
        <article id="meetings">
          <h3>Meetings</h3>
          <p>Plan agendas and keep meeting outcomes connected.</p>
        </article>
      </div>
    </section>

    {/* About section */}
    <section 
      id="about" 
      className="about"   aria-labelledby="about-title"
    >
      <h2 id="about-title">About Circle Weaver</h2>
      <p>This application helps teams collaborate effectively.</p>
    </section>
  </WorkspaceLayout>
 )
}


export default App;