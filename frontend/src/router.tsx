import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ClientLoginPage from './pages/ClientLoginPage';
import StaffLoginPage from './pages/StaffLoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import NewApplicationPage from './pages/NewApplicationPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import AssetsPage from './pages/AssetsPage';
import FeesPage from './pages/FeesPage';
import MessagesPage from './pages/MessagesPage';
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
                        element: <Navigate to="/app/dashboard" replace />,
                    },
                    {
                        path: 'dashboard',
                        element: <DashboardPage />,
                    },
                    {
                        path: 'applications',
                        element: <ApplicationsPage />,
                    },
                    {
                        path: 'applications/new',
                        element: <NewApplicationPage />,
                    },
                    {
                        path: 'applications/:id',
                        element: <ApplicationDetailPage />,
                    },
                    {
                        path: 'applications/:id/edit',
                        element: <NewApplicationPage />,
                    },
                    {
                        path: 'assets',
                        element: <AssetsPage />,
                    },
                    {
                        path: 'fees',
                        element: <FeesPage />,
                    },
                    {
                        path: 'messages',
                        element: <MessagesPage />,
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
