import axiosClient from '../../../api/axiosClient';
import type {
    Application,
    ApplicationParty,
    ApplicationAttachment,
    ProtectionTitle,
    FeeQuote,
    CreateApplicationDTO,
    CreatePartyDTO,
    CreateProtectionTitleDTO,
    UploadAttachmentDTO,
    ApplicationFilters,
    PaginatedResponse,
    ApiResponse,
} from '../types/applicationTypes';

const BASE_URL = '/applications';

export const applicationService = {
    // Application CRUD
    async getApplications(filters?: ApplicationFilters): Promise<PaginatedResponse<Application>> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.app_type) params.append('app_type', filters.app_type);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.per_page) params.append('per_page', filters.per_page.toString());

        const response = await axiosClient.get(`${BASE_URL}?${params.toString()}`);
        return response.data;
    },

    async getApplication(id: number): Promise<ApiResponse<Application>> {
        const response = await axiosClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    async createApplication(data: CreateApplicationDTO): Promise<ApiResponse<Application>> {
        const response = await axiosClient.post(BASE_URL, data);
        return response.data;
    },

    async updateApplication(id: number, data: Partial<CreateApplicationDTO>): Promise<ApiResponse<Application>> {
        const response = await axiosClient.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    async deleteApplication(id: number): Promise<void> {
        await axiosClient.delete(`${BASE_URL}/${id}`);
    },

    async submitApplication(id: number): Promise<ApiResponse<Application>> {
        const response = await axiosClient.post(`${BASE_URL}/${id}/submit`);
        return response.data;
    },

    // Parties
    async getParties(applicationId: number): Promise<ApiResponse<ApplicationParty[]>> {
        const response = await axiosClient.get(`${BASE_URL}/${applicationId}/parties`);
        return response.data;
    },

    async addParty(applicationId: number, data: CreatePartyDTO): Promise<ApiResponse<ApplicationParty>> {
        const response = await axiosClient.post(`${BASE_URL}/${applicationId}/parties`, data);
        return response.data;
    },

    async updateParty(applicationId: number, partyId: number, data: Partial<CreatePartyDTO>): Promise<ApiResponse<ApplicationParty>> {
        const response = await axiosClient.put(`${BASE_URL}/${applicationId}/parties/${partyId}`, data);
        return response.data;
    },

    async deleteParty(applicationId: number, partyId: number): Promise<void> {
        await axiosClient.delete(`${BASE_URL}/${applicationId}/parties/${partyId}`);
    },

    // Attachments
    async getAttachments(applicationId: number): Promise<ApiResponse<ApplicationAttachment[]>> {
        const response = await axiosClient.get(`${BASE_URL}/${applicationId}/attachments`);
        return response.data;
    },

    async uploadAttachment(applicationId: number, data: UploadAttachmentDTO): Promise<ApiResponse<ApplicationAttachment>> {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('attachment_type', data.attachment_type);
        if (data.description) {
            formData.append('description', data.description);
        }

        const response = await axiosClient.post(`${BASE_URL}/${applicationId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async deleteAttachment(applicationId: number, attachmentId: number): Promise<void> {
        await axiosClient.delete(`${BASE_URL}/${applicationId}/attachments/${attachmentId}`);
    },

    async downloadAttachment(applicationId: number, attachmentId: number): Promise<Blob> {
        const response = await axiosClient.get(`${BASE_URL}/${applicationId}/attachments/${attachmentId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // Protection Titles
    async getProtectionTitles(applicationId: number): Promise<ApiResponse<ProtectionTitle[]>> {
        const response = await axiosClient.get(`${BASE_URL}/${applicationId}/protection-titles`);
        return response.data;
    },

    async addProtectionTitle(applicationId: number, data: CreateProtectionTitleDTO): Promise<ApiResponse<ProtectionTitle>> {
        const response = await axiosClient.post(`${BASE_URL}/${applicationId}/protection-titles`, data);
        return response.data;
    },

    async deleteProtectionTitle(applicationId: number, titleId: number): Promise<void> {
        await axiosClient.delete(`${BASE_URL}/${applicationId}/protection-titles/${titleId}`);
    },

    // Fee Quotes
    async getFeeQuotes(applicationId: number): Promise<ApiResponse<FeeQuote[]>> {
        const response = await axiosClient.get(`${BASE_URL}/${applicationId}/fee-quotes`);
        return response.data;
    },

    async calculateFees(applicationId: number): Promise<ApiResponse<FeeQuote[]>> {
        const response = await axiosClient.post(`${BASE_URL}/${applicationId}/calculate-fees`);
        return response.data;
    },
};

export default applicationService;
