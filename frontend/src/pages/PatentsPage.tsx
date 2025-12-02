import React from 'react';
import type { Patent } from '../types';

const mockPatents: Patent[] = [
    { id: '1', patentNo: 'US-113289-B1', title: 'Quantum Entanglement Communicator', filingDate: 'Mar 15, 2023', status: 'Granted', inventor: 'Dr. Evelyn Reed' },
    { id: '2', patentNo: 'WO-202401-A2', title: 'Neural Interface for AR Systems', filingDate: 'Jan 02, 2024', status: 'Pending', inventor: 'Jian Li, Sam Carter' },
    { id: '3', patentNo: 'EP-345678-B2', title: 'Self-Healing Polymer Composite', filingDate: 'Oct 20, 2022', status: 'Granted', inventor: 'Dr. Anya Sharma' },
    { id: '4', patentNo: 'JP-202154-A', title: 'Automated Vertical Farming System', filingDate: 'Jun 05, 2021', status: 'Abandoned', inventor: 'Kenji Tanaka' },
    { id: '5', patentNo: 'US-115892-B1', title: 'Method for Cryogenic Data Storage', filingDate: 'Feb 11, 2023', status: 'Pending', inventor: 'Dr. Ben Carter, Maria Rodriguez' },
];

const statusStyles = {
    Granted: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    Pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    Abandoned: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

const PatentsPage: React.FC = () => {
    return (
        <div className="flex flex-col w-full">
            {/* Top Header Bar */}
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-[#111521]">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <a href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">Home</a>
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-base">chevron_right</span>
                        <a href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">IP Assets</a>
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-base">chevron_right</span>
                        <span className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal">Patents</span>
                    </div>
                </div>
                {/* Toolbar */}
                <div className="flex items-center gap-4">
                    <div className="relative w-64 hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Global Search..." type="text" />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button className="p-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                        <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <img alt="User avatar" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCu-HVn0WI3Otcu822C8vEDSr-f834quXWtLsyi9CeW0PVgkzOA4Y_ufe5EqKgIgw9yE7TGDCuj2bUnIpoHYQIEE96qM0PtR7QlpoJrm2vQyRFxXlZaTH9WZsuhEgiIIHJ4UZTsNL9EazwR4ZdklLdZjN5B-8xPYPIGbMVKufey6MDj2t2A01lgnytNXM27cv9yqgRsixd0BWyChdpdxNot3do4vGEDmTbuVtmX8zwqjI12E7zm1_v5bdzNMRElywzslgc-xTH49A" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="p-8">
                {/* PageHeading */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">Patents</h1>
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#3a65e9] text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-blue-600 transition-colors">
                        <span className="material-symbols-outlined text-xl">add</span>
                        <span className="truncate">New Patent</span>
                    </button>
                </div>

                {/* Filters/Chips */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <div className="relative w-full max-w-xs">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-500">search</span>
                        <input className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:outline-none" placeholder="Search patents..." type="text" />
                    </div>
                    <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white px-3 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-base text-slate-500">filter_list</span>
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">Status: All</p>
                        <span className="material-symbols-outlined text-base text-slate-500">expand_more</span>
                    </button>
                    <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white px-3 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">Inventor</p>
                        <span className="material-symbols-outlined text-base text-slate-500">expand_more</span>
                    </button>
                    <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white px-3 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">Filing Date</p>
                        <span className="material-symbols-outlined text-base text-slate-500">expand_more</span>
                    </button>
                    <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-dashed border-slate-400 bg-transparent px-3 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal">More Filters</p>
                    </button>
                </div>

                {/* Patents Data Table */}
                <div className="mt-6 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                    <thead className="bg-slate-50 dark:bg-slate-900">
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 sm:pl-6" scope="col">
                                                <div className="flex items-center gap-2 cursor-pointer group">Patent No. <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-slate-600">unfold_more</span></div>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100" scope="col">
                                                <div className="flex items-center gap-2 cursor-pointer group">Title <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-slate-600">unfold_more</span></div>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100" scope="col">
                                                <div className="flex items-center gap-2 cursor-pointer group">Filing Date <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-slate-600">unfold_more</span></div>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100" scope="col">Status</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100" scope="col">Inventor(s)</th>
                                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6" scope="col">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-[#111521]">
                                        {mockPatents.map((patent) => (
                                            <tr key={patent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-slate-100 sm:pl-6">{patent.patentNo}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{patent.title}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{patent.filingDate}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[patent.status]}`}>
                                                        {patent.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{patent.inventor}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md">
                                                        <span className="material-symbols-outlined text-xl">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <nav aria-label="Pagination" className="flex items-center justify-between border-t border-slate-200 px-4 py-4 sm:px-0 dark:border-slate-800 mt-6">
                    <div className="hidden sm:block">
                        <p className="text-sm text-slate-700 dark:text-slate-400">
                            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">20</span> results
                        </p>
                    </div>
                    <div className="flex flex-1 justify-between sm:justify-end gap-3">
                        <button className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">Previous</button>
                        <button className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">Next</button>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default PatentsPage;
