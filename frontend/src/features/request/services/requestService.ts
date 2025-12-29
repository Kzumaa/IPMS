import axiosClient from '../../../api/axiosClient';
import type {
  ApplicationRequest,
  ApiResponse,
  CreateAmendmentDTO,
  UpdateAmendmentDTO,
  CreateAssignmentDTO,
  CreateLicenseDTO,
  CreateSplitDTO,
  CreateAppealDTO,
} from '../types/requestTypes';

const BASE_URL = '/applications';

export const requestService = {
  // ==================== AMENDMENT ====================
  async getAmendments(applicationId: number): Promise<ApiResponse<ApplicationRequest[]>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/amendments`);
    return response.data;
  },

  async getAmendment(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/amendments/${requestId}`);
    return response.data;
  },

  async createAmendment(applicationId: number, data: CreateAmendmentDTO): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/amendments`, data);
    return response.data;
  },

  async updateAmendment(applicationId: number, requestId: number, data: UpdateAmendmentDTO): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.put(`${BASE_URL}/${applicationId}/requests/amendments/${requestId}`, data);
    return response.data;
  },

  async deleteAmendment(applicationId: number, requestId: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${applicationId}/requests/amendments/${requestId}`);
  },

  async submitAmendment(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/amendments/${requestId}/submit`);
    return response.data;
  },

  // ==================== ASSIGNMENT ====================
  async getAssignments(applicationId: number): Promise<ApiResponse<ApplicationRequest[]>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/assignments`);
    return response.data;
  },

  async getAssignment(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/assignments/${requestId}`);
    return response.data;
  },

  async createAssignment(applicationId: number, data: CreateAssignmentDTO): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/assignments`, data);
    return response.data;
  },

  async deleteAssignment(applicationId: number, requestId: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${applicationId}/requests/assignments/${requestId}`);
  },

  async submitAssignment(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/assignments/${requestId}/submit`);
    return response.data;
  },

  // ==================== LICENSE ====================
  async getLicenses(applicationId: number): Promise<ApiResponse<ApplicationRequest[]>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/licenses`);
    return response.data;
  },

  async getLicense(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/licenses/${requestId}`);
    return response.data;
  },

  async createLicense(applicationId: number, data: CreateLicenseDTO): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/licenses`, data);
    return response.data;
  },

  async deleteLicense(applicationId: number, requestId: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${applicationId}/requests/licenses/${requestId}`);
  },

  async submitLicense(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/licenses/${requestId}/submit`);
    return response.data;
  },

  // ==================== SPLIT ====================
  async getSplits(applicationId: number): Promise<ApiResponse<ApplicationRequest[]>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/splits`);
    return response.data;
  },

  async getSplit(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/splits/${requestId}`);
    return response.data;
  },

  async createSplit(applicationId: number, data: CreateSplitDTO): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/splits`, data);
    return response.data;
  },

  async deleteSplit(applicationId: number, requestId: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${applicationId}/requests/splits/${requestId}`);
  },

  async submitSplit(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/splits/${requestId}/submit`);
    return response.data;
  },

  // ==================== APPEAL ====================
  async getAppeals(applicationId: number): Promise<ApiResponse<ApplicationRequest[]>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/appeals`);
    return response.data;
  },

  async getAppeal(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/appeals/${requestId}`);
    return response.data;
  },

  async createAppeal(applicationId: number, data: CreateAppealDTO): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/appeals`, data);
    return response.data;
  },

  async deleteAppeal(applicationId: number, requestId: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${applicationId}/requests/appeals/${requestId}`);
  },

  async submitAppeal(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/appeals/${requestId}/submit`);
    return response.data;
  },

  // ==================== GENERIC HELPERS ====================
  async getAllRequests(applicationId: number): Promise<ApplicationRequest[]> {
    const [amendments, assignments, licenses, splits, appeals] = await Promise.all([
      this.getAmendments(applicationId).catch(() => ({ data: [] })),
      this.getAssignments(applicationId).catch(() => ({ data: [] })),
      this.getLicenses(applicationId).catch(() => ({ data: [] })),
      this.getSplits(applicationId).catch(() => ({ data: [] })),
      this.getAppeals(applicationId).catch(() => ({ data: [] })),
    ]);

    return [
      ...amendments.data,
      ...assignments.data,
      ...licenses.data,
      ...splits.data,
      ...appeals.data,
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
};

export default requestService;
