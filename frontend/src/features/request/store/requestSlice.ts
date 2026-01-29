import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import requestService from '../services/requestService';
import type {
  ApplicationRequest,
  CreateAmendmentDTO,
  UpdateAmendmentDTO,
  CreateAssignmentDTO,
  CreateLicenseDTO,
  CreateSplitDTO,
  CreateComplaintDTO,
  CreateRenewalDTO,
  CreateTerminationDTO,
  CreateWithdrawalDTO,
} from '../types/requestTypes';
import type { RequestType } from '../types/enums';

interface RequestState {
  requests: ApplicationRequest[];
  currentRequest: ApplicationRequest | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
}

const initialState: RequestState = {
  requests: [],
  currentRequest: null,
  loading: false,
  error: null,
  submitting: false,
};

// ==================== FETCH ALL REQUESTS ====================
export const fetchAllRequests = createAsyncThunk(
  'request/fetchAllRequests',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const requests = await requestService.getAllRequests(applicationId);
      return requests;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách yêu cầu');
    }
  }
);

// ==================== AMENDMENT THUNKS ====================
export const fetchAmendments = createAsyncThunk(
  'request/fetchAmendments',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const response = await requestService.getAmendments(applicationId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách sửa đổi');
    }
  }
);

export const fetchAmendment = createAsyncThunk(
  'request/fetchAmendment',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.getAmendment(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin sửa đổi');
    }
  }
);

export const createAmendment = createAsyncThunk(
  'request/createAmendment',
  async ({ applicationId, data }: { applicationId: number; data: CreateAmendmentDTO }, { rejectWithValue }) => {
    try {
      const response = await requestService.createAmendment(applicationId, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tạo yêu cầu sửa đổi');
    }
  }
);

export const updateAmendment = createAsyncThunk(
  'request/updateAmendment',
  async (
    { applicationId, requestId, data }: { applicationId: number; requestId: number; data: UpdateAmendmentDTO },
    { rejectWithValue }
  ) => {
    try {
      const response = await requestService.updateAmendment(applicationId, requestId, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể cập nhật yêu cầu sửa đổi');
    }
  }
);

export const deleteAmendment = createAsyncThunk(
  'request/deleteAmendment',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      await requestService.deleteAmendment(applicationId, requestId);
      return requestId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể xóa yêu cầu sửa đổi');
    }
  }
);

export const submitAmendment = createAsyncThunk(
  'request/submitAmendment',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.submitAmendment(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể nộp yêu cầu sửa đổi');
    }
  }
);

// ==================== ASSIGNMENT THUNKS ====================
export const fetchAssignments = createAsyncThunk(
  'request/fetchAssignments',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const response = await requestService.getAssignments(applicationId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách chuyển nhượng');
    }
  }
);

export const fetchAssignment = createAsyncThunk(
  'request/fetchAssignment',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.getAssignment(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin chuyển nhượng');
    }
  }
);

export const createAssignment = createAsyncThunk(
  'request/createAssignment',
  async ({ applicationId, data }: { applicationId: number; data: CreateAssignmentDTO }, { rejectWithValue }) => {
    try {
      const response = await requestService.createAssignment(applicationId, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tạo yêu cầu chuyển nhượng');
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  'request/deleteAssignment',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      await requestService.deleteAssignment(applicationId, requestId);
      return requestId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể xóa yêu cầu chuyển nhượng');
    }
  }
);

export const submitAssignment = createAsyncThunk(
  'request/submitAssignment',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.submitAssignment(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể nộp yêu cầu chuyển nhượng');
    }
  }
);

// ==================== LICENSE THUNKS ====================
export const fetchLicenses = createAsyncThunk(
  'request/fetchLicenses',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const response = await requestService.getLicenses(applicationId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách li-xăng');
    }
  }
);

export const fetchLicense = createAsyncThunk(
  'request/fetchLicense',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.getLicense(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin li-xăng');
    }
  }
);

export const createLicense = createAsyncThunk(
  'request/createLicense',
  async ({ applicationId, data }: { applicationId: number; data: CreateLicenseDTO }, { rejectWithValue }) => {
    try {
      const response = await requestService.createLicense(applicationId, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tạo yêu cầu li-xăng');
    }
  }
);

export const deleteLicense = createAsyncThunk(
  'request/deleteLicense',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      await requestService.deleteLicense(applicationId, requestId);
      return requestId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể xóa yêu cầu li-xăng');
    }
  }
);

