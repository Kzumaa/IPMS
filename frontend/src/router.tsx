import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from './store/hooks';

// Protected Route Wrapper
const ProtectedRoute = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public Route Wrapper (redirects to dashboard if already logged in)
const PublicRoute = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            {
                path: '/login',
                element: <div>Login Page (Placeholder)</div>,
            },
            {
                path: '/register',
                element: <div>Register Page (Placeholder)</div>,
            },
            {
                path: '/staff/login',
                element: <div>Staff Login Page (Placeholder)</div>,
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <div>Dashboard (Protected)</div>,
            },
        ],
    },
    {
        path: '*',
        element: <div>404 Not Found</div>,
    },
]);

export default router;
