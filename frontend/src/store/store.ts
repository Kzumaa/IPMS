import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import applicationReducer from '../features/application/store/applicationSlice';
import staffReducer from '../features/staff/store/staffSlice';
import requestReducer from '../features/request/store/requestSlice';
import paymentReducer from '../features/payment/store/paymentSlice';
import titleReducer from '../features/title/store/titleSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        application: applicationReducer,
        staff: staffReducer,
        request: requestReducer,
        payment: paymentReducer,
        title: titleReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
