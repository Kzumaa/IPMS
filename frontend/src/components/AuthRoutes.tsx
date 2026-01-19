import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchMe } from '../features/auth/authSlice';

// Protected Route Wrapper
export const ProtectedRoute = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // If authenticated but no user, fetch user data
        if (isAuthenticated && !user && !isLoading) {
            dispatch(fetchMe());
        }
    }, [dispatch, isAuthenticated, user, isLoading]);

    // Show loading while fetching user
    if (isAuthenticated && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-indigo-600 !text-4xl">
                    refresh
                </span>
            </div>
        );
    }

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
