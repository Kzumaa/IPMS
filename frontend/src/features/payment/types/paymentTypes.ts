export type PaymentStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED'
    | 'EXPIRED';

export type PaymentMethod = 'STRIPE' | 'BANK_TRANSFER' | 'CASH' | 'OTHER';

export interface Payment {
    id: number;
    application_id: number;
    fee_quote_id: number | null;
    amount: number;
    currency: string;
    method: PaymentMethod | null;
    status: PaymentStatus | null;
    description: string | null;
    paid_at: string | null;
    receipt_no: string | null;
    payer_name: string | null;
    stripe_session_id: string | null;
    created_at: string;
    updated_at: string;
    fee_quote?: {
        id: number;
        version: number;
        total_amount: number;
        status: string;
    };
}

export interface CheckoutResponse {
    session_id: string;
    session_url: string;
    payment_id: number;
}

export interface CreateCheckoutDTO {
    fee_quote_id: number;
    success_url: string;
    cancel_url: string;
}

export interface CreateMaintenanceCheckoutDTO {
    success_url: string;
    cancel_url: string;
}

export interface RefundDTO {
    amount?: number;
    reason?: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}
