export interface Patent {
    id: string;
    patentNo: string;
    title: string;
    filingDate: string;
    status: 'Granted' | 'Pending' | 'Abandoned' | 'Rejected';
    inventor: string;
}

export interface Application {
    refNo: string;
    title: string;
    nextDeadline: string;
    status: 'Granted' | 'Pending' | 'Rejected';
}
