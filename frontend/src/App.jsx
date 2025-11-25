import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import FacultyTeamApproval from './pages/FacultyTeamApproval'
import FacultyTeamCreate from './pages/FacultyTeamCreate'
import FacultyApprove from './pages/FacultyApprove'
import LabApprove from './pages/LabApprove'
import AvailableMaterials from './pages/AvailableMaterials'
import AvailableMachines from './pages/AvailableMachines'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<RoleSelection />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/login/faculty" element={<FacultyLogin />} />
        <Route path="/login/lab" element={<LabLogin />} />
        <Route path="/faculty/approve" element={<FacultyApprove />} />
        <Route path="/lab/approve" element={<LabApprove />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/student/landing" element={<StudentLanding />} />
        <Route path="/student/dashboard" element={<StudentHome />} />
        <Route path="/student/bom" element={<StudentBOMPage />} />
        <Route path="/student/carbon" element={<StudentCarbonPage />} />
        <Route path="/student/energy" element={<StudentEnergyPage />} />
        <Route path="/faculty" element={<FacultyLanding />} />
        <Route path="/faculty/teams" element={<FacultyTeamApproval />} />
        <Route path="/faculty/team-create" element={<FacultyTeamCreate />} />
      </Routes>
    </Router>
  )
}

export default App
