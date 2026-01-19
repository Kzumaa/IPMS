import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';
import type { User, LoginPayload, RegisterPayload } from './authTypes';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,
};

// Async Thunks
export const registerApplicant = createAsyncThunk(
    'auth/registerApplicant',
    async (data: RegisterPayload, thunkAPI) => {
        try {
            return await authService.registerApplicant(data);
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const loginApplicant = createAsyncThunk(
    'auth/loginApplicant',
    async (data: LoginPayload, thunkAPI) => {
        try {
            return await authService.loginApplicant(data);
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const loginStaff = createAsyncThunk(
    'auth/loginStaff',
    async (data: LoginPayload, thunkAPI) => {
        try {
            return await authService.loginStaff(data);
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        await authService.logout();
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, thunkAPI) => {
    try {
        return await authService.getMe();
    } catch (error: any) {
        // If fetching user fails, clear the token
        localStorage.removeItem('token');
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerApplicant.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerApplicant.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(registerApplicant.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Login Applicant
            .addCase(loginApplicant.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginApplicant.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(loginApplicant.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Login Staff
            .addCase(loginStaff.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginStaff.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(loginStaff.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                localStorage.removeItem('token');
            })
            // Fetch Me (restore user on page refresh)
            .addCase(fetchMe.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchMe.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
