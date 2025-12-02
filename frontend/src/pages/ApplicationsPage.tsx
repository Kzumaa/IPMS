import React from 'react';
import type { Application } from '../types';

const mockApplications: Application[] = [
    { refNo: 'PAT-00234', title: 'Quantum Encryption Algorithm', nextDeadline: '2024-08-15', status: 'Granted' },
    { refNo: 'TM-00567', title: 'Project Phoenix Logo', nextDeadline: '2024-09-01', status: 'Pending' },
    { refNo: 'PAT-00199', title: 'AI-Powered Diagnostic Tool', nextDeadline: '2024-09-22', status: 'Rejected' },
    { refNo: 'CR-00812', title: 'User Interface Design System', nextDeadline: '2024-10-05', status: 'Pending' },
    { refNo: 'PAT-00241', title: 'Sustainable Polymer Compound', nextDeadline: '2024-11-19', status: 'Granted' },
];

const statusStyles = {
    Granted: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    Pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

const ApplicationsPage: React.FC = () => {
    return (
        <div className="flex flex-1 flex-col">
            {/* TopNavBar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white dark:bg-[#111521] dark:border-slate-800 px-6 py-3 sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm">
                    <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white">Applications</a>
                    <span className="text-slate-400 dark:text-slate-500">/</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">Submitted</span>
                </div>
                <div className="flex flex-1 items-center justify-end gap-4">
                    <div className="w-full max-w-lg hidden md:block">
                        <label className="relative text-slate-500">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input className="form-input w-full rounded-lg border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:border-[#4338ca] focus:ring-[#4338ca] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-opacity-50" placeholder="Search by App ID or Title..." type="search" />
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500"></span>
                        </button>
                        <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined">help_outline</span>
                        </button>
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDKLGYfCwr8pQfpga0hLe_uDmjLbQJB31r-Qv0RLgqW_B9S066hrsx0UcfUzyGtVQy8pmTcDfp7XMUKjO1an_rG9RWkjttcbcngrXacLhpPv6icr6oqqe5bc7FX6iVJIAGWaH5Y4c9Mwc9uMqWEpZwjI8x1H3NpLdtz70CMU_lGGL5q3H41jvN5d5w5QfDxYBGYYO-w85g_vQuH7pt2ad7k2JTo21gfAwk7gJmar3Ol0ZnM5ghUsSie8ANQRiH63xWLWhFsdTK-uw")' }}></div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">
                {/* PageHeading */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">Active Applications</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-1">Manage and track all submitted intellectual property filings.</p>
                    </div>
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-[#4338ca] text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:bg-[#4338ca]/90 focus:outline-none focus:ring-2 focus:ring-[#4338ca]/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark transition-colors">
                        <span className="material-symbols-outlined mr-2 !text-lg">add_circle</span>
                        New Filing
                    </button>
                </div>

                {/* Data Table Section */}
                <div className="bg-white dark:bg-[#111521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3" scope="col">Ref No.</th>
                                    <th className="px-6 py-3" scope="col">Title</th>
                                    <th className="px-6 py-3" scope="col">Next Deadline</th>
                                    <th className="px-6 py-3" scope="col">Status</th>
                                    <th className="px-6 py-3" scope="col">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockApplications.map((app, index) => (
                                    <tr key={index} className="bg-white dark:bg-[#111521] border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{app.refNo}</td>
                                        <td className="px-6 py-4">{app.title}</td>
                                        <td className="px-6 py-4">{app.nextDeadline}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[app.status]}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                                                <span className="material-symbols-outlined">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <nav aria-label="Table navigation" className="flex items-center justify-between p-4">
                        <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Showing <span className="font-semibold text-slate-900 dark:text-white">1-5</span> of <span className="font-semibold text-slate-900 dark:text-white">100</span></span>
                        <ul className="inline-flex items-center -space-x-px">
                            <li>
                                <a href="#" className="px-3 py-2 ml-0 leading-tight text-slate-500 bg-white border border-slate-300 rounded-l-lg hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white">Previous</a>
                            </li>
                            <li>
                                <a href="#" className="px-3 py-2 leading-tight text-slate-500 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white">1</a>
                            </li>
                            <li>
                                <a href="#" className="px-3 py-2 leading-tight text-slate-500 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white">2</a>
                            </li>
                            <li>
                                <a href="#" className="px-3 py-2 leading-tight text-slate-500 bg-white border border-slate-300 rounded-r-lg hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white">Next</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </main>
        </div>
    );
};

export default ApplicationsPage;
