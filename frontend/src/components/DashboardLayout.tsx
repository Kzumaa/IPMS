import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

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

                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">{t('dashboard.nav.ipAssets')}</div>

                        <NavLink to="/app/patents" className={({ isActive }) => getNavLinkClass(isActive, true)}>
                            <span className="material-symbols-outlined">topic</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.patents')}</p>
                        </NavLink>
                        <NavLink to="/app/trademarks" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">copyright</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.trademarks')}</p>
                        </NavLink>

                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">{t('dashboard.nav.filings')}</div>

                        <NavLink to="/app/applications" className={({ isActive }) => getNavLinkClass(isActive, true)}>
                            <span className="material-symbols-outlined">file_present</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.applications')}</p>
                        </NavLink>
                        <NavLink to="/app/tasks" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">task_alt</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.tasks')}</p>
                        </NavLink>
                        <NavLink to="/app/reports" className={({ isActive }) => getNavLinkClass(isActive)}>
                            <span className="material-symbols-outlined">assessment</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.reports')}</p>
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
                        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50">
                            <span className="material-symbols-outlined">help</span>
                            <p className="text-sm font-medium leading-normal">{t('dashboard.nav.help')}</p>
                        </a>
                    </div>
                </div>
            </aside>

            <main className="flex-1 min-w-0 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
