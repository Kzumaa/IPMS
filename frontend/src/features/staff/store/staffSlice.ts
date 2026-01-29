import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import staffService, { type DashboardStats, type StaffRequest, type ComplaintResolutionRequest } from '../services/staffService';
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

    // Requests
    requests: StaffRequest[];
    currentRequest: StaffRequest | null;
    requestsLoading: boolean;
    requestsError: string | null;
    requestsPage: number;
    requestsTotalPages: number;
    requestsTotal: number;
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

    requests: [],
    currentRequest: null,
    requestsLoading: false,
    requestsError: null,
    requestsPage: 1,
    requestsTotalPages: 1,
    requestsTotal: 0,
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

export const startFormalityExamination = createAsyncThunk(
    'staff/startFormalityExamination',
    async (applicationId: number, { rejectWithValue }) => {
        try {
            const response = await staffService.startFormalityExamination(applicationId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to start formality examination');
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

// Request Examination Thunks
export const fetchRequests = createAsyncThunk(
    'staff/fetchRequests',
    async (params: {
        type?: string;
        status?: string;
        page?: number;
        per_page?: number;
    } | undefined, { rejectWithValue }) => {
        try {
            const response = await staffService.listRequests(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch requests');
        }
    }
);

export const fetchRequest = createAsyncThunk(
    'staff/fetchRequest',
    async (requestId: number, { rejectWithValue }) => {
        try {
            const response = await staffService.getRequest(requestId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch request');
        }
    }
);

export const startRequestExamination = createAsyncThunk(
    'staff/startRequestExamination',
    async (requestId: number, { rejectWithValue }) => {
        try {
            const response = await staffService.startRequestExamination(requestId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to start examination');
        }
    }
);

export const approveRequest = createAsyncThunk(
    'staff/approveRequest',
    async ({ requestId, notes }: { requestId: number; notes?: string }, { rejectWithValue }) => {
        try {
            const response = await staffService.approveRequest(requestId, notes);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to approve request');
        }
    }
);

export const refuseRequest = createAsyncThunk(
    'staff/refuseRequest',
    async ({ requestId, notes }: { requestId: number; notes: string }, { rejectWithValue }) => {
        try {
            const response = await staffService.refuseRequest(requestId, notes);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to refuse request');
        }
    }
);

export const resolveComplaint = createAsyncThunk(
    'staff/resolveComplaint',
    async ({ requestId, data }: { requestId: number; data: ComplaintResolutionRequest }, { rejectWithValue }) => {
        try {
            const response = await staffService.resolveComplaint(requestId, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to resolve complaint');
        }
    }
);

export const publishApplication = createAsyncThunk(
    'staff/publishApplication',
    async (applicationId: number, { rejectWithValue }) => {
        try {
            const response = await staffService.publishApplication(applicationId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to publish application');
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
            state.requestsError = null;
        },
        clearCurrentRequest: (state) => {
            state.currentRequest = null;
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

        // Start Formality Examination
        builder
            .addCase(startFormalityExamination.pending, (state) => {
                state.examinationLoading = true;
                state.examinationError = null;
            })
            .addCase(startFormalityExamination.fulfilled, (state) => {
                state.examinationLoading = false;
            })
            .addCase(startFormalityExamination.rejected, (state, action) => {
                state.examinationLoading = false;
                state.examinationError = action.payload as string;
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

        // Fetch Requests
        builder
            .addCase(fetchRequests.pending, (state) => {
                state.requestsLoading = true;
                state.requestsError = null;
            })
            .addCase(fetchRequests.fulfilled, (state, action: PayloadAction<PaginatedResponse<StaffRequest>>) => {
                state.requestsLoading = false;
                state.requests = action.payload.data;
                state.requestsPage = action.payload.meta?.current_page || 1;
                state.requestsTotalPages = action.payload.meta?.last_page || 1;
                state.requestsTotal = action.payload.meta?.total || 0;
            })
            .addCase(fetchRequests.rejected, (state, action) => {
                state.requestsLoading = false;
                state.requestsError = action.payload as string;
            });

        // Fetch Single Request
        builder
            .addCase(fetchRequest.pending, (state) => {
                state.requestsLoading = true;
                state.requestsError = null;
            })
            .addCase(fetchRequest.fulfilled, (state, action: PayloadAction<StaffRequest>) => {
                state.requestsLoading = false;
                state.currentRequest = action.payload;
            })
            .addCase(fetchRequest.rejected, (state, action) => {
                state.requestsLoading = false;
                state.requestsError = action.payload as string;
            });

        // Start Request Examination
        builder
            .addCase(startRequestExamination.pending, (state) => {
                state.examinationLoading = true;
                state.examinationError = null;
            })
            .addCase(startRequestExamination.fulfilled, (state, action: PayloadAction<StaffRequest>) => {
                state.examinationLoading = false;
                state.currentRequest = action.payload;
            })
            .addCase(startRequestExamination.rejected, (state, action) => {
                state.examinationLoading = false;
                state.examinationError = action.payload as string;
            });

        // Approve Request
        builder
            .addCase(approveRequest.pending, (state) => {
                state.examinationLoading = true;
                state.examinationError = null;
            })
            .addCase(approveRequest.fulfilled, (state, action: PayloadAction<StaffRequest>) => {
                state.examinationLoading = false;
                state.currentRequest = action.payload;
            })
            .addCase(approveRequest.rejected, (state, action) => {
                state.examinationLoading = false;
                state.examinationError = action.payload as string;
            });

        // Refuse Request
        builder
            .addCase(refuseRequest.pending, (state) => {
                state.examinationLoading = true;
                state.examinationError = null;
            })
            .addCase(refuseRequest.fulfilled, (state, action: PayloadAction<StaffRequest>) => {
                state.examinationLoading = false;
                state.currentRequest = action.payload;
            })
            .addCase(refuseRequest.rejected, (state, action) => {
                state.examinationLoading = false;
                state.examinationError = action.payload as string;
            });

        // Resolve Complaint
        builder
            .addCase(resolveComplaint.pending, (state) => {
                state.examinationLoading = true;
                state.examinationError = null;
            })
            .addCase(resolveComplaint.fulfilled, (state, action: PayloadAction<StaffRequest>) => {
                state.examinationLoading = false;
                state.currentRequest = action.payload;
            })
            .addCase(resolveComplaint.rejected, (state, action) => {
                state.examinationLoading = false;
                state.examinationError = action.payload as string;
            });

        // Publish Application
        builder
            .addCase(publishApplication.pending, (state) => {
                state.examinationLoading = true;
                state.examinationError = null;
            })
            .addCase(publishApplication.fulfilled, (state) => {
                state.examinationLoading = false;
            })
            .addCase(publishApplication.rejected, (state, action) => {
                state.examinationLoading = false;
                state.examinationError = action.payload as string;
            });
    },
});

export const { clearError, clearCurrentRequest } = staffSlice.actions;
export default staffSlice.reducer;
