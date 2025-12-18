export interface User {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    citizen_id?: string;
    org_name?: string;
    address?: string;
    country?: string;
    is_org?: boolean;
    role?: 'applicant' | 'staff'; // Optional, depending on backend response
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    full_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    citizen_id?: string;
    org_name?: string;
    address?: string;
    country?: string;
    is_org?: boolean;
}
