import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import applicationService from '../services/applicationService';
import type {
    Application,
    ApplicationParty,
    ApplicationAttachment,
    ProtectionTitle,
    FeeQuote,
    ApplicationMetric,
    CreateApplicationDTO,
    CreatePartyDTO,
    CreateProtectionTitleDTO,
    UploadAttachmentDTO,
    ApplicationFilters,
} from '../types/applicationTypes';

interface ApplicationState {
    applications: Application[];
    currentApplication: Application | null;
    parties: ApplicationParty[];
    attachments: ApplicationAttachment[];
    protectionTitles: ProtectionTitle[];
    feeQuotes: FeeQuote[];
    loading: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        lastPage: number;
        perPage: number;
        total: number;
    };
    filters: ApplicationFilters;
    formStep: number;
    isDirty: boolean;
}

const initialState: ApplicationState = {
    applications: [],
    currentApplication: null,
    parties: [],
    attachments: [],
    protectionTitles: [],
    feeQuotes: [],
    loading: false,
    error: null,
    pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
    },
    filters: {},
    formStep: 0,
    isDirty: false,
};

// Async Thunks
export const fetchApplications = createAsyncThunk(
    'application/fetchApplications',
    async (filters: ApplicationFilters | undefined, { rejectWithValue }) => {
        try {
            const response = await applicationService.getApplications(filters);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách đơn');
        }
    }
);

export const fetchApplication = createAsyncThunk(
    'application/fetchApplication',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await applicationService.getApplication(id);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin đơn');
        }
    }
);

export const createApplication = createAsyncThunk(
    'application/createApplication',
    async (data: CreateApplicationDTO, { rejectWithValue }) => {
        try {
            const response = await applicationService.createApplication(data);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể tạo đơn');
        }
    }
);

export const updateApplication = createAsyncThunk(
    'application/updateApplication',
    async ({ id, data }: { id: number; data: Partial<CreateApplicationDTO> }, { rejectWithValue }) => {
        try {
            const response = await applicationService.updateApplication(id, data);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể cập nhật đơn');
        }
    }
);

export const deleteApplication = createAsyncThunk(
    'application/deleteApplication',
    async (id: number, { rejectWithValue }) => {
        try {
            await applicationService.deleteApplication(id);
            return id;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể xóa đơn');
        }
    }
);

export const submitApplication = createAsyncThunk(
    'application/submitApplication',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await applicationService.submitApplication(id);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể nộp đơn');
        }
    }
);

// Party Thunks
export const fetchParties = createAsyncThunk(
    'application/fetchParties',
    async (applicationId: number, { rejectWithValue }) => {
        try {
            const response = await applicationService.getParties(applicationId);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách bên liên quan');
        }
    }
);

export const addParty = createAsyncThunk(
    'application/addParty',
    async ({ applicationId, data }: { applicationId: number; data: CreatePartyDTO }, { rejectWithValue }) => {
        try {
            const response = await applicationService.addParty(applicationId, data);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể thêm bên liên quan');
        }
    }
);

export const updateParty = createAsyncThunk(
    'application/updateParty',
    async ({ applicationId, partyId, data }: { applicationId: number; partyId: number; data: Partial<CreatePartyDTO> }, { rejectWithValue }) => {
        try {
            const response = await applicationService.updateParty(applicationId, partyId, data);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể cập nhật bên liên quan');
        }
    }
);

export const deleteParty = createAsyncThunk(
    'application/deleteParty',
    async ({ applicationId, partyId }: { applicationId: number; partyId: number }, { rejectWithValue }) => {
        try {
            await applicationService.deleteParty(applicationId, partyId);
            return partyId;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể xóa bên liên quan');
        }
    }
);

// Attachment Thunks
export const fetchAttachments = createAsyncThunk(
    'application/fetchAttachments',
    async (applicationId: number, { rejectWithValue }) => {
        try {
            const response = await applicationService.getAttachments(applicationId);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách tài liệu');
        }
    }
);

export const uploadAttachment = createAsyncThunk(
    'application/uploadAttachment',
    async ({ applicationId, data }: { applicationId: number; data: UploadAttachmentDTO }, { rejectWithValue }) => {
        try {
            const response = await applicationService.uploadAttachment(applicationId, data);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể tải lên tài liệu');
        }
    }
);

export const deleteAttachment = createAsyncThunk(
    'application/deleteAttachment',
    async ({ applicationId, attachmentId }: { applicationId: number; attachmentId: number }, { rejectWithValue }) => {
        try {
            await applicationService.deleteAttachment(applicationId, attachmentId);
            return attachmentId;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể xóa tài liệu');
        }
    }
);

// Protection Title Thunks
export const fetchProtectionTitles = createAsyncThunk(
    'application/fetchProtectionTitles',
    async (applicationId: number, { rejectWithValue }) => {
        try {
            const response = await applicationService.getProtectionTitles(applicationId);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách phân loại');
        }
    }
);

export const addProtectionTitle = createAsyncThunk(
    'application/addProtectionTitle',
    async ({ applicationId, data }: { applicationId: number; data: CreateProtectionTitleDTO }, { rejectWithValue }) => {
        try {
            const response = await applicationService.addProtectionTitle(applicationId, data);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể thêm phân loại');
        }
    }
);

export const deleteProtectionTitle = createAsyncThunk(
    'application/deleteProtectionTitle',
    async ({ applicationId, titleId }: { applicationId: number; titleId: number }, { rejectWithValue }) => {
        try {
            await applicationService.deleteProtectionTitle(applicationId, titleId);
            return titleId;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể xóa phân loại');
        }
    }
);

