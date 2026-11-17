import { Outlet, Route, Routes } from 'react-router-dom'
import WorkspaceLayout from './components/WorkspaceLayout'
import AttendanceHistoryPage from './pages/AttendanceHistoryPage'
import DiscussionsPage from './pages/DiscussionsPage'
import DiscussionDetailPage from './pages/DiscussionDetailPage'
import DocumentsPage from './pages/DocumentsPage'
import MeetingRoomPage from './pages/MeetingRoomPage'
import MeetingsIndexPage from './pages/MeetingsIndexPage'
import MyMeetingsPage from './pages/MyMeetingsPage'
import NewMeetingPage from './pages/NewMeetingPage'
import AskWeaverPage from './pages/AskWeaverPage'
import NotificationsPage from './pages/NotificationsPage'
import NewWorkspacePage from './pages/NewWorkspacePage'
import PlaceholderPage from './pages/PlaceholderPage'
import SitesPage from './pages/SitesPage'
import NotesPage from './pages/NotesPage'
import EmailsPage from './pages/EmailsPage'
import SettingsPage from './pages/SettingsPage'
import { AboutPage, HelpPage, PrivacyPage, TermsPage } from './pages/GuidePages'
import { ActionItemsPage, TasksPage } from './pages/WorkItemsPage'
import ProfileDirectoryPage from './pages/ProfileDirectoryPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import WorkspaceListPage from './pages/WorkspaceListPage'
import WorkspaceRoute from './pages/WorkspaceRoute'
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
        <Route path="/" element={<WorkspaceListPage />} />
        <Route path="/w/:siteKey/:pageKey" element={<WorkspaceRoute />} />
        <Route path="/meetings" element={<MyMeetingsPage />} />
        <Route path="/meetings/new" element={<NewMeetingPage />} />
        <Route path="/meetings/all" element={<MeetingsIndexPage />} />
        <Route path="/meetings/attendance" element={<AttendanceHistoryPage />} />
        <Route path="/meetings/:id" element={<MeetingRoomPage />} />
        <Route path="/discussions" element={<DiscussionsPage />} />
        <Route path="/discussions/:id" element={<DiscussionDetailPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/action-items" element={<ActionItemsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/members" element={<ProfileDirectoryPage />} />
        <Route path="/profile" element={<ProfileDirectoryPage />} />
        <Route path="/profile/:slug" element={<ProfilePage />} />
        <Route path="/workspaces" element={<NewWorkspacePage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/emails" element={<EmailsPage />} />
        <Route path="/ask" element={<AskWeaverPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
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
