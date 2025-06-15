import { configureStore } from "@reduxjs/toolkit"
import userReducer from "../slices/userSlice.js"
import categoryReducer from "../slices/categorySlice.js"
import taskReducer from "../slices/taskSlice.js"
import subscriptionReducer from "../slices/subscriptionSlice.js"
import bidReducer from "../slices/bidSlice.js"
import leaderboardReducer from "../slices/leaderboardSlice.js"
const store = configureStore({
    reducer:{
        user:userReducer,
        category:categoryReducer,
        task:taskReducer,
        subscription: subscriptionReducer,
        bid:bidReducer,
        leaderboard:leaderboardReducer

    }
})
export default store


