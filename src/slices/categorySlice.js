import axios from "../config/axios.js"
import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";

export const fetchCategories=createAsyncThunk("categories/fetchCategories",async()=>{
    try{
        const response=await axios.get("/categories")
        return response.data
    } catch(err){
        console.log(err)
    }
})

export const createCategory = createAsyncThunk("categories/createCategory", async ({ body, resetForm }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/categories", body, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      resetForm();
      console.log(response.data)
      return response.data;
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        errors: err.response?.data?.errors
      });
    }
  }
);

export const updateCategory=createAsyncThunk("categories/updateCategory",async({categoryObj,resetForm},{rejectWithValue})=>{
    try{
        const response = await axios.put(`/categories/${categoryObj._id}`,categoryObj,{
            headers:{Authorization:localStorage.getItem("token"),
        }})
        resetForm()
        return response.data
    } catch(err){
        return rejectWithValue({
            message:err.message,
            errors:err.response.data.errors
        })
    }
})

export const removeCategory = createAsyncThunk(
  "categories/removeCategory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/categories/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return response.data.category;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.error || "Could not delete category",
      });
    }
  }
);

const categorySlice=createSlice({
    name:"categories",
    initialState:{
        data:[],
        loading:false,
        serverErrors:null,
        editId:null
    },
    reducers:{
        assignEditId:(state,action)=>{
            state.editId=action.payload
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(fetchCategories.pending,(state)=>{
            state.loading=true
        })
        builder.addCase(fetchCategories.fulfilled,(state,action)=>{
            state.data=action.payload
            state.loading=false
        })
        builder.addCase(fetchCategories.rejected,(state)=>{
            state.serverErrors="something went wrong"
            state.loading=false
        })

        builder.addCase(createCategory.pending,(state)=>{
            state.loading=true
        })
        builder.addCase(createCategory.fulfilled,(state,action)=>{
            state.data.push(action.payload)
            state.serverErrors=null
        })
        builder.addCase(createCategory.rejected,(state,action)=>{
            state.serverErrors=action.payload
        })

        builder.addCase(updateCategory.pending,(state)=>{
            state.loading=true
        })
        builder.addCase(updateCategory.fulfilled,(state,action)=>{
            const index=state.data.findIndex(ele => ele._id === action.payload._id)
            state.data[index] = action.payload
            state.editId = null
            state.serverErrors = null
        })
        builder.addCase(updateCategory.rejected,(state,action)=>{
            state.serverErrors=action.payload
        })

        builder.addCase(removeCategory.pending, (state) => {
            state.loading = true;
            state.serverErrors = null;
        });

        builder.addCase(removeCategory.fulfilled, (state, action) => {
            state.loading = false;
            const deletedId = action.payload._id; 
            state.data = state.data.filter((cat) => cat._id !== deletedId);
            state.serverErrors = null;
        });

        builder.addCase(removeCategory.rejected, (state, action) => {
          state.loading = false;
          state.serverErrors = action.payload?.message || "Category deletion failed";
        });
      }
})
export const {assignEditId} = categorySlice.actions
export default categorySlice.reducer