import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
    phone: z.string().optional(),
    citizen_id: z.string().optional(),
    org_name: z.string().optional(),
    address: z.string().optional(),
    country: z.string().length(2, 'Country code must be 2 characters').optional().or(z.literal('')),
    is_org: z.boolean().optional(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
