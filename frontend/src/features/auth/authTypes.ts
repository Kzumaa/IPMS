export interface User {
    id: number;
    name: string;
    email: string;
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
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}
