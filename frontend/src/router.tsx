import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ClientLoginPage from './pages/ClientLoginPage';
import StaffLoginPage from './pages/StaffLoginPage';
import DashboardLayout from './components/DashboardLayout';
import PatentsPage from './pages/PatentsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import { ProtectedRoute, PublicRoute } from './components/AuthRoutes';

const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            {
                path: '/',
                element: <LandingPage />,
            },
            {
                path: '/login',
                element: <ClientLoginPage />,
            },
            {
                path: '/staff-login',
                element: <StaffLoginPage />,
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/app',
                element: <DashboardLayout />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="/app/patents" replace />,
                    },
                    {
                        path: 'patents',
                        element: <PatentsPage />,
                    },
                    {
                        path: 'applications',
                        element: <ApplicationsPage />,
                    },
                ],
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);

export default router;
