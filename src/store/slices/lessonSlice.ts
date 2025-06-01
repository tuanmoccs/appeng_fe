// src/store/slices/lessonSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import * as lessonService from "../../services/LessonService"
import type { Lesson, LessonStats } from "../../services/LessonService"

interface LessonState {
  lessons: Lesson[]
  currentLesson: Lesson | null
  stats: LessonStats | null
  isLoading: boolean
  error: string | null
}

const initialState: LessonState = {
  lessons: [],
  currentLesson: null,
  stats: null,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchLessons = createAsyncThunk("lesson/fetchLessons", async (_, { rejectWithValue }) => {
  try {
    return await lessonService.getLessons()
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch lessons")
  }
})

export const fetchLessonById = createAsyncThunk(
  "lesson/fetchLessonById",
  async (lessonId: number, { rejectWithValue }) => {
    try {
      return await lessonService.getLessonById(lessonId)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch lesson")
    }
  },
)

export const updateProgress = createAsyncThunk(
  "lesson/updateProgress",
  async (
    {
      lessonId,
      progressPercentage,
      sectionIndex,
      itemIndex,
    }: {
      lessonId: number
      progressPercentage: number
      sectionIndex?: number
      itemIndex?: number
    },
    { rejectWithValue },
  ) => {
    try {
      return await lessonService.updateLessonProgress(lessonId, progressPercentage, sectionIndex, itemIndex)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update progress")
    }
  },
)

export const fetchLessonStats = createAsyncThunk("lesson/fetchStats", async (_, { rejectWithValue }) => {
  try {
    return await lessonService.getLessonStats()
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch lesson stats")
  }
})

// Lesson slice
const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentLesson: (state) => {
      state.currentLesson = null
    },
  },
  extraReducers: (builder) => {
    // Fetch lessons
    builder.addCase(fetchLessons.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchLessons.fulfilled, (state, action: PayloadAction<Lesson[]>) => {
      state.isLoading = false
      state.lessons = action.payload
    })
    builder.addCase(fetchLessons.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Fetch lesson by id
    builder.addCase(fetchLessonById.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchLessonById.fulfilled, (state, action: PayloadAction<Lesson>) => {
      state.isLoading = false
      state.currentLesson = action.payload
    })
    builder.addCase(fetchLessonById.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Update progress
    builder.addCase(updateProgress.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(updateProgress.fulfilled, (state) => {
      state.isLoading = false
    })
    builder.addCase(updateProgress.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Fetch stats
    builder.addCase(fetchLessonStats.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchLessonStats.fulfilled, (state, action: PayloadAction<LessonStats>) => {
      state.isLoading = false
      state.stats = action.payload
    })
    builder.addCase(fetchLessonStats.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
  },
})

export const { clearError, clearCurrentLesson } = lessonSlice.actions
export default lessonSlice.reducer
