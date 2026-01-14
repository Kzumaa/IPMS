import axiosClient from '@/api/axiosClient';
import type { ApiResponse, PaginatedResponse, Application } from '@/features/application/types/applicationTypes';

const BASE_URL = '/staff';

export interface DashboardStats {
    total_applications: number;
    assigned_to_me: number;
    pending_formality_exam: number;
    pending_substantive_exam: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
}

export interface ExaminationResult {
    result: 'PASS' | 'FAIL';
    notes?: string;
}

export interface SubstantiveExaminationResult {
    result: 'ACCEPTABLE' | 'REJECTED' | 'OBJECTION';
    notes?: string;
}

export interface DecisionRequest {
    type: 'GRANT' | 'REFUSE';
    notes?: string;
}

export interface StaffRequest {
    id: number;
    application_id: number;
    type: string;
    status: string;
    request_date: string;
    processed_at: string | null;
    processed_by: number | null;
    notes: string | null;
    application?: {
        id: number;
        filing_number: string | null;
        title: string;
        app_type: string;
        status: string;
    };
    creator?: {
        id: number;
        name: string;
        email: string;
    };
    amendment?: {
        section: string;
        change_summary: string;
        field_name?: string;
        old_value?: string;
        new_value?: string;
        pending_version_id?: number;
    };
    assignment?: {
        transfer_type: string;
        contract_number?: string;
        contract_date?: string;
        assignor?: { id: number; name: string };
        assignee?: { id: number; name: string };
    };
    license?: {
        license_type: string;
        valid_from: string;
        valid_to: string;
        scope_territory?: string;
        scope_products?: string;
        contract_number?: string;
        licensor?: { id: number; name: string };
        licensee?: { id: number; name: string };
    };
    appeal?: {
        notice_date?: string;
        grounds: string;
        deadline?: string;
        resolution?: string;
        resolved_at?: string;
    };
    complaint?: {
        grounds: string;
        deadline: string;
        complaint_number: number;
        is_resolved: boolean;
        is_deadline_passed: boolean;
        resolution?: string;
        resolved_at?: string;
    };
    fee_quote?: {
        id: number;
        total_amount: number;
        status: string;
    };
}

export interface AppealResolutionRequest {
    resolution: 'UPHELD' | 'OVERTURNED' | 'PARTIAL' | 'WITHDRAWN';
    notes?: string;
}

export interface ComplaintResolutionRequest {
    resolution: 'ACCEPTED' | 'REJECTED';
    notes?: string;
}

export interface ClassificationSummary {
    application_id: number;
    ipc_classes: IpcClassInfo[];
    locarno_classes: LocarnoClassInfo[];
    can_assign: boolean;
    status: string;
}

export interface IpcClassInfo {
    id?: number;
    section: string;
    class_code: string;
    subclass?: string | null;
    group?: string | null;
    subgroup?: string | null;
    label?: string | null;
    assigned_by_type?: 'USER' | 'STAFF' | null;
    assigned_by_id?: number | null;
    assigned_at?: string | null;
}

export interface LocarnoClassInfo {
    id?: number;
    class_code: string;
    subclass?: string | null;
    label?: string | null;
    assigned_by_type?: 'USER' | 'STAFF' | null;
    assigned_by_id?: number | null;
    assigned_at?: string | null;
}

export interface ClassificationAssignRequest {
    ipc_classes?: Array<{
        section: string;
        class_code: string;
        subclass?: string;
        group?: string;
        subgroup?: string;
        label?: string;
    }>;
    locarno_classes?: Array<{
        class_code: string;
        subclass?: string;
        label?: string;
    }>;
}

const staffService = {
    // Staff Dashboard
    async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
        const response = await axiosClient.get(`${BASE_URL}/dashboard/stats`);
        return response.data;
    },

    // Application Lists
    async listAllApplications(params?: {
        status?: string;
        app_type?: string;
        search?: string;
        page?: number;
        per_page?: number;
    }): Promise<PaginatedResponse<Application>> {
        const response = await axiosClient.get(`${BASE_URL}/applications`, { params });
        return response.data;
    },

    async getMyApplications(params?: {
        status?: string;
        page?: number;
        per_page?: number;
    }): Promise<PaginatedResponse<Application>> {
        const response = await axiosClient.get(`${BASE_URL}/applications/assigned`, { params });
        return response.data;
    },

    // Examination Workflows
    async completeFormalityExamination(applicationId: number, data: ExaminationResult): Promise<ApiResponse<any>> {
        const response = await axiosClient.post(`/applications/${applicationId}/examination/complete`, data);
        return response.data;
    },

    async completeSubstantiveExamination(applicationId: number, data: SubstantiveExaminationResult): Promise<ApiResponse<any>> {
        const response = await axiosClient.post(`/applications/${applicationId}/substantive-examination/complete`, data);
        return response.data;
    },

    async issueDecision(applicationId: number, data: DecisionRequest): Promise<ApiResponse<any>> {
        const response = await axiosClient.post(`/applications/${applicationId}/decision`, data);
        return response.data;
    },

    // Request Examination
    async listRequests(params?: {
        type?: string;
        status?: string;
        page?: number;
        per_page?: number;
    }): Promise<PaginatedResponse<StaffRequest>> {
        const response = await axiosClient.get(`${BASE_URL}/requests`, { params });
        return response.data;
    },

    async getRequest(requestId: number): Promise<ApiResponse<StaffRequest>> {
        const response = await axiosClient.get(`${BASE_URL}/requests/${requestId}`);
        return response.data;
    },

    async startRequestExamination(requestId: number): Promise<ApiResponse<StaffRequest>> {
        const response = await axiosClient.post(`${BASE_URL}/requests/${requestId}/start-examination`);
        return response.data;
    },

    async approveRequest(requestId: number, notes?: string): Promise<ApiResponse<StaffRequest>> {
        const response = await axiosClient.post(`${BASE_URL}/requests/${requestId}/approve`, { notes });
        return response.data;
    },

    async refuseRequest(requestId: number, notes: string): Promise<ApiResponse<StaffRequest>> {
        const response = await axiosClient.post(`${BASE_URL}/requests/${requestId}/refuse`, { notes });
        return response.data;
    },

    async resolveAppeal(requestId: number, data: AppealResolutionRequest): Promise<ApiResponse<StaffRequest>> {
        const response = await axiosClient.post(`${BASE_URL}/requests/${requestId}/resolve-appeal`, data);
        return response.data;
    },

    async resolveComplaint(requestId: number, data: ComplaintResolutionRequest): Promise<ApiResponse<StaffRequest>> {
        const response = await axiosClient.post(`${BASE_URL}/requests/${requestId}/resolve-complaint`, data);
        return response.data;
    },

    // Classification Assignment
    async getClassificationSummary(applicationId: number): Promise<ApiResponse<ClassificationSummary>> {
        const response = await axiosClient.get(`${BASE_URL}/applications/${applicationId}/classification`);
        return response.data;
    },

    async assignClassification(applicationId: number, data: ClassificationAssignRequest): Promise<ApiResponse<any>> {
        const response = await axiosClient.post(`${BASE_URL}/applications/${applicationId}/assign-classification`, data);
        return response.data;
    },

    // Publication
    async publishApplication(applicationId: number): Promise<ApiResponse<Application>> {
        const response = await axiosClient.post(`/applications/${applicationId}/publish`);
        return response.data;
    },
};

export default staffService;
