// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import quizReducer from "./slices/quizSlice"
import lessonReducer from "./slices/lessonSlice"

// Configure Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
    lesson: lessonReducer,
    // Add more reducers here as needed
  },
  // Add middleware if needed
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check if needed
    }),
})

// Export types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
