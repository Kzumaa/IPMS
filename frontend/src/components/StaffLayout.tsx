import { useTranslation } from 'react-i18next';
import TopNavBar from './TopNavBar';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../features/auth/authSlice';

const StaffLayout: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const location = useLocation();

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/staff-login');
    };

    // Helper to determine active class
    const getNavLinkClass = (isActive: boolean) => {
        if (isActive) {
            return "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/30 text-white";
        }
        return "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors";
    };

    // Generate breadcrumbs based on path
    const getBreadcrumbs = () => {
        const path = location.pathname.split('/').filter(Boolean);
        const breadcrumbs: { label: string; href?: string; active?: boolean }[] = [{ label: t('staff.nav.staff'), href: '/staff' }];

        if (path.includes('dashboard')) {
            breadcrumbs.push({ label: t('staff.nav.reports'), active: true });
        } else if (path.includes('published')) {
            breadcrumbs.push({ label: t('staff.nav.publishedApplications'), active: true });
        } else if (path.includes('applications')) {
            if (path.includes('assigned')) {
                breadcrumbs.push({ label: t('staff.applications.assigned'), active: true });
            } else if (path.length > 2) {
                // Specific application detail
                breadcrumbs.push({ label: t('staff.nav.publishedApplications'), href: '/staff/published' });
                breadcrumbs.push({ label: `#${path[2]}`, active: true });
            } else {
                breadcrumbs.push({ label: t('staff.applications.title'), active: true });
            }
        } else if (path.includes('requests')) {
            if (path.length > 2) {
                // Specific request detail
                breadcrumbs.push({ label: t('staff.nav.requests'), href: '/staff/requests' });
                breadcrumbs.push({ label: `#${path[2]}`, active: true });
            } else {
                breadcrumbs.push({ label: t('staff.nav.requests'), active: true });
            }
        }

        return breadcrumbs;
    };

    return (
        <div className="relative flex min-h-screen w-full bg-[#f6f6f8] dark:bg-[#111521] font-display">
            {/* SideNavBar */}
            <aside className="flex h-screen flex-col justify-between bg-[#0f172a] p-4 text-white sticky top-0 w-64 shrink-0">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3 items-center cursor-pointer" onClick={() => navigate('/staff/dashboard')}>
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB6EntSZzkJn62SjgPIhr1Z8FS_jFuTSd0zpFNUrC-GiWDPBFWivdPyXk7Ar9di1mWY1HX5BDeXbdV_9ynwlOWvEhqIkFPo6shmLniEcX5VXrSFspVRrrGB0SidJOc1AUNAm2xjWCB_V1Wt852TXoyyA9sLFg10sPwONwbx0zMXP1iLmC9k2OGvDCd5OwysJoDgGqRSaBeXqAVCKnSEf6nJowD3yTRfdMK7h6xUUVxceb6RSIWqBNpuM0NQDefaddYctXbrln0t2A")' }}></div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-base font-medium leading-normal">{t('staff.dashboard.title')}</h1>
                            <p className="text-slate-400 text-sm font-normal leading-normal">{t('staff.dashboard.subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-4">
                        <NavLink to="/staff/dashboard" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">bar_chart</span>
                            <p className="text-sm font-medium leading-normal">{t('staff.nav.reports')}</p>
                        </NavLink>

                        <NavLink to="/staff/published" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">public</span>
                            <p className="text-sm font-medium leading-normal">{t('staff.nav.publishedApplications')}</p>
                        </NavLink>

                        <NavLink to="/staff/applications/assigned" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">assignment_ind</span>
                            <p className="text-sm font-medium leading-normal">{t('staff.nav.myApplications')}</p>
                        </NavLink>

                        <NavLink to="/staff/requests" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">pending_actions</span>
                            <p className="text-sm font-medium leading-normal">{t('staff.nav.requests')}</p>
                        </NavLink>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1 border-t border-slate-700 pt-4">
                        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50">
                            <span className="material-symbols-outlined">settings</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.settings')}</p>
                        </a>
                        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50 w-full text-left">
                            <span className="material-symbols-outlined">logout</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.logout')}</p>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 min-w-0 overflow-auto flex flex-col">
                <TopNavBar breadcrumb={getBreadcrumbs()} />
                <Outlet />
            </main>
        </div>
    );
};

export default StaffLayout;
