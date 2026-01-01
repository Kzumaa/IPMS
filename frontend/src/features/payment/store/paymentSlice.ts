import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import paymentService from '../services/paymentService';
import type { Payment, CheckoutResponse } from '../types/paymentTypes';

interface PaymentState {
    payments: Payment[];
    currentPayment: Payment | null;
    checkoutSession: CheckoutResponse | null;
    loading: boolean;
    error: string | null;
    redirecting: boolean;
}

const initialState: PaymentState = {
    payments: [],
    currentPayment: null,
    checkoutSession: null,
    loading: false,
    error: null,
    redirecting: false,
};

// Async Thunks
export const createCheckout = createAsyncThunk(
    'payment/createCheckout',
    async (
        { feeQuoteId, successUrl, cancelUrl }: {
            feeQuoteId: number;
            successUrl: string;
            cancelUrl: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await paymentService.createCheckout({
                fee_quote_id: feeQuoteId,
                success_url: successUrl,
                cancel_url: cancelUrl,
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string; message?: string } } };
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to create checkout');
        }
    }
);

export const createMaintenanceCheckout = createAsyncThunk(
    'payment/createMaintenanceCheckout',
    async (
        { scheduleId, successUrl, cancelUrl }: {
            scheduleId: number;
            successUrl: string;
            cancelUrl: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await paymentService.createMaintenanceCheckout(scheduleId, {
                success_url: successUrl,
                cancel_url: cancelUrl,
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string; message?: string } } };
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to create checkout');
        }
    }
);

export const fetchPaymentStatus = createAsyncThunk(
    'payment/fetchPaymentStatus',
    async (sessionId: string, { rejectWithValue }) => {
        try {
            const response = await paymentService.getPaymentStatus(sessionId);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string; message?: string } } };
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch payment status');
        }
    }
);

export const fetchApplicationPayments = createAsyncThunk(
    'payment/fetchApplicationPayments',
    async (applicationId: number, { rejectWithValue }) => {
        try {
            const response = await paymentService.getApplicationPayments(applicationId);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string; message?: string } } };
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch payments');
        }
    }
);

export const fetchMyPayments = createAsyncThunk(
    'payment/fetchMyPayments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await paymentService.getMyPayments();
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string; message?: string } } };
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch payments');
        }
    }
);

export const requestRefund = createAsyncThunk(
    'payment/requestRefund',
    async (
        { paymentId, amount, reason }: {
            paymentId: number;
            amount?: number;
            reason?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await paymentService.requestRefund(paymentId, { amount, reason });
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string; message?: string } } };
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to process refund');
        }
    }
);

export const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        resetError: (state) => {
            state.error = null;
        },
        setRedirecting: (state, action: PayloadAction<boolean>) => {
            state.redirecting = action.payload;
        },
        clearCheckoutSession: (state) => {
            state.checkoutSession = null;
        },
        clearCurrentPayment: (state) => {
            state.currentPayment = null;
        },
        resetPaymentState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Create Checkout
            .addCase(createCheckout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCheckout.fulfilled, (state, action) => {
                state.loading = false;
                state.checkoutSession = action.payload;
            })
            .addCase(createCheckout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Maintenance Checkout
            .addCase(createMaintenanceCheckout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createMaintenanceCheckout.fulfilled, (state, action) => {
                state.loading = false;
                state.checkoutSession = action.payload;
            })
            .addCase(createMaintenanceCheckout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Payment Status
            .addCase(fetchPaymentStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPayment = action.payload;
            })
            .addCase(fetchPaymentStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Application Payments
            .addCase(fetchApplicationPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApplicationPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload;
            })
            .addCase(fetchApplicationPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch My Payments
            .addCase(fetchMyPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload;
            })
            .addCase(fetchMyPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Request Refund
            .addCase(requestRefund.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestRefund.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPayment = action.payload;
                // Update in list if exists
                const index = state.payments.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.payments[index] = action.payload;
                }
            })
            .addCase(requestRefund.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    resetError,
    setRedirecting,
    clearCheckoutSession,
    clearCurrentPayment,
    resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;
