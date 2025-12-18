import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import staffService, { type DashboardStats } from '../services/staffService';
import type { Application, PaginatedResponse } from '@/features/application/types/applicationTypes';

interface StaffState {
    // Dashboard
    dashboardStats: DashboardStats | null;
    statsLoading: boolean;
    statsError: string | null;

    // Application Lists
    allApplications: Application[];
    myApplications: Application[];
    applicationsLoading: boolean;
    applicationsError: string | null;
    currentPage: number;
    totalPages: number;
    total: number;

    // Examination
    examinationLoading: boolean;
    examinationError: string | null;
}

const initialState: StaffState = {
    dashboardStats: null,
    statsLoading: false,
    statsError: null,

    allApplications: [],
    myApplications: [],
    applicationsLoading: false,
    applicationsError: null,
    currentPage: 1,
    totalPages: 1,
    total: 0,

    examinationLoading: false,
    examinationError: null,
};

// Async Thunks
export const fetchDashboardStats = createAsyncThunk(
    'staff/fetchDashboardStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await staffService.getDashboardStats();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch dashboard stats');
        }
    }
);

export const fetchAllApplications = createAsyncThunk(
    'staff/fetchAllApplications',
    async (params: {
        status?: string;
        app_type?: string;
        search?: string;
        page?: number;
        per_page?: number;
    } | undefined, { rejectWithValue }) => {
        try {
            const response = await staffService.listAllApplications(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch applications');
        }
    }
);

export const fetchMyApplications = createAsyncThunk(
    'staff/fetchMyApplications',
    async (params: {
        status?: string;
        page?: number;
        per_page?: number;
    } | undefined, { rejectWithValue }) => {
        try {
            const response = await staffService.getMyApplications(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch assigned applications');
        }
    }
);

export const completeFormalityExamination = createAsyncThunk(
    'staff/completeFormalityExamination',
    async ({ applicationId, data }: { applicationId: number; data: { result: 'PASS' | 'FAIL'; notes?: string } }, { rejectWithValue }) => {
        try {
            const response = await staffService.completeFormalityExamination(applicationId, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to complete formality examination');
        }
    }
);

export const completeSubstantiveExamination = createAsyncThunk(
    'staff/completeSubstantiveExamination',
    async ({ applicationId, data }: { applicationId: number; data: { result: 'ACCEPTABLE' | 'REJECTED' | 'OBJECTION'; notes?: string } }, { rejectWithValue }) => {
        try {
            const response = await staffService.completeSubstantiveExamination(applicationId, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to complete substantive examination');
        }
    }
);

export const issueDecision = createAsyncThunk(
    'staff/issueDecision',
    async ({ applicationId, data }: { applicationId: number; data: { type: 'GRANT' | 'REFUSE'; notes?: string } }, { rejectWithValue }) => {
        try {
            const response = await staffService.issueDecision(applicationId, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to issue decision');
        }
    }
);

// Slice
const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        clearError: (state) => {
            state.statsError = null;
            state.applicationsError = null;
            state.examinationError = null;
        },
    },
    extraReducers: (builder) => {
        // Dashboard Stats
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.statsLoading = true;
                state.statsError = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
                state.statsLoading = false;
                state.dashboardStats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.statsError = action.payload as string;
            });

        // All Applications
        builder
            .addCase(fetchAllApplications.pending, (state) => {
                state.applicationsLoading = true;
                state.applicationsError = null;
            })
            .addCase(fetchAllApplications.fulfilled, (state, action: PayloadAction<PaginatedResponse<Application>>) => {
                state.applicationsLoading = false;
                state.allApplications = action.payload.data;
                state.currentPage = action.payload.meta?.current_page || 1;
                state.totalPages = action.payload.meta?.last_page || 1;
                state.total = action.payload.meta?.total || 0;
            })
            .addCase(fetchAllApplications.rejected, (state, action) => {
                state.applicationsLoading = false;
                state.applicationsError = action.payload as string;
            });

        // My Applications
        builder
            .addCase(fetchMyApplications.pending, (state) => {
                state.applicationsLoading = true;
                state.applicationsError = null;
            })
            .addCase(fetchMyApplications.fulfilled, (state, action: PayloadAction<PaginatedResponse<Application>>) => {
                state.applicationsLoading = false;
                state.myApplications = action.payload.data;
                state.currentPage = action.payload.meta?.current_page || 1;
                state.totalPages = action.payload.meta?.last_page || 1;
                state.total = action.payload.meta?.total || 0;
            })
            .addCase(fetchMyApplications.rejected, (state, action) => {
                state.applicationsLoading = false;
                state.applicationsError = action.payload as string;
            });

        // Formality Examination
        builder
            .addCase(completeFormalityExamination.pending, (state) => {
                state.examinationLoading = true;
                state.examinationError = null;
            })
            .addCase(completeFormalityExamination.fulfilled, (state) => {
                state.examinationLoading = false;
            })
            .addCase(completeFormalityExamination.rejected, (state, action) => {
                state.examinationLoading = false;
                state.examinationError = action.payload as string;
            });

        // Substantive Examination
        builder
            .addCase(completeSubstantiveExamination.pending, (state) => {
                state.examinationLoading = true;
                state.examinationError = null;
            })
            .addCase(completeSubstantiveExamination.fulfilled, (state) => {
                state.examinationLoading = false;
            })
            .addCase(completeSubstantiveExamination.rejected, (state, action) => {
                state.examinationLoading = false;
                state.examinationError = action.payload as string;
            });

        // Decision
        builder
            .addCase(issueDecision.pending, (state) => {
                state.examinationLoading = true;
                state.examinationError = null;
            })
            .addCase(issueDecision.fulfilled, (state) => {
                state.examinationLoading = false;
            })
            .addCase(issueDecision.rejected, (state, action) => {
                state.examinationLoading = false;
                state.examinationError = action.payload as string;
            });
    },
});

export const { clearError } = staffSlice.actions;
export default staffSlice.reducer;
