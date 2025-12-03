import React from 'react';

const mockFees = [
    { invoiceNo: 'INV-2024-001', description: 'Filing Fee for PAT-00234', amount: '$150.00', dueDate: '2024-08-15', status: 'Paid' },
    { invoiceNo: 'INV-2024-002', description: 'Substantive Exam Fee for PAT-00199', amount: '$450.00', dueDate: '2024-09-22', status: 'Unpaid' },
    { invoiceNo: 'INV-2024-003', description: 'Annual Maintenance Fee (Year 3) for PAT-US-123456', amount: '$200.00', dueDate: '2025-01-15', status: 'Unpaid' },
];

const FeesPage: React.FC = () => {
    return (
        <div className="flex flex-1 flex-col p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-col">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">Fee Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-1">Track and pay your IP application and maintenance fees.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3">Invoice No.</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockFees.map((fee, index) => (
                                <tr key={index} className="bg-white dark:bg-[#111521] border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{fee.invoiceNo}</td>
                                    <td className="px-6 py-4">{fee.description}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{fee.amount}</td>
                                    <td className="px-6 py-4">{fee.dueDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fee.status === 'Paid'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                            }`}>
                                            {fee.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {fee.status === 'Unpaid' && (
                                            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs uppercase tracking-wide">
                                                Pay Now
                                            </button>
                                        )}
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

export default FeesPage;
