import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * PublicRoute — wraps login/auth pages.
 * If the user is already authenticated and their token is still valid,
 * redirect them to their role-specific dashboard instead of showing the login form.
 */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decoded = jwtDecode(token);
      // Only redirect if the token is still valid (not expired)
      if (decoded.exp * 1000 > Date.now()) {
        // Send each role to their home dashboard
        const dashboardMap = {
          student: '/student/dashboard',
          faculty: '/faculty/dashboard',
          labIncharge: '/lab/approve',
          admin: '/admin/dashboard',
        };
        const destination = dashboardMap[decoded.role] || '/';
        return <Navigate to={destination} replace />;
      }
    } catch {
      // Malformed token — clear it and fall through to show the login page
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  return children;
};

export default PublicRoute;
