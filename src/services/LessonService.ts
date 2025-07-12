import api from "./api"
import { ENDPOINTS } from "../constants/apiEndpoints"
import type { Lesson, LessonStats } from "../types/lesson"

export const getLessons = async (): Promise<Lesson[]> => {
  try {
    const response = await api.get(ENDPOINTS.LESSONS)
    return response.data.lessons || response.data
  } catch (error) {
    console.error("Get lessons error:", error)
    throw error
  }
}

export const getLessonById = async (lessonId: number): Promise<Lesson> => {
  try {
    const response = await api.get(ENDPOINTS.LESSON_DETAIL(lessonId))
    return response.data.lesson || response.data
  } catch (error) {
    console.error(`Get lesson ${lessonId} error:`, error)
    throw error
  }
}

export const updateLessonProgress = async (
  lessonId: number,
  progressPercentage: number,
  sectionIndex?: number,
  itemIndex?: number,
) => {
  try {
    const response = await api.post(ENDPOINTS.LESSON_PROGRESS(lessonId), {
      progress_percentage: progressPercentage,
      section_index: sectionIndex,
      item_index: itemIndex,
    })
    return response.data
  } catch (error) {
    console.error(`Update lesson ${lessonId} progress error:`, error)
    throw error
  }
}

export const completeLesson = async (lessonId: number) => {
  try {
    const response = await api.post(ENDPOINTS.LESSON_COMPLETE(lessonId))
    return response.data
  } catch (error) {
    console.error(`Complete lesson ${lessonId} error:`, error)
    throw error
  }
}

export const getLessonStats = async (): Promise<LessonStats> => {
  try {
    const response = await api.get(ENDPOINTS.LESSON_STATS)
    return response.data.stats || response.data
  } catch (error) {
    console.error("Get lesson stats error:", error)
    throw error
  }
}
