import axiosClient from '../../../api/axiosClient';
import type {
  ApplicationRequest,
  ApiResponse,
  CreateAmendmentDTO,
  UpdateAmendmentDTO,
  CreateAssignmentDTO,
  CreateLicenseDTO,
  CreateSplitDTO,
  CreateComplaintDTO,
  CreateRenewalDTO,
  CreateTerminationDTO,
  CreateWithdrawalDTO,
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

  // ==================== COMPLAINT ====================
  async getComplaints(applicationId: number): Promise<ApiResponse<ApplicationRequest[]>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/complaints`);
    return response.data;
  },

  async getComplaint(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/complaints/${requestId}`);
    return response.data;
  },

  async createComplaint(applicationId: number, data: CreateComplaintDTO): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/complaints`, data);
    return response.data;
  },

  async deleteComplaint(applicationId: number, requestId: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${applicationId}/requests/complaints/${requestId}`);
  },

  async submitComplaint(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/complaints/${requestId}/submit`);
    return response.data;
  },

  // ==================== RENEWAL ====================
  async getRenewals(applicationId: number): Promise<ApiResponse<ApplicationRequest[]>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/renewals`);
    return response.data;
  },

  async getRenewal(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/renewals/${requestId}`);
    return response.data;
  },

  async createRenewal(applicationId: number, data: CreateRenewalDTO): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/renewals`, data);
    return response.data;
  },

  async deleteRenewal(applicationId: number, requestId: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${applicationId}/requests/renewals/${requestId}`);
  },

  async submitRenewal(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/renewals/${requestId}/submit`);
    return response.data;
  },

  // ==================== TERMINATION ====================
  async getTerminations(applicationId: number): Promise<ApiResponse<ApplicationRequest[]>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/terminations`);
    return response.data;
  },

  async getTermination(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/terminations/${requestId}`);
    return response.data;
  },

  async createTermination(applicationId: number, data: CreateTerminationDTO): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/terminations`, data);
    return response.data;
  },

  async deleteTermination(applicationId: number, requestId: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${applicationId}/requests/terminations/${requestId}`);
  },

  async submitTermination(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/terminations/${requestId}/submit`);
    return response.data;
  },

  // ==================== WITHDRAWAL ====================
  async getWithdrawals(applicationId: number): Promise<ApiResponse<ApplicationRequest[]>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/withdrawals`);
    return response.data;
  },

  async getWithdrawal(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/requests/withdrawals/${requestId}`);
    return response.data;
  },

  async createWithdrawal(applicationId: number, data: CreateWithdrawalDTO): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/withdrawals`, data);
    return response.data;
  },

  async updateWithdrawal(applicationId: number, requestId: number, data: CreateWithdrawalDTO): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.put(`${BASE_URL}/${applicationId}/requests/withdrawals/${requestId}`, data);
    return response.data;
  },

  async deleteWithdrawal(applicationId: number, requestId: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${applicationId}/requests/withdrawals/${requestId}`);
  },

  async submitWithdrawal(applicationId: number, requestId: number): Promise<ApiResponse<ApplicationRequest>> {
    const response = await axiosClient.post(`${BASE_URL}/${applicationId}/requests/withdrawals/${requestId}/submit`);
    return response.data;
  },

  async canWithdraw(applicationId: number): Promise<{ can_withdraw: boolean }> {
    const response = await axiosClient.get(`${BASE_URL}/${applicationId}/can-withdraw`);
    return response.data;
  },

  // ==================== GENERIC HELPERS ====================
  async getAllRequests(applicationId: number): Promise<ApplicationRequest[]> {
    const [amendments, assignments, licenses, splits, complaints, renewals, terminations, withdrawals] = await Promise.all([
      this.getAmendments(applicationId).catch(() => ({ data: [] })),
      this.getAssignments(applicationId).catch(() => ({ data: [] })),
      this.getLicenses(applicationId).catch(() => ({ data: [] })),
      this.getSplits(applicationId).catch(() => ({ data: [] })),
      this.getComplaints(applicationId).catch(() => ({ data: [] })),
      this.getRenewals(applicationId).catch(() => ({ data: [] })),
      this.getTerminations(applicationId).catch(() => ({ data: [] })),
      this.getWithdrawals(applicationId).catch(() => ({ data: [] })),
    ]);

    return [
      ...amendments.data,
      ...assignments.data,
      ...licenses.data,
      ...splits.data,
      ...complaints.data,
      ...renewals.data,
      ...terminations.data,
      ...withdrawals.data,
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
};

export default requestService;