// Fee Quote Thunks
export const fetchFeeQuotes = createAsyncThunk(
    'application/fetchFeeQuotes',
    async (applicationId: number, { rejectWithValue }) => {
        try {
            const response = await applicationService.getFeeQuotes(applicationId);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách phí');
        }
    }
);

export const calculateFees = createAsyncThunk(
    'application/calculateFees',
    async (applicationId: number, { rejectWithValue }) => {
        try {
            const response = await applicationService.calculateFees(applicationId);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Không thể tính phí');
        }
    }
);

// Metrics Thunks
export const saveMetrics = createAsyncThunk(
    'application/saveMetrics',
    async (
        { applicationId, data }: { applicationId: number; data: Partial<ApplicationMetric> },
        { rejectWithValue }
    ) => {
        try {
            const response = await applicationService.saveMetrics(applicationId, data);
            console.log("Response of metrics saving", response)
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            return rejectWithValue(err.response?.data?.message || 'Failed to save metrics');
        }
    }
);

export const applicationSlice = createSlice({
    name: 'application',
    initialState,
    reducers: {
        resetError: (state) => {
            state.error = null;
        },
        setFormStep: (state, action: PayloadAction<number>) => {
            state.formStep = action.payload;
        },
        nextFormStep: (state) => {
            state.formStep += 1;
        },
        prevFormStep: (state) => {
            if (state.formStep > 0) {
                state.formStep -= 1;
            }
        },
        setFilters: (state, action: PayloadAction<ApplicationFilters>) => {
            state.filters = action.payload;
        },
        setIsDirty: (state, action: PayloadAction<boolean>) => {
            state.isDirty = action.payload;
        },
        clearCurrentApplication: (state) => {
            state.currentApplication = null;
            state.parties = [];
            state.attachments = [];
            state.protectionTitles = [];
            state.feeQuotes = [];
            state.formStep = 0;
            state.isDirty = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Applications
            .addCase(fetchApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.applications = action.payload.data;
                state.pagination = {
                    currentPage: action.payload.meta.current_page,
                    lastPage: action.payload.meta.last_page,
                    perPage: action.payload.meta.per_page,
                    total: action.payload.meta.total,
                };
            })
            .addCase(fetchApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Single Application
            .addCase(fetchApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.currentApplication = action.payload;
                if (action.payload.parties) {
                    state.parties = action.payload.parties;
                }
                if (action.payload.attachments) {
                    state.attachments = action.payload.attachments;
                }
                if (action.payload.protection_titles) {
                    state.protectionTitles = action.payload.protection_titles;
                }
                if (action.payload.fee_quotes) {
                    state.feeQuotes = action.payload.fee_quotes;
                }
            })
            .addCase(fetchApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Application
            .addCase(createApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.currentApplication = action.payload;
                state.applications.unshift(action.payload);
            })
            .addCase(createApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Application
            .addCase(updateApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.currentApplication = action.payload;
                const index = state.applications.findIndex(app => app.id === action.payload.id);
                if (index !== -1) {
                    state.applications[index] = action.payload;
                }
                state.isDirty = false;
            })
            .addCase(updateApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete Application
            .addCase(deleteApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.applications = state.applications.filter(app => app.id !== action.payload);
                if (state.currentApplication?.id === action.payload) {
                    state.currentApplication = null;
                }
            })
            .addCase(deleteApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Submit Application
            .addCase(submitApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.currentApplication = action.payload;
                const index = state.applications.findIndex(app => app.id === action.payload.id);
                if (index !== -1) {
                    state.applications[index] = action.payload;
                }
            })
            .addCase(submitApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Parties
            .addCase(fetchParties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchParties.fulfilled, (state, action) => {
                state.loading = false;
                state.parties = action.payload;
            })
            .addCase(fetchParties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addParty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addParty.fulfilled, (state, action) => {
                state.loading = false;
                state.parties.push(action.payload);
            })
            .addCase(addParty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateParty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateParty.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.parties.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.parties[index] = action.payload;
                }
            })
            .addCase(updateParty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteParty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteParty.fulfilled, (state, action) => {
                state.loading = false;
                state.parties = state.parties.filter(p => p.id !== action.payload);
            })
            .addCase(deleteParty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Attachments
            .addCase(fetchAttachments.fulfilled, (state, action) => {
                state.attachments = action.payload;
            })
            .addCase(uploadAttachment.fulfilled, (state, action) => {
                state.attachments.push(action.payload);
            })
            .addCase(deleteAttachment.fulfilled, (state, action) => {
                state.attachments = state.attachments.filter(a => a.id !== action.payload);
            })
            // Protection Titles
            .addCase(fetchProtectionTitles.fulfilled, (state, action) => {
                state.protectionTitles = action.payload;
            })
            .addCase(addProtectionTitle.fulfilled, (state, action) => {
                state.protectionTitles.push(action.payload);
            })
            .addCase(deleteProtectionTitle.fulfilled, (state, action) => {
                state.protectionTitles = state.protectionTitles.filter(t => t.id !== action.payload);
            })
            // Fee Quotes
            .addCase(fetchFeeQuotes.fulfilled, (state, action) => {
                state.feeQuotes = action.payload;
            })
            .addCase(calculateFees.fulfilled, (state, action) => {
                // calculateFees returns a single FeeQuote, add it to the array
                state.feeQuotes = [action.payload];
            })
            // Metrics
            .addCase(saveMetrics.fulfilled, (state, action) => {
                if (state.currentApplication) {
                    state.currentApplication.metrics = action.payload;
                }
            });
    },
});

export const {
    resetError,
    setFormStep,
    nextFormStep,
    prevFormStep,
    setFilters,
    setIsDirty,
    clearCurrentApplication,
} = applicationSlice.actions;

export default applicationSlice.reducer;
