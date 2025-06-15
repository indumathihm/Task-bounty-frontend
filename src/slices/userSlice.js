import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../config/axios";

export const fetchUserAccount = createAsyncThunk("user/fetchUserAccount",async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/users/myProfile", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return response.data;
    } catch (err) {
      console.log(err)
      return rejectWithValue("Something went wrong");
    }
  }
);

export const updateUserProfile = createAsyncThunk("user/updateUserProfile",async ({ formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/users/updateUserProfile`, formData, {
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err) {
      console.log(err)
      return rejectWithValue("Failed to update avatar");
    }
  }
);

export const fetchAllUsers = createAsyncThunk("user/fetchAllUsers",async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/users", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return response.data;
    } catch (err) {
      console.log(err)
      return rejectWithValue("Something went wrong");
    }
  }
);

export const updateUserActivation = createAsyncThunk("user/updateUserActivation",async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/users/activateUser/${id}`,{ isActive },
        {
          headers: {Authorization: localStorage.getItem("token")},
        });
      return response.data;
    } catch (err) {
      console.log(err)
      return rejectWithValue("Failed to update user activation");
    }
  }
);

export const forgotPassword = createAsyncThunk('user/forgotPassword',async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post('/users/forgotPassword', { email });
      return { message: response.data.msg };
    } catch (error) {
      return rejectWithValue({ error: error.response?.data?.msg || 'Something went wrong' });
    }
  }
);

export const resetPassword = createAsyncThunk('user/resetPassword',async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/users/resetPassword', { email, otp, newPassword });
      return { message: response.data.msg };
    } catch (error) {
      return rejectWithValue({ error: error.response?.data?.msg || 'Something went wrong' });
    }
  }
);

export const createRazorpayOrder = createAsyncThunk('user/createRazorpayOrder', async (amount, { rejectWithValue }) => {
    try {
      amount = Number(amount);
      const response = await axios.post('/wallet', { amount }, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create Razorpay order');
    }
  }
);

export const depositMoney = createAsyncThunk('user/depositMoney',async ({ payment_id, order_id, signature, amount }, { rejectWithValue }) => {
    try {
      amount = Number(amount);
      const response = await axios.post('/wallet/deposit', { payment_id, order_id, signature, amount }, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deposit money');
    }
  }
);

export const getWalletBalance = createAsyncThunk('user/getWalletBalance',async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/wallet/balance/${userId}`, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet balance');
    }
  }
);

export const withdrawMoney = createAsyncThunk('user/withdrawMoney',async ({ amount }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/wallet/withdraw',{ amount: Number(amount) },
        {
          headers: { Authorization: localStorage.getItem('token') },
        });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to withdraw money');
    }
  }
);

export const getTransactions = createAsyncThunk("user/getTransactions",async ({ search = "", sortBy = "createdAt", order = "desc" }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transactions", {
        params: { search, sortBy, order },
        headers: { Authorization: localStorage.getItem("token") },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch transactions");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
    users: [],
    transactions: [],
    loading: false,
    isLoggedIn: false,
    serverError: null,
    otpSent: false,
    message: '',
    error: '',
  },
  reducers: {
    login: (state, action) => {
      state.data = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.data = null;
      state.isLoggedIn = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserAccount.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoggedIn = true;
      })
    builder.addCase(fetchUserAccount.rejected, (state, action) => {
        state.data = null;
        state.serverError = action.payload;
        state.isLoggedIn = false;
      })

    builder.addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
    builder.addCase(fetchAllUsers.rejected, (state, action) => {
        state.serverError = action.payload;
      })
    builder.addCase(updateUserActivation.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        state.users = state.users.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        );
      })
    builder.addCase(updateUserActivation.rejected, (state, action) => {
        state.serverError = action.payload;
      })
    builder.addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.user;
      })
    builder.addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    builder.addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.otpSent = true;
      })
    builder.addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      })
    builder.addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
    builder.addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
    builder.addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      })
    builder.addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
    builder.addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
    builder.addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    builder.addCase(depositMoney.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.depositSuccess = false;
      })
    builder.addCase(depositMoney.fulfilled, (state, action) => {
        state.loading = false;
        state.depositSuccess = true;
        state.data.walletBalance = action.payload.updatedWalletBalance;
        localStorage.setItem('walletBalance', action.payload.updatedWalletBalance);
      })
    builder.addCase(depositMoney.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    builder.addCase(getWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(getWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.data.walletBalance = action.payload.updatedWalletBalance;
      })
    builder.addCase(getWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    builder.addCase(withdrawMoney.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(withdrawMoney.fulfilled, (state, action) => {
        state.loading = false;
        state.data.walletBalance = action.payload.updatedWalletBalance;
      })
    builder.addCase(withdrawMoney.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    builder.addCase(getTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
    builder.addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;