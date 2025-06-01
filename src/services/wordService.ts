
import api from "./api";
import { ENDPOINTS } from "../constants/apiEndpoints";
import { Word } from "../types/lesson";

// Get all words
export const getWords = async (): Promise<Word[]> => {
  try {
    const response = await api.get(ENDPOINTS.WORDS);
    return response.data;
  } catch (error) {
    console.error("Get words error:", error);
    throw error;
  }
};

// Get word by ID
export const getWordById = async (wordId: number): Promise<Word> => {
  try {
    const response = await api.get(ENDPOINTS.WORD_DETAIL(wordId));
    return response.data;
  } catch (error) {
    console.error(`Get word ${wordId} error:`, error);
    throw error;
  }
};

// Get words by lesson ID
export const getWordsByLessonId = async (lessonId: number): Promise<Word[]> => {
  try {
    const response = await api.get(ENDPOINTS.LESSON_WORDS(lessonId));
    return response.data;
  } catch (error) {
    console.error(`Get words for lesson ${lessonId} error:`, error);
    throw error;
  }
};