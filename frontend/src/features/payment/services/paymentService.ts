import axiosClient from '../../../api/axiosClient';
import type {
    Payment,
    CheckoutResponse,
    CreateCheckoutDTO,
    CreateMaintenanceCheckoutDTO,
    RefundDTO,
    ApiResponse,
} from '../types/paymentTypes';

export const paymentService = {
    /**
     * Create a Stripe checkout session for a fee quote.
     */
    async createCheckout(data: CreateCheckoutDTO): Promise<ApiResponse<CheckoutResponse>> {
        const response = await axiosClient.post('/payments/checkout', data);
        return response.data;
    },

    /**
     * Create a Stripe checkout session for a maintenance fee.
     */
    async createMaintenanceCheckout(
        scheduleId: number,
        data: CreateMaintenanceCheckoutDTO
    ): Promise<ApiResponse<CheckoutResponse>> {
        const response = await axiosClient.post(
            `/payments/maintenance/${scheduleId}/checkout`,
            data
        );
        return response.data;
    },

    /**
     * Get payment status by Stripe session ID.
     */
    async getPaymentStatus(sessionId: string): Promise<ApiResponse<Payment>> {
        const response = await axiosClient.get(`/payments/status/${sessionId}`);
        return response.data;
    },

    /**
     * Get a single payment by ID.
     */
    async getPayment(id: number): Promise<ApiResponse<Payment>> {
        const response = await axiosClient.get(`/payments/${id}`);
        return response.data;
    },

    /**
     * Get all payments for an application.
     */
    async getApplicationPayments(applicationId: number): Promise<ApiResponse<Payment[]>> {
        const response = await axiosClient.get(`/applications/${applicationId}/payments`);
        return response.data;
    },

    /**
     * Get all payments for the current user.
     */
    async getMyPayments(): Promise<ApiResponse<Payment[]>> {
        const response = await axiosClient.get('/payments');
        return response.data;
    },

    /**
     * Request a refund for a payment (staff only).
     */
    async requestRefund(
        paymentId: number,
        data?: RefundDTO
    ): Promise<ApiResponse<Payment>> {
        const response = await axiosClient.post(`/payments/${paymentId}/refund`, data || {});
        return response.data;
    },
};

export default paymentService;
