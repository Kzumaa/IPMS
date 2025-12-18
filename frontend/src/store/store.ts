import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import applicationReducer from '../features/application/store/applicationSlice';
import staffReducer from '../features/staff/store/staffSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        application: applicationReducer,
        staff: staffReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
