import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import RoleSelection from './pages/RoleSelection'
import StudentLogin from './pages/StudentLogin'
import AdminLogin from './pages/AdminLogin'
import FacultyLogin from './pages/FacultyLogin'
import LabLogin from './pages/LabLogin'
import LandingPage from './pages/LandingPage'
import StudentLanding from './pages/StudentLanding'
import StudentHome from './pages/StudentHome'
import StudentBOMPage from './pages/StudentBOMPage'
import BOMDetailPage from './pages/BOMDetailPage'
import StudentCarbonPage from './pages/StudentCarbonPage'
import StudentEnergyPage from './pages/StudentEnergyPage'
import FacultyLanding from './pages/FacultyLanding'
import FacultyMyTeams from './pages/FacultyMyTeams'
import FacultyTeamApproval from './pages/FacultyTeamApproval'
import FacultyTeamCreate from './pages/FacultyTeamCreate'
import FacultyApprove from './pages/FacultyApprove'
import FacultyTeamBOMQueue from './pages/FacultyTeamBOMQueue'
import LabApprove from './pages/LabApprove'
import AvailableMaterials from './pages/AvailableMaterials'
import AvailableMachines from './pages/AvailableMachines'
import AdminDashboard from './pages/AdminDashboard'
import StudentInstructions from './pages/StudentInstructions'
import AdminInstructions from './pages/AdminInstructions'
import AdminProjects from './pages/AdminProjects'
import NotFound from './pages/NotFound'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* FIX #12: PublicRoute redirects already-logged-in users away from auth pages */}
        <Route path="/login" element={<PublicRoute><RoleSelection /></PublicRoute>} />
        {/* <Route path="/explorer-portal" element={<ExplorerPortal />} /> */}
        <Route path="/login/student" element={<PublicRoute><StudentLogin /></PublicRoute>} />
        <Route path="/login/admin" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/login/faculty" element={<PublicRoute><FacultyLogin /></PublicRoute>} />
        <Route path="/login/lab" element={<PublicRoute><LabLogin /></PublicRoute>} />

        <Route path="/faculty/approve" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyApprove />
          </ProtectedRoute>
        } />
        <Route path="/faculty/approve/:teamId" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyTeamBOMQueue />
          </ProtectedRoute>
        } />
        <Route path="/lab/approve" element={
          <ProtectedRoute allowedRoles={['labIncharge']}>
            <LabApprove />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/projects" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProjects />
          </ProtectedRoute>
        } />
        <Route path="/student/landing" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLanding />
          </ProtectedRoute>
        } />
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentHome />
          </ProtectedRoute>
        } />
        <Route path="/student/bom" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentBOMPage />
          </ProtectedRoute>
        } />
        <Route path="/student/carbon" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCarbonPage />
          </ProtectedRoute>
        } />
        <Route path="/student/energy" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentEnergyPage />
          </ProtectedRoute>
        } />
        <Route path="/student/instructions" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentInstructions />
          </ProtectedRoute>
        } />

        {/* FIX #10: /faculty is now a redirect — no duplicate component mount */}
        <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
        <Route path="/faculty/dashboard" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyLanding />
          </ProtectedRoute>
        } />
        <Route path="/faculty/teams" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyTeamApproval />
          </ProtectedRoute>
        } />
        <Route path="/faculty/team-create" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyTeamCreate />
          </ProtectedRoute>
        } />
        <Route path="/faculty/my-teams" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyMyTeams />
          </ProtectedRoute>
        } />

        {/* FIX #11: Catch-all 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
