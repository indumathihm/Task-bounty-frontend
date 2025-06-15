import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../config/axios";

export const createSubscription = createAsyncThunk('subscription/createSubscription',async (planType, { rejectWithValue }) => {
    try {
      const res = await axios.post('/subscription',{ planType },
        { 
          headers: { Authorization: localStorage.getItem("token") } }
        );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create subscription');
    }
  }
);

export const verifySubscription = createAsyncThunk('subscription/verifySubscription', async ({ payment_id, order_id, signature, planType }, { rejectWithValue }) => {
    try {
      const res = await axios.post('/subscription/verify',{ payment_id, order_id, signature, planType },
        { 
          headers: { Authorization: localStorage.getItem("token") } 
        });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Payment verification failed');
    }
  }
);

export const getSubscriptionStatus = createAsyncThunk('subscription/getSubscriptionStatus', async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/subscription', {
        headers: { Authorization: localStorage.getItem("token") }
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch subscription status');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    loading: false,
    data: null,
    error: null,
    success: false,
    verified: false,
    isActive: false,
    subscriptionEndDate: null,
    order: null,
    subscriptionId: null,
  },
  reducers: {
    resetSubscriptionState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.verified = false;
      state.isActive = false;
      state.subscriptionEndDate = null;
      state.order = null;
      state.subscriptionId = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
    builder.addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload.order;
        state.subscriptionId = null;
        state.subscriptionEndDate = null;
      })
    builder.addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    builder.addCase(verifySubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.verified = false;
      })
    builder.addCase(verifySubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.verified = true;
        state.isActive = true;
        state.subscriptionId = action.payload.subscriptionId;
        state.subscriptionEndDate = action.payload.endDate;

        localStorage.setItem('subscription',JSON.stringify({
            subscriptionId: action.payload.subscriptionId,
            subscriptionEndDate: action.payload.endDate,
            isActive: true,
          })
        );
      })
    builder.addCase(verifySubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.verified = false;
      })
    builder.addCase(getSubscriptionStatus.pending, (state) => {
        state.loading = true;
      })
    builder.addCase(getSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isActive) {
          state.isActive = true;
          state.subscriptionEndDate = action.payload.endDate;
          state.subscriptionId = action.payload.subscriptionId;
        } else {
          state.isActive = false;
          state.subscriptionEndDate = null;
          state.subscriptionId = null;
        }
        state.data = action.payload;
      })
    builder.addCase(getSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSubscriptionState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;