export const submitLicense = createAsyncThunk(
  'request/submitLicense',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.submitLicense(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể nộp yêu cầu li-xăng');
    }
  }
);

// ==================== SPLIT THUNKS ====================
export const fetchSplits = createAsyncThunk(
  'request/fetchSplits',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const response = await requestService.getSplits(applicationId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách tách đơn');
    }
  }
);

export const fetchSplit = createAsyncThunk(
  'request/fetchSplit',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.getSplit(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin tách đơn');
    }
  }
);

export const createSplit = createAsyncThunk(
  'request/createSplit',
  async ({ applicationId, data }: { applicationId: number; data: CreateSplitDTO }, { rejectWithValue }) => {
    try {
      const response = await requestService.createSplit(applicationId, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tạo yêu cầu tách đơn');
    }
  }
);

export const deleteSplit = createAsyncThunk(
  'request/deleteSplit',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      await requestService.deleteSplit(applicationId, requestId);
      return requestId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể xóa yêu cầu tách đơn');
    }
  }
);

export const submitSplit = createAsyncThunk(
  'request/submitSplit',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.submitSplit(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể nộp yêu cầu tách đơn');
    }
  }
);

// ==================== COMPLAINT THUNKS ====================
export const fetchComplaints = createAsyncThunk(
  'request/fetchComplaints',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const response = await requestService.getComplaints(applicationId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách khiếu nại');
    }
  }
);

export const fetchComplaint = createAsyncThunk(
  'request/fetchComplaint',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.getComplaint(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin khiếu nại');
    }
  }
);

export const createComplaint = createAsyncThunk(
  'request/createComplaint',
  async ({ applicationId, data }: { applicationId: number; data: CreateComplaintDTO }, { rejectWithValue }) => {
    try {
      const response = await requestService.createComplaint(applicationId, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tạo khiếu nại');
    }
  }
);

export const deleteComplaint = createAsyncThunk(
  'request/deleteComplaint',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      await requestService.deleteComplaint(applicationId, requestId);
      return requestId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể xóa khiếu nại');
    }
  }
);

export const submitComplaint = createAsyncThunk(
  'request/submitComplaint',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.submitComplaint(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể nộp khiếu nại');
    }
  }
);

// ==================== RENEWAL THUNKS ====================
export const fetchRenewals = createAsyncThunk(
  'request/fetchRenewals',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const response = await requestService.getRenewals(applicationId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách gia hạn');
    }
  }
);

export const fetchRenewal = createAsyncThunk(
  'request/fetchRenewal',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.getRenewal(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin gia hạn');
    }
  }
);

export const createRenewal = createAsyncThunk(
  'request/createRenewal',
  async ({ applicationId, data }: { applicationId: number; data: CreateRenewalDTO }, { rejectWithValue }) => {
    try {
      const response = await requestService.createRenewal(applicationId, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tạo yêu cầu gia hạn');
    }
  }
);

export const deleteRenewal = createAsyncThunk(
  'request/deleteRenewal',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      await requestService.deleteRenewal(applicationId, requestId);
      return requestId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể xóa yêu cầu gia hạn');
    }
  }
);

export const submitRenewal = createAsyncThunk(
  'request/submitRenewal',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.submitRenewal(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể nộp yêu cầu gia hạn');
    }
  }
);

// ==================== TERMINATION THUNKS ====================
export const fetchTerminations = createAsyncThunk(
  'request/fetchTerminations',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const response = await requestService.getTerminations(applicationId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách chấm dứt');
    }
  }
);

export const fetchTermination = createAsyncThunk(
  'request/fetchTermination',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.getTermination(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin chấm dứt');
    }
  }
);

export const createTermination = createAsyncThunk(
  'request/createTermination',
  async ({ applicationId, data }: { applicationId: number; data: CreateTerminationDTO }, { rejectWithValue }) => {
    try {
      const response = await requestService.createTermination(applicationId, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tạo yêu cầu chấm dứt');
    }
  }
);

export const deleteTermination = createAsyncThunk(
  'request/deleteTermination',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      await requestService.deleteTermination(applicationId, requestId);
      return requestId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể xóa yêu cầu chấm dứt');
    }
  }
);

