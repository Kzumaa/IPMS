
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

// Protected Route Wrapper
export const ProtectedRoute = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public Route Wrapper (redirects to dashboard if already logged in)
export const PublicRoute = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    return !isAuthenticated ? <Outlet /> : <Navigate to="/app/dashboard" replace />;
};
