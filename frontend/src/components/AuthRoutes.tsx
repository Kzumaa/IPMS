
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

// Protected Route Wrapper
export const ProtectedRoute = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public Route Wrapper (redirects to appropriate dashboard if already logged in)
export const PublicRoute = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Outlet />;
    }

    // Redirect based on user role
    if (user?.role === 'staff') {
        return <Navigate to="/staff/dashboard" replace />;
    }

    // Default to applicant dashboard
    return <Navigate to="/app/dashboard" replace />;
};
