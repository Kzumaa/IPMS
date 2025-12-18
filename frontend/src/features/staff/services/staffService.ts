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
};

export default staffService;
