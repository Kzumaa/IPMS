import React from 'react';

const mockAssets = [
    { id: 'PAT-US-123456', title: 'Method for Quantum Key Distribution', type: 'Patent', grantDate: '2023-01-15', renewalDate: '2025-01-15', status: 'Active' },
    { id: 'TM-US-987654', title: 'APEX LOGO', type: 'Trademark', grantDate: '2022-06-10', renewalDate: '2032-06-10', status: 'Active' },
    { id: 'DES-VN-112233', title: 'Ergonomic Chair Design', type: 'Industrial Design', grantDate: '2023-11-20', renewalDate: '2028-11-20', status: 'Active' },
];

const AssetsPage: React.FC = () => {
    return (
        <div className="flex flex-1 flex-col p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-col">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">My IP Assets</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-1">View and manage your granted intellectual property rights.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3">Asset ID</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Grant Date</th>
                                <th className="px-6 py-3">Next Renewal</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockAssets.map((asset, index) => (
                                <tr key={index} className="bg-white dark:bg-[#111521] border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{asset.id}</td>
                                    <td className="px-6 py-4">{asset.title}</td>
                                    <td className="px-6 py-4">{asset.type}</td>
                                    <td className="px-6 py-4">{asset.grantDate}</td>
                                    <td className="px-6 py-4 text-amber-600 font-medium">{asset.renewalDate}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                            {asset.status}
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
            </div>
        </div>
    );
};

export default AssetsPage;
