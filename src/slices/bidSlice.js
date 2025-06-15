import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../config/axios";

export const createBid = createAsyncThunk('bids/createBid', async ({ taskId, bidAmount, comment }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/tasks/${taskId}/bids`, { bidAmount, comment },
        {
          headers: { Authorization: localStorage.getItem("token") },
        });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getBidsForTask = createAsyncThunk('bids/getBidsForTask',async (taskId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/tasks/${taskId}/bids`,
        {
          headers: { Authorization: localStorage.getItem("token") },
        });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateBid = createAsyncThunk('bids/updateBid', async ({ bidId, bidAmount, comment }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/bids/${bidId}`, { bidAmount, comment },
        {
          headers: { Authorization: localStorage.getItem("token") },
        });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateBidStatus = createAsyncThunk('bids/updateBidStatus', async ({ bidId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/bids/${bidId}/status`, { status },
        {
          headers: { Authorization: localStorage.getItem("token") },
        });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteBid = createAsyncThunk('bids/deleteBid', async (bidId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/bids/${bidId}`,
        {
          headers: { Authorization: localStorage.getItem("token") },
        });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const bidSlice = createSlice({
  name: 'bids',
  initialState: {
    bids: [],
    loading: false,
    error: null,
    selectedTaskId: null,
    editId: null,
  },
  reducers: {
    setSelectedTaskId: (state, action) => {
      state.selectedTaskId = action.payload;
    },
    assignEditId(state, action) {
      state.editId = action.payload; 
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(createBid.fulfilled, (state, action) => {
        state.loading = false;
        state.bids.push(action.payload);
      })
    builder.addCase(createBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    builder.addCase(getBidsForTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(getBidsForTask.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = action.payload;
      })
    builder.addCase(getBidsForTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    builder.addCase(updateBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(updateBid.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = state.bids.map(bid =>
          bid._id === action.payload._id ? action.payload : bid
        );
      })
    builder.addCase(updateBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    builder.addCase(updateBidStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(updateBidStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = state.bids.map(bid =>
          bid._id === action.payload._id ? action.payload : bid
        );
      })
    builder.addCase(updateBidStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    builder.addCase(deleteBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(deleteBid.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = state.bids.filter(bid => bid._id !== action.payload);
      })
    builder.addCase(deleteBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});
export const { setSelectedTaskId, assignEditId } = bidSlice.actions;
export default bidSlice.reducer;
