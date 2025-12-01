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
        await axiosClient.post('/applications/auth/logout');
    },

    getMe: async (): Promise<User> => {
        const response = await axiosClient.get('/applications/auth/me');
        return response.data;
    },
};

export default authService;
