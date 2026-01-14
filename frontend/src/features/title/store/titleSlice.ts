import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import titleService from '../services/titleService';
import type { Application } from '../../application/types/applicationTypes';

type TabType = 'owned' | 'licensed';

interface TitleState {
  ownedTitles: Application[];
  licensedTitles: Application[];
  loading: boolean;
  error: string | null;
  activeTab: TabType;
}

const initialState: TitleState = {
  ownedTitles: [],
  licensedTitles: [],
  loading: false,
  error: null,
  activeTab: 'owned',
};

// Async Thunks
export const fetchGrantedTitles = createAsyncThunk(
  'title/fetchGrantedTitles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await titleService.getGrantedTitles();
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách văn bằng bảo hộ');
    }
  }
);

export const fetchLicensedTitles = createAsyncThunk(
  'title/fetchLicensedTitles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await titleService.getLicensedTitles();
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách li-xăng');
    }
  }
);

// Slice
const titleSlice = createSlice({
  name: 'title',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<TabType>) => {
      state.activeTab = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch granted titles
    builder
      .addCase(fetchGrantedTitles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGrantedTitles.fulfilled, (state, action) => {
        state.loading = false;
        state.ownedTitles = action.payload;
      })
      .addCase(fetchGrantedTitles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch licensed titles
    builder
      .addCase(fetchLicensedTitles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLicensedTitles.fulfilled, (state, action) => {
        state.loading = false;
        state.licensedTitles = action.payload;
      })
      .addCase(fetchLicensedTitles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveTab, clearError } = titleSlice.actions;
export default titleSlice.reducer;
