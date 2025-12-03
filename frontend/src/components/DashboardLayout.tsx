import { useTranslation } from 'react-i18next';
import TopNavBar from './TopNavBar';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../features/auth/authSlice';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const location = useLocation();

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    // Helper to determine active class
    const getNavLinkClass = (isActive: boolean, isPrimary: boolean = false) => {
        if (isPrimary && isActive) {
            return "flex items-center gap-3 px-3 py-2 rounded bg-primary text-white transition-colors";
        }
        if (isActive) {
            return "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/30 text-white";
        }
        return "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors";
    };

    // Generate breadcrumbs based on path
    const getBreadcrumbs = () => {
        const path = location.pathname.split('/').filter(Boolean);
        // Default breadcrumb
        const breadcrumbs: { label: string; href?: string; active?: boolean }[] = [{ label: 'App', href: '/app' }];

        if (path.includes('dashboard')) {
            breadcrumbs.push({ label: 'Dashboard', active: true });
        } else if (path.includes('applications')) {
            breadcrumbs.push({ label: 'Applications', active: true });
        } else if (path.includes('assets')) {
            breadcrumbs.push({ label: 'IP Assets', active: true });
        } else if (path.includes('fees')) {
            breadcrumbs.push({ label: 'Fees', active: true });
        } else if (path.includes('messages')) {
            breadcrumbs.push({ label: 'Messages', active: true });
        }

        return breadcrumbs;
    };

    return (
        <div className="relative flex min-h-screen w-full bg-[#f6f6f8] dark:bg-[#111521] font-display">
            {/* SideNavBar */}
            <aside className="flex h-screen flex-col justify-between bg-[#0f172a] p-4 text-white sticky top-0 w-64 shrink-0">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3 items-center cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB6EntSZzkJn62SjgPIhr1Z8FS_jFuTSd0zpFNUrC-GiWDPBFWivdPyXk7Ar9di1mWY1HX5BDeXbdV_9ynwlOWvEhqIkFPo6shmLniEcX5VXrSFspVRrrGB0SidJOc1AUNAm2xjWCB_V1Wt852TXoyyA9sLFg10sPwONwbx0zMXP1iLmC9k2OGvDCd5OwysJoDgGqRSaBeXqAVCKnSEf6nJowD3yTRfdMK7h6xUUVxceb6RSIWqBNpuM0NQDefaddYctXbrln0t2A")' }}></div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-base font-medium leading-normal">{t('dashboard.title')}</h1>
                            <p className="text-slate-400 text-sm font-normal leading-normal">{t('dashboard.subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-4">
                        <NavLink to="/app/dashboard" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">dashboard</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.dashboard')}</p>
                        </NavLink>

                        <NavLink to="/app/applications" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">description</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.myApplications')}</p>
                        </NavLink>

                        <NavLink to="/app/assets" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">verified</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.myIpAssets')}</p>
                        </NavLink>

                        <NavLink to="/app/fees" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">payments</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.feeManagement')}</p>
                        </NavLink>

                        <NavLink to="/app/messages" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">mail</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.messages')}</p>
                        </NavLink>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#3a65e9] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors">
                        <span className="truncate">{t('dashboard.nav.newFiling')}</span>
                    </button>
                    <div className="flex flex-col gap-1 border-t border-slate-700 pt-4">
                        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50">
                            <span className="material-symbols-outlined">settings</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.settings')}</p>
                        </a>
                        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50 w-full text-left">
                            <span className="material-symbols-outlined">logout</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.logout') || 'Logout'}</p>
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

export default DashboardLayout;
