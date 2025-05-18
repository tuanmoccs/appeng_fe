// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
// import lessonReducer from './slices/lessonSlice';
import quizReducer from './slices/quizSlice';

// Configure Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    // lessons: lessonReducer,
    quiz: quizReducer,
    // Add more reducers here as needed
  },
  // Add middleware if needed
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check if needed
    }),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;