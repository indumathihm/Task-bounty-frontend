import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../config/axios";

export const fetchLeaderboard = createAsyncThunk('leaderboard/fetchLeaderboard', async (_, thunkAPI) => {
    try {
      const response = await axios.get('/leaderboard');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: {
    loading: false,
    data: [],
    error: null,
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
    builder.addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch leaderboard';
      });
  },
});

export default leaderboardSlice.reducer;