// src/store/slices/quizSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as quizService from '../../services/quizService';
import type { Quiz, QuizResult } from '../../types/quiz';

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  quizResult: QuizResult | null;
  userAnswers: Record<string, string>;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  quizResult: null,
  userAnswers: {},
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      return await quizService.getQuizzes();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes');
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  'quiz/fetchQuizById',
  async (quizId: number, { rejectWithValue }) => {
    try {
      return await quizService.getQuizById(quizId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz');
    }
  }
);

export const submitQuiz = createAsyncThunk(
  'quiz/submitQuiz',
  async ({ quizId, answers }: { quizId: number; answers: Record<string, string> }, { rejectWithValue }) => {
    try {
      return await quizService.submitQuiz(quizId, answers);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit quiz');
    }
  }
);

// Quiz slice
const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setUserAnswer: (state, action: PayloadAction<{ questionId: number; answer: string }>) => {
      const { questionId, answer } = action.payload;
      state.userAnswers = {
        ...state.userAnswers,
        [questionId]: answer,
      };
    },
    clearUserAnswers: (state) => {
      state.userAnswers = {};
    },
    clearQuizResult: (state) => {
      state.quizResult = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch quizzes
    builder.addCase(fetchQuizzes.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchQuizzes.fulfilled, (state, action: PayloadAction<Quiz[]>) => {
      state.isLoading = false;
      state.quizzes = action.payload;
    });
    builder.addCase(fetchQuizzes.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch quiz by id
    builder.addCase(fetchQuizById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchQuizById.fulfilled, (state, action: PayloadAction<Quiz>) => {
      state.isLoading = false;
      state.currentQuiz = action.payload;
    });
    builder.addCase(fetchQuizById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Submit quiz
    builder.addCase(submitQuiz.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(submitQuiz.fulfilled, (state, action: PayloadAction<QuizResult>) => {
      state.isLoading = false;
      state.quizResult = action.payload;
    });
    builder.addCase(submitQuiz.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setUserAnswer, clearUserAnswers, clearQuizResult, clearError } = quizSlice.actions;
export default quizSlice.reducer;