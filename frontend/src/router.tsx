import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ClientLoginPage from './pages/ClientLoginPage';
import RegisterPage from './pages/RegisterPage';
import StaffLoginPage from './pages/StaffLoginPage';
import DashboardLayout from './components/DashboardLayout';
import StaffLayout from './components/StaffLayout';
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import NewApplicationPage from './pages/NewApplicationPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import AmendApplicationPage from './pages/AmendApplicationPage';
import AssetsPage from './pages/AssetsPage';
import FeesPage from './pages/FeesPage';
import MessagesPage from './pages/MessagesPage';
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import StaffApplicationsPage from './pages/staff/StaffApplicationsPage';
import StaffApplicationDetailPage from './pages/staff/StaffApplicationDetailPage';
import StaffReportsPage from './pages/staff/StaffReportsPage';
import StaffRequestsPage from './pages/staff/StaffRequestsPage';
import StaffRequestDetailPage from './pages/staff/StaffRequestDetailPage';
import { ProtectedRoute, PublicRoute } from './components/AuthRoutes';
import {
    CreateAssignmentPage,
    CreateLicensePage,
    CreateSplitPage,
    CreateComplaintPage,
    CreateRenewalPage,
    CreateTerminationPage,
    CreateWithdrawalPage,
    RequestDetailPage,
} from './pages/request';
import { PaymentSuccessPage, PaymentCancelPage } from './pages/payment';

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
                path: '/register',
                element: <RegisterPage />,
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
                path: '/staff',
                element: <StaffLayout />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="/staff/dashboard" replace />,
                    },
                    {
                        path: 'dashboard',
                        element: <StaffDashboardPage />,
                    },
                    {
                        path: 'applications',
                        element: <StaffApplicationsPage />,
                    },
                    {
                        path: 'applications/assigned',
                        element: <StaffApplicationsPage assignedOnly={true} />,
                    },
                    {
                        path: 'applications/:id',
                        element: <StaffApplicationDetailPage />,
                    },
                    {
                        path: 'requests',
                        element: <StaffRequestsPage />,
                    },
                    {
                        path: 'requests/:requestId',
                        element: <StaffRequestDetailPage />,
                    },
                    {
                        path: 'reports',
                        element: <StaffReportsPage />,
                    },
                ],
            },
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
                        path: 'applications/:id/amend',
                        element: <AmendApplicationPage />,
                    },
                    // Request routes
                    {
                        path: 'applications/:id/requests/assignments/new',
                        element: <CreateAssignmentPage />,
                    },
                    {
                        path: 'applications/:id/requests/licenses/new',
                        element: <CreateLicensePage />,
                    },
                    {
                        path: 'applications/:id/requests/splits/new',
                        element: <CreateSplitPage />,
                    },
                    {
                        path: 'applications/:id/requests/complaints/new',
                        element: <CreateComplaintPage />,
                    },
                    {
                        path: 'applications/:id/requests/renewals/new',
                        element: <CreateRenewalPage />,
                    },
                    {
                        path: 'applications/:id/requests/terminations/new',
                        element: <CreateTerminationPage />,
                    },
                    {
                        path: 'applications/:id/requests/withdrawals/new',
                        element: <CreateWithdrawalPage />,
                    },
                    {
                        path: 'applications/:id/requests/:type/:requestId',
                        element: <RequestDetailPage />,
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
                    // Payment routes
                    {
                        path: 'payments/success',
                        element: <PaymentSuccessPage />,
                    },
                    {
                        path: 'payments/cancel',
                        element: <PaymentCancelPage />,
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
