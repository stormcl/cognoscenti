import { Outlet, Route, Routes } from 'react-router-dom'
import WorkspaceLayout from './components/WorkspaceLayout'
import PlaceholderPage from './pages/PlaceholderPage'
import WorkspaceHome from './pages/WorkspaceHome'
import './App.css'

function AppLayout() {
  return (
    <WorkspaceLayout>
      <Outlet />
    </WorkspaceLayout>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<WorkspaceHome />} />
        <Route
          path="/meetings"
          element={
            <PlaceholderPage
              title="Meetings"
              description="Agendas, attendance, and minutes for this workspace."
            />
          }
        />
        <Route
          path="/meetings/:id"
          element={
            <PlaceholderPage
              title="Meeting"
              description="Open a meeting or view its agenda."
            />
          }
        />
        <Route
          path="/discussions"
          element={
            <PlaceholderPage
              title="Discussions"
              description="Topics and comment threads from this workspace."
            />
          }
        />
        <Route
          path="/documents"
          element={
            <PlaceholderPage
              title="Documents"
              description="Files attached to this workspace, including upload."
            />
          }
        />
        <Route
          path="/action-items"
          element={
            <PlaceholderPage
              title="Action items"
              description="Goals and tasks assigned in this workspace."
            />
          }
        />
        <Route
          path="/notes"
          element={
            <PlaceholderPage
              title="Notes"
              description="Personal scratchpad and workspace notes."
            />
          }
        />
        <Route
          path="/members"
          element={
            <PlaceholderPage
              title="Members"
              description="Who is in this workspace, and invitations."
            />
          }
        />
        <Route
          path="/workspaces"
          element={
            <PlaceholderPage
              title="Workspaces"
              description="Switch workspaces or view the hierarchy map."
            />
          }
        />
        <Route
          path="/tasks"
          element={
            <PlaceholderPage
              title="Tasks"
              description="Action items across the workspaces you can see."
            />
          }
        />
        <Route
          path="/sites"
          element={
            <PlaceholderPage
              title="Sites"
              description="Sites and organizations you belong to."
            />
          }
        />
        <Route
          path="/help"
          element={
            <PlaceholderPage
              title="Help & support"
              description="Getting started, the help center, and contact options."
            />
          }
        />
        <Route
          path="/notifications"
          element={
            <PlaceholderPage
              title="Notifications"
              description="Updates from workspaces you are watching."
            />
          }
        />
        <Route
          path="/emails"
          element={
            <PlaceholderPage
              title="Emails"
              description="Workspace email threads and notices."
            />
          }
        />
        <Route
          path="/ask"
          element={
            <PlaceholderPage
              title="Ask Weaver"
              description="Ask Weaver about this workspace."
            />
          }
        />
        <Route
          path="/settings"
          element={
            <PlaceholderPage
              title="Settings"
              description="Account and workspace preferences."
            />
          }
        />
        <Route
          path="/search"
          element={
            <PlaceholderPage
              title="Search"
              description="Find topics, meetings, and documents."
            />
          }
        />
        <Route
          path="/about"
          element={
            <PlaceholderPage
              title="About"
              description="What Circle Weaver is and how to get started."
            />
          }
        />
        <Route
          path="/privacy"
          element={
            <PlaceholderPage
              title="Privacy"
              description="How Circle Weaver handles workspace data."
            />
          }
        />
        <Route
          path="/terms"
          element={
            <PlaceholderPage
              title="Terms"
              description="Terms of use for this prototype."
            />
          }
        />
        <Route
          path="*"
          element={
            <PlaceholderPage
              title="Page not found"
              description="That route is not in this prototype yet."
            />
          }
        />
      </Route>
    </Routes>
  )
}

export default App
