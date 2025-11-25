import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Helper to determine where to redirect based on the REQUIRED role for this route
  const getRedirectPath = () => {
    if (!allowedRoles || allowedRoles.length === 0) return '/login';
    if (allowedRoles.includes('faculty')) return '/login/faculty';
    if (allowedRoles.includes('labIncharge')) return '/login/lab';
    if (allowedRoles.includes('admin')) return '/login/admin';
    return '/login/student';
  };

  if (!token) {
    return <Navigate to={getRedirectPath()} replace state={{ from: location }} />;
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to={getRedirectPath()} replace state={{ from: location }} />;
    }

    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return <Navigate to={getRedirectPath()} replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to={getRedirectPath()} replace state={{ from: location }} />;
  }
};

export default ProtectedRoute;
