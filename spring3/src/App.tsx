import { Outlet, Route, Routes } from 'react-router-dom'
import WorkspaceLayout from './components/WorkspaceLayout'
import AttendanceHistoryPage from './pages/AttendanceHistoryPage'
import DiscussionsPage from './pages/DiscussionsPage'
import DocumentsPage from './pages/DocumentsPage'
import MeetingRoomPage from './pages/MeetingRoomPage'
import MeetingsIndexPage from './pages/MeetingsIndexPage'
import MyMeetingsPage from './pages/MyMeetingsPage'
import NewMeetingPage from './pages/NewMeetingPage'
import AskWeaverPage from './pages/AskWeaverPage'
import NotificationsPage from './pages/NotificationsPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ProfileDirectoryPage from './pages/ProfileDirectoryPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
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
        <Route path="/" element={<WorkspaceHome workspaceId="ux" />} />
        <Route path="/ux" element={<WorkspaceHome workspaceId="ux" />} />
        <Route path="/organization" element={<WorkspaceHome workspaceId="organization" />} />
        <Route path="/dev" element={<WorkspaceHome workspaceId="dev" />} />
        <Route path="/branding" element={<WorkspaceHome workspaceId="branding" />} />
        <Route path="/marketing" element={<WorkspaceHome workspaceId="marketing" />} />
        <Route path="/logistics" element={<WorkspaceHome workspaceId="logistics" />} />
        <Route path="/meetings" element={<MyMeetingsPage />} />
        <Route path="/meetings/new" element={<NewMeetingPage />} />
        <Route path="/meetings/all" element={<MeetingsIndexPage />} />
        <Route path="/meetings/attendance" element={<AttendanceHistoryPage />} />
        <Route path="/meetings/:id" element={<MeetingRoomPage />} />
        <Route path="/discussions" element={<DiscussionsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
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
        <Route path="/members" element={<ProfileDirectoryPage />} />
        <Route path="/profile" element={<ProfileDirectoryPage />} />
        <Route path="/profile/:slug" element={<ProfilePage />} />
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
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/emails"
          element={
            <PlaceholderPage
              title="Emails"
              description="Workspace email threads and notices."
            />
          }
        />
        <Route path="/ask" element={<AskWeaverPage />} />
        <Route
          path="/settings"
          element={
            <PlaceholderPage
              title="Settings"
              description="Account and workspace preferences."
            />
          }
        />
        <Route path="/search" element={<SearchPage />} />
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
