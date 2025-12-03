import React from 'react';

const DashboardPage: React.FC = () => {
    return (
        <div className="flex flex-1 flex-col p-6">
            <div className="mb-6">
                <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-1">Overview of your IP portfolio and recent activities.</p>
            </div>

            {/* Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-[#111521] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Applications</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">12</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111521] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                            <span className="material-symbols-outlined">event</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Upcoming Deadlines</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">3</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111521] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Unpaid Fees</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">$1,250</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#111521] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
                </div>
                <div className="p-6">
                    <div className="space-y-6">
                        {[
                            { title: 'Application Submitted', desc: 'Patent application "Quantum Encryption" was submitted.', time: '2 hours ago', icon: 'send', color: 'bg-green-100 text-green-600' },
                            { title: 'Fee Payment Received', desc: 'Maintenance fee for TM-00567 confirmed.', time: '1 day ago', icon: 'check_circle', color: 'bg-blue-100 text-blue-600' },
                            { title: 'Office Action Issued', desc: 'New office action for PAT-00199 requires response.', time: '2 days ago', icon: 'warning', color: 'bg-amber-100 text-amber-600' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                                    <span className="text-xs text-slate-400 mt-1 block">{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
