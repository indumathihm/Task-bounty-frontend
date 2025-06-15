import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios";

export const createTaskWithWallet = createAsyncThunk("task/createTaskWithWallet",
async (taskData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/tasks", taskData, 
      {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Task creation failed" });
    }
  }
);

export const fetchAllTasks = createAsyncThunk("tasks/fetchAllTasks",async () => {
    try {
      const response = await axios.get("/tasks/all-tasks");
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const fetchTasks = createAsyncThunk("tasks/fetchTasks",async ({ 
    page = 1, 
    limit = 10, 
    search = "", 
    sortBy = "createdAt", 
    sortOrder = "desc", 
    category,
    endingSoon = false  
  }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (search) params.append("search", search);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);
      if (category) params.append("category", category);
      if (endingSoon) params.append("endingSoon", "true");  

      const response = await axios.get(`/tasks?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.log("error",error);
    }
  }
);

export const fetchMyTasks = createAsyncThunk("task/fetchMyTasks", async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/tasks/my-tasks/${id}`, 
      {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to load my tasks" });
    }
  }
);

export const showTask = createAsyncThunk("task/show", async (taskId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/tasks/${taskId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to load task" });
    }
  }
);

export const getHunterSummary = createAsyncThunk("task/getHunterSummary",async (_, thunkAPI) => {
    try {
      const response = await axios.get("/tasks/my-work",
        { 
          headers: { Authorization: localStorage.getItem("token") } 
        });
      return response.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTask = createAsyncThunk("task/updateTask",async ({ taskObj }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/tasks/${taskObj._id}`,
        { description: taskObj.description,
          bidEndDate: taskObj.bidEndDate,
          deadline: taskObj.deadline,
         },
        { 
          headers: { Authorization: localStorage.getItem("token") } 
        });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Update failed" });
    }
  }
);

export const removeTask = createAsyncThunk("task/removeTask",async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/tasks/${id}`, 
      {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Deletion failed" });
    }
  }
);

export const submitTaskFile = createAsyncThunk("tasks/submitTaskFile",async ({ taskId, file, rating }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (rating) formData.append("rating", rating);
      const response = await axios.put(`/tasks/${taskId}/submit`, formData, 
      {
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to submit task"
      );
    }
  }
);

export const markTaskCompleted = createAsyncThunk("tasks/markTaskCompleted",async ({ id, status, rating }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/tasks/${id}/complete`,{ status, rating },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const taskSlice = createSlice({
  name: "task",
  initialState: {
    tasks: [],
    selectedTask: null,
    loading: false,
    error: null,
    successMessage: null,
    editId: null,
    selectedTaskId: null,
    page: 1,
    totalPages: 1,
    totalTasks: 0,
    limit: 10,
    taskSummary: null,
  },
  reducers: {
    clearTaskMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    assignEditId: (state, action) => {
      state.editId = action.payload;
    },
    setSelectedTaskId: (state, action) => {
      state.selectedTaskId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createTaskWithWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(createTaskWithWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.successMessage = "Task created with wallet";
      })
    builder.addCase(createTaskWithWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Task creation failed";
      })
    
    builder.addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
    builder.addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch tasks";
      })

    builder.addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.totalPages = action.payload.totalPages;
      })
    builder.addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch tasks";
      })

    builder.addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
    builder.addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Failed to load tasks";
      })

    builder.addCase(getHunterSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(getHunterSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.taskSummary = action.payload.data; 
      })
    builder.addCase(getHunterSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    builder.addCase(showTask.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
      })

    builder.addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.task;
        state.tasks = state.tasks.map((ele) =>
          ele._id === updatedTask._id ? updatedTask : ele
        );
        state.successMessage = action.payload.message;
        state.editId = null;
      })
    builder.addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Update failed";
      })

    builder.addCase(removeTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(removeTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
      })
    builder.addCase(removeTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Deletion failed";
      })

    builder.addCase(submitTaskFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(submitTaskFile.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.task;
        state.tasks = state.tasks.map((t) =>
          t._id === updatedTask._id ? updatedTask : t
        );
        state.successMessage = action.payload.message || "File submitted successfully";
      })
    builder.addCase(submitTaskFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to submit task file";
      })

    builder.addCase(markTaskCompleted.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    builder.addCase(markTaskCompleted.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.task;
        state.tasks = state.tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t));
        state.successMessage = action.payload.message;
      })
    builder.addCase(markTaskCompleted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTaskMessages, assignEditId, setSelectedTaskId } = taskSlice.actions;
export default taskSlice.reducer;