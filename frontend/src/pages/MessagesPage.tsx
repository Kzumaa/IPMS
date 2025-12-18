import React from 'react';
import { useTranslation } from 'react-i18next';

const mockMessages = [
    { id: 1, subject: 'Filing Receipt for PAT-00234', from: 'IP Office', date: '2024-02-20', status: 'Unread' },
    { id: 2, subject: 'Formality Examination Result: Accepted', from: 'IP Office', date: '2024-02-18', status: 'Read' },
    { id: 3, subject: 'Reminder: Annual Fee Due', from: 'System', date: '2024-02-15', status: 'Read' },
];

const MessagesPage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-1 flex-col p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-col">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">{t('messages.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-1">{t('messages.subtitle')}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {mockMessages.map((msg) => (
                        <div key={msg.id} className={`p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${msg.status === 'Unread' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${msg.status === 'Unread' ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                <div>
                                    <h4 className={`text-sm font-medium ${msg.status === 'Unread' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                        {msg.subject}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('messages.from')}: {msg.from}</p>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400">{msg.date}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
