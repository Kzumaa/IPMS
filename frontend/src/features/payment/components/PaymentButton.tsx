import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createCheckout, setRedirecting } from '../store/paymentSlice';

interface PaymentButtonProps {
    feeQuoteId: number;
    amount: number;
    currency?: string;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary';
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
    feeQuoteId,
    amount,
    currency = 'VND',
    disabled = false,
    className = '',
    size = 'md',
    variant = 'primary',
}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { loading, redirecting } = useAppSelector(state => state.payment);

    const handlePayment = useCallback(async () => {
        const baseUrl = window.location.origin;
        const successUrl = `${baseUrl}/app/payments/success`;
        const cancelUrl = `${baseUrl}/app/payments/cancel`;

        try {
            const result = await dispatch(createCheckout({
                feeQuoteId,
                successUrl,
                cancelUrl,
            })).unwrap();

            // Redirect to Stripe Checkout
            dispatch(setRedirecting(true));
            window.location.href = result.session_url;
        } catch (error) {
            console.error('Checkout creation failed:', error);
        }
    }, [dispatch, feeQuoteId]);

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        secondary: 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
    };

    const formattedAmount = new Intl.NumberFormat('vi-VN').format(amount);

    return (
        <button
            type="button"
            onClick={handlePayment}
            disabled={disabled || loading || redirecting}
            className={`
                inline-flex items-center justify-center rounded-lg font-medium
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${className}
            `}
        >
            {loading || redirecting ? (
                <>
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    {redirecting ? t('payment.redirecting') : t('payment.processing')}
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined mr-2 text-lg">credit_card</span>
                    {t('payment.payNow', { amount: formattedAmount, currency })}
                </>
            )}
        </button>
    );
};

export default PaymentButton;
