import axiosClient from '../../api/axiosClient';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from './authTypes';

const authService = {
    registerApplicant: async (data: RegisterPayload): Promise<AuthResponse> => {
        const response = await axiosClient.post('/auth/register', data);
        return response.data;
    },

    loginApplicant: async (data: LoginPayload): Promise<AuthResponse> => {
        const response = await axiosClient.post('/auth/login', data);
        return response.data;
    },

    loginStaff: async (data: LoginPayload): Promise<AuthResponse> => {
        const response = await axiosClient.post('/auth/staff/login', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await axiosClient.post('/auth/logout');
    },

    getMe: async (): Promise<User> => {
        const response = await axiosClient.get('/auth/me');
        // Backend returns { type: 'STAFF' | 'APPLICANT', data: user }
        const { type, data } = response.data;
        return {
            ...data,
            role: type === 'STAFF' ? 'staff' : 'applicant',
        };
    },
};

export default authService;
