import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RoleSelection from './pages/RoleSelection'
import StudentLogin from './pages/StudentLogin'
import AdminLogin from './pages/AdminLogin'
import FacultyLogin from './pages/FacultyLogin'
import LabLogin from './pages/LabLogin'
import LandingPage from './pages/LandingPage'
import StudentLanding from './pages/StudentLanding'

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
        <Route path="/student/landing" element={<StudentLanding />} />
      </Routes>
    </Router>
  )
}

export default App
