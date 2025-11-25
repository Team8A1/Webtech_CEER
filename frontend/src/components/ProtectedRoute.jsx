import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    const role = location.pathname.split('/')[1];
    return <Navigate to={`/login/${role}`} replace />;
  }

  try {
    const decoded = jwtDecode(token);
    
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const role = location.pathname.split('/')[1];
      return <Navigate to={`/login/${role}`} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return <Navigate to={`/login/${decoded.role}`} replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const role = location.pathname.split('/')[1];
    return <Navigate to={`/login/${role}`} replace />;
  }
};

export default ProtectedRoute;