export const submitTermination = createAsyncThunk(
  'request/submitTermination',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.submitTermination(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể nộp yêu cầu chấm dứt');
    }
  }
);

// ==================== WITHDRAWAL THUNKS ====================
export const fetchWithdrawals = createAsyncThunk(
  'request/fetchWithdrawals',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const response = await requestService.getWithdrawals(applicationId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách rút đơn');
    }
  }
);

export const fetchWithdrawal = createAsyncThunk(
  'request/fetchWithdrawal',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.getWithdrawal(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin rút đơn');
    }
  }
);

export const createWithdrawal = createAsyncThunk(
  'request/createWithdrawal',
  async ({ applicationId, data }: { applicationId: number; data: CreateWithdrawalDTO }, { rejectWithValue }) => {
    try {
      const response = await requestService.createWithdrawal(applicationId, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tạo yêu cầu rút đơn');
    }
  }
);

export const deleteWithdrawal = createAsyncThunk(
  'request/deleteWithdrawal',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      await requestService.deleteWithdrawal(applicationId, requestId);
      return requestId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể xóa yêu cầu rút đơn');
    }
  }
);

export const submitWithdrawal = createAsyncThunk(
  'request/submitWithdrawal',
  async ({ applicationId, requestId }: { applicationId: number; requestId: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.submitWithdrawal(applicationId, requestId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể nộp yêu cầu rút đơn');
    }
  }
);

// ==================== GENERIC REQUEST THUNK ====================
export const fetchRequest = createAsyncThunk(
  'request/fetchRequest',
  async (
    { applicationId, requestId, type }: { applicationId: number; requestId: number; type: RequestType },
    { rejectWithValue }
  ) => {
    try {
      let response;
      switch (type) {
        case 'AMENDMENT':
          response = await requestService.getAmendment(applicationId, requestId);
          break;
        case 'ASSIGNMENT':
          response = await requestService.getAssignment(applicationId, requestId);
          break;
        case 'LICENSE':
          response = await requestService.getLicense(applicationId, requestId);
          break;
        case 'SPLIT':
          response = await requestService.getSplit(applicationId, requestId);
          break;
        case 'COMPLAINT':
          response = await requestService.getComplaint(applicationId, requestId);
          break;
        case 'RENEWAL':
          response = await requestService.getRenewal(applicationId, requestId);
          break;
        case 'TERMINATION':
          response = await requestService.getTermination(applicationId, requestId);
          break;
        case 'WITHDRAWAL':
          response = await requestService.getWithdrawal(applicationId, requestId);
          break;
        default:
          throw new Error('Loại yêu cầu không hợp lệ');
      }
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin yêu cầu');
    }
  }
);

export const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    setCurrentRequest: (state, action: PayloadAction<ApplicationRequest | null>) => {
      state.currentRequest = action.payload;
    },
    clearRequests: (state) => {
      state.requests = [];
      state.currentRequest = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Requests
      .addCase(fetchAllRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchAllRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Single Request
      .addCase(fetchRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(fetchRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ==================== AMENDMENT ====================
      .addCase(fetchAmendments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAmendments.fulfilled, (state, action) => {
        state.loading = false;
        // Replace only amendments in the requests array
        state.requests = [
          ...state.requests.filter((r) => r.type !== 'AMENDMENT'),
          ...action.payload,
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      })
      .addCase(fetchAmendments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAmendment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAmendment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(fetchAmendment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAmendment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAmendment.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
        state.currentRequest = action.payload;
      })
      .addCase(createAmendment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAmendment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAmendment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        state.currentRequest = action.payload;
      })
      .addCase(updateAmendment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAmendment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAmendment.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.filter((r) => r.id !== action.payload);
        if (state.currentRequest?.id === action.payload) {
          state.currentRequest = null;
        }
      })
      .addCase(deleteAmendment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitAmendment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitAmendment.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        state.currentRequest = action.payload;
      })
      .addCase(submitAmendment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // ==================== ASSIGNMENT ====================
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = [
          ...state.requests.filter((r) => r.type !== 'ASSIGNMENT'),
          ...action.payload,
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      })
      .addCase(fetchAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
        state.currentRequest = action.payload;
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.filter((r) => r.id !== action.payload);
        if (state.currentRequest?.id === action.payload) {
          state.currentRequest = null;
        }
      })
      .addCase(submitAssignment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitAssignment.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        state.currentRequest = action.payload;
      })
      .addCase(submitAssignment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // ==================== LICENSE ====================
      .addCase(fetchLicenses.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = [
          ...state.requests.filter((r) => r.type !== 'LICENSE'),
          ...action.payload,
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      })
      .addCase(fetchLicense.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(createLicense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLicense.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
        state.currentRequest = action.payload;
      })
      .addCase(createLicense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteLicense.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.filter((r) => r.id !== action.payload);
        if (state.currentRequest?.id === action.payload) {
          state.currentRequest = null;
        }
      })
      .addCase(submitLicense.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitLicense.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        state.currentRequest = action.payload;
      })
      .addCase(submitLicense.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // ==================== SPLIT ====================
      .addCase(fetchSplits.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = [
          ...state.requests.filter((r) => r.type !== 'SPLIT'),
          ...action.payload,
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      })
      .addCase(fetchSplit.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(createSplit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSplit.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
        state.currentRequest = action.payload;
      })
      .addCase(createSplit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSplit.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.filter((r) => r.id !== action.payload);
        if (state.currentRequest?.id === action.payload) {
          state.currentRequest = null;
        }
      })
      .addCase(submitSplit.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitSplit.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        state.currentRequest = action.payload;
      })
      .addCase(submitSplit.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // ==================== COMPLAINT ====================
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = [
          ...state.requests.filter((r) => r.type !== 'COMPLAINT'),
          ...action.payload,
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      })
      .addCase(fetchComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(createComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
        state.currentRequest = action.payload;
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.filter((r) => r.id !== action.payload);
        if (state.currentRequest?.id === action.payload) {
          state.currentRequest = null;
        }
      })
      .addCase(submitComplaint.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitComplaint.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        state.currentRequest = action.payload;
      })
      .addCase(submitComplaint.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // ==================== RENEWAL ====================
      .addCase(fetchRenewals.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = [
          ...state.requests.filter((r) => r.type !== 'RENEWAL'),
          ...action.payload,
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      })
      .addCase(fetchRenewal.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(createRenewal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRenewal.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
        state.currentRequest = action.payload;
      })
      .addCase(createRenewal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteRenewal.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.filter((r) => r.id !== action.payload);
        if (state.currentRequest?.id === action.payload) {
          state.currentRequest = null;
        }
      })
      .addCase(submitRenewal.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitRenewal.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        state.currentRequest = action.payload;
      })
      .addCase(submitRenewal.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // ==================== TERMINATION ====================
      .addCase(fetchTerminations.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = [
          ...state.requests.filter((r) => r.type !== 'TERMINATION'),
          ...action.payload,
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      })
      .addCase(fetchTermination.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(createTermination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTermination.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
        state.currentRequest = action.payload;
      })
      .addCase(createTermination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTermination.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.filter((r) => r.id !== action.payload);
        if (state.currentRequest?.id === action.payload) {
          state.currentRequest = null;
        }
      })
      .addCase(submitTermination.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitTermination.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        state.currentRequest = action.payload;
      })
      .addCase(submitTermination.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // ==================== WITHDRAWAL ====================
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = [
          ...state.requests.filter((r) => r.type !== 'WITHDRAWAL'),
          ...action.payload,
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      })
      .addCase(fetchWithdrawal.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(createWithdrawal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWithdrawal.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
        state.currentRequest = action.payload;
      })
      .addCase(createWithdrawal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteWithdrawal.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.filter((r) => r.id !== action.payload);
        if (state.currentRequest?.id === action.payload) {
          state.currentRequest = null;
        }
      })
      .addCase(submitWithdrawal.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitWithdrawal.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        state.currentRequest = action.payload;
      })
      .addCase(submitWithdrawal.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetError, setCurrentRequest, clearRequests } = requestSlice.actions;

export default requestSlice.reducer;
