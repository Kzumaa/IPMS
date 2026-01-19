import axiosClient from '../../../api/axiosClient';
import type { Application } from '../../application/types/applicationTypes';

interface ApiResponse<T> {
  data: T;
}

const BASE_URL = '/applications';

export const titleService = {
  /**
   * Get granted applications owned by the current user (My Titles).
   */
  async getGrantedTitles(): Promise<ApiResponse<Application[]>> {
    const response = await axiosClient.get(`${BASE_URL}/granted`);
    return response.data;
  },

  /**
   * Get applications where the current user is a licensee (Licensed to Me).
   */
  async getLicensedTitles(): Promise<ApiResponse<Application[]>> {
    const response = await axiosClient.get(`${BASE_URL}/licensed`);
    return response.data;
  },
};

export default titleService;
